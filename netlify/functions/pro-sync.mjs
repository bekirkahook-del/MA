// Hourly: refreshes the public list of verified Pro members (drops expired trials and lapsed plans).
import { rebuildProList, json } from "./_lib/common.mjs";
export default async () => json(200, { pro: await rebuildProList() });
export const config = { schedule: "@hourly" };
