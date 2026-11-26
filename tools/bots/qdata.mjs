// Question Data Helpers: tracks.json -> flat list of questions for the question-content bots (qlength, qyears, explain).
export const flatten = tracks => tracks.flatMap(t => t.levels.flatMap(l => (l.q || []).map(q => ({ track: t.name, level: l.n, text: q[0], opts: q[1] || [], ans: q[2], why: q[3] || "" }))));
export const where = q => `${q.track} / ${q.level}`;
