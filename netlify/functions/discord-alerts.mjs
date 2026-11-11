// Checks The Wire every hour and posts NEW deals and NEW open internship applications to Discord (max 4 a run).
import { hook, wire, post, cut, getPosted, putPosted, SITE, BLUE, AMBER } from "./_lib/discord.mjs";
export const config = { schedule: "23 * * * *" };
export default async () => {
  if (!hook()) return new Response("no webhook");
  try {
    const w = await wire(), today = new Date().toISOString().slice(0, 10);
    const st = (await getPosted()) || { deals: [], apps: [] };
    const deals = (w.DEALS || []).filter(d => d.id && !st.deals.includes(d.id));
    const apps = (w.APP_OPEN || []).filter(a => a[3] === "open" && (!a[6] || a[6] >= today))
      .map(a => ({ key: `${a[0]}|${a[1]}`, a })).filter(x => !st.apps.includes(x.key));
    let n = 0;
    for (const d of deals) {
      if (n >= 4) break;
      await post("💼 **New deal**", [{ title: cut(`${d.buyer} → ${d.target} · ${d.value}`, 250), color: BLUE,
        description: cut(`${d.what}\n\n**Why it matters:** ${d.why}\n\n**Say it in an interview:** ${d.say || ""}`, 3500),
        url: `${SITE}/deals/?utm_source=discord`, footer: { text: (d.terms || []).join(" · ").slice(0, 200) } }]);
      st.deals.push(d.id); n++;
    }
    for (const { key, a } of apps) {
      if (n >= 4) break;
      await post("⏰ **Applications open**", [{ title: cut(`${a[0]}: ${a[1]}`, 250), color: AMBER,
        description: `${a[5]}${a[6] ? `\n**Closes:** ${a[6]}` : ""}\n\nApply early: most banks review applications as they come in.\nFull tracker: ${SITE}/#recruit`,
        url: `${SITE}/?utm_source=discord&utm_campaign=apps#recruit` }]);
      st.apps.push(key); n++;
    }
    st.deals = st.deals.slice(-200); st.apps = st.apps.slice(-300);
    if (n) await putPosted(st);
    console.log("alerts posted", n);
  } catch (e) { console.error("alerts failed", String(e)); }
  return new Response("ok");
};
