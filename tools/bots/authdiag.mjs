// Sign-up / Sign-in Diagnostic Bot. Four independent checks on the account flow, because a broken sign-up is the most expensive bug this site can have.
//   1. FUNNEL   from real visit events: how many open the form, try it, hit errors, end up with an account.
//   2. SOURCE   static read of js/auth.js: password-manager attributes, a wrong-error trap, mismatched password rules, forgot-password, tracking.
//   3. SETTINGS (opt-in, network) Supabase's public auth settings: is sign-up switched off, is email confirmation on, which providers work.
//   4. FORM     (opt-in, browser) opens the real form at phone width and inspects it.
// HARD RULE: this bot never types an email or password, never submits a form, never creates or signs in to an account. It only looks.
// Usage: node tools/bots/authdiag.mjs [visits.json] [--live] [--smoke]
import fs from "node:fs";
import path from "node:path";
import { ROOT, cli, serve, loadPlaywright } from "./lib.mjs";
import { read, report } from "./scan.mjs";

const F = (code, severity, detail, where = "auth") => ({ code, severity, detail, where });
const n = (c, k) => c[k] || 0;

/* ---------- 1. funnel ---------- */
export function authFunnel(rows) {
  const c = {}; for (const r of rows || []) for (const [k, v] of Object.entries(((r.data || r).ev) || {})) c[k] = (c[k] || 0) + (+v || 0);
  const oauth = Object.entries(c).filter(([k]) => /^auth_oauth_/.test(k)).reduce((a, [, v]) => a + v, 0);
  const s = { opens: n(c, "auth_open"), passwordSubmits: n(c, "auth_submit"), oauthClicks: oauth, newAccounts: n(c, "auth_new"), passwordSignIns: n(c, "auth_in"), wrongPassword: n(c, "auth_wrongpw"), otherErrors: n(c, "auth_err"), signups: n(c, "signup"), resets: n(c, "auth_reset") };
  s.attempts = s.passwordSubmits + s.oauthClicks; s.oauthShare = s.attempts ? Math.round(s.oauthClicks / s.attempts * 100) : 0;
  const f = [];
  if (s.opens < 30) return { stats: s, findings: [F("auth-funnel-thin", "info", `Only ${s.opens} form opens in the data (need 30+ to judge). Funnel numbers: ${s.attempts} attempts, ${s.signups} sign-ups.`)] };
  const tryRate = Math.round(Math.min(1, s.attempts / s.opens) * 100);
  if (tryRate < 50) f.push(F("auth-open-no-try", "warn", `${s.opens} people opened the sign-in/sign-up form but only ${s.attempts} tried it (${tryRate}%). Half leave at the form itself: look at what it asks for.`));
  const errs = s.wrongPassword + s.otherErrors;
  if (s.passwordSubmits >= 10 && errs / s.passwordSubmits >= 0.2) f.push(F("auth-error-rate", "warn", `${errs} of ${s.passwordSubmits} password submits ended in an error (${Math.round(errs / s.passwordSubmits * 100)}%): ${s.wrongPassword} wrong-password, ${s.otherErrors} other.`));
  if (s.attempts >= 10 && s.signups / s.attempts < 0.5) f.push(F("auth-attempt-no-account", "warn", `${s.attempts} attempts produced ${s.signups} new accounts (${Math.round(s.signups / s.attempts * 100)}%).`));
  if (s.attempts >= 10 && s.oauthShare >= 40) f.push(F("auth-oauth-heavy", "info", `${s.oauthShare}% of attempts use Google/LinkedIn, so those buttons matter more than the password form. Keep them working and first.`));
  return { stats: s, findings: f };
}

