// AI proxy for M&A. Keeps the Anthropic key on the server and only answers signed-in users.
// Netlify env vars: ANTHROPIC_API_KEY (required), SUPABASE_SERVICE_ROLE_KEY (required: the daily limit fails closed without it),
// AI_GLOBAL_DAILY (optional, hard cap on AI calls per day across ALL users, default 3000),
// AI_MODEL_QUICK / AI_MODEL_DEFAULT / AI_MODEL_COMPLEX (optional overrides).
import { json, getUser, getBilling, tierOf, AI_LIMITS, isOwnerUser, isConfirmed, bump, hitLimit, tooMany, clientIp } from "./_lib/common.mjs";
const MODELS = {
  quick: process.env.AI_MODEL_QUICK || "claude-haiku-5-5",
  default: process.env.AI_MODEL_DEFAULT || "claude-sonnet-5-5",
  complex: process.env.AI_MODEL_COMPLEX || "claude-sonnet-5-5",
};
const GLOBAL_DAILY = Number(process.env.AI_GLOBAL_DAILY || 3000);
const hasSvc = () => !!(process.env.SUPABASE_SERVICE_ROLE_KEY_good || process.env.SUPABASE_SERVICE_ROLE_KEY);

function parseJSON(text) {
  const t = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try { return JSON.parse(t); } catch (e) {}
  const a = t.search(/[\[{]/), b = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
  if (a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1));
  throw new Error("bad json");
}

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  if (!(process.env.ANTHROPIC_API_KEY || process.env.AnthropicAPIKeyMNA)) return json(503, { error: "AI isn't set up yet", code: "no_key" });
  if (!hasSvc()) return json(503, { error: "AI isn't set up yet", code: "no_key" }); // never run without the usage limit
  const user = await getUser(req);
  if (!user || !user.id) return json(401, { error: "Sign in to use AI features", code: "not_granted" });
  if (!isConfirmed(user)) return json(409, { error: "Confirm your email to use AI features.", code: "unconfirmed" });
  let body;
  try { body = await req.json(); } catch (e) { return json(400, { error: "Bad request" }); }
  const prompt = typeof body.prompt === "string" ? body.prompt.slice(0, 60000) : "";
  if (!prompt) return json(400, { error: "Empty prompt" });
  // burst limit (the daily allowance below is the real quota): 20 calls a minute per account, 60 a minute per IP
  if (!(await hitLimit("ai-u", user.id, 20, 60, false)) || !(await hitLimit("ai-ip", clientIp(req, context), 120, 60, false))) return tooMany();
  // pay tier decides the daily AI allowance
  const owner = await isOwnerUser(user);
  let plan = "free";
  try { plan = owner ? "owner" : tierOf(await getBilling(user.id)); } catch (e) {}
  const limit = AI_LIMITS[plan] ?? AI_LIMITS.free;
  const day = new Date().toISOString().slice(0, 10);
  let left;
  try {
    // atomic daily counters: one per account, one for the whole site (a hard ceiling on the Anthropic bill)
    const used = await bump("ai_usage", `${user.id}_${day}`, user.id, limit);
    if (used === null) return json(429, { error: plan === "free" ? `You've used today's ${limit} free AI uses. Pro is unlimited.` : plan === "trial" ? `You've used today's ${limit} trial AI uses. Upgrade for more.` : "Daily AI limit reached. Try again tomorrow.", code: "limit", plan, limit });
    left = limit - used;
    if (!owner && (await bump("ai_usage", `global_${day}`, null, GLOBAL_DAILY)) === null) return json(503, { error: "AI is at capacity for today. Try again tomorrow.", code: "capacity" });
  } catch (e) { console.error("ai limit", String(e)); return json(503, { error: "AI is unavailable right now. Try again in a minute.", code: "upstream" }); }

  const model = Object.hasOwn(MODELS, body.tier) ? MODELS[body.tier] : MODELS.default;
  let r;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": (process.env.ANTHROPIC_API_KEY || process.env.AnthropicAPIKeyMNA), "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model,
        max_tokens: 4000,
        system: "Reply with valid JSON only. No markdown fences, no text before or after the JSON.",
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(25000),
    });
  } catch (e) { console.error("Anthropic fetch", String(e)); return json(504, { error: "AI took too long. Try again.", code: "upstream" }); }
  if (!r.ok) {
    const t = await r.text();
    console.error("Anthropic error", r.status, t.slice(0, 500));
    return json(502, { error: "AI service error", code: "upstream" });
  }
  const out = await r.json();
  const text = (out.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
  try { return json(200, { result: parseJSON(text), plan, left }); }
  catch (e) { return json(502, { error: "AI returned an unreadable answer. Try again.", code: "parse" }); }
};
