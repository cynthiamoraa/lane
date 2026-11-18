import { useState } from "react";
import { partnerProfiles } from "../data/site.js";
import { useSiteData } from "../SiteDataContext.jsx";
import { apiPost, ApiError, isOffline, SLOW_TIMEOUT_MS } from "../api.js";
import useSlowRequest from "../useSlowRequest.js";

// Tab ids → API profile values.
const apiProfile = { fleet: "fleet", garages: "garage", influencers: "influencer" };

export default function PartnerHub() {
  const { waLink, reportBackendDown } = useSiteData();
  const [active, setActive] = useState(partnerProfiles[0].id);
  const [values, setValues] = useState({});
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const slow = useSlowRequest(submitting);
  const [errors, setErrors] = useState({}); // { [field label]: message }
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(null); // { whatsappUrl }
  const profile = partnerProfiles.find((p) => p.id === active);

  const switchTab = (id) => {
    setActive(id);
    setErrors({});
    setFormError("");
    setSuccess(null);
  };

  const openWhatsAppDirect = () => {
    const lines = profile.fields.map((f) => `${f}: ${values[`${active}-${f}`] || "-"}`);
    const msg = `Partner Request — ${profile.label}\n${lines.join("\n")}`;
    window.open(waLink(msg), "_blank", "noopener");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setErrors({});
    setFormError("");
    setSubmitting(true);

    const fields = Object.fromEntries(profile.fields.map((f) => [f, (values[`${active}-${f}`] || "").trim()]));

    try {
      const res = await apiPost(
        "/partner-requests",
        { profile: apiProfile[active], fields, website },
        { timeoutMs: SLOW_TIMEOUT_MS } // the backend may still be waking up
      );
      setSuccess({ whatsappUrl: res?.whatsappUrl });
      setValues((v) => Object.fromEntries(Object.entries(v).filter(([k]) => !k.startsWith(`${active}-`))));
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        // Errors may be keyed by the field label, "fields.<label>", or something else (e.g. "profile").
        const fieldErrors = {};
        const other = [];
        for (const [key, msgs] of Object.entries(err.errors || {})) {
          const text = [].concat(msgs).join(" ");
          const label = profile.fields.find((f) => key === f || key === `fields.${f}`);
          // The API reports blanks as { fields: ["missing: Company name, Phone number"] }.
          const missing = key === "fields" && text.match(/missing:\s*(.+)/i);
          if (label) fieldErrors[label] = text;
          else if (missing) {
            const names = missing[1].split(",").map((s) => s.trim().replace(/\.$/, ""));
            names.forEach((n) => { if (profile.fields.includes(n)) fieldErrors[n] = "This field is required."; });
            if (!names.every((n) => profile.fields.includes(n))) other.push(text);
          }
          else other.push(key === "fields" || key === "profile" ? text : `${key}: ${text}`);
        }
        setErrors(fieldErrors);
        setFormError(other.join(" ") || (Object.keys(fieldErrors).length ? "" : err.message));
      } else if (isOffline(err)) {
        reportBackendDown();
        openWhatsAppDirect();
      } else {
        setFormError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="partner-hub" className="bg-slate-950 py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-400">For business</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Partner Hub</h2>
          <p className="mt-3 text-lg text-slate-400">
            Select your profile to access specialized logistics, MOQs, and commission structures.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {partnerProfiles.map((p) => (
            <button
              key={p.id}
              onClick={() => switchTab(p.id)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                active === p.id
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-600/40"
                  : "border border-slate-700 text-slate-300 hover:border-brand-500 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-8 rounded-3xl border border-slate-800 bg-slate-900 p-8 md:grid-cols-2 md:p-10">
          <div>
            <h3 className="text-2xl font-bold">{profile.heading}</h3>
            <p className="mt-3 text-slate-400">{profile.body}</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {["Verified importer pricing", "Dedicated account manager", "Delivery across Nairobi hubs"].map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-[10px]">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {success ? (
            <div className="flex flex-col items-center justify-center text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-2xl">✓</span>
              <p className="mt-5 text-lg font-semibold">Thanks! Our team will contact you within one business day.</p>
              {success.whatsappUrl && (
                <a
                  href={success.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 w-full rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
                >
                  Open WhatsApp
                </a>
              )}
              <button onClick={() => setSuccess(null)} className="mt-3 text-sm text-slate-400 hover:text-white">
                Send another request
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="relative space-y-4">
              {profile.fields.map((f) => (
                <label key={f} className="block">
                  <span className="text-sm font-medium text-slate-300">{f}</span>
                  <input
                    required
                    value={values[`${active}-${f}`] || ""}
                    onChange={(e) => {
                      setValues((v) => ({ ...v, [`${active}-${f}`]: e.target.value }));
                      setErrors((er) => ({ ...er, [f]: undefined }));
                    }}
                    className={`mt-1 w-full rounded-xl border bg-slate-800 px-4 py-2.5 text-white outline-none placeholder:text-slate-500 focus:ring-2 ${
                      errors[f]
                        ? "border-red-400 focus:border-red-400 focus:ring-red-400/30"
                        : "border-slate-700 focus:border-brand-500 focus:ring-brand-500/30"
                    }`}
                  />
                  {errors[f] && <span className="mt-1 block text-xs text-red-400">{errors[f]}</span>}
                </label>
              ))}

              {/* Honeypot: hidden from people, must stay empty. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label>
                  Website
                  <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </label>
              </div>

              {formError && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{formError}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
              >
                {submitting ? (slow ? "Sending your request… this can take a moment" : "Sending…") : "Submit Partner Request"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
