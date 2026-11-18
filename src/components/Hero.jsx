import { useEffect, useRef, useState } from "react";
import { askLaneAI } from "../laneAI.js";
import { apiPost, ApiError, isOffline } from "../api.js";
import { availabilityOf, byPrice } from "../availability.js";
import { useSiteData } from "../SiteDataContext.jsx";
import ProductCard from "./ProductCard.jsx";
import { SendIcon, SparkIcon } from "./Icons.jsx";
import Skeleton from "./Skeleton.jsx";

// Shown in the chat but never sent to the API.
const welcome = {
  role: "assistant",
  content: "Hi, I'm Lane AI. Tell me your car model, tyre size or the oil you need and I'll match it against importer stock in Nairobi.",
};

const starterSuggestions = [
  "225/65R17 for Toyota Harrier",
  "All-season vs all-terrain?",
  "5W-30 synthetic oil",
  "Fleet tyres",
];

const MAX_HISTORY = 20;

// The API expects the conversation to start with a user turn and only role/content.
function toApiHistory(messages) {
  const history = messages.filter((m) => !m.skip).map(({ role, content }) => ({ role, content })).slice(-MAX_HISTORY);
  while (history.length && history[0].role !== "user") history.shift();
  return history;
}

// Highlight the last three words of the heading in the brand gradient,
// e.g. "The Smartest Way To Buy" + "Tyres & Oils."
function splitHeading(text) {
  const words = String(text ?? "").trim().split(/\s+/);
  if (words.length <= 3) return { lead: "", accent: words.join(" ") };
  return { lead: words.slice(0, -3).join(" "), accent: words.slice(-3).join(" ") };
}

