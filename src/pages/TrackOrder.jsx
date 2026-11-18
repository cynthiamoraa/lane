import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet, ApiError } from "../api.js";
import { useSiteData } from "../SiteDataContext.jsx";
import { formatKES } from "../data/site.js";
import usePageTitle from "../usePageTitle.js";
import Skeleton from "../components/Skeleton.jsx";
import { WhatsAppIcon } from "../components/Icons.jsx";

const REFRESH_MS = 60_000;

const STEPS = [
  { status: "pending_verification", label: "Order received", note: "We're confirming stock with the importer." },
  { status: "awaiting_confirmation", label: "Checking availability with importers", note: "We'll message you on WhatsApp with final prices before you pay." },
  { status: "stock_confirmed", label: "Stock confirmed" },
  { status: "payment_requested", label: "Payment requested", note: "Check WhatsApp for payment details." },
  { status: "paid", label: "Paid" },
  { status: "fitting_scheduled", label: "Fitting scheduled" },
  { status: "completed", label: "Completed" },
];

const nairobiDateTime = new Intl.DateTimeFormat("en-KE", {
  timeZone: "Africa/Nairobi",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatFitting(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : `${nairobiDateTime.format(d)} (Nairobi time)`;
}

// The availability step only appears for orders with items Lane had to confirm
// (found online or ordered in), including after they've all been confirmed.
function hasSourcedItems(order) {
  return (
    order.status === "awaiting_confirmation" ||
    order.hasUnconfirmedItems === true ||
    (order.items || []).some((i) => (i.availability && i.availability !== "in_stock") || (i.confirmationStatus && i.confirmationStatus !== "not_needed"))
  );
}

const stepsFor = (order) => STEPS.filter((s) => s.status !== "awaiting_confirmation" || hasSourcedItems(order));

const leadTime = (days) =>
  typeof days !== "number" ? "" : days <= 0 ? ", ready now" : `, ready in ${days} day${days === 1 ? "" : "s"}`;

const money = (n) => (typeof n === "number" ? formatKES(n) : "—");

// Items may come back flat or with a nested product; read both.
function describeItem(item) {
  const p = item.product || {};
  const brand = item.brand ?? p.brand;
  const name = item.name ?? item.productName ?? p.name ?? "Item";
  const size = item.size ?? p.size;
  const qty = item.quantity ?? item.qty ?? 1;
  const unit = item.unitPrice ?? item.price ?? p.price;
  const line = item.lineTotal ?? item.total ?? (typeof unit === "number" ? unit * qty : undefined);
  const status = item.confirmationStatus || "not_needed"; // not_needed | pending | confirmed | unavailable
  const confirmedUnit = item.confirmedPrice ?? unit;
  return { key: item.id ?? item.productId ?? p.id, brand, name, size, qty, line, status, confirmedUnit, leadTimeDays: item.leadTimeDays };
}

export default function TrackOrder() {
  const { reference: rawRef } = useParams();
  const reference = (rawRef || "").toUpperCase();
  usePageTitle(`Track order ${reference} | Lane`);
  const { waLink, backendStatus } = useSiteData();

  const [order, setOrder] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | notfound | error

  const load = useCallback(async () => {
    try {
      const data = await apiGet(`/orders/${encodeURIComponent(reference)}`);
      setOrder(data);
      setState("ready");
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setOrder(null);
        setState("notfound");
        return false;
      }
      // Keep showing the last good data if a background refresh fails.
      setState((s) => (s === "ready" ? s : "error"));
      return true;
    }
  }, [reference]);

  // If the first load failed while the backend was asleep, load again as soon as it's awake.
  useEffect(() => {
    if (backendStatus === "ready" && state === "error") load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendStatus]);

  useEffect(() => {
    let timer;
    let cancelled = false;
    setState("loading");
    setOrder(null);

    load().then((keepPolling) => {
      if (cancelled || !keepPolling) return;
      timer = setInterval(() => {
        load().then((again) => { if (!again) clearInterval(timer); });
      }, REFRESH_MS);
    });

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [load]);

  return (
    <main className="bg-gradient-to-b from-brand-50 via-white to-white pt-28 pb-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Order tracking</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{reference}</h1>

        {state === "loading" && (
          <div className="mt-8 space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            {STEPS.map((s) => (
              <div key={s.status} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-5 w-40" />
              </div>
            ))}
          </div>
        )}

        {state === "notfound" && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
            <p className="text-5xl">🔍</p>
            <h2 className="mt-4 text-xl font-bold">We couldn't find that order</h2>
            <p className="mt-2 text-slate-600">
              Check the reference in your confirmation message (it looks like <span className="font-semibold">LN-7F3K2</span>) and try again.
            </p>
            <Link
              to="/track"
              className="mt-6 inline-flex rounded-full bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
            >
              Try another reference
            </Link>
          </div>
        )}

        {state === "error" && backendStatus === "waking" && (
          <div role="status" className="mt-8 flex items-center gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            <span className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-amber-500" />
            <p>Lane is starting up, this can take up to a minute. Your order will appear here automatically.</p>
          </div>
        )}

        {state === "error" && backendStatus !== "waking" && (
          <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            <p className="font-semibold">We couldn't load your order right now.</p>
            <p className="mt-1 text-sm">Please try again in a moment, or ask us on WhatsApp.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => { setState("loading"); load(); }}
                className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Try again
              </button>
              <a
                href={waLink(`Hi Lane, I have a question about my order ${reference}.`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp
              </a>
            </div>
          </div>
        )}

        {state === "ready" && order && (
          <>
            {order.status === "cancelled" ? (
              <div role="alert" className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800">
                <p className="text-lg font-bold">This order was cancelled.</p>
                <p className="mt-1 text-sm">If you weren't expecting this, chat with us on WhatsApp and we'll help.</p>
              </div>
            ) : (
              <Timeline order={order} />
            )}

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">Items</h2>
              <ul className="mt-4 divide-y divide-slate-100">
                {(order.items || []).map((item, idx) => {
                  const it = describeItem(item);
                  const unavailable = it.status === "unavailable";
                  return (
                    <li key={it.key ?? idx} className="flex items-start justify-between gap-4 py-3">
                      <div className={`min-w-0 ${unavailable ? "text-slate-400 line-through" : ""}`}>
                        {it.brand && (
                          <p className={`text-xs font-semibold uppercase ${unavailable ? "" : "text-brand-600"}`}>{it.brand}</p>
                        )}
                        <p className="font-semibold">{it.name}</p>
                        <p className={`text-sm ${unavailable ? "" : "text-slate-500"}`}>
                          {it.size ? `${it.size} · ` : ""}Qty {it.qty}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        {it.status === "pending" && <p className="text-sm font-medium text-amber-700">Checking…</p>}
                        {unavailable && <p className="text-sm font-medium text-red-600">Unavailable</p>}
                        {it.status === "confirmed" && (
                          <>
                            <p className="font-bold">{money(it.line)}</p>
                            <p className="text-xs text-emerald-700">
                              Confirmed: {money(it.confirmedUnit)}{it.qty > 1 ? " each" : ""}{leadTime(it.leadTimeDays)}
                            </p>
                          </>
                        )}
                        {it.status === "not_needed" && <p className="font-bold">{money(it.line)}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-4 text-lg">
                <span className="font-medium text-slate-600">{order.hasUnconfirmedItems ? "Total so far" : "Total"}</span>
                <span className="font-black">{money(order.total)}</span>
              </div>
              {order.hasUnconfirmedItems && (
                <p className="mt-1 text-right text-sm text-amber-700">Items still being checked are added once confirmed.</p>
              )}
            </div>

            <a
              href={waLink(`Hi Lane, I have a question about my order ${order.reference || reference}.`)}
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
            >
              <WhatsAppIcon className="h-5 w-5" /> Questions? Chat on WhatsApp
            </a>
            <p className="mt-3 text-center text-xs text-slate-400">This page refreshes automatically every minute.</p>
          </>
        )}
      </div>
    </main>
  );
}

function Timeline({ order }) {
  const steps = stepsFor(order);
  const current = Math.max(0, steps.findIndex((s) => s.status === order.status));
  const allDone = order.status === "completed";
  const centre = order.serviceCentre;
  const fitting = formatFitting(order.fittingAt);

  return (
    <ol className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      {steps.map((step, i) => {
        const done = i < current || (allDone && i === current);
        const isCurrent = i === current && !allDone;
        const last = i === steps.length - 1;
        return (
          <li key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
            {!last && (
              <span
                aria-hidden="true"
                className={`absolute left-4 top-8 bottom-0 -ml-px w-0.5 ${i < current ? "bg-brand-600" : "bg-slate-200"}`}
              />
            )}
            <span className="relative grid h-8 w-8 shrink-0 place-items-center">
              {isCurrent && <span className="absolute inset-0 animate-ping rounded-full bg-brand-400 opacity-60" />}
              <span
                className={`relative grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${
                  done || isCurrent ? "bg-brand-600 text-white" : "border-2 border-slate-200 bg-white text-slate-400"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
            </span>
            <div className="pt-1">
              <p className={`font-semibold ${done || isCurrent ? "text-slate-900" : "text-slate-400"}`}>
                {step.label}
                {isCurrent && <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">Now</span>}
              </p>
              {isCurrent && step.note && <p className="mt-1 text-sm text-slate-600">{step.note}</p>}
              {step.status === "fitting_scheduled" && (done || isCurrent) && (centre || fitting) && (
                <div className="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                  {centre && (
                    <p>
                      <span className="font-semibold text-slate-800">{centre.name}</span>
                      {centre.area ? `, ${centre.area}` : ""}
                      {centre.address && <span className="block">{centre.address}</span>}
                    </p>
                  )}
                  {fitting && <p className={centre ? "mt-1" : ""}>{fitting}</p>}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
