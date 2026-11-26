// Changelog Bot: turns the commits waiting on staging into a plain-English "what ships" list, grouped by what a student would notice.
// It also says whether the batch will trigger a Netlify build (15 credits) or ride along free. Read-only.
// Usage: node tools/bots/changelog.mjs
import { ROOT, cli, git } from "./lib.mjs";

export const AREAS = [
  ["Learning content", /^(js\/(lessons2?|reps-data|models-data|pitch-data|more-content2?|qfix|practice|modellab|pitch|superday|srs|mock)\.js)/],
  ["Pro, billing and accounts", /^(js\/(rewards|pro-plus|gate|auth|backend|grow)\.js|netlify\/functions\/(stripe|grant|billing|checkout|portal))/],
  ["Guides and SEO", /^(guides\/(?!_src)|sitemap\.xml|robots\.txt|feed\.xml|llms\.txt)/],
  ["Site pages and design", /^(index\.html|css\/|js\/(app|header|uxpolish|visual|visuals-hero|panes|firstrun)\.js)/],
  ["Backend functions", /^netlify\/functions\//],
  ["Bots and tools (not on the site)", /^(tools\/|tests\/|social\/|supabase\/)/],
];
export const NO_BUILD = /^(data\/wire\.json|social\/|guides\/_src\/|supabase\/|tests\/|tools\/|.*\.md$)/;
export function changelog(commits) {
  const groups = {}, build = [];
  for (const c of commits) {
    const hits = new Set(); for (const f of c.files) { const a = AREAS.find(([, re]) => re.test(f)); hits.add(a ? a[0] : "Other"); }
    for (const g of hits.size ? hits : ["Other"]) (groups[g] ||= []).push(c.subject);
    if (c.files.some(f => !NO_BUILD.test(f))) build.push(c.subject);
  }
  const buildsSite = build.length > 0;
  return { commits: commits.length, groups, buildsSite, buildCommits: build.length, creditsIfDeployed: commits.length ? (buildsSite ? 15 : 0) : 0,
    summary: commits.length ? `${commits.length} change(s) waiting. ${buildsSite ? `${build.length} touch the live site, so a deploy costs ~15 credits.` : "None touch the live site, so they would not trigger a build."}` : "Nothing waiting." };
}
export function readQueue(root = ROOT) {
  const out = git(["log", "--name-only", "--format=@@%s", "origin/main..origin/staging"], root);
  return out.split("@@").filter(Boolean).map(b => { const [subject, ...files] = b.split("\n").map(s => s.trim()).filter(Boolean); return { subject, files }; });
}
export const scan = (root = ROOT) => changelog(readQueue(root));
cli(import.meta.url, () => scan());
