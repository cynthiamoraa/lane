import { useSiteData } from "../SiteDataContext.jsx";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "./Icons.jsx";
import Skeleton from "./Skeleton.jsx";

export default function Contact() {
  const { site, waLink, loading } = useSiteData();
  const cards = [
    { icon: PhoneIcon, label: "Call us", value: site.phone, href: `tel:+${String(site.whatsappNumber).replace(/\D/g, "")}` },
    { icon: MailIcon, label: "Email", value: site.email, href: `mailto:${site.email}` },
    { icon: WhatsAppIcon, label: "WhatsApp", value: "Chat with us", href: waLink(), external: true },
  ];

  return (
    <section id="contact" className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Contact Us</h2>
        <p className="mt-3 text-lg text-slate-600">Have a question? Reach out — we&apos;re here to help.</p>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {cards.map(({ icon: Icon, label, value, href, external }) => (
            <a
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer" : undefined}
              className="group rounded-3xl border border-slate-200 p-8 transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl"
            >
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                <Icon className="h-6 w-6" />
              </span>
              <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
              {loading && !external ? (
                <Skeleton className="mx-auto mt-1 h-6 w-36" />
              ) : (
                <p className="mt-1 font-bold text-slate-900">{value}</p>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
