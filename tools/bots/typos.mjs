// Typo Bot: the misspellings that show up most often, in guides and the home page text. A small list on purpose: it only reports words that are wrong in every context.
// Usage: node tools/bots/typos.mjs
import { ROOT, cli } from "./lib.mjs";
import { guidePages, read, textOf, report } from "./scan.mjs";

export const TYPOS = { recieve: "receive", seperate: "separate", occured: "occurred", definately: "definitely", accomodate: "accommodate", untill: "until", teh: "the", adress: "address", begining: "beginning", sucess: "success", goverment: "government", enviroment: "environment", refered: "referred", aquire: "acquire", existance: "existence", maintainance: "maintenance", comission: "commission", experiance: "experience", responsability: "responsibility", acheive: "achieve", beleive: "believe", calender: "calendar", wich: "which", thier: "their", ocurred: "occurred", paralell: "parallel", investiment: "investment", intrest: "interest", compeny: "company", analyis: "analysis", valuaton: "valuation" };
const RE = new RegExp("\\b(" + Object.keys(TYPOS).filter(k => TYPOS[k]).join("|") + ")\\b", "gi");
export function findTypos(text, where) {
  const out = [], rep = /\b(the|and|of|to|a|in|is|that|for)\s+\1\b/gi;
  for (const m of text.matchAll(RE)) out.push({ where, word: m[1].toLowerCase(), fix: TYPOS[m[1].toLowerCase()] });
  for (const m of text.matchAll(rep)) out.push({ where, word: m[0].toLowerCase(), fix: m[1] });
  return out;
}
export function typos(docs) {
  const all = docs.flatMap(d => findTypos(d.text, d.name)), by = {};
  for (const t of all) (by[t.word] ||= []).push(t.where);
  const f = Object.keys(by).length ? [{ code: "typos", severity: "warn", where: "guides", detail: `${all.length} likely typos: ${Object.entries(by).slice(0, 5).map(([w, l]) => `"${w}" in ${l.slice(0, 2).join(", ")}${l.length > 2 ? " +" + (l.length - 2) : ""}`).join("; ")}` }] : [];
  return report("typos", f, { docs: docs.length, found: all.length });
}
export const scan = (root = ROOT) => typos([{ name: "index.html", text: textOf(read(root, "index.html")) }, ...guidePages(root).map(g => ({ name: g.slug, text: textOf(g.html) }))]);
cli(import.meta.url, () => scan());
