// Shareable story card (1080x1920 PNG). Usage:
// shareCard({kicker:"SUPERDAY READINESS TEST", big:"11/12", title:"Superday ready", sub:"Can you beat my score?", path:"/tools/superday-readiness-test/", file:"my-superday-score.png", text:"..."})
// Shares the image (phones: straight to Instagram/TikTok/Messages) or downloads it, falling back to sharing text.
(function () {
  const W = 1080, H = 1920;
  function wrap(c, t, maxW) { const out = []; let cur = ""; for (const w of String(t).split(" ")) { const n = cur ? cur + " " + w : w; if (c.measureText(n).width > maxW && cur) { out.push(cur); cur = w } else cur = n } out.push(cur); return out }
  function draw(o) {
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H; const c = cv.getContext("2d");
    const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#0F172A"); g.addColorStop(1, "#1E2B5C"); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const r = c.createRadialGradient(W / 2, 760, 40, W / 2, 760, 820); r.addColorStop(0, "rgba(36,72,216,.55)"); r.addColorStop(1, "rgba(36,72,216,0)"); c.fillStyle = r; c.fillRect(0, 0, W, H);
    c.fillStyle = "rgba(255,255,255,.06)"; for (let y = 40; y < H; y += 48) for (let x = 40; x < W; x += 48) c.fillRect(x, y, 3, 3);
    c.textAlign = "center"; c.fillStyle = "#fff";
    c.font = "900 64px Nunito, 'Archivo', system-ui, sans-serif"; c.fillText("M&A Prep", W / 2, 230);
    c.fillStyle = "#8EA8FF"; c.font = "600 38px 'IBM Plex Mono', ui-monospace, monospace"; c.fillText((o.kicker || "").toUpperCase(), W / 2, 520);
    c.fillStyle = "#fff"; c.font = "800 300px 'Archivo', system-ui, sans-serif"; c.fillText(o.big, W / 2, 860);
    c.font = "800 84px 'Archivo', system-ui, sans-serif"; wrap(c, o.title, 900).forEach((l, i) => c.fillText(l, W / 2, 1030 + i * 96));
    c.fillStyle = "#CBD5E1"; c.font = "400 50px 'IBM Plex Sans', system-ui, sans-serif"; wrap(c, o.sub || "", 880).forEach((l, i) => c.fillText(l, W / 2, 1230 + i * 66));
    const url = "mnaprep.com" + (o.short || ""); c.font = "600 54px 'IBM Plex Sans', system-ui, sans-serif"; const pw = c.measureText(url).width + 110;
    c.fillStyle = "#2448D8"; const x0 = (W - pw) / 2, y0 = 1480, h = 110; c.beginPath(); c.roundRect ? c.roundRect(x0, y0, pw, h, 55) : c.rect(x0, y0, pw, h); c.fill();
    c.fillStyle = "#fff"; c.fillText(url, W / 2, y0 + 72);
    c.fillStyle = "#94A3B8"; c.font = "400 40px 'IBM Plex Sans', system-ui, sans-serif"; c.fillText("Free IB, PE & hedge fund interview prep", W / 2, 1680);
    return cv;
  }
  window.shareCard = async function (o) {
    try { await document.fonts.ready } catch (e) {}
    const cv = draw(o), blob = await new Promise(r => cv.toBlob(r, "image/png"));
    const file = new File([blob], o.file || "mnaprep-score.png", { type: "image/png" });
    const link = "https://mnaprep.com" + (o.path || "/");
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: o.text || link }); return "shared" }
    } catch (e) { if (e && e.name === "AbortError") return "cancelled" }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    try { await navigator.clipboard.writeText(o.text || link) } catch (e) {}
    return "downloaded";
  };
  window.shareCardPreview = o => draw(o).toDataURL("image/png");
})();
