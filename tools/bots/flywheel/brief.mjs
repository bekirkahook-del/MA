// Content Brief Bot: the Flywheel's daily output. One page that says how content is trending, what tomorrow's slots are, what to fix before posting, and what to stop.
// It only arranges what the other bots found. It never posts and invents nothing.
import { PLATFORMS } from "./core.mjs";
const f = (reports, id) => (reports[id] && reports[id].findings) || [];
const bullet = x => `- ${x.detail}`;
export function brief(reports, { date } = {}) {
  const plan = (reports.slotplan && reports.slotplan.stats && reports.slotplan.stats.plan) || [], out = [`# Content brief${date ? " for " + date : ""}`, ""];
  const g = [...f(reports, "growthrate"), ...f(reports, "compound")]; out.push("## Is the flywheel turning?", "", ...(g.length ? g.map(bullet) : ["- Not enough scored weeks yet."]), "");
  if (plan.length) { out.push(`## Tomorrow's slots (${reports.slotplan.stats.date})`, "", "| Time (ET) | Role | Idea type | Format | Topic | Post to |", "|---|---|---|---|---|---|"); for (const s of plan) out.push(`| ${s.time} | ${s.role} | ${s.family} | ${s.format} | ${s.topic} | ${s.platforms.post.map(k => PLATFORMS[k]).join(", ")} |`); out.push(""); }
  const gates = ["ctagate", "sourcegate", "rendergate", "blackoutgate", "capgate", "utmgate", "videolog", "dupegate", "clichegate", "slidetext", "dailymix"].flatMap(id => f(reports, id).filter(x => x.severity !== "info"));
  out.push("## Fix before posting", "", ...(gates.length ? gates.map(bullet) : ["- Every upcoming deck passes your rules."]), "");
  const due = ["spikes", "reposts", "sequelqueue", "characterladder", "repurpose"].flatMap(id => f(reports, id));
  if (due.length) out.push("## Sequels, reposts and series due", "", ...due.map(bullet), "");
  const news = f(reports, "newsjack"); if (news.length) out.push("## Live market, post within 24 hours", "", ...news.map(bullet), "");
  const stop = ["flops", "loserwatch", "retirements", "saturation"].flatMap(id => f(reports, id).filter(x => x.severity !== "info" || id === "saturation")); if (stop.length) out.push("## Stop or rotate", "", ...stop.map(bullet), "");
  const ext = ["quoragap", "bumps", "dirnext", "newsage", "calpast"].flatMap(id => f(reports, id).filter(x => x.severity !== "info")); if (ext.length) out.push("## Around the content", "", ...ext.map(bullet), "");
  return out.join("\n");
}
