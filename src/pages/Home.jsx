import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSiteData } from "../SiteDataContext.jsx";
import usePageTitle from "../usePageTitle.js";
import Hero from "../components/Hero.jsx";
import Brands from "../components/Brands.jsx";
import HowToOrder from "../components/HowToOrder.jsx";
import Categories from "../components/Categories.jsx";
import FAQ from "../components/FAQ.jsx";
import PartnerHub from "../components/PartnerHub.jsx";
import Contact from "../components/Contact.jsx";

export default function Home() {
  usePageTitle();
  const { hash, key } = useLocation();
  const { loading } = useSiteData();

  // Lets the category cards push a query into the Lane AI chat.
  const [pendingQuery, setPendingQuery] = useState(null);

  const askLane = (q) => {
    setPendingQuery({ q, at: Date.now() });
    document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
  };

  // Arriving from another page via /#section: scroll there once rendered,
  // and again once the live content has loaded (skeletons can change heights slightly).
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [hash, key, loading]);

  return (
    <main>
      <Hero pendingQuery={pendingQuery} />
      <Brands />
      <HowToOrder />
      <Categories onPick={askLane} />
      <FAQ />
      <PartnerHub />
      <Contact />
    </main>
  );
}
