// Grey pulsing placeholder. Pass Tailwind size classes so it matches the real content.
export default function Skeleton({ className = "" }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded-lg bg-slate-200/80 ${className}`} />;
}
