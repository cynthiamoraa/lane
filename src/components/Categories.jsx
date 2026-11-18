import { useSiteData } from "../SiteDataContext.jsx";
import Skeleton from "./Skeleton.jsx";

export default function Categories({ onPick }) {
  const { categories, loading } = useSiteData();

  return (
    <section className="bg-gradient-to-b from-white to-brand-50/60 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Find Your Category</h2>
          <p className="mt-3 text-lg text-slate-600">What are you looking for today? Pick a category to start.</p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex flex-col items-start rounded-3xl border border-slate-200 bg-white p-6">
                  <Skeleton className="h-14 w-14 rounded-2xl" />
                  <Skeleton className="mt-5 h-7 w-32" />
                  <Skeleton className="mt-1 h-5 w-40" />
                  <Skeleton className="mt-5 h-5 w-24" />
                </div>
              ))
            : categories.map((c) => (
                <button
                  key={c.id ?? c.title}
                  onClick={() => onPick(c.query)}
                  className="group flex flex-col items-start rounded-3xl border border-slate-200 bg-white p-6 text-left transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-xl"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-3xl transition group-hover:bg-brand-100">
                    {c.icon}
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{c.title}</h3>
                  <p className="text-sm text-slate-500">{c.subtitle}</p>
                  <span className="mt-5 text-sm font-semibold text-brand-600 group-hover:underline">Ask Lane AI →</span>
                </button>
              ))}
        </div>
      </div>
    </section>
  );
}
