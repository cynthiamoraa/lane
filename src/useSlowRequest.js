import { useEffect, useState } from "react";
import { useSiteData } from "./SiteDataContext.jsx";

const SLOW_AFTER_MS = 3_000;

// True while a request is in flight and is likely to be slow: right away if the
// backend isn't known to be awake, otherwise after a few seconds of waiting.
export default function useSlowRequest(inFlight) {
  const { backendStatus } = useSiteData();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!inFlight) {
      setSlow(false);
      return;
    }
    if (backendStatus !== "ready") setSlow(true);
    const t = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(t);
  }, [inFlight, backendStatus]);

  return slow;
}
