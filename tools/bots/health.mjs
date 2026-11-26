// Bot 2: Site health. (a) broken internal links/assets in every HTML file, (b) syntax check of every Netlify function,
// (c) optional headless-browser smoke test: loads the site, opens every level briefing, samples guide pages, records JS errors.
// Usage: node tools/bots/health.mjs [--smoke]
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT, cli, serve, loadPlaywright, sortBySev } from "./lib.mjs";

function* walk(dir, skip = /^(node_modules|\.git|social|tools|tests|supabase|_src)$/) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.test(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p, skip); else yield p;
  }
}
export function brokenLinks(root = ROOT, { limit = 60 } = {}) {
  const found = new Map(); let pages = 0, refs = 0;
  const fn = new Set(fs.existsSync(path.join(root, "netlify/functions")) ? fs.readdirSync(path.join(root, "netlify/functions")).map(f => f.replace(/\.mjs$/, "")) : []);
  const toml = fs.existsSync(path.join(root, "netlify.toml")) ? fs.readFileSync(path.join(root, "netlify.toml"), "utf8") : "";
  const redirects = [...toml.matchAll(/^\s*from\s*=\s*"([^"]+)"/gm)].map(m => m[1]);
  const viaRedirect = u => redirects.some(r => r === u || (r.endsWith("*") && u.startsWith(r.slice(0, -1))));
  const exists = u => { // u is a root-relative path with no query or hash
    if (viaRedirect(u)) return true;
    if (u.startsWith("/.netlify/functions/")) return fn.has(u.split("/")[3]);
    const f = path.join(root, u); if (!f.startsWith(root)) return true;
    if (fs.existsSync(f)) return fs.statSync(f).isDirectory() ? fs.existsSync(path.join(f, "index.html")) : true;
    return fs.existsSync(f + ".html");
  };
  for (const file of walk(root)) {
    if (!file.endsWith(".html")) continue; pages++;
    const html = fs.readFileSync(file, "utf8"), dir = "/" + path.relative(root, path.dirname(file)).split(path.sep).join("/");
    for (const m of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
      let u = m[1].trim(); if (!u || /[${}]/.test(u) || /^(https?:|mailto:|tel:|data:|javascript:|#|\/\/|blob:)/i.test(u)) continue;
      u = u.split("#")[0].split("?")[0]; if (!u) continue; refs++;
      if (!u.startsWith("/")) u = path.posix.normalize((dir === "/." ? "/" : dir + "/") + u);
      if (!exists(u)) { const k = u; const e = found.get(k) || { target: u, count: 0, from: [] }; e.count++; if (e.from.length < 2) e.from.push("/" + path.relative(root, file)); found.set(k, e); }
    }
  }
  const list = [...found.values()].sort((a, b) => b.count - a.count);
  return { pages, refs, broken: list.length, worst: list.slice(0, limit) };
}
export function functionSyntax(root = ROOT) {
  const dir = path.join(root, "netlify/functions"), bad = [];
  const files = fs.readdirSync(dir, { recursive: true }).filter(f => String(f).endsWith(".mjs"));
  for (const f of files) { try { execFileSync("node", ["--check", path.join(dir, String(f))], { stdio: "pipe" }); } catch (e) { bad.push({ file: String(f), error: String(e.stderr || e.message).split("\n").find(l => /Error/.test(l)) || "syntax error" }); } }
  return { checked: files.length, bad };
}
export async function smoke(root = ROOT, { guides = 8 } = {}) {
  const s = await serve(root), { chromium } = loadPlaywright(), b = await chromium.launch(), out = { errors: [], levelsOpened: 0, levelsFailed: [], guides: [] };
  try {
    const p = await b.newPage(), push = (w, m) => { if (!/favicon|net::ERR_(NAME|INTERNET|CONNECTION)|supabase|googleapis|gstatic|\.netlify\/functions|ERR_BLOCKED|Failed to load resource|cloudflareinsights|cdn-cgi/i.test(m) && out.errors.length < 25) out.errors.push(w + ": " + m.slice(0, 200)); };
    p.on("pageerror", e => push("pageerror", e.message)); p.on("console", m => m.type() === "error" && push("console", m.text()));
    await p.goto(s.url + "/index.html", { waitUntil: "load" }); await p.waitForTimeout(1200);
    const r = await p.evaluate(() => { const bad = []; let ok = 0; TRACKS.forEach(t => t.levels.forEach((l, i) => { try { showBrief(t, i); const el = document.querySelector("#panel"); if (!el || el.textContent.trim().length < 20) bad.push(t.id + ":" + i + " empty"); else ok++; } catch (e) { bad.push(t.id + ":" + i + " " + e.message); } })); return { ok, bad }; });
    out.levelsOpened = r.ok; out.levelsFailed = r.bad;
    const gdir = path.join(root, "guides"), names = fs.existsSync(gdir) ? fs.readdirSync(gdir).filter(n => fs.existsSync(path.join(gdir, n, "index.html"))) : [];
    const step = Math.max(1, Math.floor(names.length / guides));
    for (let i = 0; i < names.length && out.guides.length < guides; i += step) {
      const g = names[i], pg = await b.newPage(); const errs = []; pg.on("pageerror", e => errs.push(e.message));
      await pg.goto(s.url + "/guides/" + g + "/", { waitUntil: "load" }).catch(() => errs.push("did not load"));
      const t = await pg.title().catch(() => ""), h = await pg.locator("h1").count().catch(() => 0);
      out.guides.push({ guide: g, title: !!t, h1: h > 0, errors: errs.length }); await pg.close();
    }
  } finally { await b.close(); s.close(); }
  return out;
}
export function summarize({ links, funcs, sm }) {
  const f = [];
  if (funcs && funcs.bad.length) funcs.bad.forEach(b => f.push({ severity: "critical", what: "function syntax", detail: b.file + ": " + b.error }));
  if (links && links.broken) f.push({ severity: links.worst[0] && links.worst[0].count > 5 ? "critical" : "warn", what: "broken links", detail: links.broken + " distinct targets missing across " + links.pages + " pages. Worst: " + links.worst.slice(0, 3).map(x => x.target + " (" + x.count + "x)").join(", ") });
  if (sm) {
    if (sm.levelsFailed.length) f.push({ severity: "critical", what: "levels fail to open", detail: sm.levelsFailed.slice(0, 5).join("; ") });
    if (sm.errors.length) f.push({ severity: "warn", what: "browser errors", detail: sm.errors.slice(0, 3).join(" | ") });
    sm.guides.filter(g => !g.title || !g.h1 || g.errors).forEach(g => f.push({ severity: "warn", what: "guide page problem", detail: g.guide }));
  }
  return { ok: !f.length, findings: sortBySev(f) };
}
cli(import.meta.url, async a => {
  const links = brokenLinks(), funcs = functionSyntax(), sm = a.includes("--smoke") ? await smoke() : null;
  return { ...summarize({ links, funcs, sm }), stats: { pages: links.pages, refs: links.refs, functions: funcs.checked, levelsOpened: sm && sm.levelsOpened } };
});
