// Prints the deal database from js/dealsdb.js as JSON (used by deals.py to build the static /deals/ page).
const fs=require('fs');const s=fs.readFileSync(require('path').join(__dirname,'../../js/dealsdb.js'),'utf8');
const a=s.indexOf('const S1='),b=s.indexOf('\n];',a)+3;
console.log(JSON.stringify(new Function(s.slice(a,b)+';return D')()));
