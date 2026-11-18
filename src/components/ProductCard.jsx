import { formatKES } from "../data/site.js";
import { useCart } from "../CartContext.jsx";
import { availabilityOf, CONFIRM_NOTE } from "../availability.js";
import AvailabilityBadge from "./AvailabilityBadge.jsx";

export default function ProductCard({ product, highlight = false }) {
  const { add } = useCart();
  const isTyre = product.type === "tyre";
  const availability = availabilityOf(product);
  const inStock = availability === "in_stock";
  const online = availability === "found_online";
  const estimate = product.estimatedPrice ?? product.price;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg ${
        highlight ? "border-brand-400 ring-2 ring-brand-100" : "border-slate-200"
      }`}
    >
      {highlight && (
        <span className="absolute -top-2.5 left-4 rounded-full bg-brand-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Best value
        </span>
      )}
      <div className="flex items-start gap-3">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-slate-100 text-2xl">
          {isTyre ? "🛞" : "🛢️"}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{product.brand}</p>
            <AvailabilityBadge product={product} />
          </div>
          <h4 className="truncate font-semibold text-slate-900">{product.name}</h4>
          <p className="text-sm text-slate-500">{product.size}</p>
        </div>
      </div>

      {online ? (
        <div className="mt-4 rounded-lg bg-slate-50 p-2 text-xs">
          {product.sourceTitle && <p className="truncate text-slate-500" title={product.sourceTitle}>{product.sourceTitle}</p>}
          {product.sourceUrl && (
            <a
              href={product.sourceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-medium text-brand-600 hover:underline"
            >
              View source ↗
            </a>
          )}
        </div>
      ) : (
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-slate-50 p-2">
            <dt className="text-slate-400">Type</dt>
            <dd className="font-medium text-slate-700">{product.season || "—"}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            <dt className="text-slate-400">Origin</dt>
            <dd className="font-medium text-slate-700">{product.origin || "—"}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            <dt className="text-slate-400">{isTyre ? "DOT" : "Batch"}</dt>
            <dd className="font-medium text-slate-700">{product.year || "—"}</dd>
          </div>
        </dl>
      )}

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {inStock && (
            <>
              <p className="text-lg font-bold text-slate-900">{formatKES(product.price)}</p>
              <p className="text-xs text-slate-400">{isTyre ? "per tyre" : "per unit"}</p>
            </>
          )}
          {availability === "order_in" &&
            (typeof estimate === "number" ? (
              <>
                <p className="text-base font-bold text-slate-900">From {formatKES(estimate)}</p>
                <p className="text-xs text-slate-400">estimate {isTyre ? "per tyre" : "per unit"}</p>
              </>
            ) : (
              <p className="text-base font-bold text-slate-900">Price on request</p>
            ))}
          {online && (
            <>
              <p className="text-base font-bold text-slate-900">Price on request</p>
              {typeof product.estimatedPrice === "number" && (
                <p className="text-xs text-slate-400">Seen online around {formatKES(product.estimatedPrice)}</p>
              )}
            </>
          )}
        </div>
        <button
          onClick={() => add(product)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
            inStock
              ? "bg-brand-600 text-white hover:bg-brand-700"
              : "border border-brand-300 bg-white text-brand-700 hover:bg-brand-50"
          }`}
        >
          {inStock ? (isTyre ? "Add set of 4" : "Add to cart") : "Request this"}
        </button>
      </div>

      {!inStock && <p className="mt-3 text-[11px] leading-snug text-slate-500">{CONFIRM_NOTE}</p>}
    </div>
  );
}
