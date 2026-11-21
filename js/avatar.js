/* Your M&A Prep character (Bitmoji-style). Built from SVG parts, so it's instant and tiny.
   Rank up to unlock finance-flex gear: quarter-zips, the fleece vest, suits, steel and gold watches, trading-floor
   and corner-office backgrounds. Special items for a duel win, a Superday offer and a 7-day streak.
   Saved on the profile (S.profile.av) and synced, so friends see it on your profile and leaderboards.
   Item names are look-alikes, not real brands. */
(function(){
  const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const xp=()=>{try{return totalXP()}catch(e){return 0}};
  const rank=()=>{try{return rankOf(xp())}catch(e){return 0}};
  const RN=()=>{try{return RANKS}catch(e){return [["Intern",0]]}};
  /* unlock rules: number = rank index needed; function = special */
  const SPECIAL={duel:{t:"Win a live duel",ok:()=>((S.ach||{}).duelWins||0)>=1},offer:{t:"Get an Offer in a Superday",ok:()=>(S.superdays||[]).some(x=>x.decision==="Offer")},
    streak:{t:"Reach a 7-day streak",ok:()=>{try{return streak()>=7||(S.bestStreak||0)>=7}catch(e){return false}}}};
  const SKIN=["#F7D7C4","#EDBB99","#D49A6A","#B87447","#8D5524","#5C3A1E"];
  const HC={black:"#1F1A17",brown:"#5A3A22",blonde:"#D8B06A",red:"#A8432A",gray:"#9AA0A6"};
  const ITEMS={
    hair:[["short","Short",0],["side","Side part",0],["buzz","Buzz",0],["curly","Curly",0],["long","Long",0],["bun","Bun",0],["slick","Wall St slick-back",4]],
    hc:[["black","Black",0],["brown","Brown",0],["blonde","Blonde",0],["red","Red",0],["gray","Silver fox",5]],
    top:[["tee","Tee",0],["hoodie","Hoodie",0],["qzip","Country-club quarter-zip",1],["vest","Midtown fleece vest",2],["shirt","Shirt + tie",3],["suit","Suit",4],["suitsq","Suit + pocket square",5],["three","Three-piece",6]],
    eyes:[["none","None",0],["round","Round glasses",0],["avi","Aviators",3]],
    ears:[["none","None",0],["buds","Wireless earbuds",1]],
    wrist:[["none","None",0],["sport","Sport watch",2],["steel","Steel diver watch",4],["gold","Gold oyster watch",6]],
    hand:[["none","None",0],["coffee","Coffee",0],["iced","Iced coffee",1],["glove","Boxing glove","duel"],["offer","Offer letter","offer"]],
    bg:[["blue","Blue",0],["mint","Mint",0],["sand","Sand",0],["floor","Trading floor",3],["nyc","NYC skyline",4],["office","Corner office",6],["fire","Streak flames","streak"]]};
  const CAT=[["top","Outfit"],["wrist","Watch"],["hand","Hand"],["hair","Hair"],["hc","Hair color"],["eyes","Eyewear"],["ears","Ears"],["bg","Background"],["skin","Skin"]];
  const unlocked=it=>typeof it[2]==="number"?rank()>=it[2]:!!(SPECIAL[it[2]]&&SPECIAL[it[2]].ok());
  const lockText=it=>typeof it[2]==="number"?`Unlocks at ${RN()[it[2]]?RN()[it[2]][0]:"a higher rank"}`:SPECIAL[it[2]]?SPECIAL[it[2]].t:"";
  const DEF={skin:1,hair:"short",hc:"brown",top:"hoodie",eyes:"none",ears:"none",wrist:"none",hand:"coffee",bg:"blue"};
  const cfgOf=c=>({...DEF,...(c||{})});
  /* ---------- SVG ---------- */
  function svg(c,size,id){c=cfgOf(c);const sk=SKIN[c.skin]||SKIN[1],hc=HC[c.hc]||HC.brown,u="a"+(id||Math.random().toString(36).slice(2,7));
    const shade="rgba(0,0,0,.12)";
    const BG={blue:`<rect width="200" height="200" fill="#DCE6FF"/>`,mint:`<rect width="200" height="200" fill="#D7F2E6"/>`,sand:`<rect width="200" height="200" fill="#F3E6CF"/>`,
      floor:`<rect width="200" height="200" fill="#0E1B33"/>${[0,1,2,3].map(i=>`<rect x="${10+i*48}" y="40" width="40" height="26" rx="3" fill="#13284d" stroke="#2c4d86"/><polyline points="${13+i*48},60 ${20+i*48},52 ${27+i*48},56 ${35+i*48},46 ${46+i*48},50" fill="none" stroke="${i%2?"#3ad07a":"#ff5a5a"}" stroke-width="2"/>`).join("")}<rect y="150" width="200" height="50" fill="#0a1426"/>`,
      nyc:`<rect width="200" height="200" fill="#FFB26B"/><rect width="200" height="110" fill="#FF8E72"/><circle cx="150" cy="60" r="18" fill="#FFE08A"/>${[[0,90,26],[24,70,20],[42,100,24],[64,55,18],[80,85,26],[104,40,16],[118,75,22],[138,95,24],[160,60,20],[178,88,22]].map(([x,y,w])=>`<rect x="${x}" y="${y}" width="${w}" height="${200-y}" fill="#2B2D52"/>`).join("")}`,
      office:`<rect width="200" height="200" fill="#EDE3D2"/><rect x="10" y="20" width="180" height="110" rx="4" fill="#9CC6E8" stroke="#6b5a45" stroke-width="5"/><line x1="100" y1="20" x2="100" y2="130" stroke="#6b5a45" stroke-width="4"/>${[[18,70,22],[42,55,18],[62,80,20],[110,60,24],[138,75,18],[160,50,22]].map(([x,y,w])=>`<rect x="${x}" y="${y}" width="${w}" height="${130-y}" fill="#5d7fa0"/>`).join("")}`,
      fire:`<rect width="200" height="200" fill="#2A0E0A"/><path d="M30 200 C20 150 60 140 50 100 C80 130 70 90 90 60 C100 100 130 90 120 50 C150 90 170 110 160 150 C180 140 185 170 175 200Z" fill="#FF6A1A"/><path d="M60 200 C55 165 85 160 80 130 C100 150 105 120 115 100 C125 130 150 140 145 200Z" fill="#FFC53D"/>`};
    const T={tee:`<path d="M30 200 C34 160 60 146 100 146 C140 146 166 160 170 200Z" fill="#3D6FD8"/><path d="M84 146 Q100 160 116 146" fill="none" stroke="${shade}" stroke-width="4"/>`,
      hoodie:`<path d="M26 200 C30 156 58 142 100 142 C142 142 170 156 174 200Z" fill="#59616E"/><path d="M70 146 Q100 176 130 146" fill="#4b525d"/><line x1="92" y1="160" x2="90" y2="184" stroke="#e8e8e8" stroke-width="2.5"/><line x1="108" y1="160" x2="110" y2="184" stroke="#e8e8e8" stroke-width="2.5"/>`,
      qzip:`<path d="M26 200 C30 156 58 142 100 142 C142 142 170 156 174 200Z" fill="#1F3A68"/><path d="M84 140 L100 150 L116 140 L114 152 L100 162 L86 152Z" fill="#17305a"/><line x1="100" y1="150" x2="100" y2="186" stroke="#c9ced6" stroke-width="2.5"/><rect x="97" y="182" width="6" height="8" rx="2" fill="#c9ced6"/>`,
      vest:`<path d="M26 200 C30 156 58 142 100 142 C142 142 170 156 174 200Z" fill="#DCE3EE"/><path d="M56 154 C62 150 76 146 88 146 L100 200 L50 200 C50 180 52 164 56 154Z" fill="#2B3A55"/><path d="M144 154 C138 150 124 146 112 146 L100 200 L150 200 C150 180 148 164 144 154Z" fill="#2B3A55"/><rect x="126" y="168" width="12" height="6" rx="1" fill="#9fb0c8"/>`,
      shirt:`<path d="M26 200 C30 156 58 142 100 142 C142 142 170 156 174 200Z" fill="#EAF1FB"/><path d="M86 144 L100 158 L114 144 L112 152 L100 160 L88 152Z" fill="#fff" stroke="#cfd8e6"/><path d="M96 158 L104 158 L108 196 L100 204 L92 196Z" fill="#9E1C2E"/>`,
      suit:`<path d="M26 200 C30 156 58 142 100 142 C142 142 170 156 174 200Z" fill="#1E2433"/><path d="M86 144 L100 166 L114 144Z" fill="#fff"/><path d="M96 160 L104 160 L107 196 L100 202 L93 196Z" fill="#26457a"/><path d="M78 148 L100 196 L88 200 L70 160Z" fill="#161b27"/><path d="M122 148 L100 196 L112 200 L130 160Z" fill="#161b27"/>`,
      suitsq:"",three:""};
    T.suitsq=T.suit+`<path d="M132 170 L144 168 L142 176 L132 177Z" fill="#E8C84A"/>`;
    T.three=T.suit.replace(/#26457a/,"#5a1630")+`<path d="M90 172 L100 196 L110 172 L108 200 L92 200Z" fill="#3a3f52"/><circle cx="100" cy="182" r="1.6" fill="#c9a43a"/><circle cx="100" cy="190" r="1.6" fill="#c9a43a"/>`;
    const H={short:`<path d="M55 90 C48 36 152 36 145 90 C142 74 134 66 124 63 C110 58 90 58 76 63 C66 66 58 74 55 90Z" fill="${hc}"/>`,
      side:`<path d="M54 92 C46 34 154 34 146 90 C140 68 120 58 96 60 C78 62 62 72 54 92Z" fill="${hc}"/><path d="M90 52 C80 60 72 64 60 70" stroke="${shade}" stroke-width="3" fill="none"/>`,
      buzz:`<path d="M60 80 C60 50 140 50 140 80 C136 66 120 60 100 60 C80 60 64 66 60 80Z" fill="${hc}" opacity=".85"/>`,
      curly:`${[[62,70],[74,56],[90,50],[110,50],[126,56],[138,70],[66,84],[134,84]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="13" fill="${hc}"/>`).join("")}`,
      long:`<path d="M54 84 C50 40 150 40 146 84 L150 140 C140 130 138 110 136 96 C130 66 70 66 64 96 C62 110 60 130 50 140Z" fill="${hc}"/>`,
      bun:`<circle cx="100" cy="38" r="16" fill="${hc}"/><path d="M58 80 C56 46 144 46 142 80 C138 62 122 56 100 56 C78 56 62 62 58 80Z" fill="${hc}"/>`,
      slick:`<path d="M54 92 C46 30 154 30 146 92 C142 70 128 58 100 56 C72 58 58 70 54 92Z" fill="${hc}"/><path d="M70 58 C90 46 120 46 134 60" stroke="rgba(255,255,255,.35)" stroke-width="3" fill="none"/>`};
    const EY={none:"",round:`<g fill="none" stroke="#222" stroke-width="3"><circle cx="82" cy="92" r="11"/><circle cx="118" cy="92" r="11"/><line x1="93" y1="92" x2="107" y2="92"/></g>`,
      avi:`<g><path d="M68 86 L96 86 L94 100 C90 106 74 106 70 100Z" fill="#1d2a3a" opacity=".9"/><path d="M104 86 L132 86 L130 100 C126 106 110 106 106 100Z" fill="#1d2a3a" opacity=".9"/><line x1="96" y1="88" x2="104" y2="88" stroke="#b8902e" stroke-width="2.5"/></g>`};
    const EAR={none:"",buds:`<rect x="52" y="96" width="7" height="14" rx="3.5" fill="#fff" stroke="#ccc"/><rect x="141" y="96" width="7" height="14" rx="3.5" fill="#fff" stroke="#ccc"/>`};
    // forearm + hand at bottom-right, watch on the wrist, item in hand
    const arm=c.wrist!=="none"||c.hand!=="none";
    const sleeve={tee:"#3D6FD8",hoodie:"#59616E",qzip:"#1F3A68",vest:"#DCE3EE",shirt:"#EAF1FB",suit:"#1E2433",suitsq:"#1E2433",three:"#1E2433"}[c.top]||"#59616E";
    const W={none:"",sport:`<rect x="139" y="166" width="20" height="9" rx="3" fill="#222"/><rect x="143" y="164" width="12" height="13" rx="3" fill="#3a3a3a" stroke="#111"/>`,
      steel:`<rect x="139" y="166" width="20" height="9" rx="2" fill="#B9C0C9"/><circle cx="149" cy="170.5" r="7.5" fill="#1C3D6E" stroke="#C8CED6" stroke-width="2.5"/>`,
      gold:`<rect x="139" y="166" width="20" height="9" rx="2" fill="#D4AF37"/><circle cx="149" cy="170.5" r="7.5" fill="#F4E7B5" stroke="#C9A227" stroke-width="2.5"/><line x1="149" y1="170.5" x2="149" y2="166" stroke="#333" stroke-width="1"/>`};
    const HD={none:"",coffee:`<rect x="150" y="128" width="18" height="24" rx="3" fill="#fff" stroke="#bbb"/><rect x="150" y="134" width="18" height="8" fill="#8B5E3C"/>`,
      iced:`<path d="M148 124 L170 124 L167 154 L151 154Z" fill="rgba(255,255,255,.7)" stroke="#aaa"/><rect x="151" y="134" width="16" height="18" fill="#a8743f" opacity=".8"/><line x1="161" y1="112" x2="158" y2="128" stroke="#2db36b" stroke-width="3"/>`,
      glove:`<path d="M146 124 C146 110 172 108 174 124 L174 146 C174 152 148 152 146 146Z" fill="#D6322C"/><rect x="146" y="146" width="28" height="8" rx="2" fill="#fff"/>`,
      offer:`<rect x="146" y="114" width="28" height="36" rx="2" fill="#fff" stroke="#bbb" transform="rotate(-8 160 132)"/><text x="149" y="132" font-size="7" font-weight="700" fill="#1E7F4F" transform="rotate(-8 160 132)">OFFER</text><circle cx="166" cy="142" r="4" fill="#C9A227" transform="rotate(-8 160 132)"/>`};
    const armSvg=arm?`<path d="M128 200 C132 182 140 172 150 168 L158 172 C150 182 146 192 146 200Z" fill="${sleeve}"/><circle cx="157" cy="152" r="10" fill="${sk}"/><rect x="146" y="150" width="20" height="20" rx="8" fill="${sk}"/>${W[c.wrist]||""}${HD[c.hand]||""}`:"";
    return `<svg viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="Avatar" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="${u}"><rect width="200" height="200" rx="${c.round?100:28}"/></clipPath></defs><g clip-path="url(#${u})">
      ${BG[c.bg]||BG.blue}${c.hair==="long"?H.long:""}
      <rect x="88" y="120" width="24" height="30" rx="8" fill="${sk}"/><path d="M88 138 Q100 146 112 138 L112 132 L88 132Z" fill="${shade}"/>
      ${T[c.top]||T.hoodie}
      <ellipse cx="57" cy="98" rx="7" ry="10" fill="${sk}"/><ellipse cx="143" cy="98" rx="7" ry="10" fill="${sk}"/>
      <ellipse cx="100" cy="92" rx="42" ry="46" fill="${sk}"/>
      ${c.hair==="long"?"":(H[c.hair]||H.short)}${c.hair==="long"?`<path d="M58 80 C56 46 144 46 142 80 C138 62 122 56 100 56 C78 56 62 62 58 80Z" fill="${hc}"/>`:""}
      <path d="M72 80 Q82 75 92 80" stroke="${hc}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M108 80 Q118 75 128 80" stroke="${hc}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="82" cy="93" rx="6" ry="7" fill="#fff"/><ellipse cx="118" cy="93" rx="6" ry="7" fill="#fff"/><circle cx="83" cy="94" r="3.6" fill="#2a1d14"/><circle cx="119" cy="94" r="3.6" fill="#2a1d14"/>
      <path d="M100 98 Q96 110 101 112" stroke="${shade}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M86 120 Q100 130 114 120" stroke="#7a3a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      ${EY[c.eyes]||""}${EAR[c.ears]||""}${armSvg}</g></svg>`}
  window.maAvatarSVG=svg;
  /* ---------- editor ---------- */
  function editor(){const cur=cfgOf(S.profile.av);let cat="top";
    const draw=()=>{const items=cat==="skin"?SKIN.map((col,i)=>[i,`Tone ${i+1}`,0,col]):ITEMS[cat];
      const left=RN().slice(rank()+1)[0];
      openPanel(`<div class="label">Your character</div><h2>Make it yours</h2>
        <div class="avx-ed"><div class="avx-prev">${svg(cur,200,"prev")}<p class="note">${left?`<b>${E(RN()[rank()][0])}</b> now · ${Math.max(0,left[1]-xp())} XP to <b>${E(left[0])}</b> for new gear`:"Managing Director. Every rank item is yours."}</p></div>
        <div class="avx-side"><div class="avx-cats">${CAT.map(([k,n])=>`<button type="button" data-cat="${k}" aria-pressed="${k===cat}">${n}</button>`).join("")}</div>
        <div class="avx-grid">${items.map(it=>{const ok=cat==="skin"||unlocked(it),on=String(cur[cat])===String(it[0]);
          const prev={...cur,[cat]:it[0]};return `<button type="button" class="avx-it ${on?"on":""} ${ok?"":"lock"}" data-v="${E(it[0])}" ${ok?"":`title="${E(lockText(it))}"`}>${svg(prev,64,"t"+cat+it[0])}<span>${E(it[1])}</span>${ok?"":`<small>🔒 ${E(lockText(it))}</small>`}</button>`}).join("")}</div></div></div>
        <div class="actions"><button class="btn" id="avxSave">Save my character</button><button class="ghost" id="avxX">Cancel</button></div>`);
      try{panel.classList.add("wide")}catch(e){}
      panel.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{cat=b.dataset.cat;draw()});
      panel.querySelectorAll(".avx-it").forEach(b=>b.onclick=()=>{if(b.classList.contains("lock")){try{toast(b.title||"Locked")}catch(e){}return}const v=b.dataset.v;cur[cat]=cat==="skin"?+v:v;draw()});
      document.getElementById("avxSave").onclick=()=>{S.profile.av=cur;S.profile.avSeen=rank();save();try{syncProfile()}catch(e){}try{toast("Character saved")}catch(e){}try{window.maEv&&maEv("avatar_save")}catch(e){}closePanel();try{render()}catch(e){}};
      document.getElementById("avxX").onclick=closePanel};
    draw()}
  window.maAvatarEditor=editor;
  /* ---------- show it ---------- */
  const st=document.createElement("style");st.textContent=`.avx-card{display:flex;align-items:center;gap:16px;margin:0 0 14px;padding:14px;border:1px solid var(--rule);border-radius:6px;background:var(--sheet)}
.avx-card svg{flex:none;border-radius:6px;box-shadow:0 8px 22px rgba(20,32,59,.15)}.avx-card b{display:block;font-size:16px}.avx-card p{margin:4px 0 10px;font-size:13.5px;color:var(--ink-2)}
.avx-ed{display:grid;grid-template-columns:220px 1fr;gap:18px;align-items:start}.avx-prev{position:sticky;top:0;text-align:center}.avx-prev svg{border-radius:6px;box-shadow:0 10px 30px rgba(20,32,59,.18)}
.avx-cats{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}.avx-cats button{font:inherit;font-size:13px;padding:6px 11px;border-radius:999px;border:1px solid var(--rule);background:none;color:var(--ink);cursor:pointer}.avx-cats button[aria-pressed=true]{background:var(--ink);color:var(--paper)}
.avx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(98px,1fr));gap:8px;max-height:46vh;overflow:auto}
.avx-it{display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 6px;border:2px solid var(--rule);border-radius:6px;background:var(--paper);cursor:pointer;font:inherit;color:var(--ink)}
.avx-it svg{border-radius:6px}.avx-it span{font-size:12px;font-weight:600;text-align:center;line-height:1.2}.avx-it small{font-size:10.5px;color:var(--ink-2);text-align:center;line-height:1.2}
.avx-it.on{border-color:var(--cobalt);box-shadow:0 0 0 3px color-mix(in srgb,var(--cobalt) 18%,transparent)}.avx-it.lock{opacity:.6;cursor:not-allowed}.avx-it.lock svg{filter:grayscale(1)}
.av.avx-av{background:none!important;overflow:hidden;padding:0}.av.avx-av svg{display:block;width:100%;height:100%}
@media(max-width:640px){.avx-ed{grid-template-columns:1fr}.avx-prev svg{width:150px;height:150px}}`;document.head.appendChild(st);
  // profile: character card above the profile
  const _sp=window.showPlayer;if(typeof _sp==="function"){window.showPlayer=function(p){_sp.apply(this,arguments);try{
    const isMe=!window.myId||p.id===myId||p.id==="me",av=isMe?S.profile.av:p.av;const li=panel.querySelector(".li");if(!li||li.querySelector(".avx-card"))return;
    if(!isMe&&!av)return;const r=rank(),nxt=RN()[r+1];
    const card=document.createElement("div");card.className="avx-card";
    card.innerHTML=`${svg(av,110,"pf")}<div><b>${isMe?(av?"Your character":"Make your character"):"Their character"}</b><p>${isMe?(nxt?`Rank up to ${E(nxt[0])} to unlock new gear.`:"You've unlocked every rank item."):""}</p>${isMe?`<button class="btn sm" id="avxEdit">${av?"Customize":"Create my character"}</button>`:""}</div>`;
    li.insertBefore(card,li.firstChild);const b=card.querySelector("#avxEdit");if(b)b.onclick=editor}catch(e){console.error(e)}}}
  // everywhere else: show the character instead of initials when there's no photo
  try{const _av=avatar;avatar=function(id,name,size){const h=_av(id,name,size);try{
      if(/av-img/.test(h))return h;const isMe=window.myId?(id===myId||id==="me"):id==="me";
      const p=isMe?null:(typeof PLAYERS!=="undefined"?PLAYERS.find(x=>x.id===id):null),c=isMe?S.profile.av:p&&p.av;if(!c)return h;
      return `<span class="av avx-av" style="width:${size}px;height:${size}px" aria-hidden="true">${svg({...c,round:1},size,"l"+String(id).slice(0,6)+size)}</span>`}catch(e){return h}}}catch(e){}
  // sync the character with the public profile
  try{const _ms=myStats;myStats=function(){const o=_ms.apply(this,arguments);if(S.profile&&S.profile.av)o.av=S.profile.av;return o}}catch(e){}
  // new gear unlocked after a rank-up: tell them once
  setInterval(()=>{try{const r=rank(),seen=S.profile.avSeen;if(seen==null){S.profile.avSeen=r;return}if(r>seen){S.profile.avSeen=r;save();
    const got=Object.values(ITEMS).flat().filter(it=>it[2]===r).map(it=>it[1]);if(got.length&&typeof toast==="function"){toast(`New gear unlocked: ${got.join(", ")}. Tap to dress up.`);const t=document.querySelector(".toast");if(t){t.style.cursor="pointer";t.onclick=editor}}}}catch(e){}},5000);
})();

