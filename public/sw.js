// Service worker: keeps the app shell and static assets available on weak or no network.
// API calls (/graphql, /files, /api) always go to the network; offline writes are queued
// by the app itself in IndexedDB, not here.
const CACHE = "school-portal-v1";
const SHELL = ["/dashboard", "/login", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (/^\/(graphql|files|api|payments|webhooks)/.test(url.pathname)) return;

  if (url.pathname.startsWith("/_next/static/")) {
    // Hashed file names never change: cache first.
    event.respondWith(
      caches.match(event.request).then(
        (hit) => hit || fetch(event.request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, copy));
          return res;
        }),
      ),
    );
    return;
  }

  if (event.request.mode === "navigate") {
    // Pages: network first, fall back to the last copy so a teacher can reopen the app offline.
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request).then((hit) => hit || caches.match("/dashboard"))),
    );
  }
});
