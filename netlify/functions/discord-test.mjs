// One-time test post (Nov 11 04:12 UTC = 11:12pm ET Nov 10). Delete after the test.
import { postQotd } from "./_lib/discordq.mjs";
export const config = { schedule: "12 4 11 11 *" };
export default postQotd;
