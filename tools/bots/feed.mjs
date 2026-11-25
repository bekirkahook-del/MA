// Feed Bot: feed.xml (RSS) and llms.txt (the file AI answer engines read) must only list pages that exist.
// Usage: node tools/bots/feed.mjs
import fs from "node:fs";
import path from "node:path";
import { ROOT, cli } from "./lib.mjs";
import { read, report } from "./scan.mjs";

const local = u => u.replace(/^https?:\/\/(www\.)?mnaprep\.com/, "").split(/[?#]/)[0];
export function feed({ rss, llms, exists }) {
  const f = [], add = (code, severity, detail, where) => f.push({ code, severity, detail, where });
  const items = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);
  if (!rss.trim()) add("feed-missing", "warn", "feed.xml is missing or empty.", "feed.xml");
  else {
    if (!items.length) add("feed-empty", "warn", "feed.xml has no <item> entries.", "feed.xml");
    const dead = items.map(i => (i.match(/<link>([^<]+)<\/link>/) || [])[1]).filter(l => l && /mnaprep\.com/.test(l) && !exists(local(l)));
    if (dead.length) add("feed-dead-links", "warn", `${dead.length} feed items link to pages that do not exist. e.g. ${dead.slice(0, 3).join(", ")}`, "feed.xml");
    const badDate = items.filter(i => { const d = (i.match(/<pubDate>([^<]+)<\/pubDate>/) || [])[1]; return !d || isNaN(Date.parse(d)); });
    if (badDate.length) add("feed-bad-dates", "info", `${badDate.length} feed items have a missing or unreadable pubDate.`, "feed.xml");
  }
  if (!llms.trim()) add("llms-missing", "info", "llms.txt is missing or empty.", "llms.txt");
  else { const dead = [...llms.matchAll(/https?:\/\/(?:www\.)?mnaprep\.com[^\s)>\]"']*/g)].map(m => m[0].replace(/[.,;]+$/, "")).filter(u => !exists(local(u) || "/")); if (dead.length) add("llms-dead-links", "warn", `${dead.length} llms.txt links point at pages that do not exist. e.g. ${dead.slice(0, 3).join(", ")}`, "llms.txt"); }
  return report("feed", f, { feedItems: items.length });
}
export function scan(root = ROOT) { const ex = p => { const f = path.join(root, p); return fs.existsSync(f) && (fs.statSync(f).isFile() || fs.existsSync(path.join(f, "index.html"))); }; return feed({ rss: read(root, "feed.xml"), llms: read(root, "llms.txt"), exists: ex }); }
cli(import.meta.url, () => scan());
