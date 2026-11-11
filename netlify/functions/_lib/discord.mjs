// Shared helpers for the M&A Prep Discord bot. Posts go to the webhook in env DISCORD_WEBHOOK_URL.
// "Already posted" ids live in the Supabase docs table (col "discord", id "posted"), server-only.
import { SB_URL } from "./common.mjs";
import { svc } from "./mail.mjs";
export const WIRE = "https://raw.githubusercontent.com/bekirkahook-del/MA/main/data/wire.json";
export const SITE = "https://mnaprep.com";
export const BLUE = 0x2448d8, GREEN = 0x16a06a, AMBER = 0xe39b0b, VIOLET = 0x7357f6;
export const hook = () => process.env.DISCORD_WEBHOOK_URL;
export async function wire() { return (await fetch(WIRE + "?t=" + Date.now())).json(); }
export async function post(content, embeds) {
  const r = await fetch(hook(), { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "M&A Prep", content, embeds, allowed_mentions: { parse: [] } }) });
  if (!r.ok) throw new Error("discord " + r.status + " " + (await r.text()).slice(0, 200));
}
export async function getPosted() {
  const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.discord&id=eq.posted&select=data`, { headers: svc() });
  const rows = r.ok ? await r.json() : null;
  if (!rows) throw new Error("state read failed " + r.status);
  return rows[0] ? rows[0].data : null;
}
export async function putPosted(data) {
  const r = await fetch(`${SB_URL}/rest/v1/docs?on_conflict=col,id`, { method: "POST",
    headers: { ...svc(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ col: "discord", id: "posted", uid: null, data, updated_at: new Date().toISOString() }) });
  if (!r.ok) throw new Error("state save failed " + r.status);
}
export const cut = (s, n) => (s = String(s || "")).length > n ? s.slice(0, n - 1) + "…" : s;
export async function questions() {
  const js = await (await fetch(SITE + "/embed/q.js?t=" + Date.now())).text();
  return JSON.parse(js.match(/var Q=(\[[\s\S]*?\]\]);/)[1]);
}
