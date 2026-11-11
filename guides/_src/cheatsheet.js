// Renders guides/_src/cheatsheet.print.html to cheat-sheet/50-investment-banking-interview-questions.pdf
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.join(__dirname, 'cheatsheet.print.html'), { waitUntil: 'networkidle' });
  await p.pdf({ path: path.join(__dirname, '..', '..', 'cheat-sheet', '50-investment-banking-interview-questions.pdf'), format: 'Letter', printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: '<div style="width:100%;text-align:center;font:8px monospace;color:#8590A6">mnaprep.com · Free IB, PE &amp; hedge fund interview prep · <span class="pageNumber"></span></div>' });
  await b.close(); console.log('pdf ok'); })();
