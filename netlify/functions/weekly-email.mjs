// Sends the Sunday email to every active subscriber. Runs automatically (Netlify scheduled function).
import { activeSubs, send, shell, ADDRESS } from "./_lib/mail.mjs";
import { weekly } from "./_lib/weekly.mjs";

export default async () => {
  if (!process.env.RESEND_API_KEY) { console.log("weekly email skipped: RESEND_API_KEY not set"); return new Response("skipped"); }
  if (!ADDRESS()) { console.log("weekly email skipped: MAIL_ADDRESS not set (a postal address is required on marketing email)"); return new Response("skipped"); }
  const subs = await activeSubs(), { subject, body, week } = weekly();
  await send(subs.map(s => ({ to: s.email, subject, html: shell(body, s), s })));
  console.log(`weekly email ${week} sent to ${subs.length}`);
  return new Response("ok");
};
export const config = { schedule: "0 15 * * 0" }; // Sundays 15:00 UTC = 10am ET (11am during daylight time)
