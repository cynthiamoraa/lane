import { useState } from "react";
import { useSiteData } from "../SiteDataContext.jsx";

// Small, dismissible note shown when some live data couldn't be loaded.
export default function OfflineNotice() {
  const { offline } = useSiteData();
  const [dismissed, setDismissed] = useState(false);
  if (!offline || dismissed) return null;

  return (
    <div
      role="status"
      className="fixed bottom-5 left-5 z-30 flex max-w-[calc(100%-6.5rem)] items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800 shadow-lg sm:max-w-sm"
    >
      <span>Live stock is taking a break, so you're seeing our saved catalogue. WhatsApp still works.</span>
      <button onClick={() => setDismissed(true)} className="shrink-0 font-semibold hover:text-amber-950" aria-label="Dismiss notice">
        ✕
      </button>
    </div>
  );
}
