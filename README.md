# Lane — React + Tailwind

The lane.co.ke landing page, built with React 18, Vite, Tailwind CSS 3 and React Router.
It talks to the Lane Phoenix backend's JSON API (`/api/v1`) and falls back to local sample
data and WhatsApp if the API is unavailable.

## Configure

Copy `.env.example` to `.env` and point it at the backend:

```bash
cp .env.example .env
# .env
VITE_API_URL=http://localhost:4000
```

`VITE_API_URL` is the backend's base URL, without `/api/v1`. It's read at build time, so set it
in your hosting provider's environment variables for production builds. `.env` is git-ignored.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the production build locally
```

### Against the local backend

1. Start the Phoenix backend (it should listen on `http://localhost:4000`).
2. Make sure the backend allows CORS from `http://localhost:5173`.
3. Set `VITE_API_URL=http://localhost:4000` in `.env` and run `npm run dev`.
   Restart Vite after changing `.env`.

If the API can't be reached, the site still works: content comes from `src/data/site.js`,
Lane AI answers with the local matcher in `src/laneAI.js` ("Offline mode"), and checkout and
partner requests open WhatsApp with the details typed in. A small notice tells visitors this.

## Pages

| Route | What it is |
|---|---|
| `/` | Landing page (Lane AI chat, brands, how to order, categories, FAQ, Partner Hub, contact) |
| `/track` | Enter an order reference (e.g. `LN-7F3K2`) |
| `/track/:reference` | Order tracking timeline; refreshes every 60 seconds |
| `/privacy` | Privacy policy (**draft placeholder**, have it reviewed before publishing) |
| anything else | "Page not found" |

Referral links: `https://lane.co.ke/?ref=CODE` saves the code for the session and pre-fills it at checkout.

## Structure

```
src/
  main.jsx              router + providers
  App.jsx               layout (Navbar, Footer, CartDrawer, WhatsAppFab) and routes
  api.js                fetch wrapper: apiGet/apiPost, 10s timeout, ApiError (status, 422 errors)
  SiteDataContext.jsx   loads site settings, brands, categories, FAQs, featured products
  CartContext.jsx       cart state (add, qty, total)
  laneAI.js             offline rule-based Lane AI fallback
  usePageTitle.js       sets document.title per route
  data/site.js          fallback content, nav links, partner profiles, formatKES
  pages/
    Home, TrackLookup, TrackOrder, Privacy, NotFound
  components/
    Navbar, Hero (Lane AI chat + recommendation + inventory), ProductCard, Brands (marquee),
    HowToOrder, Categories, FAQ, PartnerHub, Contact, Footer, CartDrawer (checkout form),
    WhatsAppFab, OfflineNotice, SectionLink, Skeleton, Icons
```

## Customising

- **Contacts / copy / brands / FAQs / categories:** managed in the backend. The values in
  `src/data/site.js` are only the offline fallback.
- **Brand colour:** `brand` palette in `tailwind.config.js` (600 = `#c026d3`).

## Deploying

Client-side routes like `/track/LN-7F3K2` need the host to serve `index.html` for every path:

- **Netlify / Cloudflare Pages:** `public/_redirects` (`/* /index.html 200`) is copied into `dist/`.
- **Vercel:** `vercel.json` rewrites all paths to `/index.html`.
