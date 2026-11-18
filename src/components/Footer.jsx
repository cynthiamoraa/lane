import { Link } from "react-router-dom";
import { navLinks } from "../data/site.js";
import SectionLink from "./SectionLink.jsx";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <SectionLink href="#top" className="flex items-center gap-2 text-xl font-black">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-600 text-xs text-white">L</span>
          Lane
        </SectionLink>
        <ul className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
          {navLinks.map((l) => (
            <li key={l.href}>
              <SectionLink href={l.href} className="hover:text-brand-600">{l.label}</SectionLink>
            </li>
          ))}
          <li>
            <Link to="/track" className="hover:text-brand-600">Track Order</Link>
          </li>
          <li>
            <Link to="/privacy" className="hover:text-brand-600">Privacy Policy</Link>
          </li>
        </ul>
        <p className="text-sm text-slate-500">© {new Date().getFullYear()} Lane Ltd.</p>
      </div>
    </footer>
  );
}
