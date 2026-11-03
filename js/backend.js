/* M&A backend shim: gives the app the same window.claude.use() surface it had on claude.ai,
   backed by Supabase (auth + database) and a Netlify Function (AI). */
(function(){
  const SB_URL="https://nbakxpnhcfzdosbzbupd.supabase.co";
  const SB_KEY="sb_publishable_-2q58P2-fXrY-q1y4GQ8jw_58OrzsDu";
  const OWNER_HASH="13d8e795a85caa1b6668d51dd5c74b25aa7ed1c1a508336292a3078fcbe47fc6"; /* sha-256 of the owner email */
  const PUBLIC_COLS=["players","reviews","views","avatars","names"];
  /* Progress belongs to an account. Runs before the app reads localStorage: if the saved progress
     was synced to a different account (or someone signed out), start this browser fresh. The account's
     own progress then loads from the cloud. Display settings like theme are kept. */
  try{const KEY="ma-progress-v1",raw=localStorage.getItem(KEY);
    let uid=null;try{const t=JSON.parse(localStorage.getItem("sb-nbakxpnhcfzdosbzbupd-auth-token")||"null");uid=(t&&(t.user||(t.currentSession&&t.currentSession.user))||{}).id||null}catch(e){}
    if(raw){const loc=JSON.parse(raw);
      if(loc&&loc._synced&&loc._synced!==uid){localStorage.setItem(KEY,JSON.stringify({settings:loc.settings||{},seeded:true,onboardSkip:true}));
        ["ma-notif-v1"].forEach(k=>{try{localStorage.removeItem(k)}catch(e){}})}}}catch(e){}
  let sb=null;try{sb=window.supabase&&window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}catch(e){console.warn("Supabase init failed",e)}
  const ready=sb?sb.auth.getSession().then(r=>r.data&&r.data.session||null).catch(()=>null):Promise.resolve(null);
  window.MA_AUTH={sb,ready,session:null};
  let loadUid=null,reloading=false;
  ready.then(s=>{window.MA_AUTH.session=s;loadUid=s?s.user.id:null;
    /* only reload when the signed-in person actually changes (sign in / sign out), never on token refresh or tab focus */
    if(sb)sb.auth.onAuthStateChange((ev,ns)=>{window.MA_AUTH.session=ns;const nu=ns?ns.user.id:null;
      if(!reloading&&nu!==loadUid&&(ev==="SIGNED_IN"||ev==="SIGNED_OUT")){reloading=true;setTimeout(()=>location.reload(),60)}})});

  const split=path=>{const i=path.lastIndexOf("/");return [path.slice(0,i),path.slice(i+1)]};
  const mkDoc=(id,data)=>({id,exists:!!data,data:()=>data||undefined});
  const listeners=new Map();let chan=null;
  function ensureChannel(){if(chan||!sb)return;try{chan=sb.channel("docs-live").on("postgres_changes",{event:"*",schema:"public",table:"docs"},p=>{const col=(p.new&&p.new.col)||(p.old&&p.old.col);(listeners.get(col)||[]).forEach(f=>f())}).subscribe()}catch(e){}}
  function watch(col,fn){ensureChannel();if(!listeners.has(col))listeners.set(col,new Set());listeners.get(col).add(fn);const t=setInterval(fn,45000);return()=>{listeners.get(col).delete(fn);clearInterval(t)}}
  function bump(col){setTimeout(()=>(listeners.get(col)||[]).forEach(f=>f()),150)}

  function docRef(col,id){return{
    async get(){const {data,error}=await sb.from("docs").select("data").eq("col",col).eq("id",id).maybeSingle();if(error)throw error;return mkDoc(id,data&&data.data)},
    async set(d){const uid=(window.MA_AUTH.session||{}).user?.id;const {error}=await sb.from("docs").upsert({col,id,data:d,uid,updated_at:new Date().toISOString()});if(error)throw error;bump(col)},
    async update(d){const cur=await this.get();return this.set({...(cur.data()||{}),...d})},
    async delete(){const {error}=await sb.from("docs").delete().eq("col",col).eq("id",id);if(error)throw error;bump(col)},
    onSnapshot(cb,err){let last;const run=()=>this.get().then(d=>{const k=JSON.stringify(d.data()||null);if(k===last)return;last=k;cb(d)},e=>err&&err(e));run();return watch(col,run)}}}
  function colRef(col,lim=1000){return{
    limit(n){return colRef(col,n)},
    doc(id){return docRef(col,id)},
    async get(){const {data,error}=await sb.from("docs").select("id,data").eq("col",col).order("updated_at",{ascending:false}).limit(lim);if(error)throw error;return{docs:(data||[]).map(r=>mkDoc(r.id,r.data))}},
    onSnapshot(cb,err){let last;const run=()=>this.get().then(r=>{const k=JSON.stringify(r.docs.map(d=>[d.id,d.data()]).sort((a,b)=>a[0]<b[0]?-1:1));if(k===last)return;last=k;cb(r)},e=>err&&err(e));run();return watch(col,run)}}}

  async function makeDB(){const s=await ready;if(!sb||!s)return null;
    return{collection:p=>colRef(p),doc:p=>{const [c,i]=split(p);return docRef(c,i)}}}
  async function makeUser(){const s=await ready;if(!sb||!s)return null;const u=s.user;
    const nm=()=>{try{const st=JSON.parse(localStorage.getItem("ma-progress-v1")||"{}");if(st.profile&&st.profile.name)return st.profile.name}catch(e){}return (u.user_metadata&&(u.user_metadata.full_name||u.user_metadata.name))||""};
    const pushName=async n=>{if(!n)return;try{await sb.from("docs").upsert({col:"names",id:u.id,data:{name:n},uid:u.id,updated_at:new Date().toISOString()})}catch(e){}};
    pushName(nm());window.MA_AUTH.pushName=pushName;
    let owner=false;try{const h=await crypto.subtle.digest("SHA-256",new TextEncoder().encode((u.email||"").toLowerCase()));owner=[...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,"0")).join("")===OWNER_HASH}catch(e){}
    return{id:async()=>u.id,me:async()=>({name:nm(),email:u.email}),isOwner:()=>owner,can:async()=>true,
      async profiles(ids){const out={};if(!ids.length)return out;const {data}=await sb.from("docs").select("id,data").eq("col","names").in("id",ids.slice(0,500));(data||[]).forEach(r=>out[r.id]={name:(r.data&&r.data.name)||""});return out}}}
  async function makeSample(){const s=await ready;if(!s)return null;
    return{async json(prompt,opts){const cur=(await sb.auth.getSession()).data.session;const r=await fetch("/.netlify/functions/ai",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+(cur?cur.access_token:"")},body:JSON.stringify({prompt,json:true,tier:(opts&&opts.modelTier)||"default"})});
      const j=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(j.error||"AI request failed");e.code=j.code||r.status;throw e}return j.result}}}
  const downloads={async save({filename,data}){const url=URL.createObjectURL(data instanceof Blob?data:new Blob([data]));const a=document.createElement("a");a.href=url;a.download=filename||"download";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(url);a.remove()},500)}};
  window.claude={use(name){
    if(name==="db")return makeDB();if(name==="user")return makeUser();if(name==="sample")return makeSample();
    if(name==="downloads")return Promise.resolve(downloads);return Promise.resolve(null)}};

  /* AI is a Pro feature: friendly lock message used wherever AI would run */
  window.aiLock=function(name){const signed=!!(window.MA_AUTH&&window.MA_AUTH.session);
    return signed?`<span class="ai-lock">${name} comes with Pro. <a href="#" data-ai-pro>Try it free</a></span>`
      :`<span class="ai-lock">${name} comes with Pro. <a href="#" data-ai-auth>Try it free</a></span>`};
  document.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest("[data-ai-pro],[data-ai-auth]");if(!a)return;e.preventDefault();
    if(a.hasAttribute("data-ai-auth")){window.maOpenAuth&&window.maOpenAuth("up");return}
    try{if(typeof closePanel==="function")closePanel()}catch(x){}try{showTab("pro")}catch(x){}});
})();
