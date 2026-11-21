/* Minimal service worker: makes M&A Prep installable as an app. It does not cache anything, so the site always
   loads fresh (no stale-version bugs). */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {}); // pass-through: the browser handles every request normally
