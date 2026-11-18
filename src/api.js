// Small fetch wrapper for the Lane Phoenix API (/api/v1).

const BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  constructor(message, { status = 0, errors = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status; // 0 = network error or timeout
    this.errors = errors; // { field: ["message"] } from a 422 response
  }
}

// True when the API couldn't be reached or failed on its side,
// i.e. when the site should fall back to local data / WhatsApp.
export const isOffline = (err) => !(err instanceof ApiError) || err.status === 0 || err.status >= 500;

async function request(method, path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${BASE_URL}/api/v1${path}`, {
      method,
      headers: { Accept: "application/json", ...(body !== undefined && { "Content-Type": "application/json" }) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    const timedOut = err?.name === "AbortError";
    throw new ApiError(timedOut ? "The request timed out. Please try again." : "We couldn't reach Lane right now.");
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON body (e.g. an HTML error page or the dev server's index.html).
    if (res.ok) throw new ApiError("Unexpected response from the server.", { status: 0 });
  }

  // Phoenix wraps most responses as { data: ... }. Unwrap those, but leave paginated
  // responses like { data: [...], meta } (products) intact.
  if (res.ok) {
    const isEnvelope = data && typeof data === "object" && !Array.isArray(data) && Object.keys(data).length === 1 && "data" in data;
    return isEnvelope ? data.data : data;
  }

  if (res.status === 429) {
    throw new ApiError("You're sending messages too fast. Please wait a moment.", { status: 429 });
  }
  if (res.status === 422) {
    throw new ApiError("Please check the highlighted fields.", { status: 422, errors: data?.errors || {} });
  }
  if (res.status === 404) {
    throw new ApiError("Not found.", { status: 404 });
  }
  throw new ApiError(data?.error || data?.message || "Something went wrong. Please try again.", { status: res.status });
}

export const apiGet = (path) => request("GET", path);
export const apiPost = (path, body) => request("POST", path, body ?? {});

// Flattens a 422 error value (string, list, or nested object such as
// items: [{ webProduct: { sourceUrl: ["is invalid"] } }]) into readable text.
export function errorText(value, label = "") {
  if (value == null) return "";
  if (typeof value === "string") return label ? `${label} ${value}` : value;
  if (Array.isArray(value)) return value.map((v) => errorText(v, label)).filter(Boolean).join(" ");
  if (typeof value === "object")
    return Object.entries(value)
      .map(([k, v]) => errorText(v, k.replace(/([A-Z])/g, " $1").replace(/_/g, " ").toLowerCase()))
      .filter(Boolean)
      .join(" ");
  return String(value);
}
