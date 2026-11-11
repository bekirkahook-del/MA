// Announces every new M&A Prep YouTube upload (video or Short) in Discord, so the channels feed each other.
// Reads the public YouTube RSS feed; already-announced ids are kept in the shared Discord state (key "yt").
import { post, getPosted, putPosted, cut, SITE } from "./_lib/discord.mjs";
export const config = { schedule: "37 * * * *" }; // hourly at :37
const FEED = "https://www.youtube.com/feeds/videos.xml?channel_id=UCecz_zgUGiksG2HpJEt0cTg";
const RED = 0xff0033;
export default async () => {
  const xml = await (await fetch(FEED)).text();
  const items = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m => ({
    id: (m[1].match(/<yt:videoId>(.*?)<\/yt:videoId>/) || [])[1],
    title: (m[1].match(/<title>(.*?)<\/title>/) || [])[1],
    date: (m[1].match(/<published>(.*?)<\/published>/) || [])[1] })).filter(x => x.id);
  const st = (await getPosted()) || { deals: [], apps: [] }; const seen = new Set(st.yt || []);
  if (!st.yt) { st.yt = items.map(x => x.id); await putPosted(st); return new Response("seeded " + items.length); } // first run: don't flood old videos
  const fresh = items.filter(x => !seen.has(x.id) && Date.now() - Date.parse(x.date) < 3 * 864e5).slice(0, 2);
  for (const v of fresh.reverse()) {
    const t = v.title.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    await post("📺 New on YouTube", [{ title: cut(t, 250), url: `https://www.youtube.com/watch?v=${v.id}`, color: RED,
      image: { url: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg` },
      description: `Practice what's in the video: ${SITE}/?utm_source=discord`, footer: { text: "M&A Prep · mnaprep.com/youtube" } }]);
    seen.add(v.id);
  }
  st.yt = [...seen].slice(-200); await putPosted(st);
  return new Response("posted " + fresh.length);
};
