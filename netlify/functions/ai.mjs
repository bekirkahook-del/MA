// AI proxy for M&A. Keeps the Anthropic key on the server and only answers signed-in users.
// Netlify env vars: ANTHROPIC_API_KEY (required), SUPABASE_SERVICE_ROLE_KEY (optional, turns on the daily limit),
// AI_DAILY_LIMIT (optional, default 60), AI_MODEL_QUICK / AI_MODEL_DEFAULT / AI_MODEL_COMPLEX (optional overrides).
const SB_URL = "https://nbakxpnhcfzdosbzbupd.supabase.co";
const SB_KEY = "sb_publishable_-2q58P2-fXrY-q1y4GQ8jw_58OrzsDu";
const MODELS = {
  quick: process.env.AI_MODEL_QUICK || "claude-haiku-5-5",
  default: process.env.AI_MODEL_DEFAULT || "claude-sonnet-5-5",
  complex: process.env.AI_MODEL_COMPLEX || "claude-sonnet-5-5",
};
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function getUser(token) {
  if (!token) return null;
  const r = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` } });
  return r.ok ? r.json() : null;
}

async function underLimit(uid) {
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!svc) return true;
  const limit = Number(process.env.AI_DAILY_LIMIT || 60);
  const id = `${uid}_${new Date().toISOString().slice(0, 10)}`;
  const h = { apikey: svc, "Content-Type": "application/json", ...(svc.startsWith("eyJ") ? { Authorization: `Bearer ${svc}` } : {}) };
  const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.ai_usage&id=eq.${id}&select=data`, { headers: h });
  const rows = r.ok ? await r.json() : [];
  const n = (rows[0] && rows[0].data && rows[0].data.n) || 0;
  if (n >= limit) return false;
  await fetch(`${SB_URL}/rest/v1/docs`, {
    method: "POST",
    headers: { ...h, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ col: "ai_usage", id, uid, data: { n: n + 1 }, updated_at: new Date().toISOString() }),
  });
  return true;
}

function parseJSON(text) {
  const t = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try { return JSON.parse(t); } catch (e) {}
  const a = t.search(/[\[{]/), b = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
  if (a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1));
  throw new Error("bad json");
}

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  if (!process.env.ANTHROPIC_API_KEY) return json(503, { error: "AI isn't set up yet", code: "no_key" });
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const user = await getUser(token);
  if (!user || !user.id) return json(401, { error: "Sign in to use AI features", code: "not_granted" });
  let body;
  try { body = await req.json(); } catch (e) { return json(400, { error: "Bad request" }); }
  const prompt = String(body.prompt || "").slice(0, 60000);
  if (!prompt) return json(400, { error: "Empty prompt" });
  if (!(await underLimit(user.id))) return json(429, { error: "Daily AI limit reached. Try again tomorrow.", code: "limit" });

  const model = MODELS[body.tier] || MODELS.default;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      system: "Reply with valid JSON only. No markdown fences, no text before or after the JSON.",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    console.error("Anthropic error", r.status, t.slice(0, 500));
    return json(502, { error: "AI service error", code: "upstream" });
  }
  const out = await r.json();
  const text = (out.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
  try { return json(200, { result: parseJSON(text) }); }
  catch (e) { return json(502, { error: "AI returned an unreadable answer. Try again.", code: "parse" }); }
};
