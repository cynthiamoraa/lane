import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiGet } from "./api.js";
import * as fallback from "./data/site.js";

// Normalisers so API data and the local fallback have the same shape.
const toBrand = (b, i) =>
  typeof b === "string" ? { id: `b${i}`, name: b, slug: b.toLowerCase(), logoUrl: null } : b;
const toFaq = (f) => ({ id: f.id ?? f.q ?? f.question, q: f.q ?? f.question, a: f.a ?? f.answer });

const initial = {
  site: fallback.siteSettings,
  brands: fallback.brands.map(toBrand),
  categories: fallback.categories,
  faqs: fallback.faqs.map(toFaq),
  featured: fallback.inventory.slice(0, 4),
};

const SiteDataContext = createContext(null);

export function SiteDataProvider({ children }) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      apiGet("/site"),
      apiGet("/brands"),
      apiGet("/categories"),
      apiGet("/faqs"),
      apiGet("/products?featured=true"),
    ]).then(([site, brands, categories, faqs, featured]) => {
      if (cancelled) return;
      const ok = (r, check = Array.isArray) => r.status === "fulfilled" && check(r.value);

      setData((prev) => ({
        site: ok(site, (v) => v && typeof v === "object") ? { ...prev.site, ...site.value } : prev.site,
        brands: ok(brands) && brands.value.length ? brands.value.map(toBrand) : prev.brands,
        categories: ok(categories) && categories.value.length ? categories.value : prev.categories,
        faqs: ok(faqs) && faqs.value.length ? faqs.value.map(toFaq) : prev.faqs,
        featured:
          ok(featured, (v) => Array.isArray(v?.data)) && featured.value.data.length ? featured.value.data : prev.featured,
      }));
      setOffline([site, brands, categories, faqs, featured].some((r) => r.status === "rejected"));
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const waLink = useCallback(
    (text = "") => {
      const number = String(data.site.whatsappNumber || fallback.siteSettings.whatsappNumber).replace(/\D/g, "");
      return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
    },
    [data.site.whatsappNumber]
  );

  const value = useMemo(() => ({ ...data, loading, offline, waLink }), [data, loading, offline, waLink]);

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export const useSiteData = () => useContext(SiteDataContext);
