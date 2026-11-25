// Loads the real site in a headless browser and saves every question (TRACKS) to JSON for the QA bot.
// Usage: node tools/bots/dump.mjs out.json
import fs from "node:fs";
import { serve, loadPlaywright, cli } from "./lib.mjs";
export async function dumpTracks() {
  const s = await serve(), { chromium } = loadPlaywright(), b = await chromium.launch();
  try {
    const p = await b.newPage(); await p.goto(s.url + "/index.html", { waitUntil: "load" }); await p.waitForTimeout(1200);
    return await p.evaluate(() => ({ tracks: TRACKS.map(t => ({ id: t.id, name: t.name, levels: t.levels.map(l => ({ n: l.n, q: l.q || [] })) })), reps: Object.keys(window.MA_REPS || {}) }));
  } finally { await b.close(); s.close(); }
}
cli(import.meta.url, async a => { const d = await dumpTracks(); if (a[0]) fs.writeFileSync(a[0], JSON.stringify(d)); return { tracks: d.tracks.length, levels: d.tracks.reduce((n, t) => n + t.levels.length, 0), questions: d.tracks.reduce((n, t) => n + t.levels.reduce((m, l) => m + l.q.length, 0), 0), reps: d.reps.length, savedTo: a[0] || null }; });
