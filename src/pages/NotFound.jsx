import { Link } from "react-router-dom";
import usePageTitle from "../usePageTitle.js";

export default function NotFound() {
  usePageTitle("Page not found | Lane");
  return (
    <main className="pt-28 pb-24">
      <div className="mx-auto max-w-md px-4 text-center sm:px-6">
        <p className="text-6xl">🛞</p>
        <h1 className="mt-6 text-3xl font-black tracking-tight">Page not found</h1>
        <p className="mt-3 text-slate-600">That page has rolled off somewhere. Let's get you back on the road.</p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
