/* Ekran TV — Fembed kino + M3U Telekanallar katalogi. */
(() => {
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SITE=window.SITE||{name:'Ekran TV'};
const FILMS=(window.FILMS||[]).map(f=>({...f,id:Number(f.id),title:String(f.title||''),video:String(f.video||'').trim()}));
const TV=window.TV_CHANNELS||[];
const UZ=window.UZ_CHANNELS||[];
function fembed(v){
  try {
    const u=new URL(v); const h=u.hostname.toLowerCase();
    if(u.protocol!=='https:' || !['fembed.co','www.fembed.co'].includes(h)) return '';
    const m=u.pathname.match(/^\/(?:embed|v)\/([A-Za-z0-9_-]+)\/?$/);
    return m?`https://fembed.co/embed/${m[1]}`:'';
  }catch{return '';}
}
const findFilm=id=>FILMS.find(x=>x.id===Number(id));
const palette=(f)=>Array.isArray(f.colors)&&f.colors.length===3?f.colors:['#252047','#7456a8','#e7d8ff'];
function poster(f){
 const c=palette(f), img=/^(?:posters\/|https:\/\/)/.test(f.poster||'')?`<img class="pimg" src="${esc(f.poster)}" alt="" loading="lazy">`:'';
 return `<div class="poster ${img?'has-img':''}" style="--c1:${esc(c[0])};--c2:${esc(c[1])};--c3:${esc(c[2])}">${img}<i class="hills"></i>${fembed(f.video)?'':'<span class="soon">Tez orada</span>'}<div class="pt"><b>${esc(f.title)}</b><span>${esc(f.genre)}${Number(f.year)>0?' · '+esc(f.year):''}</span></div></div>`;
}
const dur=m=>{m=Number(m)||0;return m?`${Math.floor(m/60)?Math.floor(m/60)+' soat ':''}${m%60} daq`:''};
const meta=f=>`${Number(f.rating)>0?`<span class="score">★ ${esc(f.rating)}</span>`:''}${Number(f.year)>0?`<span>${esc(f.year)}</span>`:''}<span>${esc(f.genre)}</span>${dur(f.duration)?`<span>${dur(f.duration)}</span>`:''}<span class="age">${esc(f.age||'0+')}</span>`;
const toast=(msg,ms=3200)=>{const t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.hidden=true,ms);};
$$('#siteName,.site-name').forEach(el=>el.textContent=SITE.name||'Ekran TV');
$('#year').textContent=new Date().getFullYear();
$('#contactMail').textContent=SITE.email||'';$('#contactPhone').textContent=SITE.phone||'';
const local={get:(k,d)=>{try{return JSON.parse(localStorage.getItem('ekran-'+k))??d}catch{return d}},set:(k,v)=>{try{localStorage.setItem('ekran-'+k,JSON.stringify(v))}catch{}}};
let currentFilm=null,currentTV=null,lastFocus=null,videoEl=null,hlsObj=null;
let fav=new Set(local.get('favs',[]));
let progress=local.get('progress',{});
function favorite(id){fav.has(id)?fav.delete(id):fav.add(id);local.set('favs',[...fav]);renderFilms();syncFavorite();toast(fav.has(id)?"Ro'yxatga qo'shildi":"Ro'yxatdan olib tashlandi");}
function syncFavorite(){if(hero) $('#heroFav').textContent=fav.has(hero.id)?"✓ Ro'yxatimda":"＋ Ro'yxatimga";if(currentFilm)$('#pFav').textContent=fav.has(currentFilm.id)?"✓ Ro'yxatimda":"＋ Ro'yxatimga";}
const hero=findFilm(SITE.heroFilmId)||FILMS[0];
if(hero){
  $('#heroTitle').textContent=hero.title;$('#heroDesc').textContent=hero.description||'';$('#heroMeta').innerHTML=meta(hero);
  const c=palette(hero);$('#heroBg').style.setProperty('--h1',c[1]);$('#heroBg').style.setProperty('--h2',c[2]);
  const hp=$('#heroPoster'); hp.innerHTML=poster(hero);hp.firstElementChild.style.height='100%';hp.firstElementChild.style.width='100%';
  $('#heroPlay').onclick=()=>openFilm(hero);$('#heroFav').onclick=()=>favorite(hero.id);
}else $('#hero').hidden=true;
const genres=['Hammasi',"Mening ro'yxatim",...new Set(FILMS.map(x=>x.genre).filter(Boolean))];
let activeGenre='Hammasi',q='',sortBy='new';
$('#chips').innerHTML=genres.map(g=>`<button class="chip" type="button" data-genre="${esc(g)}" aria-pressed="${g===activeGenre}">${esc(g)}</button>`).join('');
$('#chips').onclick=e=>{const b=e.target.closest('[data-genre]');if(!b)return;activeGenre=b.dataset.genre;$$('#chips .chip').forEach(x=>x.setAttribute('aria-pressed',x===b));renderFilms();};
$('#sort').onchange=e=>{sortBy=e.target.value;renderFilms();};
$('#q').oninput=e=>{q=e.target.value.trim().toLocaleLowerCase();renderFilms();if(q)$('#kinolar').scrollIntoView({behavior:'smooth'});};
function card(f){return `<div class="tile"><button class="card" type="button" data-film="${f.id}">${poster(f)}<span class="ci"><b>${esc(f.title)}</b><span>${Number(f.rating)>0?'★ '+esc(f.rating):''}</span></span></button><button class="fav" type="button" data-fav="${f.id}" aria-label="Sevimlilarga qo'shish" aria-pressed="${fav.has(f.id)}">${fav.has(f.id)?'★':'☆'}</button></div>`;}
function renderFilms(){
 let arr=FILMS.filter(f=>(activeGenre==='Hammasi'||(activeGenre==="Mening ro'yxatim"?fav.has(f.id):f.genre===activeGenre))&&(!q||[f.title,f.genre].some(x=>String(x).toLocaleLowerCase().includes(q))));
 arr.sort(sortBy==='rating'?(a,b)=>Number(b.rating)-Number(a.rating):sortBy==='az'?(a,b)=>a.title.localeCompare(b.title):(a,b)=>Number(!!fembed(b.video))-Number(!!fembed(a.video))||Number(b.year)-Number(a.year)||b.id-a.id);
 $('#grid').innerHTML=arr.map(card).join('');$('#empty').hidden=!!arr.length;$('#empty').textContent=arr.length?'':"Kino topilmadi.";
}
function renderContinue(){const arr=FILMS.filter(f=>progress[f.id]>60&&progress[f.id]<Number(f.duration)*60*.95);
 $('#davom').hidden=!arr.length;$('#contRow').innerHTML=arr.map(f=>`<button class="card" data-film="${f.id}" type="button">${poster(f)}<span class="ci"><b>${esc(f.title)}</b></span></button>`).join('');}
renderFilms();renderContinue();syncFavorite();
/* Xalqaro telekanallar: O'zbekiston kanallari bu ro'yxatda emas. */
const categories=[...new Set(TV.map(t=>t.group||'Boshqa'))].sort((a,b)=>a.localeCompare(b));
$('#tvCategory').innerHTML='<option value="">Barcha kategoriyalar</option>'+categories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
let tvQuery='',tvGroup='',tvVisible=72,tvFiltered=TV;
function tvCard(ch,i,isUz=false){const logo=String(ch.logo||'');const safeLogo=/^https:\/\//i.test(logo)?logo:'';
 return `<button type="button" class="tv-card" ${isUz?`data-uz-tv="${i}"`:`data-tv="${i}"`} title="${esc(ch.name)}"><span class="tv-icon">${safeLogo?`<img src="${esc(safeLogo)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:esc(ch.name?.[0]||'TV')}</span><span class="tv-info"><strong>${esc(ch.name)}</strong><small>${esc(ch.group)}</small><span class="tv-live">${/^https:\/\//i.test(ch.url||'')?'● EFIR MANZILI BOR':'○ MANBA ULANMAGAN'}${ch.quality?` · <b class="tv-quality">${esc(ch.quality)}</b>`:''}</span></span></button>`;}
function renderTv(){tvFiltered=TV.map((ch,i)=>({...ch,_i:i})).filter(ch=>(!tvGroup||ch.group===tvGroup)&&(!tvQuery||(`${ch.name} ${ch.group}`).toLocaleLowerCase().includes(tvQuery)));
 const displayed=tvFiltered.slice(0,tvVisible);$('#tvGrid').innerHTML=displayed.map(ch=>tvCard(ch,ch._i)).join('');$('#tvEmpty').hidden=tvFiltered.length!==0;
 $('#tvCount').textContent=`${TV.length.toLocaleString('en-US')} ta kanal · ${tvFiltered.length} tasi ko'rsatilmoqda`;
 $('#tvMore').hidden=tvFiltered.length<=tvVisible;$('#tvMore').textContent=`Yana kanallarni ko'rsatish (${tvFiltered.length-tvVisible} ta qoldi)`;
}
$('#tvSearch').oninput=e=>{tvQuery=e.target.value.trim().toLocaleLowerCase();tvVisible=72;renderTv();};
$('#tvCategory').onchange=e=>{tvGroup=e.target.value;tvVisible=72;renderTv();};
$('#tvMore').onclick=()=>{tvVisible+=96;renderTv();};
$('#tvGrid').onclick=e=>{const b=e.target.closest('[data-tv]');if(b)openTV(TV[Number(b.dataset.tv)],Number(b.dataset.tv));};
addEventListener('ekran-iptv-import',()=>{renderTv();});
renderTv();

/* O‘zbek kanallari: UZ.m3u katalogi, 1080p / 720p / SD nomli variantlar alohida. */
const uzCategories=[...new Set(UZ.map(t=>t.group||'Boshqa'))].sort((a,b)=>a.localeCompare(b));
$('#uzCategory').innerHTML='<option value="">Barcha kategoriyalar</option>'+uzCategories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
let uzQuery='',uzGroup='';
function renderUz(){
 const matches=UZ.map((ch,i)=>({...ch,_i:i})).filter(ch=>(!uzGroup||ch.group===uzGroup)&&(!uzQuery||(`${ch.name} ${ch.group}`).toLocaleLowerCase().includes(uzQuery)));
 $('#uzGrid').innerHTML=matches.map(ch=>tvCard(ch,ch._i,true)).join('');
 $('#uzEmpty').hidden=matches.length!==0;
 $('#uzCount').textContent=`${UZ.length} ta oqim (HD/SD variantlar bilan) · ${matches.length} tasi ko‘rsatilmoqda`;
}
$('#uzSearch').oninput=e=>{uzQuery=e.target.value.trim().toLocaleLowerCase();renderUz();};
$('#uzCategory').onchange=e=>{uzGroup=e.target.value;renderUz();};
$('#uzGrid').onclick=e=>{const b=e.target.closest('[data-uz-tv]');if(b)openTV(UZ[Number(b.dataset.uzTv)],Number(b.dataset.uzTv),true);};
renderUz();
/* Universal modal: faqat Fembed kino va HLS telekanal (YouTube yo'q). */
const hideOverlay=()=>$('#pOver').hidden=true;
function overlay(title,msg){$('#pOverTitle').textContent=title;$('#pOverText').textContent=msg;$('#pOver').hidden=false;}
function cleanMedia(){if(hlsObj){try{hlsObj.destroy()}catch{}hlsObj=null;}if(videoEl){try{videoEl.pause();videoEl.removeAttribute('src');videoEl.load()}catch{}videoEl=null;}$('#mediaHost').replaceChildren();}
function openModal(){if($('#modal').hidden)lastFocus=document.activeElement;cleanMedia();hideOverlay();$('#modal').hidden=false;document.body.style.overflow='hidden';$('#pClose').focus();}
function openFilm(f){if(!f)return;window.EKRAN_TV_PLAYER?.close();currentFilm=f;currentTV=null;openModal();
 $('#pTitle').textContent=f.title;$('#pGenre').textContent=f.genre||'Kino';$('#pMeta').innerHTML=meta(f);$('#pDesc').textContent=f.description||'';
 $('#pFav').hidden=false;$('#similarWrap').hidden=false;$('#similar').innerHTML=FILMS.filter(x=>x.id!==f.id).slice(0,6).map(x=>`<button class="card" type="button" data-film="${x.id}">${poster(x)}</button>`).join('');syncFavorite();
 if(location.origin!=='null'&&location.hash!==`#kino-${f.id}`) history.replaceState(null,'',`#kino-${f.id}`);
 const src=fembed(f.video);if(!src){overlay('Video hali qo\'shilmagan','Admin panelga Fembed havolasini kiriting.');return;}
 const iframe=document.createElement('iframe');iframe.className='yt';iframe.src=src;iframe.allow='autoplay; fullscreen; picture-in-picture; encrypted-media';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.title=f.title+' — Fembed video';
 $('#mediaHost').replaceChildren(iframe);
}
function openTV(c,i,isUz=false){if(!c)return;window.EKRAN_TV_PLAYER?.open(c,i,isUz);}
let hlsPromise=null;
function loadHls(){if(window.Hls)return Promise.resolve(window.Hls);if(hlsPromise)return hlsPromise;hlsPromise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';s.async=true;s.onload=()=>window.Hls?resolve(window.Hls):reject(new Error('HLS kutubxonasi yuklanmadi'));s.onerror=reject;document.head.append(s);});return hlsPromise;}
function closeModal(){cleanMedia();$('#modal').hidden=true;document.body.style.overflow='';currentFilm=null;currentTV=null;if(location.origin!=='null'&&/^#(?:kino|kanal|uzkanal)-/.test(location.hash))history.replaceState(null,'',location.pathname+location.search);lastFocus?.focus?.();}
$('#pClose').onclick=closeModal;$('#modal').onclick=e=>{if(e.target===$('#modal'))closeModal();};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#modal').hidden)closeModal();});
$('#pFav').onclick=()=>{if(currentFilm)favorite(currentFilm.id);};
$('#pShare').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);toast('Havola nusxalandi');}catch{toast('Havola: '+location.href,5000);}};
document.addEventListener('click',e=>{let b=e.target.closest('[data-fav]');if(b){favorite(Number(b.dataset.fav));return;}b=e.target.closest('[data-film]');if(b)openFilm(findFilm(Number(b.dataset.film)));});
function route(){const k=location.hash.match(/^#kino-(\d+)$/),c=location.hash.match(/^#kanal-(\d+)$/),u=location.hash.match(/^#uzkanal-(\d+)$/);if(k){openFilm(findFilm(Number(k[1])));}else if(c){openTV(TV[Number(c[1])],Number(c[1]));}else if(u){openTV(UZ[Number(u[1])],Number(u[1]),true);}}
addEventListener('hashchange',route);route();
let installPrompt=null;const standalone=matchMedia('(display-mode:standalone)').matches||navigator.standalone;
if(standalone)$('#installBtn').hidden=true;addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
$('#installBtn').onclick=async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice.catch(()=>{});installPrompt=null;}else if(/iphone|ipad/i.test(navigator.userAgent))toast("Safari'da Ulashish → Bosh ekranga qo'shish ni tanlang.",5500);else toast("Brauzer menyusidan 'Ilovani o'rnatish' ni tanlang.",5000);};
const ids=['bosh','kinolar','ozbek-kanallari','telekanallar','haqida'];addEventListener('scroll',()=>{let cur='bosh';for(const id of ids){if(document.getElementById(id)?.getBoundingClientRect().top<150)cur=id;}if(scrollY<200)cur='bosh';$$('nav.main a,.tabbar a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+cur));},{passive:true});
if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
})();