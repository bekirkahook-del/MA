// Secrets & Headers Bot: looks for live keys committed to the repo and for missing security headers.
// It NEVER prints a matched value: only file, line and the kind of secret. The site's public Supabase key (sb_publishable_) is allowed on purpose.
// Usage: node tools/bots/secrets.mjs
import fs from "node:fs";
import path from "node:path";
import { ROOT, cli } from "./lib.mjs";
import { trackedFiles, read, report } from "./scan.mjs";

const RULES = [
  ["Stripe live secret key", /\b(?:sk|rk)_live_[A-Za-z0-9]{10,}/], ["Stripe webhook secret", /\bwhsec_[A-Za-z0-9]{16,}/], ["Supabase secret key", /\bsb_secret_[A-Za-z0-9_-]{10,}/],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/], ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{30,}/], ["Slack token", /\bxox[abprs]-[A-Za-z0-9-]{10,}/], ["Private key block", /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
];
const PLACEHOLDER = /(fake|test|example|dummy|placeholder|xxxx|your[_-]?key|redacted)/i;
export function jwtRole(tok) { try { return JSON.parse(Buffer.from(tok.split(".")[1], "base64url").toString()).role || ""; } catch (e) { return ""; } }
export function scanText(text, file) {
  const out = [];
  text.split("\n").forEach((ln, i) => {
    if (ln.length > 4000) ln = ln.slice(0, 4000);
    for (const [kind, re] of RULES) { const m = ln.match(re); if (m && !PLACEHOLDER.test(ln)) out.push({ code: "secret", severity: "critical", kind, where: `${file}:${i + 1}` }); }
    for (const m of ln.matchAll(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g)) if (jwtRole(m[0]) === "service_role") out.push({ code: "secret", severity: "critical", kind: "Supabase service_role key", where: `${file}:${i + 1}` });
  });
  return out;
}
export function headers(toml) {
  const f = [], has = re => re.test(toml), add = (code, detail) => f.push({ code, severity: "info", detail, where: "netlify.toml" });
  if (!has(/X-Content-Type-Options/i)) add("hdr-nosniff", "No X-Content-Type-Options header.");
  if (!has(/X-Frame-Options|frame-ancestors/i)) add("hdr-frame", "No clickjacking protection (X-Frame-Options or CSP frame-ancestors).");
  if (!has(/Referrer-Policy/i)) add("hdr-referrer", "No Referrer-Policy header.");
  if (!has(/Strict-Transport-Security/i)) add("hdr-hsts", "No Strict-Transport-Security header (Netlify sends one by default on its own domains; check custom domain).");
  return f;
}
const TEXT = /\.(m?js|cjs|json|html|toml|md|txt|py|sh|ya?ml|env|css|webmanifest)$/i;
export function scan(root = ROOT) {
  const found = [], files = trackedFiles(root).filter(f => TEXT.test(f) || /(^|\/)\.env/.test(f));
  for (const f of files) { const p = path.join(root, f); try { if (fs.statSync(p).size > 3e6) continue; } catch (e) { continue; } found.push(...scanText(read(root, f), f)); }
  const by = {}; for (const s of found) (by[s.kind] ||= []).push(s);
  const f = Object.entries(by).map(([kind, list]) => ({ code: "secret-" + kind.toLowerCase().replace(/\W+/g, "-"), severity: "critical", where: list[0].where, detail: `${kind} found in ${list.length} place(s): ${list.slice(0, 3).map(l => l.where).join(", ")}. Value not shown. Rotate it, then remove it from git history.` }));
  const envTracked = trackedFiles(root).filter(x => /(^|\/)\.env(\.|$)/.test(x) && !/\.example$/.test(x));
  if (envTracked.length) f.push({ code: "env-tracked", severity: "critical", where: envTracked[0], detail: `${envTracked.length} .env file(s) are tracked by git: ${envTracked.join(", ")}` });
  f.push(...headers(read(root, "netlify.toml")));
  return report("secrets", f, { filesScanned: files.length });
}
cli(import.meta.url, () => scan());