export default function Hero({ pendingQuery }) {
  const { site, featured, loading, backendStatus, wake, reportBackendDown } = useSiteData();
  const heading = splitHeading(site.heroHeading);
  const [messages, setMessages] = useState([]); // [{ role: "user" | "assistant", content, count?, offline?, skip? }]
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [results, setResults] = useState(featured);
  const [hasSearched, setHasSearched] = useState(false);
  const [recommendation, setRecommendation] = useState(null); // { productId, reason } | null
  const [suggestions, setSuggestions] = useState(starterSuggestions);
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const conversationId = useRef(0); // bumps on "Start fresh" so late replies are ignored

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  // Show the API's featured stock once it arrives, unless the user has already searched.
  useEffect(() => {
    if (!hasSearched) setResults(featured);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featured]);

  useEffect(() => {
    if (pendingQuery) send(pendingQuery.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuery]);

  function showProducts(products, rec) {
    if (products.length) {
      setResults(products);
      setHasSearched(true);
      setRecommendation(rec);
    } else if (rec) {
      setRecommendation(rec);
    }
  }

  // Answer with the local matcher (backend asleep, waking or unreachable).
  function answerLocally(q, { offline }) {
    const { reply, products } = askLaneAI(q);
    setMessages((m) => [...m, { role: "assistant", content: reply, count: products.length, offline }]);
    showProducts(products, null);
    setSuggestions([]);
  }

  async function send(text) {
    const q = text.trim();
    if (!q || typing) return;

    const userMsg = { role: "user", content: q };
    const conversation = [...messages, userMsg];
    const myId = conversationId.current;
    setMessages(conversation);
    setInput("");
    setTyping(true);

    // Backend still starting up (or gave up waking): don't make the customer wait.
    // The "starting up" notice explains this; once it's ready we switch to the live API.
    if (backendStatus !== "ready") {
      if (backendStatus === "offline") wake(); // try waking it again in the background
      await new Promise((r) => setTimeout(r, 500));
      if (myId !== conversationId.current) return;
      answerLocally(q, { offline: backendStatus === "offline" });
      setTyping(false);
      return;
    }

    try {
      const res = await apiPost("/ai/chat", { messages: toApiHistory(conversation) });
      if (myId !== conversationId.current) return;
      const products = Array.isArray(res?.products) ? res.products : [];
      setMessages((m) => [...m, { role: "assistant", content: res?.reply || "", count: products.length }]);
      showProducts(products, res?.recommendation ?? null);
      setSuggestions(Array.isArray(res?.suggestions) ? res.suggestions : []);
    } catch (err) {
      if (myId !== conversationId.current) return;
      if (err instanceof ApiError && err.status === 429) {
        // Rate limited: tell the user, and leave this turn out of the history we send next time.
        setMessages((m) => [
          ...m.slice(0, -1),
          { ...userMsg, skip: true },
          { role: "assistant", content: err.message, skip: true },
        ]);
      } else {
        // API down or timed out: answer with the local matcher, and check whether
        // the backend has gone back to sleep.
        if (isOffline(err)) reportBackendDown();
        answerLocally(q, { offline: true });
      }
    } finally {
      if (myId === conversationId.current) setTyping(false);
    }
  }

  function reset() {
    conversationId.current += 1;
    setMessages([]);
    setResults(featured);
    setHasSearched(false);
    setRecommendation(null);
    setSuggestions(starterSuggestions);
    setTyping(false);
    setInput("");
  }

  // Group results by availability. The recommendation card only ever shows an in-stock product:
  // the API's pick if it's in stock, otherwise the cheapest in-stock match (or the first featured item).
  const inStock = results.filter((p) => availabilityOf(p) === "in_stock");
  const orderIn = byPrice(results.filter((p) => availabilityOf(p) === "order_in"));
  const online = byPrice(results.filter((p) => availabilityOf(p) === "found_online"));

  const apiPick = recommendation && inStock.find((p) => p.id === recommendation.productId);
  const sortedStock = hasSearched ? byPrice(inStock) : inStock;
  const best = apiPick || sortedStock[0] || null;
  const otherStock = sortedStock.filter((p) => p !== best);

  const groups = [
    { title: "In stock at Lane", items: otherStock },
    { title: "Available to order", items: orderIn },
    { title: "Found online", items: online },
  ].filter((g) => g.items.length > 0);

  const toRequest = orderIn.length + online.length;
  const countLabel = [
    inStock.length > 0 && `${inStock.length} in stock`,
    toRequest > 0 && (inStock.length > 0 ? `${toRequest} more to request` : `${toRequest} to request`),
  ]
    .filter(Boolean)
    .join(" · ") || "0 items";
  const sortLabel = hasSearched ? "Sorted by price" : "Featured stock";

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white pt-28 pb-16">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Live importer stock · Nairobi
          </span>
          {loading ? (
            <>
              <Skeleton className="mx-auto mt-6 h-10 w-11/12 sm:h-[60px]" />
              <Skeleton className="mx-auto mt-2 h-10 w-2/3 sm:h-[60px]" />
              <Skeleton className="mx-auto mt-5 h-7 w-4/5 sm:h-8" />
            </>
          ) : (
            <>
              <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
                {heading.lead}{" "}
                <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                  {heading.accent}
                </span>
              </h1>
              <p className="mt-5 text-lg text-slate-600 sm:text-xl">{site.heroSubtext}</p>
            </>
          )}
          <button
            onClick={() => inputRef.current?.focus()}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700"
          >
            <SparkIcon className="h-5 w-5" /> Ask Lane AI →
          </button>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-5">
          {/* Chat */}
          <div className="flex h-[560px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-white">
                  <SparkIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Lane AI</p>
                  <p className="text-xs text-slate-400">This conversation is not stored</p>
                </div>
              </div>
              <button onClick={reset} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-600">
                Start fresh
              </button>
            </div>

            {backendStatus === "waking" && (
              <p role="status" className="flex items-center gap-2 border-b border-amber-100 bg-amber-50 px-5 py-2 text-xs text-amber-800">
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-500" />
                Lane AI is starting up, this can take up to a minute. Basic matches are shown meanwhile.
              </p>
            )}

            <div ref={chatRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {[welcome, ...messages].map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-sm bg-brand-600 text-white"
                        : "rounded-bl-sm bg-slate-100 text-slate-800"
                    }`}
                  >
                    {m.content}
                    {m.count > 0 && (
                      <p className="mt-2 text-xs font-semibold text-brand-700">
                        Matching Inventory ({m.count} {m.count > 1 ? "items" : "item"}) →
                      </p>
                    )}
                  </div>
                  {m.offline && <p className="mt-1 px-1 text-[11px] text-slate-400">Offline mode: showing basic matches.</p>}
                </div>
              ))}
              {typing && (
                <div className="flex gap-1 rounded-2xl bg-slate-100 px-4 py-3 w-fit">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${d * 150}ms` }} />
                  ))}
                </div>
              )}
            </div>

            {suggestions.length > 0 && !typing && (
              <div className="flex flex-wrap gap-2 px-5 pb-3">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2 border-t border-slate-100 p-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. 225/65R17 for my Harrier"
                className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="flex items-center gap-1 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40"
              >
                Send <SendIcon className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Recommendation + Inventory */}
          <div id="inventory" className="rounded-3xl border border-slate-200 bg-slate-50/60 p-5 lg:col-span-3">
            {best && (
              <>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-bold">Lane AI&apos;s Recommendation</h3>
                  <span className="text-sm text-slate-500">{sortLabel}</span>
                </div>
                <div className="mt-4">
                  <ProductCard product={best} highlight />
                  {apiPick && recommendation.reason && (
                    <p className="mt-3 flex gap-2 text-sm text-slate-600">
                      <SparkIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                      <span>{recommendation.reason}</span>
                    </p>
                  )}
                </div>
              </>
            )}

            <div className={`flex flex-wrap items-baseline justify-between gap-2 ${best ? "mt-6" : ""}`}>
              <h3 className="text-lg font-bold">Inventory ({countLabel})</h3>
              {!best && <span className="text-sm text-slate-500">{sortLabel}</span>}
            </div>
            <p className="text-sm text-slate-500">
              Match your exact tyre size, compare prices, and book a fitting near you in seconds.
            </p>
            <div className={`mt-4 space-y-5 overflow-y-auto pr-1 ${best ? "max-h-[300px]" : "max-h-[560px]"}`}>
              {groups.map((g) => (
                <div key={g.title}>
                  <h4 className="mb-2 text-sm font-semibold text-slate-700">
                    {g.title} <span className="font-normal text-slate-400">({g.items.length})</span>
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {g.items.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              ))}
              {groups.length === 0 && (
                <p className="text-sm text-slate-400">No other matches. Ask Lane AI for another size.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
