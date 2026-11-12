// Server-side Pro check: uses only the billing record (written by Stripe's webhook or the trial function).
import { getBilling, tierOf } from "./common.mjs";
export async function isProUser(uid) {
  const b = await getBilling(uid).catch(() => null);
  return tierOf(b) !== "free";
}
