import { useEffect, useState } from "react";
import { navLinks } from "../data/site.js";
import { useSiteData } from "../SiteDataContext.jsx";
import { useCart } from "../CartContext.jsx";
import { WhatsAppIcon, CartIcon, MenuIcon, CloseIcon } from "./Icons.jsx";
import SectionLink from "./SectionLink.jsx";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, setOpen: openCart } = useCart();
  const { waLink } = useSiteData();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all ${
        scrolled ? "bg-white/90 shadow-sm backdrop-blur" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <SectionLink href="#top" className="flex items-center gap-2 text-2xl font-black tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm text-white">L</span>
          <span>Lane</span>
        </SectionLink>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <SectionLink href={l.href} className="text-sm font-medium text-slate-600 transition hover:text-brand-600">
                {l.label}
              </SectionLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openCart(true)}
            className="relative rounded-full p-2 text-slate-700 transition hover:bg-brand-50 hover:text-brand-600"
            aria-label="Open cart"
          >
            <CartIcon className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
          <a
            href={waLink()}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-600 sm:flex"
          >
            <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp
          </a>
          <button
            className="rounded-lg p-2 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 md:hidden">
          {navLinks.map((l) => (
            <SectionLink
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-base font-medium text-slate-700 hover:text-brand-600"
            >
              {l.label}
            </SectionLink>
          ))}
          <a
            href={waLink()}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-3 font-semibold text-white"
          >
            <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}
