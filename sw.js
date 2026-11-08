/* Ekran TV service worker — v12; tarmoq birinchi. */
const VERSION='ekran-v17-film-theater';
const SHELL=['./','index.html','css/style.css','css/tv-player.css','js/app.js','js/tv-player.js','js/iptv-local.js','js/film-player.js','css/film-player.css','data/films.js','data/channels.js','data/uz_channels.js','manifest.webmanifest','icons/icon-192.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ekran-')&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(VERSION).then(c=>c.put(e.request,copy));}return r;}).catch(()=>caches.match(e.request)));
});