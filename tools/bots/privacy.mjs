// Privacy Bot: personal email addresses and phone numbers sitting in files that ship to the public site. It prints where, and only the email's domain, never the address.
// Usage: node tools/bots/privacy.mjs
import { ROOT, cli } from "./lib.mjs";
import { trackedFiles, read, report } from "./scan.mjs";

const OK_DOMAINS = /(mnaprep\.com|example\.(com|org)|sentry\.io|schema\.org|w3\.org|supabase\.co|netlify\.com|stripe\.com|noreply)/i;
export function pii(files) {
  const hits = [];
  for (const f of files) f.text.split("\n").forEach((ln, i) => {
    if (ln.length > 5000) return;
    for (const m of ln.matchAll(/[\w.+-]+@([\w-]+(?:\.[\w-]+)+)/g)) if (!OK_DOMAINS.test(m[1]) && !/\.(png|jpe?g|webp|svg|gif|js|css)$/i.test(m[1])) hits.push({ kind: "email", domain: m[1].toLowerCase(), where: `${f.name}:${i + 1}` });
    if (/(?<![\d.])\(?\b[2-9]\d{2}\)?[-. ]\d{3}[-. ]\d{4}\b(?![\d.])/.test(ln) && !/\b(tel|phone|call)\b.*example/i.test(ln) && !/\d{4}-\d{2}-\d{2}/.test(ln)) hits.push({ kind: "phone", domain: "", where: `${f.name}:${i + 1}` });
  });
  const em = hits.filter(h => h.kind === "email"), ph = hits.filter(h => h.kind === "phone"), f = [];
  if (em.length) f.push({ code: "emails-public", severity: "info", where: em[0].where, detail: `${em.length} email addresses at outside domains appear in public files (${[...new Set(em.map(h => h.domain))].slice(0, 5).join(", ")}). Locations: ${em.slice(0, 4).map(h => h.where).join(", ")}. Addresses not shown. These may be intentional contact emails (club officers, career centers) but are scraped by spammers.` });
  if (ph.length) f.push({ code: "phones-public", severity: "info", where: ph[0].where, detail: `${ph.length} lines look like phone numbers in public files. e.g. ${ph.slice(0, 4).map(h => h.where).join(", ")}` });
  return report("privacy", f, { files: files.length, emails: em.length, phones: ph.length });
}
export const scan = (root = ROOT) => pii(trackedFiles(root).filter(f => /^(index\.html|guides\/(?!_src).*\.html|js\/(?!companies|guideidx)[^/]+\.js|data\/.*\.json)$/.test(f)).map(name => ({ name, text: read(root, name) })));
cli(import.meta.url, () => scan());
