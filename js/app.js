/* Ekran TV — sayt dasturi. Kinolar ro'yxati: data/films.js */
(function () {
"use strict";

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const pad = n => String(n).padStart(2, "0");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtDur = m => (m >= 60 ? `${Math.floor(m / 60)} soat ` : "") + `${m % 60} daq`;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

const SITE = window.SITE || { name: "Ekran TV" };
const SCHED = Object.assign({ startHour: 6, breakMinutes: 12 }, window.SCHEDULE || {});

/* ---------- YouTube havolasidan ID ajratish ---------- */
function ytId(v) {
  if (!v) return "";
  v = String(v).trim();
  if (/^[\w-]{11}$/.test(v)) return v;
  const m = v.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : "";
}

/* ---------- Bulutdagi video havolasini aniqlash ----------
   file  — to'g'ridan-to'g'ri video fayl (.mp4, .webm, .mov)
   hls   — oqim (.m3u8)
   embed — tanilgan video xizmati pleyeri (Bunny Stream, Vimeo, Cloudflare Stream) */
function videoSrc(v) {
  if (!v) return null;
  v = String(v).trim();
  if (!/^https:\/\//i.test(v)) return null;
  let u; try { u = new URL(v); } catch (e) { return null; }
  const path = u.pathname.toLowerCase(), host = u.hostname.toLowerCase();
  if (/\.m3u8$/.test(path)) return { kind: "hls", url: v };
  if (/\.(mp4|m4v|webm|mov)$/.test(path)) return { kind: "file", url: v };
  let m;
  if ((m = v.match(/vimeo\.com\/(?:video\/)?(\d+)/))) return { kind: "embed", url: `https://player.vimeo.com/video/${m[1]}`, t: "vimeo" };
  if (host === "iframe.mediadelivery.net") return { kind: "embed", url: v.replace("/play/", "/embed/"), t: "bunny" };
  if (host === "iframe.videodelivery.net" || host.endsWith(".cloudflarestream.com")) return { kind: "embed", url: v, t: "cf" };
  return null;
}

const FILMS = (window.FILMS || []).map(f => {
  const yt = ytId(f.youtube) || ytId(f.video);
  return {
    id: f.id, t: f.title, g: f.genre, y: f.year, d: f.duration, age: f.age, s: f.rating,
    c: f.colors && f.colors.length === 3 ? f.colors : ["#2b2450", "#5b4a9e", "#d8ccff"],
    desc: f.description || "", yt, vs: yt ? null : videoSrc(f.video), poster: f.poster || ""
  };
});
const hasVideo = f => !!(f.yt || f.vs);
const byId = id => FILMS.find(f => f.id === id);

/* ---------- Brauzer xotirasi (ixtiyoriy) ---------- */
const store = {
  get(k, def) { try { const v = localStorage.getItem("ekran-" + k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
  set(k, v) { try { localStorage.setItem("ekran-" + k, JSON.stringify(v)); } catch (e) {} }
};
let favs = new Set(store.get("favs", []));
let progress = store.get("progress", {});   // { filmId: soniya }

function toast(msg, ms = 2600) {
  const t = $("#toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), ms);
}

/* ---------- Poster ---------- */
function posterHTML(f, cls = "") {
  const sx = 10 + (f.id * 17) % 40, sy = 6 + (f.id * 11) % 22;
  const img = f.poster ? `<img class="pimg" src="${esc(f.poster)}" alt="" loading="lazy">` : "";
  const soon = hasVideo(f) ? "" : `<span class="soon">Tez orada</span>`;
  return `<div class="poster ${cls} ${f.poster ? "has-img" : ""}" style="--c1:${f.c[0]};--c2:${f.c[1]};--c3:${f.c[2]};--sx:${sx}%;--sy:${sy}%">${img}<i class="hills"></i>${soon}<div class="pt"><b>${esc(f.t)}</b><span>${esc(f.g)} · ${f.y}</span></div></div>`;
}
function fillPoster(el, f) {
  const tmp = document.createElement("div"); tmp.innerHTML = posterHTML(f);
  const p = tmp.firstChild; el.style.cssText = p.style.cssText; el.className = p.className + " hero-poster"; el.innerHTML = p.innerHTML;
}
const metaHTML = f => `<span class="score">★ ${f.s}</span><span>${f.y}</span><span>${esc(f.g)}</span><span>${fmtDur(f.d)}</span><span class="age">${esc(f.age)}</span>`;

/* ---------- Umumiy ---------- */
$$("#siteName,.site-name").forEach(e => (e.textContent = SITE.name));
$("#year").textContent = new Date().getFullYear();
$("#contactMail").textContent = SITE.email || "";
$("#contactPhone").textContent = SITE.phone || "";

/* ---------- Hero ---------- */
const hero = byId(SITE.heroFilmId) || FILMS[0];
if (hero) {
  $("#heroTitle").textContent = hero.t;
  $("#heroDesc").textContent = hero.desc;
  $("#heroMeta").innerHTML = metaHTML(hero);
  $("#heroBg").style.setProperty("--h1", hero.c[1]);
  $("#heroBg").style.setProperty("--h2", hero.c[2]);
  fillPoster($("#heroPoster"), hero);
  $("#heroPlay").onclick = () => openPlayer(hero);
  $("#heroFav").onclick = () => toggleFav(hero.id);
}

/* ---------- Sevimlilar ---------- */
function toggleFav(id) {
  favs.has(id) ? favs.delete(id) : favs.add(id);
  store.set("favs", [...favs]);
  toast(favs.has(id) ? "Ro'yxatingizga qo'shildi" : "Ro'yxatingizdan olib tashlandi");
  renderGrid(); syncFavBtns();
}
const favLabel = id => (favs.has(id) ? "✓ Ro'yxatimda" : "＋ Ro'yxatimga");
function syncFavBtns() {
  if (hero) $("#heroFav").textContent = favLabel(hero.id);
  if (pFilm) $("#pFav").textContent = favLabel(pFilm.id);
}

/* ---------- Katalog ---------- */
const GENRES = ["Hammasi", "Mening ro'yxatim", ...new Set(FILMS.map(f => f.g))];
let genre = "Hammasi", query = "", sortBy = "new";
$("#chips").innerHTML = GENRES.map(g => `<button class="chip" type="button" aria-pressed="${g === genre}">${esc(g)}</button>`).join("");
$("#chips").addEventListener("click", e => {
  const b = e.target.closest(".chip"); if (!b) return;
  genre = b.textContent; $$("#chips .chip").forEach(c => c.setAttribute("aria-pressed", c === b)); renderGrid();
});
$("#sort").addEventListener("change", e => { sortBy = e.target.value; renderGrid(); });
let searchT;
$("#q").addEventListener("input", e => {
  query = e.target.value.trim().toLowerCase(); renderGrid();
  clearTimeout(searchT); if (query) searchT = setTimeout(() => $("#kinolar").scrollIntoView({ behavior: reduce ? "auto" : "smooth" }), 350);
});
function tileHTML(f) {
  return `<div class="tile"><button class="card" type="button" data-id="${f.id}">${posterHTML(f)}<span class="ci"><b>${esc(f.t)}</b><span>★ ${f.s}</span></span></button><button class="fav" type="button" data-fav="${f.id}" aria-pressed="${favs.has(f.id)}" aria-label="${favs.has(f.id) ? "Ro'yxatdan olib tashlash" : "Ro'yxatga qo'shish"}">${favs.has(f.id) ? "★" : "☆"}</button></div>`;
}
function renderGrid() {
  let list = FILMS.filter(f =>
    (genre === "Hammasi" || (genre === "Mening ro'yxatim" ? favs.has(f.id) : f.g === genre)) &&
    (!query || f.t.toLowerCase().includes(query) || f.g.toLowerCase().includes(query)));
  const sorters = { new: (a, b) => b.y - a.y || b.id - a.id, rating: (a, b) => b.s - a.s, az: (a, b) => a.t.localeCompare(b.t, "uz") };
  list.sort(sorters[sortBy]);
  $("#grid").innerHTML = list.map(tileHTML).join("");
  const empty = $("#empty"); empty.hidden = list.length > 0;
  empty.textContent = !list.length && genre === "Mening ro'yxatim" && !query
    ? "Ro'yxatingiz hozircha bo'sh. Kino posteridagi ☆ belgisini bosib qo'shing."
    : "Bunday kino topilmadi. Boshqa nom bilan qidirib ko'ring.";
}
document.addEventListener("click", e => {
  const fv = e.target.closest("[data-fav]"); if (fv) { toggleFav(+fv.dataset.fav); return; }
  const c = e.target.closest("[data-id]"); if (c) openPlayer(byId(+c.dataset.id));
});
renderGrid();

/* ---------- Ko'rishni davom ettirish ---------- */
function renderContinue() {
  const list = Object.entries(progress).map(([id, sec]) => ({ f: byId(+id), sec }))
    .filter(x => x.f && x.sec > 60 && x.sec < x.f.d * 60 * 0.95);
  $("#davom").hidden = !list.length;
  $("#contRow").innerHTML = list.map(({ f, sec }) =>
    `<button class="card" type="button" data-id="${f.id}">${posterHTML(f)}<span class="progress-mini"><i style="width:${Math.min(100, sec / (f.d * 60) * 100).toFixed(1)}%"></i></span><span class="ci"><b>${esc(f.t)}</b></span></button>`).join("");
}
renderContinue();

/* ---------- Efir jadvali (Toshkent vaqti) ---------- */
function tashParts() {
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tashkent", year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(new Date());
  const g = t => +p.find(x => x.type === t).value;
  return { y: g("year"), mo: g("month"), d: g("day"), h: g("hour") % 24, mi: g("minute"), s: g("second") };
}
const tashSec = () => { const t = tashParts(); return t.h * 3600 + t.mi * 60 + t.s; };
const START = SCHED.startHour * 60;
function nowMin() { let n = tashSec() / 60; if (n < START) n += 1440; return n; }
// Har kuni sana bo'yicha boshqacha tartib, lekin hamma tomoshabin uchun bir xil
function daySeed() { const t = tashParts(); const shift = t.h < SCHED.startHour ? -1 : 0; return Math.floor(Date.UTC(t.y, t.mo - 1, t.d + shift) / 864e5); }
function buildDay(ch) {
  const pool = FILMS.filter(f => !ch.genres || ch.genres.includes(f.g));
  if (!pool.length) return [];
  let t = START, out = [], i = (daySeed() + ch.number * 3) % pool.length;
  while (t < START + 1440) { const f = pool[i % pool.length], len = f.d + SCHED.breakMinutes; out.push({ f, start: t, end: t + len }); t += len; i++; }
  return out;
}
const CHANNELS = (window.CHANNELS || []).filter(c => FILMS.some(f => !c.genres || c.genres.includes(f.g)));
const EXT = (window.LIVE_CHANNELS || []).map(c => Object.assign({}, c, { yt: ytId(c.youtube), stream: String(c.stream || "").trim() }))
  .filter(c => c.yt || /^https:\/\//.test(c.stream));
function extCardHTML(c) {
  const logo = c.logo ? `<img src="${esc(c.logo)}" alt="" style="width:100%;height:100%;object-fit:contain;border-radius:12px">` : esc(c.short || c.name[0]);
  return `<button class="chan" type="button" data-ext="${esc(c.id)}" style="--ch:${esc(c.color || "#9b5de5")}"><span class="chan-logo">${logo}${c.number ? `<small>${c.number}</small>` : ""}</span><span class="chan-body"><span class="chan-top"><b>${esc(c.name)}</b><span class="mini-live">JONLI</span></span><span class="chan-now">${esc(c.description || "Hamkor kanal efiri")}</span></span></button>`;
}
let DAYS = {}, dayKey = -1;
function ensureDays() { const k = daySeed(); if (k !== dayKey) { dayKey = k; DAYS = {}; CHANNELS.forEach(c => (DAYS[c.id] = buildDay(c))); } }
ensureDays();
let chan = CHANNELS[0];
const hm = m => `${pad(Math.floor(m / 60) % 24)}:${pad(Math.floor(m % 60))}`;
function slotIdx(day) { const n = nowMin(); const i = day.findIndex(s => n >= s.start && n < s.end); return i < 0 ? day.length - 1 : i; }
function liveSlot(ch = chan) { const day = DAYS[ch.id]; return day[slotIdx(day)]; }

const months = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const weekdays = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

function selectChannel(id, scroll) {
  chan = CHANNELS.find(c => c.id === id) || chan; renderLive();
  if (scroll) $("#efir").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
}
let liveFilm;
function renderLive() {
  if (!chan) return;
  ensureDays();
  const day = DAYS[chan.id], i = slotIdx(day), s = day[i], n = nowMin();
  liveFilm = s.f;
  $("#liveChan").textContent = `${chan.name} · ${chan.number}-kanal`;
  $("#liveTitle").textContent = (n - s.start) >= s.f.d ? `Tanaffus · keyin: ${day[(i + 1) % day.length].f.t}` : s.f.t;
  $("#liveStart").textContent = hm(s.start); $("#liveEnd").textContent = hm(s.end);
  $("#liveBar").style.width = Math.min(100, (n - s.start) / (s.end - s.start) * 100).toFixed(1) + "%";
  const th = $("#liveThumb");
  if (s.f.yt && !window.PREVIEW_MODE) { const src = `https://i.ytimg.com/vi/${s.f.yt}/hqdefault.jpg`; if (th.getAttribute("src") !== src) th.src = src; th.hidden = false; } else th.hidden = true;
  $("#nextList").innerHTML = day.slice(i + 1, i + 5).map(x =>
    `<button class="next" type="button" data-id="${x.f.id}">${posterHTML(x.f)}<span style="min-width:0"><h4>${esc(x.f.t)}</h4><small>${esc(x.f.g)} · ${esc(x.f.age)}</small></span><span class="time">${hm(x.start)}</span></button>`).join("");
  // Kanallar
  $("#chanGrid").innerHTML = CHANNELS.map(c => {
    const cs = liveSlot(c), p = Math.min(100, (n - cs.start) / (cs.end - cs.start) * 100).toFixed(1);
    return `<button class="chan" type="button" data-ch="${c.id}" aria-pressed="${c.id === chan.id}" style="--ch:${c.color}"><span class="chan-logo">${esc(c.short)}<small>${c.number}</small></span><span class="chan-body"><span class="chan-top"><b>${esc(c.name)}</b><span class="mini-live">EFIRDA</span></span><span class="chan-now">${esc(cs.f.t)} · ${hm(cs.start)}–${hm(cs.end)}</span><span class="bar"><i style="width:${p}%"></i></span></span></button>`;
  }).join("") + (EXT.length ? EXT.map(extCardHTML).join("") : `<div class="chan chan-add"><span class="chan-logo">＋</span><span class="chan-body"><b style="font-size:15px">Hamkor kanallar</b><span class="chan-now" style="white-space:normal">Litsenziyali telekanallar shu yerga qo'shiladi</span></span></div>`);
  // Teledastur
  $("#epgTabs").innerHTML = CHANNELS.map(c => `<button class="chip" type="button" data-epg="${c.id}" aria-pressed="${c.id === chan.id}">${esc(c.name)}</button>`).join("");
  $("#epg").innerHTML = day.map((x, k) =>
    `<button class="slot ${k < i ? "past" : k === i ? "now" : ""}" type="button" ${k === i ? 'data-live="1"' : `data-id="${x.f.id}"`}><span class="time">${hm(x.start)}</span><span><h4>${esc(x.f.t)}${k === i ? '<span class="tag-now">● EFIRDA</span>' : ""}</h4><small>${esc(x.f.g)} · ${fmtDur(x.f.d)}</small></span></button>`).join("");
  const t = tashParts(), wd = new Date(Date.UTC(t.y, t.mo - 1, t.d)).getUTCDay();
  $("#epgDate").textContent = `${weekdays[wd]}, ${t.d}-${months[t.mo - 1]}`;
}
$("#chanGrid").addEventListener("click", e => {
  const x = e.target.closest("[data-ext]"); if (x) { openExternal(EXT.find(c => c.id === x.dataset.ext)); return; }
  const b = e.target.closest("[data-ch]"); if (b) selectChannel(b.dataset.ch, true);
});
$("#epgTabs").addEventListener("click", e => { const b = e.target.closest("[data-epg]"); if (b) selectChannel(b.dataset.epg, false); });
$("#epg").addEventListener("click", e => { if (e.target.closest("[data-live]")) openPlayer(liveFilm, true); });
function tickClock() { const s = tashSec(); $("#clock").textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s % 3600 / 60))}:${pad(s % 60)}`; }
renderLive(); tickClock();
setInterval(tickClock, 1000); setInterval(renderLive, 30000);
$("#liveScreen").onclick = () => openPlayer(liveFilm, true);
$("#liveScreen").onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPlayer(liveFilm, true); } };

/* ---------- Animatsiyali fon (video yo'q paytda) ---------- */
function filmPainter(canvas, getFilm) {
  const ctx = canvas.getContext("2d"); let t = 0;
  return function frame() {
    const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    if (!r.width) return;
    if (canvas.width !== Math.round(r.width * dpr)) { canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr); }
    const w = canvas.width, h = canvas.height, f = getFilm(); if (!f) return;
    const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, f.c[0]); g.addColorStop(1, f.c[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const cx = w * (.5 + .25 * Math.sin(t / 240)), cy = h * (.38 + .06 * Math.cos(t / 180));
    const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, h * .6); rg.addColorStop(0, f.c[2]); rg.addColorStop(1, "transparent"); ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
    for (let L = 0; L < 3; L++) {
      ctx.beginPath(); ctx.moveTo(0, h);
      const base = h * (.62 + L * .12), amp = h * (.09 - L * .02), off = t * (.4 + L * .5);
      for (let x = 0; x <= w; x += w / 40) ctx.lineTo(x, base - amp * Math.sin((x + off * dpr) / (w / (3 + L))) - amp * .5 * Math.sin((x * 2.3 + off) / (w / 5)));
      ctx.lineTo(w, h); ctx.closePath(); ctx.fillStyle = `rgba(8,6,18,${.35 + L * .2})`; ctx.fill();
    }
    t++;
  };
}
const liveFrame = filmPainter($("#liveCanvas"), () => liveFilm);
const pFrame = filmPainter($("#pCanvas"), () => pFilm);
function loop() { if ($("#liveThumb").hidden) liveFrame(); if (!$("#modal").hidden && !ytPlayer && !videoEl) pFrame(); if (!reduce) requestAnimationFrame(loop); }
requestAnimationFrame(loop);

/* ---------- YouTube pleyer ---------- */
let ytReady;
function loadYT() {
  if (ytReady) return ytReady;
  ytReady = new Promise((res, rej) => {
    if (window.YT && window.YT.Player) return res(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev && prev(); res(window.YT); };
    const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; s.async = true;
    s.onerror = () => { ytReady = null; rej(new Error("yt")); };
    document.head.appendChild(s);
  });
  return ytReady;
}
let ytPlayer = null, pFilm = null, isLive = false, saveT = null, lastFocus = null, videoEl = null, hls = null;

/* ---------- Hamkor kanal (m3u8) uchun HLS pleyer ---------- */
let hlsReady;
function loadHls() {
  if (hlsReady) return hlsReady;
  hlsReady = new Promise((res, rej) => {
    if (window.Hls) return res(window.Hls);
    const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js";
    s.onload = () => res(window.Hls); s.onerror = () => { hlsReady = null; rej(new Error("hls")); };
    document.head.appendChild(s);
  });
  return hlsReady;
}
function setPlayerChrome(ext) {
  $("#pFav").hidden = ext; $("#pShare").hidden = ext; $("#similarWrap").hidden = ext;
}
function openExternal(c) {
  if (!c) return;
  if ($("#modal").hidden) lastFocus = document.activeElement;
  destroyYT();
  pFilm = { id: "ext-" + c.id, t: c.name, c: [c.color || "#2b2450", "#1a1630", "#d8ccff"], d: 0 }; isLive = true;
  setPlayerChrome(true);
  $("#pOver").hidden = true;
  $("#pTitle").textContent = c.name; $("#pDesc").textContent = c.description || "";
  $("#pGenre").textContent = "● Jonli efir · Hamkor kanal"; $("#pMeta").innerHTML = "";
  $("#modal").hidden = false; document.body.style.overflow = "hidden"; $("#pClose").focus();
  if (window.PREVIEW_MODE) { showOver("Namuna ko'rinish", "Jonli efir internetga joylangan haqiqiy saytda ochiladi."); return; }
  const fail = () => showOver("Efirga ulanib bo'lmadi", "Kanal efiri hozir mavjud emas yoki havola noto'g'ri. Birozdan keyin qayta urinib ko'ring.");
  if (c.yt) {
    loadYT().then(YT => {
      if ($("#modal").hidden) return;
      ytPlayer = new YT.Player("ytHost", { host: "https://www.youtube-nocookie.com", videoId: c.yt,
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1, controls: 1 },
        events: { onReady: e => { try { e.target.playVideo(); } catch (er) {} }, onError: fail } });
    }).catch(fail);
    return;
  }
  playStream(c.stream, true, 0, fail, null, true);
}

/* Video fayl yoki m3u8 oqimni o'z pleyerimizda ochish */
function playStream(url, isHls, start, onFail, onEnded, liveStream) {
  const v = document.createElement("video");
  Object.assign(v, { controls: true, autoplay: true, playsInline: true, preload: "auto" });
  v.className = "yt"; v.id = "ytHost"; v.setAttribute("playsinline", ""); v.style.background = "#000";
  $("#ytHost").replaceWith(v); videoEl = v;
  v.addEventListener("error", () => { if (videoEl === v) onFail(); });
  if (onEnded) v.addEventListener("ended", onEnded);
  if (start > 0) v.addEventListener("loadedmetadata", () => { try { if (!isFinite(v.duration) || start < v.duration) v.currentTime = start; } catch (e) {} }, { once: true });
  if (!isHls || v.canPlayType("application/vnd.apple.mpegurl")) { v.src = url; v.play().catch(() => {}); return; }
  loadHls().then(Hls => {
    if (videoEl !== v) return;
    if (!Hls.isSupported()) return onFail();
    hls = new Hls(liveStream ? { liveDurationInfinity: true } : { startPosition: start > 0 ? start : -1 });
    hls.on(Hls.Events.ERROR, (_, d) => { if (d.fatal) onFail(); });
    hls.loadSource(url); hls.attachMedia(v);
    hls.on(Hls.Events.MANIFEST_PARSED, () => v.play().catch(() => {}));
  }).catch(onFail);
}
/* Bunny Stream / Vimeo / Cloudflare Stream pleyeri */
function playEmbed(vs, start) {
  let url = vs.url;
  const sep = url.includes("?") ? "&" : "?";
  if (vs.t === "vimeo") url += `${sep}autoplay=1` + (start > 0 ? `#t=${Math.floor(start)}s` : "");
  else if (vs.t === "cf") url += `${sep}autoplay=true` + (start > 0 ? `&startTime=${Math.floor(start)}s` : "");
  else url += `${sep}autoplay=true&preload=true`;
  const f = document.createElement("iframe");
  Object.assign(f, { src: url, allowFullscreen: true, className: "yt", id: "ytHost" });
  f.setAttribute("allow", "autoplay; fullscreen; picture-in-picture; encrypted-media");
  f.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  $("#ytHost").replaceWith(f);
}

function showOver(title, text) { $("#pOverTitle").textContent = title; $("#pOverText").textContent = text; $("#pOver").hidden = false; }
function destroyYT() {
  clearInterval(saveT);
  if (ytPlayer) { saveProgress(); try { ytPlayer.destroy(); } catch (e) {} ytPlayer = null; }
  if (hls) { try { hls.destroy(); } catch (e) {} hls = null; }
  if (videoEl) { try { videoEl.pause(); videoEl.removeAttribute("src"); videoEl.load(); } catch (e) {} videoEl = null; }
  $("#ytHost").replaceWith(Object.assign(document.createElement("div"), { className: "yt", id: "ytHost" }));
}
function saveProgress() {
  if (isLive || !pFilm || typeof pFilm.id !== "number") return;
  let sec = 0;
  if (ytPlayer && typeof ytPlayer.getCurrentTime === "function") sec = Math.floor(ytPlayer.getCurrentTime() || 0);
  else if (videoEl) sec = Math.floor(videoEl.currentTime || 0);
  else return;
  if (sec > 0) { progress[pFilm.id] = sec; store.set("progress", progress); }
}

function openPlayer(f, live = false) {
  if (!f) return;
  if ($("#modal").hidden) lastFocus = document.activeElement;
  destroyYT();
  pFilm = f; isLive = live;
  setPlayerChrome(false);
  $("#pOver").hidden = true;
  $("#pTitle").textContent = f.t; $("#pDesc").textContent = f.desc;
  $("#pGenre").textContent = live ? `● Jonli efir · ${chan.name}` : f.g;
  $("#pMeta").innerHTML = metaHTML(f);
  syncFavBtns();
  const sim = FILMS.filter(x => x.id !== f.id && x.g === f.g).concat(FILMS.filter(x => x.id !== f.id && x.g !== f.g)).slice(0, 8);
  $("#similar").innerHTML = sim.map(x => `<button class="card" type="button" data-id="${x.id}">${posterHTML(x)}</button>`).join("");
  $("#modal").hidden = false; document.body.style.overflow = "hidden";
  if (!live && location.hash !== "#kino-" + f.id) history.replaceState(null, "", "#kino-" + f.id);

  let start = 0;
  if (live) {
    const day = DAYS[chan.id], s = liveSlot(), off = (nowMin() - s.start) * 60;
    if (off >= f.d * 60) {
      const nx = day[(day.indexOf(s) + 1) % day.length];
      showOver("Tanaffus", `Keyingi kino: «${nx.f.t}», soat ${hm(nx.start)} da`);
      $("#pClose").focus(); if (reduce) pFrame(); return;
    }
    start = Math.floor(off);
  } else if (progress[f.id] && progress[f.id] < f.d * 60 * 0.95) start = progress[f.id];

  if (hasVideo(f) && window.PREVIEW_MODE) {
    showOver("Namuna ko'rinish", "Bu kinoga video ulangan. Video internetga joylangan haqiqiy saytda ochiladi.");
    $("#pClose").focus(); if (reduce) pFrame(); return;
  }
  if (!hasVideo(f)) {
    showOver("Video tez orada", "Bu kino hali saytga yuklanmagan. Tez orada shu yerda ko'rishingiz mumkin bo'ladi.");
    $("#pClose").focus(); if (reduce) pFrame(); return;
  }
  if (f.vs) {
    const onEnd = () => {
      if (isLive) showOver("Tanaffus", "Keyingi kino tez orada boshlanadi.");
      else { delete progress[f.id]; store.set("progress", progress); renderContinue(); }
    };
    const onFail = () => showOver("Videoni ochib bo'lmadi", "Video havolasini tekshiring: fayl ommaviy (public) bo'lishi va havola https:// bilan boshlanishi kerak.");
    if (f.vs.kind === "embed") playEmbed(f.vs, start);
    else { playStream(f.vs.url, f.vs.kind === "hls", start, onFail, onEnd, false); saveT = setInterval(saveProgress, 10000); }
    $("#pClose").focus(); return;
  }
  loadYT().then(YT => {
    if (pFilm !== f || $("#modal").hidden) return;
    ytPlayer = new YT.Player("ytHost", {
      host: "https://www.youtube-nocookie.com",
      videoId: f.yt,
      playerVars: { autoplay: 1, start, rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, controls: 1, hl: "uz" },
      events: {
        onReady: e => { try { e.target.playVideo(); } catch (er) {} },
        onStateChange: e => {
          if (e.data === YT.PlayerState.ENDED) {
            if (isLive) showOver("Tanaffus", "Keyingi kino tez orada boshlanadi.");
            else { delete progress[f.id]; store.set("progress", progress); renderContinue(); }
          }
        },
        onError: () => showOver("Videoni ochib bo'lmadi", "Video havolasini tekshiring: u YouTube'da «Ro'yxatda yo'q» (Unlisted) bo'lishi va joylashtirishga ruxsat berilgan bo'lishi kerak.")
      }
    });
    saveT = setInterval(saveProgress, 10000);
  }).catch(() => showOver("Internet bilan muammo", "Pleyerni yuklab bo'lmadi. Internetni tekshirib, qaytadan urinib ko'ring."));
  $("#pClose").focus();
}
function closePlayer() {
  destroyYT(); $("#modal").hidden = true; document.body.style.overflow = ""; renderContinue();
  if (location.hash.startsWith("#kino-")) history.replaceState(null, "", location.pathname + location.search);
  lastFocus && lastFocus.focus && lastFocus.focus();
}
$("#pClose").onclick = closePlayer;
$("#modal").addEventListener("click", e => { if (e.target.id === "modal") closePlayer(); });
document.addEventListener("keydown", e => { if (!$("#modal").hidden && e.key === "Escape") closePlayer(); });
$("#pFav").onclick = () => pFilm && toggleFav(pFilm.id);
$("#pShare").onclick = () => {
  const url = location.origin + location.pathname + "#kino-" + pFilm.id;
  (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast("Havola nusxalandi")).catch(() => toast(url, 5000));
};
addEventListener("pagehide", saveProgress);

/* ---------- Havola orqali kino ochish: sayt.uz/#kino-3 ---------- */
function routeHash() { const m = location.hash.match(/^#kino-(\d+)$/); if (m) openPlayer(byId(+m[1])); }
addEventListener("hashchange", routeHash);
routeHash();

/* ---------- Menyu belgisi ---------- */
const navIds = ["bosh", "efir", "kanallar", "kinolar", "dastur"];
addEventListener("scroll", () => {
  let cur = "bosh";
  navIds.forEach(id => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < 140) cur = id; });
  if (scrollY < 200) cur = "bosh";
  $$("nav.main a, .tabbar a").forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + cur || (cur === "kanallar" && a.closest(".tabbar") && a.getAttribute("href") === "#efir")));
}, { passive: true });

/* ---------- Ilova sifatida o'rnatish (PWA) ---------- */
let deferredPrompt = null;
const isStandalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
if (isStandalone) $("#installBtn").hidden = true;
addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredPrompt = e; });
$("#installBtn").onclick = async () => {
  if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice.catch(() => {}); deferredPrompt = null; return; }
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) toast("Safari'da pastdagi «Ulashish» tugmasini bosing, so'ng «Bosh ekranga qo'shish»ni tanlang.", 6000);
  else toast("Brauzer menyusidan «Ilovani o'rnatish» yoki «Bosh ekranga qo'shish»ni tanlang.", 6000);
};
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