/* ---------- 2. source ---------- */
export function auditAuthSource(src, settings) {
  const f = [], has = re => re.test(src);
  if (/r\.data\s*&&\s*r\.data\.session\)\s*\{[\s\S]{0,400}?return\s*\}\s*throw new Error\("WRONGPW"\)/.test(src))
    f.push(F("auth-confirm-trap", settings && settings.mailer_autoconfirm === true ? "info" : "warn", `After sign-up, if Supabase does not return a session (which happens whenever email confirmation is switched on) the form tells a brand-new person "That email already has an account and the password doesn't match". ${settings && settings.mailer_autoconfirm === true ? "Settings say auto-confirm is on, so this path should not fire." : "Not confirmed either way: run with --live to read the setting."}`, "js/auth.js"));
  const pw = [...src.matchAll(/<input[^>]*type=\\?"password\\?"[^>]*>/g)].map(m => m[0]);
  if (!pw.length) f.push(F("auth-no-password-field", "critical", "js/auth.js has no password input.", "js/auth.js"));
  else if (pw.some(p => !/autocomplete=/.test(p))) f.push(F("auth-pw-autocomplete", "warn", "A password field has no autocomplete attribute, so password managers and phones cannot fill it.", "js/auth.js"));
  const em = [...src.matchAll(/<input[^>]*id=\\?"auE\\?"[^>]*>/g)].map(m => m[0]); if (em.some(e => !/type=\\?"email/.test(e) || !/autocomplete=/.test(e))) f.push(F("auth-email-attrs", "info", "The email field is missing type=email or autocomplete (phones show the wrong keyboard).", "js/auth.js"));
  const rules = new Set([...src.matchAll(/length\s*<\s*(\d+)/g)].map(m => +m[1]).filter(x => x >= 4 && x <= 12)), shown = new Set([...src.matchAll(/(\d+)\+?\s*characters/gi)].map(m => +m[1]));
  if (rules.size && shown.size && ![...shown].every(x => rules.has(x))) f.push(F("auth-password-rule-mismatch", "warn", `The form says passwords need ${[...shown].join(" or ")} characters but the code checks ${[...rules].join(" or ")}.`, "js/auth.js"));
  if (!has(/forgot password/i)) f.push(F("auth-no-forgot", "warn", "No \"Forgot password\" option in the form.", "js/auth.js"));
  if (!has(/id=\\?"auEye\\?"|Show<|>Show/)) f.push(F("auth-no-show-password", "info", "No show/hide password button (a top cause of failed phone sign-ins).", "js/auth.js"));
  const raw = (src.match(/say\((?:error|x|e)\.message\)/g) || []).length; if (raw) f.push(F("auth-raw-errors", "info", `${raw} places show the server's raw error text to students (e.g. "Email rate limit exceeded"). Friendly wording converts better.`, "js/auth.js"));
  const missing = ["auth_open", "auth_submit", "auth_new", "auth_err", "auth_wrongpw"].filter(e => !src.includes('"' + e + '"')); if (missing.length) f.push(F("auth-untracked", "warn", `These steps are not tracked, so the funnel is blind there: ${missing.join(", ")}.`, "js/auth.js"));
  return f;
}

/* ---------- 3. settings ---------- */
export function judgeSettings(s) {
  if (!s || typeof s !== "object") return { findings: [F("auth-settings-unreachable", "info", "Could not read Supabase's public auth settings from here (network blocked or offline).")], stats: {} };
  const f = [], ext = s.external || {}, providers = Object.entries(ext).filter(([k, v]) => v && !["email", "phone"].includes(k)).map(([k]) => k);
  if (s.disable_signup === true) f.push(F("auth-signup-disabled", "critical", "Supabase has new sign-ups switched OFF. Nobody can create an account.", "supabase"));
  if (ext.email === false) f.push(F("auth-email-disabled", "critical", "Supabase has email sign-in switched off.", "supabase"));
  if (s.mailer_autoconfirm === false) f.push(F("auth-confirm-required", "info", "Email confirmation is ON: new password sign-ups must click an email link before they have a session.", "supabase"));
  if (!providers.length) f.push(F("auth-no-oauth", "info", "No Google/LinkedIn sign-in is enabled (the buttons stay hidden).", "supabase"));
  return { findings: f, stats: { autoconfirm: s.mailer_autoconfirm, signupDisabled: !!s.disable_signup, providers } };
}
export async function fetchSettings(url, key, ms = 8000) {
  try { const r = await fetch(url.replace(/\/$/, "") + "/auth/v1/settings", { headers: { apikey: key }, signal: AbortSignal.timeout(ms) }); return r.ok ? await r.json() : null; } catch (e) { return null; }
}

/* ---------- 4. form (browser) ---------- */
export function judgeForm(m) {
  const f = [], w = m.width || 375;
  if (m.libMissing) return [F("auth-form-untested", "info", "The sign-in library (Supabase script) did not load in this test browser, so the form could not be opened. Not a site bug by itself.")];
  if (!m.opened) return [F("auth-wont-open", "critical", "Calling the site's own sign-up opener did not show a form.", "form")];
  if (!m.fields.some(x => x.type === "email")) f.push(F("auth-form-no-email", "critical", "The opened form has no email field.", "form"));
  if (!m.fields.some(x => x.type === "password")) f.push(F("auth-form-no-password", "critical", "The opened form has no password field.", "form"));
  if (!m.submit) f.push(F("auth-form-no-submit", "critical", "The opened form has no submit button.", "form"));
  const bad = m.fields.filter(x => x.type === "password" && !x.autocomplete); if (bad.length) f.push(F("auth-form-pw-autocomplete", "warn", "The password field on screen has no autocomplete attribute.", "form"));
  const off = m.fields.filter(x => x.right > w + 1 || x.left < -1); if (off.length) f.push(F("auth-form-offscreen", "warn", `${off.length} field(s) run off the edge of a ${w}px phone screen.`, "form"));
  const unl = m.fields.filter(x => !x.labelled); if (unl.length) f.push(F("auth-form-unlabelled", "info", `${unl.length} field(s) have no visible label or aria-label.`, "form"));
  if (m.errors && m.errors.length) f.push(F("auth-form-js-errors", "warn", `Opening the form threw: ${m.errors[0].slice(0, 120)}`, "form"));
  return f;
}
export async function probeForm(root = ROOT, mode = "up") {
  const s = await serve(root), { chromium } = loadPlaywright(), b = await chromium.launch();
  try {
    const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true }), pg = await ctx.newPage(), errors = []; pg.on("pageerror", e => errors.push(String(e.message || e)));
    await pg.goto(s.url + "/index.html", { waitUntil: "load" }); await pg.waitForTimeout(1500);
    const m = await pg.evaluate(m => { if (typeof window.maOpenAuth !== "function") return { libMissing: typeof window.supabase === "undefined", opened: false, fields: [] }; try { window.maOpenAuth(m); } catch (e) { return { opened: false, fields: [], err: String(e) }; } return null; }, mode);
    await pg.waitForTimeout(700);
    const meas = m || await pg.evaluate(() => { const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }; const inputs = [...document.querySelectorAll("input")].filter(vis); const fields = inputs.map(i => { const r = i.getBoundingClientRect(); return { type: i.type, autocomplete: i.getAttribute("autocomplete") || "", labelled: !!(i.getAttribute("aria-label") || (i.closest("label") && i.closest("label").textContent.trim()) || (i.id && document.querySelector(`label[for="${i.id}"]`))), left: r.left, right: r.right }; }); const form = inputs.find(i => i.type === "password") && inputs.find(i => i.type === "password").closest("form"); const submit = form && [...form.querySelectorAll("button")].some(b => b.type === "submit" || /continue|sign|create|log/i.test(b.textContent)); return { opened: fields.length > 0, fields, submit: !!submit, width: window.innerWidth }; });
    return judgeForm({ ...meas, width: 375, errors });
  } finally { await b.close(); s.close(); }
}

/* ---------- the bot ---------- */
export async function scan(root = ROOT, o = {}) {
  const f = [], stats = {}, fun = authFunnel(o.rows); f.push(...fun.findings); Object.assign(stats, fun.stats);
  let settings = null;
  if (o.network) { const be = read(root, "js/backend.js"), url = (be.match(/SB_URL\s*=\s*"([^"]+)"/) || [])[1], key = (be.match(/SB_KEY\s*=\s*"([^"]+)"/) || [])[1]; if (url && key) settings = await fetchSettings(url, key); const j = judgeSettings(settings); f.push(...j.findings); Object.assign(stats, { settings: j.stats }); }
  f.push(...auditAuthSource(read(root, "js/auth.js"), settings));
  if (o.smoke) { f.push(...await probeForm(root, "up")); }
  return report("authdiag", f, stats);
}
cli(import.meta.url, async a => { const file = a.find(x => x.endsWith(".json")); return scan(ROOT, { rows: file ? JSON.parse(fs.readFileSync(file, "utf8")) : null, network: a.includes("--live"), smoke: a.includes("--smoke") }); });
