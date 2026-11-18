import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { apiGet, checkHealth } from "./api.js";
import * as fallback from "./data/site.js";

// The backend runs on Render's free plan: it sleeps after 15 minutes idle and takes
// about a minute to wake. We ping /api/health on load (which starts the wake-up),
// poll while it's waking, and swap live content in once it answers.
const POLL_MS = 5_000;
const WAKE_LIMIT_MS = 90_000;
const SKELETON_GRACE_MS = 1_500; // after this, show fallback content instead of skeletons

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
  const [backendStatus, setBackendStatus] = useState("waking"); // "waking" | "ready" | "offline"
  const contentLoaded = useRef(false);
  const wakeRun = useRef(0);
  const mounted = useRef(true);
  const statusRef = useRef(backendStatus);
  statusRef.current = backendStatus;

  const loadContent = useCallback(async () => {
    const results = await Promise.allSettled([
      apiGet("/site"),
      apiGet("/brands"),
      apiGet("/categories"),
      apiGet("/faqs"),
      apiGet("/products?featured=true"),
    ]);
    if (!mounted.current) return false;
    const [site, brands, categories, faqs, featured] = results;
    const ok = (r, check = Array.isArray) => r.status === "fulfilled" && check(r.value);

    setData((prev) => ({
      // Drop null fields so unset API values don't wipe out the local fallbacks.
      site: ok(site, (v) => v && typeof v === "object")
        ? { ...prev.site, ...Object.fromEntries(Object.entries(site.value).filter(([, v]) => v != null)) }
        : prev.site,
      brands: ok(brands) && brands.value.length ? brands.value.map(toBrand) : prev.brands,
      categories: ok(categories) && categories.value.length ? categories.value : prev.categories,
      faqs: ok(faqs) && faqs.value.length ? faqs.value.map(toFaq) : prev.faqs,
      featured:
        ok(featured, (v) => Array.isArray(v?.data)) && featured.value.data.length ? featured.value.data : prev.featured,
    }));
    setLoading(false);
    const allOk = results.every((r) => r.status === "fulfilled");
    if (allOk) contentLoaded.current = true;
    return allOk;
  }, []);

  // Ping /api/health until the backend answers, for up to 90 seconds.
  const wake = useCallback(async () => {
    const run = ++wakeRun.current;
    const started = Date.now();
    setBackendStatus("waking");

    while (mounted.current && run === wakeRun.current) {
      const attemptStart = Date.now();
      if (await checkHealth()) {
        if (!mounted.current || run !== wakeRun.current) return;
        setBackendStatus("ready");
        if (!contentLoaded.current) loadContent(); // swap live content in silently
        return;
      }
      if (Date.now() - started >= WAKE_LIMIT_MS) {
        if (mounted.current && run === wakeRun.current) setBackendStatus("offline");
        return;
      }
      // Poll every 5 seconds (a timed-out attempt has already waited longer than that).
      const wait = Math.max(0, POLL_MS - (Date.now() - attemptStart));
      await new Promise((r) => setTimeout(r, wait));
    }
  }, [loadContent]);

  // Called by features whose request failed with a network error: the backend may have
  // gone back to sleep while the page was open, so start waking it again.
  const reportBackendDown = useCallback(() => {
    if (statusRef.current !== "waking") wake();
  }, [wake]);

  useEffect(() => {
    mounted.current = true;
    wake(); // starts the wake-up in the background; doesn't block rendering
    loadContent(); // fast path when the backend is already awake
    const grace = setTimeout(() => setLoading(false), SKELETON_GRACE_MS);
    return () => {
      mounted.current = false;
      wakeRun.current++;
      clearTimeout(grace);
    };
  }, [wake, loadContent]);

  const waLink = useCallback(
    (text = "") => {
      const number = String(data.site.whatsappNumber || fallback.siteSettings.whatsappNumber).replace(/\D/g, "");
      return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
    },
    [data.site.whatsappNumber]
  );

  const value = useMemo(
    () => ({
      ...data,
      loading,
      backendStatus,
      offline: backendStatus === "offline",
      wake,
      reportBackendDown,
      waLink,
    }),
    [data, loading, backendStatus, wake, reportBackendDown, waLink]
  );

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export const useSiteData = () => useContext(SiteDataContext);
