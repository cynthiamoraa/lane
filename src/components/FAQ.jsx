import { useState } from "react";
import { useSiteData } from "../SiteDataContext.jsx";
import { ChevronIcon } from "./Icons.jsx";
import Skeleton from "./Skeleton.jsx";

export default function FAQ() {
  const [open, setOpen] = useState(0);
  // The context maps the API's question/answer to q/a.
  const { faqs, loading } = useSiteData();

  return (
    <section id="faq" className="bg-white py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
          <p className="mt-3 text-lg text-slate-600">
            Straight answers for real concerns — because trust is measured in millimetres.
          </p>
        </div>

        <div className="mt-12 divide-y divide-slate-200 rounded-3xl border border-slate-200">
          {loading &&
            Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="px-6 py-5">
                <Skeleton className="h-6 w-4/5" />
                {i === 0 && <Skeleton className="mt-5 h-12 w-full" />}
              </div>
            ))}
          {!loading && faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.id ?? f.q}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-slate-900">{f.q}</span>
                  <ChevronIcon
                    className={`h-5 w-5 shrink-0 text-brand-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <p className="overflow-hidden px-6 text-slate-600">
                    <span className="block pb-5">{f.a}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
