// Encoding Bot: garbled characters ("â€™" instead of an apostrophe) that appear when text is saved with the wrong encoding.
// Usage: node tools/bots/mojibake.mjs
import { ROOT, cli } from "./lib.mjs";
import { trackedFiles, read, report } from "./scan.mjs";

const BAD = /(â€[™œ\u009d\u0098\u0093\u0094¦“”]|Ã[©¨ª¡³º±¼]|Â[  °·]|�)/;
export function mojibake(files) {
  const hits = files.map(f => { const i = f.text.search(BAD); return i >= 0 ? { name: f.name, sample: f.text.slice(Math.max(0, i - 15), i + 20).replace(/\s+/g, " ") } : null; }).filter(Boolean), f = [];
  if (hits.length) f.push({ code: "garbled-text", severity: "warn", where: hits[0].name, detail: `${hits.length} files contain garbled characters. e.g. ${hits.slice(0, 3).map(h => `${h.name} ("${h.sample}")`).join("; ")}` });
  return report("mojibake", f, { files: files.length });
}
export const scan = (root = ROOT) => mojibake(trackedFiles(root).filter(f => /^(index\.html|guides\/(?!_src).*\.html|js\/.*\.js|data\/.*\.json)$/.test(f)).map(name => ({ name, text: read(root, name) })));
cli(import.meta.url, () => scan());