/* Home: "next unlock" card. Shows your character already wearing the next rank's gear, and how far away it is. */
(function(){
  const st=document.createElement("style");st.textContent=`.avx-next{display:flex;align-items:center;gap:14px;margin:12px 0;padding:12px 14px;border:1px solid var(--rule);border-radius:6px;background:linear-gradient(120deg,color-mix(in srgb,var(--cobalt) 8%,var(--sheet)),var(--sheet));cursor:pointer;text-align:left;width:100%;font:inherit;color:var(--ink)}
.avx-next svg{flex:none;border-radius:6px}.avx-next b{display:block;font-size:15px}.avx-next span{display:block;font-size:13px;color:var(--ink-2)}
.avx-bar{height:6px;border-radius:3px;background:var(--rule);margin-top:8px;overflow:hidden}.avx-bar i{display:block;height:100%;background:var(--cobalt)}`;document.head.appendChild(st);
  function card(){try{const home=document.querySelector('[data-view="home"]');if(!home||home.classList.contains("home-new"))return;const cont=document.getElementById("continue");if(!cont)return;
    let el=document.getElementById("avxNext");const x=totalXP(),r=rankOf(x),nx=RANKS[r+1];
    if(!nx){if(el)el.remove();return}
    const ITEMS_NEXT={1:["Country-club quarter-zip","Wireless earbuds","Iced coffee"],2:["Midtown fleece vest","Sport watch"],3:["Shirt + tie","Aviators","Trading floor"],4:["Suit","Steel diver watch","Slick-back","NYC skyline"],5:["Pocket square","Silver fox"],6:["Three-piece","Gold oyster watch","Corner office"]}[r+1]||[];
    const PREV={1:{top:"qzip",ears:"buds",hand:"iced"},2:{top:"vest",wrist:"sport"},3:{top:"shirt",eyes:"avi",bg:"floor"},4:{top:"suit",wrist:"steel",bg:"nyc"},5:{top:"suitsq",hc:"gray"},6:{top:"three",wrist:"gold",bg:"office"}}[r+1]||{};
    const pct=Math.max(0,Math.min(100,Math.round((x-RANKS[r][1])/(nx[1]-RANKS[r][1])*100)));
    const html=`${maAvatarSVG({...(S.profile.av||{}),...PREV},72,"nx")}<div style="flex:1;min-width:0"><b>${nx[1]-x} XP to ${nx[0]}</b><span>Unlocks: ${ITEMS_NEXT.join(", ")}</span><div class="avx-bar"><i style="width:${pct}%"></i></div></div>`;
    if(!el){el=document.createElement("button");el.type="button";el.id="avxNext";el.className="avx-next";el.onclick=()=>maAvatarEditor();cont.after(el)}
    if(el.dataset.h!==html){el.innerHTML=html;el.dataset.h=html}}catch(e){}}
  setInterval(card,3000);setTimeout(card,1500);
})();
