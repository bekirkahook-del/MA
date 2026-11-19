// Weekday market wrap in Discord at 5:21pm ET: today's closing numbers (live from Yahoo, built in code)
// + top 3 stories from The Wire if they're from the last day and a half. Skips holidays instead of reposting old data.
import { hook, wire, post, cut, SITE, GREEN } from "./_lib/discord.mjs";
import { marketClose } from "./_lib/close.mjs";
export const config = { schedule: "21 22 * * 1-5" }; // 22:21 UTC = 5:21pm ET (6:21 in summer)
export default async () => {
  if (!hook()) return new Response("no webhook");
  try {
    const close = await marketClose();
    if (!close) return new Response("market closed today");
    let news = "";
    try {
      const w = await wire();
      const nd = Date.parse(w.NEWS_DATE || ""), fresh = nd && Date.now() - nd < 36 * 3600e3;
      if (fresh) news = (w.NEWS || []).slice(0, 3).map(n => `**${cut(n.h, 160)}**\n${cut(n.m || n.w, 260)}`).join("\n\n");
    } catch (e) {}
    await post("📈 **Today's market wrap**", [{ title: `The Wire · ${close.label}`, color: GREEN,
      description: cut(`${close.text}${news ? "\n\n" + news : ""}`, 3900), url: `${SITE}/?utm_source=discord&utm_campaign=wrap#wire`,
      footer: { text: "Interview tip: have one market story ready for every interview." } }]);
  } catch (e) { console.error("wrap failed", String(e)); }
  return new Response("ok");
};
