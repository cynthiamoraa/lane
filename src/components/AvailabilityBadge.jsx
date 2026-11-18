import { availabilityOf } from "../availability.js";

const styles = {
  in_stock: { label: "In stock", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  order_in: { label: "Available to order", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  found_online: { label: "Found online", cls: "bg-slate-100 text-slate-600 ring-slate-200" },
};

export default function AvailabilityBadge({ product, className = "" }) {
  const { label, cls } = styles[availabilityOf(product)];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${cls} ${className}`}>
      {label}
    </span>
  );
}
