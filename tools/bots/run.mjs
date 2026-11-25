// One entry point: node tools/bots/run.mjs <bot> [args]. Bots: qa health funnel retention freshness cost billing outreach
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
const dir = path.dirname(fileURLToPath(import.meta.url)), bot = process.argv[2], map = { qa: "qa.mjs", health: "health.mjs", funnel: "funnel.mjs", retention: "retention.mjs", freshness: "freshness.mjs", cost: "cost.mjs", billing: "billing.mjs", outreach: "outreach.mjs", dump: "dump.mjs", circle: "circle/circle.mjs" };
if (!map[bot]) { console.error("usage: node tools/bots/run.mjs <" + Object.keys(map).join("|") + "> [args]"); process.exit(2); }
process.exit(spawnSync("node", [path.join(dir, map[bot]), ...process.argv.slice(3)], { stdio: "inherit" }).status || 0);
