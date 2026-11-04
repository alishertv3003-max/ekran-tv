/* Ekran TV — oflayn ishlash uchun oddiy kesh.
   Sayt fayllarini o'zgartirganingizda VERSION raqamini oshiring (v2, v3 ...). */
const VERSION = "ekran-v3";
const SHELL = ["./", "index.html", "css/style.css", "js/app.js", "data/films.js", "manifest.webmanifest", "icons/icon-192.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Avval internetdan olishga harakat qiladi, internet bo'lmasa keshdan beradi
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});
