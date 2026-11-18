// Fallback content. The live site loads all of this from the API (see SiteDataContext.jsx)
// and only uses these values while loading or when the API is unavailable.

export const siteSettings = {
  heroHeading: "The Smartest Way To Buy Tyres & Oils.",
  heroSubtext: "Sourced directly from importers. Fitted in a service centre near you.",
  phone: "0718 109 629",
  email: "admin@lane.co.ke",
  whatsappNumber: "254718109629",
  brandCountText: "55+ Brands.",
};

export const navLinks = [
  { label: "How to Order", href: "#how-to-order" },
  { label: "Browse Inventory", href: "#inventory" },
  { label: "Partner Hub", href: "#partner-hub" },
  { label: "Contact", href: "#contact" },
];

export const brands = [
  "Armstrong", "Bridgestone", "Chaoyang", "Compasal", "Continental",
  "Cooper Tires", "Double Coin", "Dunlop", "Falken", "Fortune",
  "Goodyear", "Hankook", "Michelin", "Pirelli", "Yokohama",
];

// Fallback inventory, used by the offline Lane AI matcher (src/laneAI.js) and as featured stock
// when the API is unavailable. Live products come from /api/v1/products.
export const inventory = [
  { id: "t1", type: "tyre", brand: "Bridgestone", name: "Dueler H/T 684", size: "225/65R17", season: "All-Season", category: "SUV & 4×4", price: 18500, origin: "Japan", year: 2026, inStock: true },
  { id: "t2", type: "tyre", brand: "Dunlop", name: "Grandtrek AT5", size: "225/65R17", season: "All-Terrain", category: "SUV & 4×4", price: 16200, origin: "Thailand", year: 2026, inStock: true },
  { id: "t3", type: "tyre", brand: "Continental", name: "ComfortContact CC7", size: "195/65R15", season: "All-Season", category: "Sedan", price: 11800, origin: "Germany", year: 2026, inStock: true },
  { id: "t4", type: "tyre", brand: "Falken", name: "Wildpeak A/T3W", size: "265/65R17", season: "All-Terrain", category: "SUV & 4×4", price: 21400, origin: "Japan", year: 2025, inStock: true },
  { id: "t5", type: "tyre", brand: "Double Coin", name: "RR202", size: "315/80R22.5", season: "Highway", category: "Fleet", price: 38500, origin: "China", year: 2026, inStock: true },
  { id: "t6", type: "tyre", brand: "Chaoyang", name: "SU318 H/T", size: "225/65R17", season: "Highway", category: "SUV & 4×4", price: 10900, origin: "China", year: 2026, inStock: true },
  { id: "t7", type: "tyre", brand: "Cooper Tires", name: "Discoverer AT3 4S", size: "265/70R16", season: "All-Terrain", category: "SUV & 4×4", price: 19800, origin: "USA", year: 2025, inStock: true },
  { id: "t8", type: "tyre", brand: "Armstrong", name: "Blu-Trac HP", size: "205/55R16", season: "All-Season", category: "Sedan", price: 8900, origin: "India", year: 2026, inStock: true },
  { id: "o1", type: "oil", brand: "Castrol", name: "EDGE 5W-30 Fully Synthetic (4L)", size: "5W-30", season: "Synthetic", category: "Synthetics", price: 6800, origin: "UK", year: 2026, inStock: true },
  { id: "o2", type: "oil", brand: "Mobil", name: "Mobil 1 0W-20 (4L)", size: "0W-20", season: "Synthetic", category: "Synthetics", price: 7400, origin: "USA", year: 2026, inStock: true },
  { id: "o3", type: "oil", brand: "Shell", name: "Rimula R4 15W-40 (20L)", size: "15W-40", season: "Commercial", category: "Fleet", price: 14500, origin: "UAE", year: 2026, inStock: true },
  { id: "o4", type: "oil", brand: "Total", name: "Quartz 9000 5W-30 (4L)", size: "5W-30", season: "Synthetic", category: "Synthetics", price: 6200, origin: "France", year: 2026, inStock: true },
];

export const categories = [
  { id: "c1", title: "SUV & 4×4", subtitle: "All-Terrain & Highway", icon: "🚙", query: "SUV" },
  { id: "c2", title: "Sedan", subtitle: "Durability & Comfort", icon: "🚗", query: "Sedan" },
  { id: "c3", title: "Synthetics", subtitle: "5W-30 / 0W-20", icon: "🛢️", query: "Synthetic oil" },
  { id: "c4", title: "Fleet", subtitle: "15W-40 Commercial", icon: "🚛", query: "Fleet" },
];

export const steps = [
  { title: "Input Your Specs", body: "Type your car model, tyre size, or required lubricant into the Lane AI canvas." },
  { title: "Instant Match", body: "Lane AI cross-references Nairobi hubs to generate a side-by-side spec and price comparison." },
  { title: "Add to Cart & Check Out", body: "Add products to your cart directly from the results, enter your details and place your order. We confirm stock before you pay." },
];

export const faqs = [
  {
    q: "Are you just middlemen taking my money and searching for stock afterward?",
    a: "No. We verify stock with the importer first. A payment request is only sent once your exact item is confirmed available and reserved for you.",
  },
  {
    q: "How do I know the tyres/oils aren't expired stock?",
    a: "Every tyre carries a DOT date code on the sidewall and every oil has a batch date. We share these with you before you pay, so you can check the manufacture date yourself.",
  },
  {
    q: "What if I pay upfront and don't like the product when it arrives?",
    a: "Inspect the product before fitting. If it doesn't match what was confirmed in your order (brand, size, date code), we replace it or refund you.",
  },
  {
    q: "What happens if something goes wrong during installation at the workshop?",
    a: "We only work with vetted partner service centres. If there's a fitting issue, contact us on WhatsApp and we'll coordinate with the centre to make it right.",
  },
];

export const partnerProfiles = [
  {
    id: "fleet",
    label: "Fleet Managers",
    heading: "Request Commercial Depot Terms",
    body: "Gain access to scheduled bulk deliveries, invoicing, and fleet-wide lubricant standardisation.",
    fields: ["Company name", "Fleet size", "Contact person", "Phone number"],
  },
  {
    id: "garages",
    label: "Garages & Bays",
    heading: "Become a Lane Fitting Partner",
    body: "Receive pre-paid fitting jobs, trade pricing on stock, and priority delivery to your bay.",
    fields: ["Garage name", "Location", "Number of bays", "Phone number"],
  },
  {
    id: "influencers",
    label: "Influencers / Sales",
    heading: "Join the Lane Referral Programme",
    body: "Earn commission on every order you refer, with a personal code and monthly payouts via M-Pesa.",
    fields: ["Full name", "Platform / handle", "Audience size", "Phone number"],
  },
];

export const formatKES = (n) => `KES ${n.toLocaleString("en-KE")}`;
