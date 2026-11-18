import { inventory, brands } from "./data/site.js";

// Simple rule-based matcher used as the offline fallback when the
// Lane AI API (POST /api/v1/ai/chat) is unavailable. See Hero.jsx.

const carSizes = {
  harrier: "225/65R17",
  "rav4": "225/65R17",
  "x-trail": "225/65R17",
  xtrail: "225/65R17",
  forester: "225/65R17",
  prado: "265/65R17",
  "land cruiser": "265/65R17",
  hilux: "265/65R17",
  "d-max": "265/70R16",
  dmax: "265/70R16",
  axio: "195/65R15",
  fielder: "195/65R15",
  premio: "195/65R15",
  allion: "195/65R15",
  note: "195/65R15",
  golf: "205/55R16",
  mazda: "205/55R16",
  demio: "195/65R15",
};

const sizeRegex = /(\d{3})\s*\/\s*(\d{2})\s*r?\s*(\d{2}(?:\.\d)?)/i;
const oilRegex = /(\d{1,2})\s*w\s*-?\s*(\d{2})/i;

export function askLaneAI(message) {
  const text = message.toLowerCase();

  // General advice questions
  if (/all[- ]?season/.test(text) && /all[- ]?terrain/.test(text)) {
    return {
      reply:
        "For mostly city and highway driving in Nairobi, all-season tyres give you a quieter ride, better fuel economy and longer tread life. Go all-terrain only if you regularly drive on murram, upcountry roads or off-road. Tell me your car model or tyre size and I'll pull matching options.",
      products: [],
    };
  }

  let size = null;
  const sm = text.match(sizeRegex);
  if (sm) size = `${sm[1]}/${sm[2]}R${sm[3]}`.toUpperCase();

  if (!size) {
    for (const [car, s] of Object.entries(carSizes)) {
      if (text.includes(car)) { size = s; break; }
    }
  }

  let results = inventory;
  let label = "";

  const om = text.match(oilRegex);
  if (om) {
    const grade = `${om[1]}W-${om[2]}`.toUpperCase();
    results = inventory.filter((p) => p.type === "oil" && p.size.toUpperCase() === grade);
    label = grade;
  } else if (size) {
    results = inventory.filter((p) => p.type === "tyre" && p.size.toUpperCase() === size);
    label = size;
  } else if (/oil|lubricant|synthetic/.test(text)) {
    results = inventory.filter((p) => p.type === "oil");
    label = "engine oils";
  } else if (/fleet|truck|lorry|commercial|15w/.test(text)) {
    results = inventory.filter((p) => p.category === "Fleet");
    label = "fleet & commercial";
  } else if (/suv|4x4|4×4|terrain/.test(text)) {
    results = inventory.filter((p) => p.category === "SUV & 4×4");
    label = "SUV & 4×4";
  } else if (/sedan|saloon|salon/.test(text)) {
    results = inventory.filter((p) => p.category === "Sedan");
    label = "sedan";
  } else {
    const brand = brands.concat(["Castrol", "Mobil", "Shell", "Total"]).find((b) => text.includes(b.toLowerCase()));
    if (brand) {
      results = inventory.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
      label = brand;
    } else {
      return {
        reply:
          "I can help with tyres and engine oils. Try a tyre size like 225/65R17, a car model like “Toyota Harrier”, or an oil grade like 5W-30.",
        products: [],
      };
    }
  }

  if (results.length === 0) {
    return {
      reply: `I couldn't find ${label} in our live inventory right now, but we source from 55+ brands. Chat with us on WhatsApp and we'll check with importers for you.`,
      products: [],
    };
  }

  const sorted = [...results].sort((a, b) => a.price - b.price);
  return {
    reply: `Found ${sorted.length} great option${sorted.length > 1 ? "s" : ""} in ${label}.`,
    products: sorted,
  };
}
