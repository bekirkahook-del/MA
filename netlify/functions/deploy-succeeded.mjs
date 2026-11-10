// Runs automatically after every successful Netlify deploy (event-triggered function).
// Pings IndexNow (Bing, Yandex and others) with every page in the sitemap changed in the last 3 days,
// so new and updated pages get crawled the same day without anyone doing it by hand.
const KEY = "d486adbe6ddeb42fd51699ce30414cef";
const HOST = "mnaprep.com";

export default async () => {
  try {
    const xml = await (await fetch(`https://${HOST}/sitemap.xml?t=${Date.now()}`)).text();
    const cutoff = new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10);
    const urls = [...xml.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>([0-9-]+)<\/lastmod>/g)]
      .filter(m => m[2] >= cutoff).map(m => m[1]).slice(0, 500);
    if (!urls.includes(`https://${HOST}/`)) urls.unshift(`https://${HOST}/`);
    const r = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
    });
    console.log("IndexNow", r.status, urls.length, "urls");
  } catch (e) { console.log("IndexNow ping failed", String(e)); }
  return new Response("ok");
};
