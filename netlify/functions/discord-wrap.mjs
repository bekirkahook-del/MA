// Weekday market wrap in Discord at 5:21pm ET: today's recap + top 3 stories from The Wire.
import { hook, wire, post, cut, SITE, GREEN } from "./_lib/discord.mjs";
export const config = { schedule: "21 22 * * 1-5" }; // 22:21 UTC = 5:21pm ET (6:21 in summer)
export default async () => {
  if (!hook()) return new Response("no webhook");
  try {
    const w = await wire();
    const news = (w.NEWS || []).slice(0, 3).map(n => `**${cut(n.h, 160)}**\n${cut(n.m || n.w, 260)}`).join("\n\n");
    await post("📈 **Today's market wrap**", [{ title: `The Wire · ${w.RECAP?.d || w.NEWS_DATE || ""}`, color: GREEN,
      description: cut(`${w.RECAP?.t || ""}\n\n${news}`, 3900), url: `${SITE}/?utm_source=discord&utm_campaign=wrap#wire`,
      footer: { text: "Interview tip: have one market story ready for every interview." } }]);
  } catch (e) { console.error("wrap failed", String(e)); }
  return new Response("ok");
};
