import { steps } from "../data/site.js";

export default function HowToOrder() {
  return (
    <section id="how-to-order" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Simple. Fast. Verified.</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">How to Order with Lane AI</h2>
        </div>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="group relative rounded-3xl border border-slate-200 bg-white p-8 transition hover:border-brand-300 hover:shadow-xl"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-xl font-black text-white shadow-lg shadow-brand-600/30">
                {i + 1}
              </span>
              <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-slate-600">{s.body}</p>
              {i < steps.length - 1 && (
                <span className="absolute -right-5 top-1/2 hidden -translate-y-1/2 text-3xl text-brand-300 md:block">→</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
