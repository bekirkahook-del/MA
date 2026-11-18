// Club plan pricing: a flat $6 per member per month, billed monthly to the club officer.
// Minimum 10 seats ($60/month). Over 500 members = talk to us.
// KEEP IN SYNC with the copy in js/rewards.js (tests/club.test.mjs checks both).
export const CLUB = { centsPerMember: 600, minSeats: 10, maxSeats: 500, interval: "month" };

export function clubQuote(members) {
  const n = Math.floor(Number(members));
  if (!Number.isFinite(n) || n < 1) return { ok: false, error: "Enter how many members your club has." };
  if (n > CLUB.maxSeats) return { ok: false, contact: true, error: `Clubs over ${CLUB.maxSeats} members get a custom quote. Email us.` };
  const seats = Math.max(n, CLUB.minSeats);
  return { ok: true, members: n, seats, perMemberCents: CLUB.centsPerMember, totalCents: seats * CLUB.centsPerMember };
}
