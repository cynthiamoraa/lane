import { useSiteData } from "../SiteDataContext.jsx";
import { WhatsAppIcon } from "./Icons.jsx";

export default function WhatsAppFab() {
  const { waLink } = useSiteData();
  return (
    <a
      href={waLink("Hi Lane, I'd like help finding tyres/oil.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white shadow-xl transition hover:scale-110 hover:bg-emerald-600"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
