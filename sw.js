const CACHE = "mock-interview-v7";
const OFFLINE_PAGE = new URL("./index.html", self.registration.scope).href;
const ASSETS = [
  new URL("./", self.registration.scope).href,
  OFFLINE_PAGE,
  new URL("./manifest.webmanifest", self.registration.scope).href,
  new URL("./vendor/pdfjs/pdf.min.mjs", self.registration.scope).href,
  new URL("./vendor/pdfjs/pdf.worker.min.mjs", self.registration.scope).href,
  new URL("./vendor/mammoth/mammoth.browser.min.js", self.registration.scope).href
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request).then(hit => hit || caches.match(OFFLINE_PAGE))));
});
