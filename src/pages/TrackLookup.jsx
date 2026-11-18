import { useState } from "react";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../usePageTitle.js";

export default function TrackLookup() {
  usePageTitle("Track your order | Lane");
  const navigate = useNavigate();
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const ref = reference.trim().toUpperCase();
    if (!ref) {
      setError("Please enter your order reference.");
      return;
    }
    navigate(`/track/${encodeURIComponent(ref)}`);
  };

  return (
    <main className="bg-gradient-to-b from-brand-50 via-white to-white pt-28 pb-20">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <h1 className="text-center text-3xl font-black tracking-tight sm:text-4xl">Track your order</h1>
        <p className="mt-3 text-center text-slate-600">
          Enter the reference from your order confirmation or WhatsApp message.
        </p>

        <form onSubmit={submit} className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Order reference</span>
            <input
              value={reference}
              onChange={(e) => { setReference(e.target.value); setError(""); }}
              placeholder="e.g. LN-7F3K2"
              autoCapitalize="characters"
              className={`mt-1 w-full rounded-xl border bg-slate-50 px-4 py-3 text-lg font-semibold uppercase tracking-wide outline-none placeholder:font-normal placeholder:normal-case placeholder:tracking-normal focus:bg-white focus:ring-2 ${
                error ? "border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-brand-400 focus:ring-brand-100"
              }`}
            />
            {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
          </label>
          <button
            type="submit"
            className="mt-4 w-full rounded-full bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
          >
            Track order
          </button>
        </form>
      </div>
    </main>
  );
}
