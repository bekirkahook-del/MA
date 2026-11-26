// Localhost Bot: development addresses (localhost, 127.0.0.1, ngrok) left in files that ship to the live site.
// Usage: node tools/bots/localhost.mjs
import { ROOT, cli } from "./lib.mjs";
import { trackedFiles, read, report } from "./scan.mjs";

const DEV = /(localhost|127\.0\.0\.1|0\.0\.0\.0|\.ngrok(-free)?\.(io|app)|\.local\b)/i;
export function devUrls(files) {
  const hits = [];
  for (const f of files) f.text.split("\n").forEach((ln, i) => { if (ln.length < 3000 && DEV.test(ln) && !/^\s*(\/\/|\*)/.test(ln) && !/(hostname\s*===?|location\.hostname|isLocal|dev\b)/i.test(ln)) hits.push(`${f.name}:${i + 1}`); });
  const f = hits.length ? [{ code: "dev-urls", severity: "warn", where: hits[0], detail: `${hits.length} lines in shipped files mention a development address. e.g. ${hits.slice(0, 4).join(", ")}` }] : [];
  return report("localhost", f, { files: files.length, hits: hits.length });
}
export const scan = (root = ROOT) => devUrls(trackedFiles(root).filter(f => /^(index\.html|js\/[^/]+\.js|netlify\/functions\/[^/]+\.mjs)$/.test(f)).map(name => ({ name, text: read(root, name) })));
cli(import.meta.url, () => scan());
