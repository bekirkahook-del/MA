// In-memory stand-in for Supabase (auth + docs table + bump_counter), Stripe and Anthropic, so the Netlify functions
// can be exercised end to end without any network or real keys.
export const J = (s, b) => new Response(b === undefined ? null : JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });

export function installBackend({ users = {}, rpc = true, stripeSub = null, anthropicText = '{"ok":true}' } = {}) {
  const docs = new Map(), calls = [];
  const put = (col, id, uid, data) => docs.set(`${col}|${id}`, { col, id, uid: uid ?? null, data });
  globalThis.fetch = async (url, opts = {}) => {
    const u = new URL(String(url)), method = (opts.method || "GET").toUpperCase();
    calls.push({ host: u.hostname, path: u.pathname, method, body: opts.body });
    if (u.hostname.endsWith("supabase.co")) {
      if (u.pathname === "/auth/v1/user") {
        const t = ((opts.headers || {}).Authorization || "").replace(/^Bearer\s+/i, "");
        return users[t] ? J(200, users[t]) : J(401, { msg: "bad jwt" });
      }
      if (u.pathname === "/auth/v1/admin/users") return J(200, { users: Object.values(users) });
      if (u.pathname.startsWith("/auth/v1/admin/users/")) {
        const id = u.pathname.split("/").pop(), usr = Object.values(users).find((x) => x.id === id);
        return usr ? J(200, usr) : J(404, {});
      }
      if (u.pathname === "/rest/v1/rpc/bump_counter") {
        if (!rpc) return J(404, { code: "PGRST202" });
        const b = JSON.parse(opts.body), k = `${b.p_col}|${b.p_id}`, n = (docs.get(k)?.data.n) || 0;
        if (n >= b.p_limit) return J(200, null);
        put(b.p_col, b.p_id, b.p_uid, { n: n + 1 }); return J(200, n + 1);
      }
      if (u.pathname === "/rest/v1/docs") {
        const q = u.searchParams, col = (q.get("col") || "").replace(/^eq\./, ""), id = (q.get("id") || "").replace(/^eq\./, "");
        if (method === "GET") {
          const jf = [...q.entries()].filter(([k]) => k.startsWith("data->>")); // data->>field=eq.value
          const rows = [...docs.values()].filter((d) => d.col === col && (!id || d.id === id) && jf.every(([k, v]) => String((d.data || {})[k.slice(7)]) === v.replace(/^eq\./, "")));
          return J(200, rows.map((d) => ({ id: d.id, data: d.data })));
        }
        if (method === "POST") {
          const b = JSON.parse(opts.body);
          if (String((opts.headers || {}).Prefer || "").includes("ignore-duplicates") && docs.has(`${b.col}|${b.id}`)) return J(201, []); // first writer wins
          put(b.col, b.id, b.uid, b.data); return J(201, []);
        }
        if (method === "DELETE") { for (const [k, d] of docs) if (d.col === col) docs.delete(k); return J(204); }
      }
    }
    if (u.hostname === "api.anthropic.com") return J(200, { content: [{ type: "text", text: anthropicText }] });
    if (u.hostname === "api.stripe.com") return J(200, stripeSub || { status: "active", current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400 });
    throw new Error("unexpected network call: " + url);
  };
  return { docs, calls, put, get: (col, id) => docs.get(`${col}|${id}`)?.data };
}

export const UID = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
export const user = (n, over = {}) => ({ id: UID(n), email: `u${n}@example.com`, email_confirmed_at: "2026-11-01T00:00:00Z", created_at: "2026-10-01T00:00:00Z", ...over });
export const post = (path, body, token, extra = {}) => new Request("https://mnaprep.com/.netlify/functions/" + path, { method: "POST", headers: { "content-type": "application/json", ...(token ? { authorization: "Bearer " + token } : {}), ...extra }, body: typeof body === "string" ? body : JSON.stringify(body ?? {}) });
export const setEnv = () => { Object.assign(process.env, { SUPABASE_SERVICE_ROLE_KEY: "sb_secret_testkey", STRIPE_SECRET_KEY: "sk_test_x", ANTHROPIC_API_KEY: "ak_test" }); delete process.env.SUPABASE_SERVICE_ROLE_KEY_good; };
