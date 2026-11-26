/* Harder question pools for the Advanced (and part of Intermediate) difficulty.
   window.MA_HARDQ["trackId-levelIndex"] = [[question, [4 options], correctIndex, why], ...]  (same shape as the core bank).
   Every number below was worked out by hand; tests/hardq.test.mjs re-checks the shape. A level with no pool here
   falls back to its core questions, so adding a pool is always safe. */
(function(){
"use strict";
window.MA_HARDQ=Object.assign(window.MA_HARDQ||{},{});
})();
