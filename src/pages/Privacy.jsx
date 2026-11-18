import { useSiteData } from "../SiteDataContext.jsx";
import usePageTitle from "../usePageTitle.js";

// PLACEHOLDER COPY: have this reviewed (ideally by someone familiar with Kenya's
// Data Protection Act, 2019) before publishing. Bracketed text is for the business owner to fill in.

function Section({ title, children }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3 text-slate-600">{children}</div>
    </section>
  );
}

export default function Privacy() {
  usePageTitle("Privacy Policy | Lane");
  const { site } = useSiteData();

  return (
    <main className="pt-24 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div role="note" className="rounded-2xl border border-yellow-300 bg-yellow-100 px-5 py-3 text-sm font-semibold text-yellow-900">
          Draft: have this reviewed before publishing.
        </div>

        <h1 className="mt-8 text-3xl font-black tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: [date]</p>

        <Section title="Who we are">
          <p>
            Lane is operated by Lane Ltd, [registered address], Nairobi, Kenya. We help you buy tyres and engine oil
            sourced directly from importers and fitted at a partner service centre.
          </p>
          <p>
            You can reach us at <a className="font-medium text-brand-600 hover:underline" href={`mailto:${site.email}`}>{site.email}</a>{" "}
            or on {site.phone}.
          </p>
        </Section>

        <Section title="What we collect">
          <ul className="list-disc space-y-1 pl-5">
            <li>Your name and phone number.</li>
            <li>Your vehicle (make, model and year).</li>
            <li>Order details: the products, quantities, chosen fitting centre and any referral code.</li>
            <li>[Any other data, e.g. partner request details, payment confirmations, website analytics.]</li>
          </ul>
          <p>
            <strong>Lane AI chats are not stored.</strong> Your messages are used only to answer you during that
            conversation. [Confirm with the technical team whether any AI provider processes messages and add details.]
          </p>
        </Section>

        <Section title="Why we collect it">
          <p>We use your information to:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>verify stock with the importer before asking you to pay;</li>
            <li>process your order;</li>
            <li>arrange fitting at a service centre; and</li>
            <li>contact you on WhatsApp about your order.</li>
          </ul>
          <p>[State the lawful basis for each purpose, e.g. performing a contract with you, or your consent.]</p>
        </Section>

        <Section title="Who we share it with">
          <p>
            We share your details with importers and service centres only as needed to fulfil your order: for example,
            confirming stock or booking your fitting. We do not sell your data. [List any other processors, e.g.
            hosting, WhatsApp/Meta, payment providers.]
          </p>
        </Section>

        <Section title="How long we keep it">
          <p>[State retention periods, e.g. order records kept for X years for tax and warranty purposes, then deleted.]</p>
        </Section>

        <Section title="Your rights">
          <p>Under Kenya's Data Protection Act, 2019 you have the right to:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>access the personal data we hold about you;</li>
            <li>ask us to correct data that is wrong or incomplete; and</li>
            <li>ask us to delete your data, where we don't need to keep it by law.</li>
          </ul>
          <p>
            To make a request, email <a className="font-medium text-brand-600 hover:underline" href={`mailto:${site.email}`}>{site.email}</a>{" "}
            with your name, phone number and order reference (if you have one). [State how quickly you will respond.]
            You can also complain to the Office of the Data Protection Commissioner (ODPC).
          </p>
        </Section>

        <Section title="Contact us">
          <p>
            Questions about this policy? Email{" "}
            <a className="font-medium text-brand-600 hover:underline" href={`mailto:${site.email}`}>{site.email}</a> or call{" "}
            {site.phone}.
          </p>
        </Section>
      </div>
    </main>
  );
}
