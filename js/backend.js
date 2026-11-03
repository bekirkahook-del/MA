/* M&A backend shim: gives the app the same window.claude.use() surface it had on claude.ai,
   backed by Supabase (auth + database) and a Netlify Function (AI). */
(function(){
  const SB_URL="https://nbakxpnhcfzdosbzbupd.supabase.co";
  const SB_KEY="sb_publishable_-2q58P2-fXrY-q1y4GQ8jw_58OrzsDu";
  const OWNER_EMAIL="bekirkahook@gmail.com";
  const PUBLIC_COLS=["players","reviews","views","avatars","names"];
  let sb=null;try{sb=window.supabase&&window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}catch(e){console.warn("Supabase init failed",e)}
  const ready=sb?sb.auth.getSession().then(r=>r.data&&r.data.session||null).catch(()=>null):Promise.resolve(null);
  window.MA_AUTH={sb,ready,session:null,ownerEmail:OWNER_EMAIL};
  ready.then(s=>{window.MA_AUTH.session=s});
  if(sb)sb.auth.onAuthStateChange((ev,s)=>{const had=!!window.MA_AUTH.session;window.MA_AUTH.session=s;
    if((ev==="SIGNED_IN"&&!had)||ev==="SIGNED_OUT"){setTimeout(()=>location.reload(),50)}});

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
    onSnapshot(cb,err){const run=()=>this.get().then(cb,e=>err&&err(e));run();return watch(col,run)}}}
  function colRef(col,lim=1000){return{
    limit(n){return colRef(col,n)},
    doc(id){return docRef(col,id)},
    async get(){const {data,error}=await sb.from("docs").select("id,data").eq("col",col).order("updated_at",{ascending:false}).limit(lim);if(error)throw error;return{docs:(data||[]).map(r=>mkDoc(r.id,r.data))}},
    onSnapshot(cb,err){const run=()=>this.get().then(cb,e=>err&&err(e));run();return watch(col,run)}}}

  async function makeDB(){const s=await ready;if(!sb||!s)return null;
    return{collection:p=>colRef(p),doc:p=>{const [c,i]=split(p);return docRef(c,i)}}}
  async function makeUser(){const s=await ready;if(!sb||!s)return null;const u=s.user;
    const nm=()=>{try{const st=JSON.parse(localStorage.getItem("ma-progress-v1")||"{}");if(st.profile&&st.profile.name)return st.profile.name}catch(e){}return (u.user_metadata&&(u.user_metadata.full_name||u.user_metadata.name))||""};
    const pushName=async n=>{if(!n)return;try{await sb.from("docs").upsert({col:"names",id:u.id,data:{name:n},uid:u.id,updated_at:new Date().toISOString()})}catch(e){}};
    pushName(nm());window.MA_AUTH.pushName=pushName;
    return{id:async()=>u.id,me:async()=>({name:nm(),email:u.email}),isOwner:()=>(u.email||"").toLowerCase()===OWNER_EMAIL,can:async()=>true,
      async profiles(ids){const out={};if(!ids.length)return out;const {data}=await sb.from("docs").select("id,data").eq("col","names").in("id",ids.slice(0,500));(data||[]).forEach(r=>out[r.id]={name:(r.data&&r.data.name)||""});return out}}}
  async function makeSample(){const s=await ready;if(!s)return null;
    return{async json(prompt,opts){const cur=(await sb.auth.getSession()).data.session;const r=await fetch("/.netlify/functions/ai",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+(cur?cur.access_token:"")},body:JSON.stringify({prompt,json:true,tier:(opts&&opts.modelTier)||"default"})});
      const j=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(j.error||"AI request failed");e.code=j.code||r.status;throw e}return j.result}}}
  const downloads={async save({filename,data}){const url=URL.createObjectURL(data instanceof Blob?data:new Blob([data]));const a=document.createElement("a");a.href=url;a.download=filename||"download";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(url);a.remove()},500)}};
  window.claude={use(name){
    if(name==="db")return makeDB();if(name==="user")return makeUser();if(name==="sample")return makeSample();
    if(name==="downloads")return Promise.resolve(downloads);return Promise.resolve(null)}};
})();
