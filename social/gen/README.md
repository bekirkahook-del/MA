# TikTok carousel generator

`node render.js spec.json` → 1080x1920 JPG slides in `social/<date>/<key>-NN.jpg`.
The last slide of every deck is added automatically: a QR code to `guide` tagged `utm_source=tiktok&utm_campaign=<key>`.
Exit code 2 = a slide overflows into TikTok's button area. Shorten that slide and re-run.

## Slide HTML building blocks (inside each slide string)
- `<div class="kicker">Small gold label</div>`
- `<h1>Big hook with <em>blue words</em></h1>` (slide 1 only) · `<h2>Headline</h2>` · `<p class="lede">Body text</p>` · `<p class="note">small grey</p>`
- Numbered list: `<div class="list"><div class="li"><b>1</b>Text</div>...</div>` (use `<b>✓</b>` for checks)
- Quiz options: `<div class="opts"><div class="opt"><i>A</i>Option</div>...</div>`; correct answer: `<div class="opt ok">`
- Big number: `<div class="big">$650M</div>`
- Step card: `<div class="card wide" style="display:flex;flex-direction:column;gap:26px;--nw:260px"><div class="step"><div class="n">$500M</div><div class="t">Label<small>sub-label</small></div></div>...</div>` (raise `--nw` for wider numbers)
- Quote card: `<div class="card"><p class="lede" style="color:#F2F4F9">"..."</p></div>`
- Table: `<table><thead><tr><th>COL</th>...</tr></thead><tbody><tr><td>row</td><td class="hot">green</td></tr></tbody></table>`

## Rules that keep posts engaging
- Slide 1 = a hook that makes people stop: a question, a challenge ("Can you do this in your head?"), or a bold claim. 6–12 words.
- Prefer quiz format: hook → question with 4 options ("Pick one, then swipe") → answer → why → follow-up/curveball → CTA.
- 5–7 content slides. One idea per slide. Short sentences, plain English, explain jargon in a few words.
- Every number must be correct. Run the math in node before rendering.
- Keep text short so nothing overflows (the renderer checks).

See `example-spec.json` for a full deck.
