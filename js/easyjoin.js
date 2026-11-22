/* Easy join (Nov 21, 2026): fewer steps from "who is this" to a filled-in profile. Users always see and choose
   what happens; nothing signs anyone up without them tapping a Google/LinkedIn/email button.
   1) Google One Tap for guests: Google's own "Continue as <name>" card. Off until GCID is set (public client ID
      from Google Cloud → the OAuth client Supabase uses; add https://mnaprep.com to its Authorized JavaScript origins).
   2) After any sign-in, fill empty profile fields once: photo from Google/LinkedIn, school from a known .edu domain.
   3) If grad year is still empty, one small "Class of" chip row (one tap, or skip). */
(function(){
  const GCID = ""; // e.g. "1234567890-abc.apps.googleusercontent.com" (public, not a secret)
  const A = window.MA_AUTH; if (!A || !A.sb) return;
  const LS = { get: k => { try { return localStorage.getItem(k) } catch (e) { return null } }, set: (k, v) => { try { localStorage.setItem(k, v) } catch (e) {} } };
  const ev = n => { try { window.maEv && maEv(n) } catch (e) {} };
  const hasS = () => typeof S !== "undefined" && S && S.profile;
  const persist = () => { try { save() } catch (e) {} try { syncProfile() } catch (e) {} try { render() } catch (e) {} };

const st = document.createElement("style"); st.textContent = `.ej-g{position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9996;width:min(460px,calc(100% - 24px));background:#13203B;color:#fff;border-radius:6px;padding:12px 14px;box-shadow:0 14px 40px rgba(0,0,0,.3);font-size:14.5px}
.ej-g b{display:block;margin-bottom:8px}.ej-g .r{display:flex;gap:6px;flex-wrap:wrap}.ej-g button{font:inherit;font-size:14px;font-weight:700;padding:7px 12px;border:0;border-radius:4px;background:#2448D8;color:#fff;cursor:pointer}
.ej-g button.s{background:none;color:#B8C2DA;text-decoration:underline;font-weight:400}`; document.head.appendChild(st);
  /* ---- 2) profile auto-fill ---- */
  const EDU = { "osu.edu":"The Ohio State University","buckeyemail.osu.edu":"The Ohio State University","umich.edu":"University of Michigan","upenn.edu":"University of Pennsylvania",
    "wharton.upenn.edu":"University of Pennsylvania","nyu.edu":"New York University","stern.nyu.edu":"New York University","columbia.edu":"Columbia University","harvard.edu":"Harvard University",
    "college.harvard.edu":"Harvard University","yale.edu":"Yale University","princeton.edu":"Princeton University","stanford.edu":"Stanford University","mit.edu":"MIT",
    "uchicago.edu":"University of Chicago","northwestern.edu":"Northwestern University","u.northwestern.edu":"Northwestern University","cornell.edu":"Cornell University",
    "duke.edu":"Duke University","georgetown.edu":"Georgetown University","virginia.edu":"University of Virginia","unc.edu":"UNC Chapel Hill","ad.unc.edu":"UNC Chapel Hill",
    "berkeley.edu":"UC Berkeley","ucla.edu":"UCLA","usc.edu":"USC","utexas.edu":"UT Austin","nd.edu":"University of Notre Dame","bc.edu":"Boston College","bu.edu":"Boston University",
    "emory.edu":"Emory University","vanderbilt.edu":"Vanderbilt University","wustl.edu":"WashU in St. Louis","cmu.edu":"Carnegie Mellon University","andrew.cmu.edu":"Carnegie Mellon University",
    "brown.edu":"Brown University","dartmouth.edu":"Dartmouth College","rice.edu":"Rice University","indiana.edu":"Indiana University","iu.edu":"Indiana University",
    "illinois.edu":"University of Illinois","wisc.edu":"University of Wisconsin","umn.edu":"University of Minnesota","psu.edu":"Penn State","purdue.edu":"Purdue University",
    "msu.edu":"Michigan State University","rutgers.edu":"Rutgers University","scarletmail.rutgers.edu":"Rutgers University","umd.edu":"University of Maryland","terpmail.umd.edu":"University of Maryland",
    "uiowa.edu":"University of Iowa","unl.edu":"University of Nebraska","huskers.unl.edu":"University of Nebraska","northeastern.edu":"Northeastern University","fordham.edu":"Fordham University",
    "baruch.cuny.edu":"Baruch College","villanova.edu":"Villanova University","miami.edu":"University of Miami","ufl.edu":"University of Florida","gatech.edu":"Georgia Tech",
    "uga.edu":"University of Georgia","tamu.edu":"Texas A&M University","smu.edu":"SMU","tcu.edu":"TCU","byu.edu":"BYU","asu.edu":"Arizona State University","uw.edu":"University of Washington",
    "miamioh.edu":"Miami University","case.edu":"Case Western Reserve University","cincinnati.edu":"University of Cincinnati","mail.uc.edu":"University of Cincinnati","uc.edu":"University of Cincinnati",
    "pitt.edu":"University of Pittsburgh","lehigh.edu":"Lehigh University","bucknell.edu":"Bucknell University","richmond.edu":"University of Richmond","wfu.edu":"Wake Forest University",
    "babson.edu":"Babson College","bentley.edu":"Bentley University" };
  function schoolFor(email){ const d = String(email || "").toLowerCase().split("@")[1] || ""; if (!/\.edu$/.test(d)) return "";
    if (EDU[d]) return EDU[d]; const parts = d.split("."); for (let i = 1; i < parts.length - 1; i++) { const k = parts.slice(i).join("."); if (EDU[k]) return EDU[k] } return "" }
  function photoToData(url){ return new Promise(res => { if (!/^https:\/\//.test(url || "")) return res("");
    const im = new Image(); im.crossOrigin = "anonymous"; im.referrerPolicy = "no-referrer";
    im.onload = () => { try { const c = document.createElement("canvas"); c.width = c.height = 160; const x = c.getContext("2d");
      const m = Math.min(im.naturalWidth, im.naturalHeight); x.drawImage(im, (im.naturalWidth - m) / 2, (im.naturalHeight - m) / 2, m, m, 0, 0, 160, 160);
      const d = c.toDataURL("image/jpeg", 0.82); res(d.length < 110000 ? d : "") } catch (e) { res("") } }; // canvas taint (no CORS) -> skip
    im.onerror = () => res(""); setTimeout(() => res(""), 8000); im.src = url }) }
  async function autofill(s){ if (!s || !hasS()) return; const u = s.user, key = "ma-af-" + u.id; if (LS.get(key)) return; LS.set(key, "1");
    const md = u.user_metadata || {}; let changed = false;
    if (!S.profile.name && (md.full_name || md.name)) { S.profile.name = String(md.full_name || md.name).slice(0, 60); changed = true }
    if (!S.profile.school) { const sc = schoolFor(u.email); if (sc) { S.profile.school = sc; try { S.settings.noSchool = false } catch (e) {} changed = true; ev("af_school") } }
    if (!S.profile.photo && (md.avatar_url || md.picture)) { const d = await photoToData(md.avatar_url || md.picture); if (d) { S.profile.photo = d; changed = true; ev("af_photo") } }
    if (changed) persist();
    askGrad() }

  /* ---- 3) one small card for whatever's still missing: school (LinkedIn/Google don't share it) + grad year ---- */
  function askGrad(){ if (!hasS() || LS.get("ma-gradask") || !(S.onb && S.onb.done)) return; /* new accounts give school + year on Make my plan (gate.js) */
    const needSchool = !S.profile.school && !(S.settings && S.settings.noSchool), needGrad = !S.profile.grad && !S.profile.year;
    if (!needSchool && !needGrad) return;
    const now = new Date(), y0 = now.getFullYear() + (now.getMonth() >= 5 ? 1 : 0), ys = [y0, y0 + 1, y0 + 2, y0 + 3];
    const names = [...new Set(Object.values(EDU))].sort();
    const d = document.createElement("div"); d.className = "ej-g"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "Finish your profile");
    d.innerHTML = `<b>${needSchool ? "Finish your profile in 5 seconds" : "What year do you graduate? We'll tailor your recruiting timeline."}</b>` +
      (needSchool ? `<input class="ej-s" list="ejSchools" maxlength="80" placeholder="Your school (e.g. Ohio State)" aria-label="Your school" style="width:100%;box-sizing:border-box;font:inherit;padding:8px 10px;border-radius:4px;border:0;margin:0 0 8px"><datalist id="ejSchools">${names.map(n => `<option value="${n.replace(/"/g, "&quot;")}">`).join("")}</datalist>` : "") +
      (needGrad ? `<div class="r" style="margin-bottom:6px"><span style="align-self:center;color:#B8C2DA">Class of</span>${ys.map(y => `<button data-y="${y}">${y}</button>`).join("")}</div>` : "") +
      `<div class="r">${needSchool ? '<button class="go">Save</button>' : ""}<button class="s" data-y="">Skip</button></div>`;
    let grad = "";
    const saveAll = () => { const si = d.querySelector(".ej-s"); const sc = si ? si.value.trim().slice(0, 80) : "";
      if (sc) { S.profile.school = sc; try { S.settings.noSchool = false } catch (e) {} ev("af_school_typed") }
      if (grad) { S.profile.grad = grad; ev("af_grad") }
      if (sc || grad) persist(); LS.set("ma-gradask", "1"); d.remove() };
    d.onclick = e => { const b = e.target.closest("button"); if (!b) return;
      if (b.classList.contains("s")) { LS.set("ma-gradask", "1"); ev("af_grad_skip"); d.remove(); return }
      if (b.dataset.y) { grad = b.dataset.y; d.querySelectorAll("[data-y]").forEach(x => x.style.outline = x === b ? "2px solid #fff" : "");
        if (!needSchool || (d.querySelector(".ej-s") || {}).value) saveAll(); return }
      if (b.classList.contains("go")) saveAll() };
    d.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.classList.contains("ej-s")) { e.preventDefault(); saveAll() } });
    setTimeout(() => document.body.appendChild(d), 2500) }

  /* ---- 1) Google One Tap ---- */
  let tapReady = false;
  window.maQuickJoin = mode => { const box = () => window.maOpenAuth && maOpenAuth(mode || "up");
    if (!tapReady || !window.google || !google.accounts) return box(); ev("quickjoin_tap");
    try { google.accounts.id.prompt(n => { try { if (n.isNotDisplayed() || n.isSkippedMoment()) box() } catch (e) { box() } }) } catch (e) { box() } };
  async function oneTap(){ if (!GCID || LS.get("ma-1tap-off")) return; ev("onetap_load");
    const raw = [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, "0")).join("");
    const hashed = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw)))].map(b => b.toString(16).padStart(2, "0")).join("");
    const sc = document.createElement("script"); sc.src = "https://accounts.google.com/gsi/client"; sc.async = true;
    sc.onload = () => { try { google.accounts.id.initialize({ client_id: GCID, nonce: hashed, use_fedcm_for_prompt: true, itp_support: true, cancel_on_tap_outside: true, context: "signup",
        callback: async r => { ev("onetap_ok"); const { error } = await A.sb.auth.signInWithIdToken({ provider: "google", token: r.credential, nonce: raw });
          if (error) { console.warn("One Tap", error.message); return } try { window.maCloudFlush && await maCloudFlush() } catch (e) {} location.reload() } });
      tapReady = true; google.accounts.id.prompt() } catch (e) {} };
    document.head.appendChild(sc) }

  /* ---- 4) install as an app (after the 2nd visit, once a week at most) ---- */
  try { if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {}) } catch (e) {}
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  const visits = (+LS.get("ma-visits") || 0) + 1; LS.set("ma-visits", String(visits));
  const canAsk = () => !standalone && visits >= 2 && Date.now() - (+LS.get("ma-inst-ask") || 0) > 7 * 864e5 && !document.querySelector(".ej-g,.gw-ov,.gw-tc,.ma-cn") && (()=>{const o=document.getElementById("overlay");return !o||o.hidden})();
  function bar(html, onGo){ const d = document.createElement("div"); d.className = "ej-g"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "Install app");
    d.innerHTML = html + `<div class="r">${onGo ? '<button class="go">Install</button>' : ""}<button class="s">Not now</button></div>`;
    d.onclick = e => { const b = e.target.closest("button"); if (!b) return; if (b.classList.contains("go")) onGo(); else ev("install_no"); d.remove() };
    LS.set("ma-inst-ask", String(Date.now())); ev("install_shown"); document.body.appendChild(d) }
  let deferred = null;
  addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e;
    setTimeout(() => { if (!canAsk()) return; bar("<b>Add M&A Prep to your home screen. Opens like an app, one tap to practice.</b>",
      async () => { ev("install_click"); try { deferred.prompt(); const r = await deferred.userChoice; if (r && r.outcome === "accepted") ev("install_ok") } catch (x) {} deferred = null }) }, 20000) });
  const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && /safari/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
  if (iOS) setTimeout(() => { if (canAsk()) bar("<b>Get the app: tap the Share button below, then “Add to Home Screen”.</b>", null) }, 25000);
  addEventListener("appinstalled", () => ev("install_ok"));

  A.ready.then(s => { if (s) autofill(s); else setTimeout(oneTap, 6000) });
  try { A.sb.auth.onAuthStateChange((e, s) => { if (e === "SIGNED_IN" && s) setTimeout(() => autofill(s), 800) }) } catch (e) {}
})();
