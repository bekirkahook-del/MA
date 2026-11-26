/* Beginner question pools: window.MA_EASYQ["trackId-levelIndex"] = [[question, [4 options], correctIndex, why], ...]
   Foundational wording, one idea per question, no multi-step math. Same shape as the core bank and js/hardq.js.
   A level with fewer than 10 here is topped up from the core bank; `node tools/qcoverage.mjs` shows the gaps. */
(function(){
"use strict";
window.MA_EASYQ=window.MA_EASYQ||{};
})();
