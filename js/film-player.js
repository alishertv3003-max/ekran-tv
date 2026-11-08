/* Ekran TV — dedicated full-screen film player.
   Cross-origin Fembed embeds cannot be reliably sought/paused through the parent site.
   Native MP4/HLS content supports remote ±5s seeking and pause/play. */
(function(){
'use strict';
let layer=null,video=null,hls=null,active=null,previous=null,timer=null,loadTimer=null,serial=0;
let movieIsEmbed=false,uiVisible=false,displayNotice=null;
const $=s=>layer?.querySelector(s);
const icons={
back:'<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>',
prev:'<svg viewBox="0 0 24 24"><path d="m14 5-9 7 9 7V5Z"/></svg>',
next:'<svg viewBox="0 0 24 24"><path d="m10 5 9 7-9 7V5Z"/></svg>',
play:'<svg viewBox="0 0 24 24"><path d="m7 4 14 8-14 8V4Z"/></svg>',
pause:'<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>'
};
function btn(id,icon,label){return '<button type="button" id="'+id+'" class="movie-icon" aria-label="'+label+'" title="'+label+'">'+icons[icon]+'</button>';}
function mount(){
 if(layer)return;
 layer=document.createElement('section');layer.id='movieStage';layer.hidden=true;layer.className='movie-stage';
 layer.setAttribute('role','dialog');layer.setAttribute('aria-label','Ekran TV kino player');
 layer.tabIndex=-1;
 layer.innerHTML='<div class="movie-media" id="movieMedia"></div><div class="movie-gradient"></div>'+
 '<header class="movie-top">'+btn('movieBack','back','Kinolarga qaytish')+
 '<strong id="movieTitle"></strong><span class="movie-label">EKRAN TV</span></header>'+
 '<div class="movie-state" id="movieState" hidden><strong id="movieStateText"></strong></div>'+
 '<footer class="movie-bottom"><div class="movie-toolbar">'+btn('movieRewind','prev','5 soniya orqaga')+
 '<span class="movie-five">−5 s</span>'+btn('moviePause','pause','Pauza')+
 '<span class="movie-five">+5 s</span>'+btn('movieForward','next','5 soniya oldinga')+
 '<span id="movieTime">00:00</span></div><div class="movie-progress"><div id="movieProgress"></div></div>'+
 '<small id="movieHint">Pult: ← −5 s · → +5 s · OK pauza/davom · Back chiqish</small></footer>';
 document.body.append(layer);
 $('#movieBack').onclick=close;
 $('#movieRewind').onclick=()=>seek(-5);
 $('#movieForward').onclick=()=>seek(5);
 $('#moviePause').onclick=toggle;
 layer.addEventListener('pointermove',()=>showUI());
}
function message(msg,ms=3500){if(!layer)return;$('#movieStateText').textContent=msg;$('#movieState').hidden=false;
 clearTimeout(displayNotice);displayNotice=setTimeout(()=>{if(layer)$('#movieState').hidden=true;},ms);}
function showUI(focus=false){
 if(!layer||layer.hidden)return;
 layer.classList.remove('movie-idle');uiVisible=true;
 clearTimeout(timer);
 if(focus)$('#moviePause').focus({preventScroll:true});
 timer=setTimeout(()=>{if(layer&&!layer.hidden){layer.classList.add('movie-idle');uiVisible=false;
 if(layer.contains(document.activeElement))document.activeElement.blur();
 layer.focus({preventScroll:true});}},2000);
}
function destroy(){
 serial++;clearTimeout(timer);clearTimeout(loadTimer);clearTimeout(displayNotice);timer=loadTimer=displayNotice=null;
 if(hls){try{hls.destroy()}catch{}hls=null;}
 if(video){try{video.pause();video.removeAttribute('src');video.load();}catch{}video=null;}
 $('#movieMedia')?.replaceChildren();
}
function close(){
 if(!layer||layer.hidden)return;
 destroy();layer.hidden=true;active=null;document.body.classList.remove('watching-movie');
 if(document.fullscreenElement===layer)document.exitFullscreen?.().catch?.(()=>{});
 if(/^#kino-\d+$/.test(location.hash))history.replaceState(null,'',location.pathname+location.search);
 previous?.focus?.({preventScroll:true});
}
function fullscreen(){
 if(document.fullscreenElement===layer||!layer?.requestFullscreen)return;
 try{const p=layer.requestFullscreen({navigationUI:'hide'});p?.catch?.(()=>{});}catch(e){}
}
function update(){
 if(!video||!layer)return;
 $('#moviePause').innerHTML=video.paused?icons.play:icons.pause;
 if(Number.isFinite(video.duration)&&video.duration>0){
  const n=Math.floor(video.currentTime||0),end=Math.floor(video.duration);
  const fmt=x=>String(Math.floor(x/60)).padStart(2,'0')+':'+String(x%60).padStart(2,'0');
  $('#movieTime').textContent=fmt(n)+' / '+fmt(end);
  $('#movieProgress').style.width=(100*Math.min(1,n/end))+'%';
 }
}
function seek(delta){
 if(movieIsEmbed){message('Fembed tashqi playerida ±5 s boshqaruvi mavjud emas. Videoning o‘z boshqaruvini ishlating.');return;}
 if(!video||!Number.isFinite(video.duration)||!video.duration){message('Video hali tayyor emas');return;}
 let from=Number(video.currentTime||0),to=Math.max(0,Math.min(video.duration-.1,from+delta));
 try{video.currentTime=to;}catch(e){}
 message((delta>0?'+':'')+delta+' soniya',650);update();showUI();
}
function toggle(){
 if(movieIsEmbed){message('Fembed playerining ichida pauza/boshlashni tanlang.');return;}
 if(!video)return;
 video.paused?video.play().catch(()=>{}):video.pause();
 update();showUI();
}
function validDirect(src){
 try{
  let u=new URL(src);return u.protocol==='https:'&&/\.(mp4|webm|m4v|m3u8)(?:$|\?)/i.test(u.pathname+u.search);
 }catch{return false;}
}
function validEmbed(src){
 try{
  let u=new URL(src);return u.protocol==='https:'&&['fembed.co','www.fembed.co'].includes(u.hostname)&&/^\/(?:embed|v)\/[\w-]+\/?$/.test(u.pathname);
 }catch{return false;}
}
function loadHls(){
 if(window.Hls)return Promise.resolve(window.Hls);
 return new Promise((resolve,reject)=>{let s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';s.onload=()=>window.Hls?resolve(window.Hls):reject(Error('HLS yuklanmadi'));s.onerror=reject;document.head.append(s);});
}
function open(f){
 if(!f)return;mount();if(layer.hidden)previous=document.activeElement;
 destroy();active=f;layer.hidden=false;movieIsEmbed=false;uiVisible=true;
 document.body.classList.add('watching-movie');$('#movieTitle').textContent=f.title||'Kino';
 $('#movieTime').textContent='';$('#movieProgress').style.width='0%';
 $('#movieHint').textContent='Pult: ← −5 s · → +5 s · OK pauza/davom · Back chiqish';
 if(location.hash!=='#kino-'+f.id)history.replaceState(null,'','#kino-'+f.id);
 layer.focus({preventScroll:true});
 fullscreen();showUI();
 // directVideo is opt-in for properly licensed, CORS-compatible MP4/HLS.
 // Existing Fembed links remain fully supported and are not rewritten.
 const direct=String(f.directVideo||'').trim();
 const link=String(f.video||'').trim();
 if(validDirect(direct)||validDirect(link)){
  const src=validDirect(direct)?direct:link;
  video=document.createElement('video');
  video.className='movie-native';video.playsInline=true;video.setAttribute('playsinline','');
  video.autoplay=true;video.preload='metadata';video.controls=false;
  $('#movieMedia').append(video);
  video.addEventListener('timeupdate',update);
  video.addEventListener('play',update);video.addEventListener('pause',update);
  video.addEventListener('waiting',()=>message('Buferlanmoqda…',2300));
  video.addEventListener('error',()=>message('Video manbasi ochilmadi. Havolani tekshiring.',7000));
  const v=video,token=serial;
  if(/\.m3u8(?:$|\?)/i.test(src)){
   if(v.canPlayType('application/vnd.apple.mpegurl')){v.src=src;v.play().catch(()=>{});}
   else loadHls().then(Hls=>{if(video!==v||token!==serial)return;if(!Hls.isSupported()){message('HLS qo‘llanmaydi',5000);return;}
    hls=new Hls();hls.attachMedia(v);hls.loadSource(src);hls.on(Hls.Events.MANIFEST_PARSED,()=>v.play().catch(()=>{}));
   }).catch(()=>message('HLS yuklanmadi',5000));
  }else{v.src=src;v.play().catch(()=>{});}
 }else if(validEmbed(link)){
  movieIsEmbed=true;
  const u=new URL(link),id=u.pathname.split('/').filter(Boolean).pop();
  const iframe=document.createElement('iframe');
  iframe.src='https://fembed.co/embed/'+id;iframe.className='movie-frame';iframe.title=f.title||'Kino';
  iframe.allow='autoplay; fullscreen; encrypted-media; picture-in-picture';iframe.allowFullscreen=true;
  iframe.referrerPolicy='strict-origin-when-cross-origin';
  $('#movieMedia').append(iframe);
  $('#movieTime').textContent='Fembed';
  $('#movieHint').textContent='Fembed: videoning ichki boshqaruv tugmalaridan foydalaning; Back — chiqish';
  // Parent cannot pause/seek cross-origin iframe without an official embedded API.
 }else message('Film uchun Fembed yoki HTTPS video manzili mavjud emas',10000);
}
document.addEventListener('keydown',e=>{
 if(!layer||layer.hidden)return;
 if(['Escape','Backspace','BrowserBack','GoBack'].includes(e.key)){
  e.preventDefault();e.stopImmediatePropagation();close();return;
 }
 if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
  if(e.target.closest?.('.movie-toolbar')){showUI();return;}
  e.preventDefault();e.stopImmediatePropagation();seek(e.key==='ArrowLeft'?-5:5);return;
 }
 if(e.key==='ArrowUp'||e.key==='ArrowDown'){showUI(true);return;}
 if(['Enter','NumpadEnter',' ','MediaPlayPause'].includes(e.key)&&document.activeElement===layer){
  e.preventDefault();e.stopImmediatePropagation();if(!uiVisible)showUI(true);else toggle();
 }
},true);
window.EKRAN_FILM_PLAYER={open,close,isOpen:()=>!!layer&&!layer.hidden};
})();
