/* Header polish: one consistent control size, cleaner order, Sign out moved into Settings. */
(function(){
  const css=`
.top{flex-wrap:nowrap!important;align-items:center!important;gap:12px!important;padding:12px 0!important;min-height:64px}
.top-r{flex-wrap:nowrap!important;gap:6px!important;align-items:center!important}
.top-r>*{flex:none}
.top-r #palBtn{order:1}.top-r #newsBtn{order:2}.top-r #proBtn{order:3}.top-r #xpChip{order:4}
.top-r #statsBtn{order:5}.top-r .nbell{order:6}.top-r #setBtn{order:7}.top-r #avBtn{order:8}.top-r #authBtn{order:9}
.top-r #authBtn:not(.cta){display:none!important}
.top-r .palbtn{height:36px;min-width:210px;padding:0 10px 0 12px;border:1px solid var(--rule);border-radius:10px;background:var(--sheet);color:var(--ink-2);font-size:13.5px;gap:8px;transition:border-color .15s,box-shadow .15s}
.top-r .palbtn:hover{border-color:var(--ink-2)}
.top-r .palbtn kbd{margin-left:auto;font-family:var(--mono);font-size:10.5px;border:1px solid var(--rule);border-radius:5px;padding:1px 5px;background:var(--paper)}
.top-r .newsbtn{height:36px;padding:0 12px!important;border:1px solid transparent!important;border-radius:10px!important;color:var(--ink)!important;font-size:13.5px!important;font-weight:500;gap:7px;background:none}
.top-r .newsbtn .nb-ic{display:block!important;color:var(--ink-2)}
.top-r .newsbtn:hover{background:color-mix(in srgb,var(--ink) 6%,transparent)!important}
.top-r .nb-dot{top:7px!important;right:auto!important;left:22px!important;width:7px!important;height:7px!important;box-shadow:0 0 0 2px var(--paper)}
.top-r .probtn{height:30px;padding:0 12px!important;border-radius:99px!important;border:1px solid color-mix(in srgb,var(--brass) 55%,transparent)!important;color:var(--brass)!important;font-size:12px!important;font-weight:700!important;letter-spacing:.04em;background:color-mix(in srgb,var(--brass) 8%,transparent)!important;margin:0 2px}
.top-r .probtn:hover{background:color-mix(in srgb,var(--brass) 16%,transparent)!important}
.top-r .iconbtn,.top-r .nbell{width:36px!important;height:36px!important;padding:0!important;border-radius:10px!important;display:grid!important;place-items:center;color:var(--ink-2)!important;background:none;transition:background .15s,color .15s}
.top-r .iconbtn:hover,.top-r .nbell:hover{background:color-mix(in srgb,var(--ink) 6%,transparent)!important;color:var(--ink)!important}
.top-r .avbtn{width:34px!important;height:34px!important;margin-left:4px;box-shadow:0 0 0 2px var(--paper),0 0 0 3px var(--rule);border-radius:50%}
.top-r #authBtn.cta{height:36px;padding:0 16px;border-radius:10px;font-size:13.5px;margin-left:4px}
.top-r .xpchip{font-size:11.5px!important}
@media (max-width:900px){.top-r .palbtn{min-width:0}.top-r .palbtn span,.top-r .palbtn kbd{display:none}.top-r .palbtn{width:36px;padding:0;justify-content:center;border-color:transparent;background:none}.top-r .palbtn:hover{background:color-mix(in srgb,var(--ink) 6%,transparent)}
  .top-r .newsbtn .nb-l{display:none!important}.top-r .newsbtn{width:36px;padding:0!important;justify-content:center}.top-r #xpChip{display:none!important}}
@media (max-width:480px){.top{gap:6px!important;min-height:56px;padding:10px 0!important}.top-r{gap:0!important}
  .top-r .probtn{height:26px;padding:0 8px!important;font-size:11px!important}
  .top-r .iconbtn,.top-r .nbell,.top-r .palbtn,.top-r .newsbtn{width:34px!important;height:34px!important}
  .top-r .avbtn{width:30px!important;height:30px!important}.top-r #authBtn.cta{padding:0 12px;height:32px;font-size:12.5px}
  .top .brand{font-size:25px!important}}
@media (max-width:370px){.top-r .probtn{display:none!important}}
.top .brand{font-family:"Nunito",var(--display)!important;font-weight:900!important;font-stretch:normal!important;letter-spacing:.02em!important;font-size:31px!important;line-height:1}
.acct-row{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;border:1px solid var(--rule);border-radius:12px;padding:12px 14px;margin:0 0 18px;background:var(--sheet)}
.acct-row span{font-size:13.5px;color:var(--ink-2)}.acct-row b{color:var(--ink);font-weight:600}
.acct-row button{font:inherit;font-size:13px;font-weight:600;border:1px solid var(--rule);background:none;color:var(--ink);border-radius:9px;padding:7px 14px;cursor:pointer}
.acct-row button:hover{border-color:var(--bad);color:var(--bad)}`;
  const st=document.createElement("style");st.id="hdr-polish";st.textContent=css;document.head.appendChild(st);
  /* Sign out lives in Settings now */
  const A=window.MA_AUTH;if(!A||!A.ready)return;
  A.ready.then(s=>{if(!s)return;
    const add=()=>{const box=document.getElementById("settings");if(!box||box.querySelector(".acct-row"))return;
      const row=document.createElement("div");row.className="acct-row";
      row.innerHTML=`<span>Signed in as <b></b></span><button type="button">Sign out</button>`;row.querySelector("b").textContent=s.user.email||"";
      row.querySelector("button").onclick=async e=>{const b=e.currentTarget;if(!confirm("Sign out of M&A? Your progress stays saved to your account."))return;b.disabled=true;b.textContent="Saving…";
        try{if(window.maCloudFlush)await maCloudFlush()}catch(x){}try{await A.sb.auth.signOut()}catch(x){}};
      box.insertBefore(row,box.firstChild)};
    add();setInterval(add,1000)});
})();
