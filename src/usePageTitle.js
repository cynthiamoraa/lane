import { useEffect } from "react";

export const DEFAULT_TITLE = "Buy Tyres & Engine Oil in Nairobi | Direct from Importers | Lane";

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title || DEFAULT_TITLE;
  }, [title]);
}
