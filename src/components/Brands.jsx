import { useSiteData } from "../SiteDataContext.jsx";
import Skeleton from "./Skeleton.jsx";

export default function Brands() {
  const { brands, site, loading } = useSiteData();
  const loop = [...brands, ...brands];
  // The API sends e.g. "55+"; the fallback is "55+ Brands.". Normalise to "55+ Brands."
  const count = String(site.brandCountText || "").trim();
  const countText = /brand/i.test(count) ? count : `${count} Brands.`;
  return (
    <section className="border-y border-slate-100 bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          {countText} <span className="text-brand-600">One Inventory.</span>
        </h2>
      </div>
      <div className="relative mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        {loading ? (
          <div className="flex w-max gap-4">
            {Array.from({ length: 10 }, (_, i) => (
              <Skeleton key={i} className="h-[54px] w-36 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="flex w-max animate-marquee gap-4 hover:[animation-play-state:paused]">
            {loop.map((b, i) =>
              b.logoUrl ? (
                <span
                  key={`${b.id}-${i}`}
                  className="grid h-[54px] place-items-center whitespace-nowrap rounded-xl border border-slate-200 bg-white px-6 transition hover:border-brand-300"
                >
                  <img src={b.logoUrl} alt={b.name} loading="lazy" className="max-h-8 w-auto max-w-[8rem] object-contain" />
                </span>
              ) : (
                <span
                  key={`${b.id}-${i}`}
                  className="whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-6 py-3 text-lg font-bold text-slate-500 transition hover:border-brand-300 hover:text-brand-600"
                >
                  {b.name}
                </span>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}
