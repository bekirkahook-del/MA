// Posts the finance interview question of the day to a Discord channel every morning, with the answer
// hidden behind a spoiler tag. Setup: in Discord, Channel settings → Integrations → Webhooks → New Webhook →
// Copy URL, then add it in Netlify as the env var DISCORD_WEBHOOK_URL (never commit it). Without it, this does nothing.
// Same question as the embed widget (embed/q.js), so the site, widget and Discord match each day.
export const config = { schedule: "7 13 * * *" }; // daily 13:07 UTC = 8:07am ET (9:07 in summer)

export default async () => {
  const hook = process.env.DISCORD_WEBHOOK_URL;
  if (!hook) { console.log("DISCORD_WEBHOOK_URL not set; skipping"); return new Response("no webhook"); }
  try {
    const js = await (await fetch("https://mnaprep.com/embed/q.js?t=" + Date.now())).text();
    const m = js.match(/var Q=(\[[\s\S]*?\]\]);/);
    const Q = JSON.parse(m[1]);
    const ny = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
    const day = Math.floor((ny - new Date(ny.getFullYear(), 0, 0)) / 864e5) + ny.getFullYear() * 366;
    const [q, opts, ans, why] = Q[day % Q.length];
    const L = "ABCD";
    const embed = {
      title: "🧠 Interview question of the day",
      description: `**${q}**\n\n${opts.map((o, i) => `**${L[i]}.** ${o}`).join("\n")}\n\nAnswer: ||**${L[ans]}. ${opts[ans]}**: ${why}||`,
      color: 0x2448d8,
      footer: { text: "Practice 1,000+ more free at mnaprep.com" },
      url: "https://mnaprep.com/?utm_source=discord&utm_campaign=qotd",
    };
    const r = await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "M&A Prep", content: "Lock in your answer before you tap the spoiler 👇", embeds: [embed], allowed_mentions: { parse: [] } }) });
    console.log("discord", r.status);
  } catch (e) { console.error("discord qotd failed", String(e)); }
  return new Response("ok");
};
