// Posts the finance interview question of the day to Discord every morning (see _lib/discordq.mjs for setup).
import { postQotd } from "./_lib/discordq.mjs";
export const config = { schedule: "7 13 * * *" }; // daily 13:07 UTC = 8:07am ET (9:07 in summer)
export default postQotd;
