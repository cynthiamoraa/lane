import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import WhatsAppFab from "./components/WhatsAppFab.jsx";
import OfflineNotice from "./components/OfflineNotice.jsx";
import Home from "./pages/Home.jsx";
import TrackLookup from "./pages/TrackLookup.jsx";
import TrackOrder from "./pages/TrackOrder.jsx";
import Privacy from "./pages/Privacy.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  const { pathname, hash } = useLocation();

  // New page without a #section: start at the top (Home handles hash scrolling itself).
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div id="top" className="min-h-screen font-sans">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/track" element={<TrackLookup />} />
        <Route path="/track/:reference" element={<TrackOrder />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <CartDrawer />
      <WhatsAppFab />
      <OfflineNotice />
    </div>
  );
}
