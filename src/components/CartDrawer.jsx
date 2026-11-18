import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../CartContext.jsx";
import { useSiteData } from "../SiteDataContext.jsx";
import { apiGet, apiPost, ApiError, errorText, isOffline } from "../api.js";
import { CONFIRM_NOTE } from "../availability.js";
import AvailabilityBadge from "./AvailabilityBadge.jsx";
import { formatKES } from "../data/site.js";
import { CloseIcon, WhatsAppIcon } from "./Icons.jsx";

const REF_KEY = "lane:ref";

// Kenyan mobile: 07XXXXXXXX, 01XXXXXXXX, +2547XXXXXXXX or 2547XXXXXXXX (spaces/dashes ignored).
const KENYAN_MOBILE = /^(?:0[17]\d{8}|\+?2547\d{8})$/;
const normalisePhone = (v) => v.replace(/[\s-]/g, "");

// Local sample products (used when the API is down) don't have real UUIDs and can't be ordered via the API.
// Found-online products have "web_…" ids and are sent as `webProduct` instead.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readStoredRef() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("ref");
    if (fromUrl) {
      sessionStorage.setItem(REF_KEY, fromUrl.trim());
      return fromUrl.trim();
    }
    return sessionStorage.getItem(REF_KEY) || "";
  } catch {
    return "";
  }
}

const emptyForm = () => ({ customerName: "", customerPhone: "", vehicle: "", serviceCentreId: "", referralCode: readStoredRef(), website: "" });

const inputCls = (err) =>
  `mt-1 w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 ${
    err ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-brand-400 focus:ring-brand-100"
  }`;

