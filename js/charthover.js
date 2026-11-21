/* Chart hover (Nov 21, 2026): any <svg data-hv='[[x,y,"label"],...]'> shows a crosshair, a dot and the exact
   label (date + price) for the nearest point under the mouse or finger. x/y are viewBox coordinates, sorted by x.
   Keyboard: focus the chart, then ←/→ (Shift for 10 steps), Home/End. Used by the price card and Monte Carlo charts. */
(function(){
  "use strict";
  var st = document.createElement("style");
  st.textContent = "svg[data-hv]{touch-action:pan-y;cursor:crosshair;outline:none}svg[data-hv]:focus-visible{box-shadow:0 0 0 2px var(--cobalt,#2448D8);border-radius:6px}" +
    ".hv-tip{position:fixed;z-index:9999;pointer-events:none;background:#13203B;color:#fff;font:600 12.5px/1.35 var(--mono,ui-monospace,monospace);padding:6px 9px;border-radius:8px;white-space:pre;box-shadow:0 6px 18px rgba(0,0,0,.25);transform:translate(-50%,-100%);margin-top:-10px}";
  document.head.appendChild(st);
  var tip = null, cur = null; // cur = {svg, pts, i}
  function data(svg){ if (svg._hv) return svg._hv; try { svg._hv = JSON.parse(svg.getAttribute("data-hv")) } catch (e) { svg._hv = [] } return svg._hv }
  function nearest(pts, x){ var lo = 0, hi = pts.length - 1; while (hi - lo > 1) { var m = (lo + hi) >> 1; if (pts[m][0] < x) lo = m; else hi = m }
    return Math.abs(pts[lo][0] - x) <= Math.abs(pts[hi][0] - x) ? lo : hi }
  function g(svg){ var el = svg.querySelector("g.hv-g"); if (el) return el; var NS = "http://www.w3.org/2000/svg"; el = document.createElementNS(NS, "g"); el.setAttribute("class", "hv-g");
    var vb = svg.viewBox.baseVal, ln = document.createElementNS(NS, "line"), dot = document.createElementNS(NS, "circle");
    ln.setAttribute("y1", vb.y); ln.setAttribute("y2", vb.y + vb.height); ln.setAttribute("stroke", "currentColor"); ln.setAttribute("stroke-opacity", ".35"); ln.setAttribute("stroke-dasharray", "3 3");
    dot.setAttribute("r", "4"); dot.setAttribute("fill", "var(--cobalt,#2448D8)"); dot.setAttribute("stroke", "#fff"); dot.setAttribute("stroke-width", "1.5");
    el.appendChild(ln); el.appendChild(dot); svg.appendChild(el); return el }
  function show(svg, i){ var pts = data(svg); if (!pts.length) return; i = Math.max(0, Math.min(pts.length - 1, i)); var p = pts[i];
    var el = g(svg); el.style.display = ""; el.firstChild.setAttribute("x1", p[0]); el.firstChild.setAttribute("x2", p[0]); el.lastChild.setAttribute("cx", p[0]); el.lastChild.setAttribute("cy", p[1]);
    if (!tip) { tip = document.createElement("div"); tip.className = "hv-tip"; tip.setAttribute("role", "status"); tip.setAttribute("aria-live", "polite"); document.body.appendChild(tip) }
    tip.textContent = p[2]; tip.style.display = "";
    var m = svg.getScreenCTM(); if (m) { var sp = svg.createSVGPoint(); sp.x = p[0]; sp.y = p[1]; var q = sp.matrixTransform(m);
      var w = tip.offsetWidth || 120, x = Math.max(w / 2 + 6, Math.min(innerWidth - w / 2 - 6, q.x)); tip.style.left = x + "px"; tip.style.top = Math.max(tip.offsetHeight + 14, q.y) + "px" }
    cur = { svg: svg, pts: pts, i: i } }
  function hide(){ if (tip) tip.style.display = "none"; if (cur) { var el = cur.svg.querySelector("g.hv-g"); if (el) el.style.display = "none" } cur = null }
  function move(e){ var svg = e.target.closest && e.target.closest("svg[data-hv]"); if (!svg) { if (cur && e.type !== "pointerdown") hide(); return }
    if (!svg.hasAttribute("tabindex")) svg.setAttribute("tabindex", "0");
    var m = svg.getScreenCTM(); if (!m) return; var sp = svg.createSVGPoint(); sp.x = e.clientX; sp.y = e.clientY; var loc = sp.matrixTransform(m.inverse());
    show(svg, nearest(data(svg), loc.x)) }
  document.addEventListener("pointermove", move, { passive: true });
  document.addEventListener("pointerdown", move, { passive: true });
  document.addEventListener("pointerleave", function(e){ if (e.target && e.target.matches && e.target.matches("svg[data-hv]")) hide() }, true);
  document.addEventListener("scroll", hide, { passive: true, capture: true });
  document.addEventListener("focusin", function(e){ var svg = e.target; if (svg && svg.matches && svg.matches("svg[data-hv]")) show(svg, data(svg).length - 1) });
  document.addEventListener("focusout", function(e){ if (e.target && e.target.matches && e.target.matches("svg[data-hv]")) hide() });
  document.addEventListener("keydown", function(e){ if (!cur || document.activeElement !== cur.svg) return; var n = cur.pts.length, k = e.key, step = e.shiftKey ? 10 : 1, i = cur.i;
    if (k === "ArrowRight") i += step; else if (k === "ArrowLeft") i -= step; else if (k === "Home") i = 0; else if (k === "End") i = n - 1; else return;
    e.preventDefault(); show(cur.svg, i) });
  /* helper for chart builders: build the attribute value (escaped for HTML) */
  window.maHvAttr = function(rows){ return " data-hv='" + JSON.stringify(rows).replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/</g, "&lt;") + "' tabindex=\"0\"" };
})();
