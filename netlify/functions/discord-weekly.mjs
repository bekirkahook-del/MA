// Sunday challenge in Discord (6:13pm ET): 3 interview questions, answers in spoilers. Members reply with their score.
import { hook, post, questions, SITE, VIOLET } from "./_lib/discord.mjs";
export const config = { schedule: "13 23 * * 0" }; // Sundays 23:13 UTC = 6:13pm ET (7:13 in summer)
export default async () => {
  if (!hook()) return new Response("no webhook");
  try {
    const Q = await questions(), wk = Math.floor(Date.now() / 6048e5), L = "ABCD";
    const pick = [0, 1, 2].map(i => Q[(wk * 3 + i * 5) % Q.length]);
    const body = pick.map(([q, o, a, why], i) => `**${i + 1}. ${q}**\n${o.map((x, j) => `${L[j]}. ${x}`).join("  ·  ")}\nAnswer: ||${L[a]}. ${o[a]}: ${why}||`).join("\n\n");
    await post("🏆 **Sunday challenge**: 3 questions, no peeking. Reply with your score (0–3) 👇", [{ title: "Weekly challenge", color: VIOLET,
      description: body.slice(0, 3900), url: `${SITE}/?utm_source=discord&utm_campaign=weekly`, footer: { text: "Want more? 1,000+ free questions at mnaprep.com" } }]);
  } catch (e) { console.error("weekly failed", String(e)); }
  return new Response("ok");
};