function Field({ label, error, optional, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label} {optional && <span className="font-normal text-slate-400">(optional)</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

// A found-online product isn't in Lane's database, so the order carries a snapshot of it.
// estimatedPrice is information only; the server never uses it as the price.
const webItem = ({ product: p, qty }) => ({
  webProduct: {
    id: p.id,
    brand: p.brand,
    name: p.name,
    size: p.size,
    type: p.type,
    sourceUrl: p.sourceUrl,
    estimatedPrice: p.estimatedPrice ?? null,
  },
  quantity: qty,
});

// Estimates are never added in: the total only covers in-stock items.
function CartTotal({ total, unconfirmed }) {
  return (
    <div>
      <div className="flex items-center justify-between text-lg">
        <span className="font-medium text-slate-600">{unconfirmed > 0 ? "Total for in-stock items" : "Total"}</span>
        <span className="font-black">{formatKES(total)}</span>
      </div>
      {unconfirmed > 0 && (
        <p className="text-right text-sm text-amber-700">
          + {unconfirmed} item{unconfirmed > 1 ? "s" : ""} priced on confirmation
        </p>
      )}
    </div>
  );
}

export default function CartDrawer() {
  const { items, setQty, clear, total, unconfirmedCount, open, setOpen } = useCart();
  const { waLink } = useSiteData();
  const [stage, setStage] = useState("cart"); // "cart" | "details" | "done"
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [centres, setCentres] = useState(null); // null = not loaded yet
  const [order, setOrder] = useState(null); // { reference, total, whatsappUrl, unconfirmed }

  // Load fitting centres the first time the details form is shown.
  useEffect(() => {
    if (stage !== "details" || centres !== null) return;
    apiGet("/service-centres")
      .then((list) => setCentres(Array.isArray(list) ? list : []))
      .catch(() => setCentres([]));
  }, [stage, centres]);

  // Start over at the cart view after a completed order once the drawer closes.
  useEffect(() => {
    if (!open && stage === "done") {
      setStage("cart");
      setOrder(null);
    }
  }, [open, stage]);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.customerName.trim()) er.customerName = "Please enter your full name.";
    if (!KENYAN_MOBILE.test(normalisePhone(form.customerPhone)))
      er.customerPhone = "Enter a Kenyan mobile number, e.g. 0712 345 678 or +254 712 345 678.";
    if (!form.vehicle.trim()) er.vehicle = "Please enter your vehicle make, model and year.";
    return er;
  };

  // Fallback when the API is unavailable: the old behaviour, with the customer's details included.
  const whatsappFallback = () => {
    const lines = items.map((i) => {
      const what = `• ${i.qty} × ${i.product.brand} ${i.product.name} (${i.product.size})`;
      if (i.availability === "in_stock") return `${what} — ${formatKES(i.qty * i.product.price)}`;
      const src = i.availability === "found_online" && i.product.sourceUrl ? ` — seen at ${i.product.sourceUrl}` : "";
      return `${what} — price to be confirmed${src}`;
    });
    const centre = centres?.find((c) => c.id === form.serviceCentreId);
    const details = [
      form.customerName && `Name: ${form.customerName.trim()}`,
      form.customerPhone && `Phone: ${normalisePhone(form.customerPhone)}`,
      form.vehicle && `Vehicle: ${form.vehicle.trim()}`,
      `Fitting centre: ${centre ? centre.name : "I'll choose later"}`,
      form.referralCode && `Referral code: ${form.referralCode.trim()}`,
    ].filter(Boolean);
    const msg = `Hi Lane, I'd like to order:\n${lines.join("\n")}\n\n${unconfirmedCount ? "Total for in-stock items" : "Total"}: ${formatKES(total)}${unconfirmedCount ? `\n+ ${unconfirmedCount} item${unconfirmedCount > 1 ? "s" : ""} priced on confirmation` : ""}\n\n${details.join("\n")}\n\nPlease confirm stock and the nearest fitting centre.`;
    window.open(waLink(msg), "_blank", "noopener");
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setFormError("");
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) return;

    if (items.some((i) => i.availability !== "found_online" && !UUID.test(String(i.product.id)))) {
      whatsappFallback();
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiPost("/orders", {
        customerName: form.customerName.trim(),
        customerPhone: normalisePhone(form.customerPhone),
        vehicle: form.vehicle.trim(),
        serviceCentreId: form.serviceCentreId || null,
        referralCode: form.referralCode.trim() || undefined,
        website: form.website, // honeypot: always empty for real users
        items: items.map((i) => (i.availability === "found_online" ? webItem(i) : { productId: i.product.id, quantity: i.qty })),
      });
      setOrder({ ...res, unconfirmed: unconfirmedCount });
      clear();
      setForm((f) => ({ ...emptyForm(), referralCode: f.referralCode }));
      setStage("done");
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const known = ["customerName", "customerPhone", "vehicle", "serviceCentreId", "referralCode"];
        const fieldErrors = {};
        const other = [];
        for (const [field, msgs] of Object.entries(err.errors || {})) {
          const text = known.includes(field) ? errorText(msgs) : errorText(msgs, field);
          if (known.includes(field)) fieldErrors[field] = text;
          else other.push(text);
        }
        setErrors(fieldErrors);
        setFormError(other.join(" ") || (Object.keys(fieldErrors).length ? "" : err.message));
      } else if (isOffline(err)) {
        setFormError("We couldn't reach our order system, so we've opened WhatsApp with your order instead.");
        whatsappFallback();
      } else {
        setFormError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const title = stage === "details" ? "Your Details" : stage === "done" ? "Order Placed" : "Your Cart";

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-slate-900/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-slate-100" aria-label="Close cart">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {stage === "done" && order && (
          <div className="flex-1 overflow-y-auto px-6 py-8 text-center">
            <p className="text-5xl">✅</p>
            <p className="mt-4 text-sm text-slate-500">Your order reference</p>
            <p className="mt-1 text-3xl font-black tracking-wide text-brand-600">{order.reference}</p>
            <p className="mt-4 text-lg">
              {order.unconfirmed > 0 ? "Total for in-stock items" : "Total"}:{" "}
              <span className="font-black">{formatKES(order.total || 0)}</span>
            </p>
            <p className="mx-auto mt-3 max-w-xs text-sm text-slate-600">
              We'll verify stock with the importer before asking for payment.
            </p>
            {order.unconfirmed > 0 && (
              <p className="mx-auto mt-3 max-w-xs rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                We're checking availability for {order.unconfirmed} item{order.unconfirmed > 1 ? "s" : ""}. We'll message you
                on WhatsApp with final prices before you pay.
              </p>
            )}
            {order.whatsappUrl && (
              <a
                href={order.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
              >
                <WhatsAppIcon className="h-5 w-5" /> Open WhatsApp
              </a>
            )}
            <Link
              to={`/track/${encodeURIComponent(order.reference)}`}
              onClick={() => setOpen(false)}
              className="mt-3 block w-full rounded-full border border-brand-200 px-6 py-3 font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              Track your order
            </Link>
          </div>
        )}

        {stage === "cart" && (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {items.length === 0 && (
                <div className="mt-20 text-center text-slate-400">
                  <p className="text-5xl">🛞</p>
                  <p className="mt-4">Your cart is empty.</p>
                  <p className="text-sm">Ask Lane AI to find your size.</p>
                </div>
              )}
              {items.map(({ product, qty, availability }) => (
                <div key={product.id} className="flex gap-4 rounded-2xl border border-slate-200 p-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-slate-100 text-2xl">
                    {product.type === "tyre" ? "🛞" : "🛢️"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-xs font-semibold uppercase text-brand-600">{product.brand}</p>
                      {availability !== "in_stock" && <AvailabilityBadge product={product} />}
                    </div>
                    <p className="truncate font-semibold">{product.name}</p>
                    <p className="text-sm text-slate-500">{product.size}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-slate-200">
                        <button onClick={() => setQty(product.id, qty - 1)} className="px-3 py-1 text-lg leading-none">−</button>
                        <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                        <button onClick={() => setQty(product.id, qty + 1)} className="px-3 py-1 text-lg leading-none">+</button>
                      </div>
                      {availability === "in_stock" ? (
                        <p className="font-bold">{formatKES(qty * product.price)}</p>
                      ) : (
                        <p className="text-sm font-medium text-amber-700">Price to be confirmed</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {items.length > 0 && (
              <div className="border-t border-slate-100 px-6 py-5">
                <CartTotal total={total} unconfirmed={unconfirmedCount} />
                <p className="mt-1 text-xs text-slate-400">
                  No payment now. We verify stock with the importer, then send a payment request.
                </p>
                {unconfirmedCount > 0 && <p className="mt-1 text-xs text-slate-500">{CONFIRM_NOTE}</p>}
                <button
                  onClick={() => setStage("details")}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
                >
                  Continue to checkout
                </button>
                <button onClick={clear} className="mt-2 w-full text-sm text-slate-400 hover:text-slate-600">
                  Clear cart
                </button>
              </div>
            )}
          </>
        )}

        {stage === "details" && (
          <form onSubmit={placeOrder} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <button type="button" onClick={() => setStage("cart")} className="text-sm font-medium text-brand-600 hover:underline">
                ← Back to cart
              </button>

              <Field label="Full name" error={errors.customerName}>
                <input value={form.customerName} onChange={update("customerName")} autoComplete="name" className={inputCls(errors.customerName)} />
              </Field>
              <Field label="Phone number" error={errors.customerPhone}>
                <input
                  value={form.customerPhone}
                  onChange={update("customerPhone")}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="0712 345 678"
                  className={inputCls(errors.customerPhone)}
                />
              </Field>
              <Field label="Vehicle" error={errors.vehicle}>
                <input value={form.vehicle} onChange={update("vehicle")} placeholder="e.g. Toyota Harrier 2016" className={inputCls(errors.vehicle)} />
              </Field>
              <Field label="Fitting centre" error={errors.serviceCentreId}>
                <select
                  value={form.serviceCentreId}
                  onChange={update("serviceCentreId")}
                  disabled={centres === null}
                  className={inputCls(errors.serviceCentreId)}
                >
                  <option value="">{centres === null ? "Loading fitting centres…" : "I'll choose later"}</option>
                  {centres?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}{c.area ? ` — ${c.area}` : ""}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Referral code" optional error={errors.referralCode}>
                <input value={form.referralCode} onChange={update("referralCode")} className={inputCls(errors.referralCode)} />
              </Field>

              {/* Honeypot: hidden from people, tempting for bots. Must stay empty. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label>
                  Website
                  <input tabIndex={-1} autoComplete="off" value={form.website} onChange={update("website")} />
                </label>
              </div>

              {formError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</p>}
            </div>

            <div className="border-t border-slate-100 px-6 py-5">
              <CartTotal total={total} unconfirmed={unconfirmedCount} />
              <button
                type="submit"
                disabled={submitting || items.length === 0}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
              >
                {submitting ? "Placing order…" : "Place order"}
              </button>
              <p className="mt-3 text-center text-xs text-slate-400">
                By placing an order you agree to our{" "}
                <Link to="/privacy" onClick={() => setOpen(false)} className="font-medium text-brand-600 hover:underline">
                  Privacy Policy
                </Link>.
              </p>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}
