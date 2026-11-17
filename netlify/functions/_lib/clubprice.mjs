// Club plan pricing: a yearly quote based on how many members the club has.
// Graduated (like tax brackets): each band's price applies only to the members inside that band,
// so adding one member never makes the total drop. Minimum 10 seats. Over 500 members = talk to us.
// KEEP IN SYNC with the copy in js/rewards.js (tests/clubprice.test.mjs checks both).
export const CLUB = {
  tiers: [
    { upTo: 25, cents: 1100 },  // members 1-25:    $11 each per year
    { upTo: 75, cents: 900 },   // members 26-75:    $9 each
    { upTo: 200, cents: 700 },  // members 76-200:   $7 each
    { upTo: 500, cents: 500 },  // members 201-500:  $5 each
  ],
  minSeats: 10,
  maxSeats: 500,
};

export function clubQuote(members) {
  const n = Math.floor(Number(members));
  if (!Number.isFinite(n) || n < 1) return { ok: false, error: "Enter how many members your club has." };
  if (n > CLUB.maxSeats) return { ok: false, contact: true, error: `Clubs over ${CLUB.maxSeats} members get a custom quote. Email us.` };
  const seats = Math.max(n, CLUB.minSeats);
  let left = seats, prev = 0, totalCents = 0;
  const lines = [];
  for (const t of CLUB.tiers) {
    const count = Math.min(left, t.upTo - prev);
    if (count > 0) { totalCents += count * t.cents; lines.push({ from: prev + 1, to: prev + count, count, cents: t.cents }); left -= count; }
    prev = t.upTo;
    if (left <= 0) break;
  }
  return { ok: true, members: n, seats, totalCents, perMemberCents: Math.round(totalCents / seats), lines };
}
