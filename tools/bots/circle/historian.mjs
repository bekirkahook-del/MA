// Historian Bot: remembers how each fix type has gone. A type that keeps getting reverted loses its right to run unattended.
export const empty = () => ({ classes: {}, updated: null });
export function record(h, type, outcome, now = new Date()) { const c = (h.classes[type] ||= { ok: 0, reverted: 0, blocked: 0 }); c[outcome] = (c[outcome] || 0) + 1; h.updated = now.toISOString(); return h; }
export const autoAllowed = (h, type) => { const c = h.classes[type]; return !c || !(c.reverted >= 2 && c.reverted > c.ok); };
