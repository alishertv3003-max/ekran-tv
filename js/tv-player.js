/* Ekran TV — cinematic live-TV player for Android TV, TV browsers and phones. */
(function () {
'use strict';
const AUTO_HIDE_MS=2000;
let stage=null,video=null,hls=null,current=null,index=0,isUz=false,prevFocus=null;
let uiTimer=null,delayTimer=null,loadTimer=null,requestSerial=0;
const $=s=>stage?.querySelector(s);
const icons={
 back:'<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>',
 prev:'<svg viewBox="0 0 24 24"><path d="m7 6-5 6 5 6V6Zm2 6 11-6v12L9 12Z"/></svg>',
 next:'<svg viewBox="0 0 24 24"><path d="m17 6 5 6-5 6V6ZM15 12 4 6v12l11-6Z"/></svg>',
 pause:'<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
 play:'<svg viewBox="0 0 24 24"><path d="m7 4 14 8-14 8V4Z"/></svg>',
 sound:'<svg viewBox="0 0 24 24"><path d="M3 9v6h4l6 5V4L7 9H3Zm13-2a7 7 0 0 1 0 10m3-13a11 11 0 0 1 0 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 muted:'<svg viewBox="0 0 24 24"><path d="M3 9v6h4l6 5V4L7 9H3Zm13 0 5 6m0-6-5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};
function button(id,icon,label){return '<button type="button" class="tv-icon-btn" id="'+id+'" aria-label="'+label+'" title="'+label+'">'+icons[icon]+'</button>';}
function make(){
 if(stage)return;
 stage=document.createElement('section');
 stage.id='tvStage';stage.className='tv-stage';stage.hidden=true;stage.tabIndex=-1;
 stage.setAttribute('role','dialog');stage.setAttribute('aria-label','Ekran TV jonli kanal');
 stage.innerHTML='<div class="tv-video" id="tvVideo"></div>'+
 '<div class="tv-shade" aria-hidden="true"></div>'+
 '<div class="tv-top">'+button('tvExit','back','Kanallar ro‘yxatiga qaytish')+
 '<div class="tv-title"><strong id="tvName"></strong><small id="tvGroup"></small></div>'+
 '<span class="tv-live">● JONLI EFIR</span></div>'+
 '<div class="tv-status" id="tvStatus"><span class="tv-spin"></span><strong id="tvStatusTitle">Efir yuklanmoqda…</strong><small id="tvStatusText">Ulanmoqda</small>'+
 '<button class="tv-retry" id="tvRetry" type="button" hidden>↻ Qayta urinish</button></div>'+
 '<div class="tv-bottom"><div class="tv-name" id="tvNameBottom"></div><div class="tv-buttons">'+
 button('tvPrev','prev','Oldingi kanal')+button('tvPause','pause','Pauza')+
 button('tvMute','sound','Ovozni o‘chirish')+button('tvNext','next','Keyingi kanal')+
 '</div></div>';
 document.body.append(stage);
 $('#tvExit').onclick=close;
 $('#tvPrev').onclick=()=>switchChannel(-1);
 $('#tvNext').onclick=()=>switchChannel(1);
 $('#tvPause').onclick=()=>{if(!video)return;video.paused?video.play().catch(()=>{}):video.pause();updateButtons();showUi();};
 $('#tvMute').onclick=()=>{if(!video)return;video.muted=!video.muted;updateButtons();showUi();};
 $('#tvRetry').onclick=()=>{if(current)open(current,index,isUz);};
 stage.addEventListener('mousemove',()=>showUi());
 stage.addEventListener('pointerdown',()=>showUi());
}
function controls(){return ['#tvExit','#tvPrev','#tvPause','#tvMute','#tvNext'].map($).filter(Boolean);}
function hideUi(){
 if(!stage||stage.hidden)return;
 stage.classList.add('tv-idle');
 if(stage.contains(document.activeElement))document.activeElement.blur();
 stage.focus({preventScroll:true});
}
function showUi(focus=false){
 if(!stage||stage.hidden)return;
 stage.classList.remove('tv-idle');
 clearTimeout(uiTimer);
 if(focus)$('#tvPause').focus({preventScroll:true});
 uiTimer=setTimeout(hideUi,AUTO_HIDE_MS);
}
function status(title,detail='',retry=false){
 if(!stage)return;
 $('#tvStatus').hidden=false;
 $('#tvStatusTitle').textContent=title;
 $('#tvStatusText').textContent=detail;
 $('#tvRetry').hidden=!retry;
 stage.classList.toggle('tv-failed',retry);
}
function updateButtons(){
 if(!video||!stage)return;
 $('#tvPause').innerHTML=video.paused?icons.play:icons.pause;
 $('#tvPause').setAttribute('aria-label',video.paused?'Davom ettirish':'Pauza');
 $('#tvMute').innerHTML=video.muted?icons.muted:icons.sound;
 $('#tvMute').setAttribute('aria-label',video.muted?'Ovozni yoqish':'Ovozni o‘chirish');
}
function clean(){
 requestSerial++;
 clearTimeout(uiTimer);clearTimeout(loadTimer);clearInterval(delayTimer);
 uiTimer=loadTimer=delayTimer=null;
 if(hls){try{hls.destroy();}catch(e){}hls=null;}
 if(video){try{video.pause();video.removeAttribute('src');video.load();video.remove();}catch(e){}video=null;}
}
function close(){
 if(!stage||stage.hidden)return;
 clean();
 stage.hidden=true;
 stage.classList.remove('tv-idle');document.body.classList.remove('tv-active');
 if(document.fullscreenElement===stage)document.exitFullscreen?.().catch?.(()=>{});
 current=null;
 if(/^#(?:kanal|uzkanal)-\d+$/.test(location.hash))history.replaceState(null,'',location.pathname+location.search);
 prevFocus?.focus?.({preventScroll:true});
}
function switchChannel(dir){
 let arr=isUz?(window.UZ_CHANNELS||[]):(window.TV_CHANNELS||[]);
 if(!arr.length)return;
 let n=(index+dir+arr.length)%arr.length;
 open(arr[n],n,isUz);
}
function requestFullScreen(){
 // Call directly from the channel-click handler, while user activation is available.
 // Browsers that deny the Fullscreen API still get CSS viewport-wide theater mode.
 if(document.fullscreenElement===stage||!stage?.requestFullscreen)return;
 try{const promise=stage.requestFullscreen({navigationUI:'hide'});promise?.catch?.(()=>{});}catch(e){}
}
function seek15(){
 if(!video||!current)return;
 try{
  const ranges=video.seekable;
  if(!ranges.length)return;
  const end=ranges.end(ranges.length-1),start=ranges.start(ranges.length-1);
  if(end-start<17)return;
  const goal=Math.max(start,end-15);
  if(Math.abs(video.currentTime-goal)>5)video.currentTime=goal;
 }catch(e){}
}
function open(channel,n,uz){
 if(!channel)return;
 make();
 if(stage.hidden)prevFocus=document.activeElement;
 clean();current=channel;index=n||0;isUz=!!uz;
 stage.hidden=false;stage.classList.remove('tv-failed');
 document.body.classList.add('tv-active');
 $('#tvName').textContent=$('#tvNameBottom').textContent=channel.name||'Telekanal';
 $('#tvGroup').textContent=channel.group||'';
 $('#tvVideo').replaceChildren();
 stage.focus({preventScroll:true});
 // No separate fullscreen button: request it at the moment a channel is selected.
 requestFullScreen();
 showUi();
 const hash='#'+(isUz?'uzkanal':'kanal')+'-'+index;
 if(location.hash!==hash)history.replaceState(null,'',hash);
 status('Efir yuklanmoqda…','Kanalga ulanmoqda');
 const src=String(channel.url||'').trim();
 if(!/^https:\/\//i.test(src)){
  status('Efir manzili ulanmagan','Ushbu kanal uchun ruxsatli HTTPS efir manzili kerak.',true);return;
 }
 const v=document.createElement('video');
 v.className='tv-media';v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');
 v.autoplay=true;v.controls=false;v.preload='auto';v.disablePictureInPicture=true;
 $('#tvVideo').append(v);video=v;
 const serial=requestSerial;
 const live=()=>video===v&&serial===requestSerial;
 const fail=()=>{if(live())status('Efir ochilmadi','Server, CORS, kanal havolasi yoki hududiy cheklovni tekshiring.',true);};
 v.addEventListener('error',fail);
 v.addEventListener('playing',()=>{if(!live())return;$('#tvStatus').hidden=true;stage.classList.remove('tv-failed');updateButtons();});
 v.addEventListener('waiting',()=>{if(live())status('Buferlanmoqda…','Video buferi to‘ldirilmoqda');});
 v.addEventListener('pause',updateButtons);v.addEventListener('play',updateButtons);
 const play=()=>{if(live())v.play().catch(()=>{if(live())status('Ijroni boshlash uchun OK bosing','Avtomatik ijro cheklangan');});};
 if(v.canPlayType('application/vnd.apple.mpegurl')){
  v.src=src;v.addEventListener('loadedmetadata',()=>{seek15();play();});
  delayTimer=setInterval(seek15,5000);play();
 }else{
  loadHls().then(Hls=>{
   if(!live())return;
   if(!Hls.isSupported()){fail();return;}
   hls=new Hls({lowLatencyMode:false,liveSyncDuration:15,liveMaxLatencyDuration:45,maxBufferLength:35,backBufferLength:35});
   hls.on(Hls.Events.ERROR,(_,data)=>{if(data.fatal)fail();});
   hls.on(Hls.Events.MANIFEST_PARSED,play);
   hls.attachMedia(v);hls.loadSource(src);
  }).catch(fail);
 }
 loadTimer=setTimeout(()=>{if(live()&&v.readyState===0)fail();},20000);
 updateButtons();
}
let hlsPromise=null;
function loadHls(){
 if(window.Hls)return Promise.resolve(window.Hls);
 if(hlsPromise)return hlsPromise;
 hlsPromise=new Promise((resolve,reject)=>{
  const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
  s.onload=()=>window.Hls?resolve(window.Hls):reject(Error('HLS yuklanmadi'));
  s.onerror=reject;document.head.append(s);
 });
 return hlsPromise;
}
document.addEventListener('keydown',e=>{
 if(!stage||stage.hidden)return;
 const key=e.key;
 if(['Escape','Backspace','BrowserBack','GoBack'].includes(key)){
  e.preventDefault();e.stopImmediatePropagation();close();return;
 }
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(key)){
  e.preventDefault();e.stopImmediatePropagation();
  if(stage.classList.contains('tv-idle')){
   if(key==='ArrowLeft'||key==='ArrowRight'){switchChannel(key==='ArrowLeft'?-1:1);return;}
   showUi(true);return;
  }
  const arr=controls();
  let i=arr.indexOf(document.activeElement);
  if(i===-1){showUi(true);return;}
  let target;
  if(key==='ArrowUp')target=$('#tvExit');
  else if(key==='ArrowDown')target=$('#tvPause');
  else target=arr[(i+(key==='ArrowRight'?1:-1)+arr.length)%arr.length];
  target?.focus({preventScroll:true});showUi();return;
 }
 if(['Enter','NumpadEnter',' ','Select'].includes(key)){
  if(stage.classList.contains('tv-idle')){
   e.preventDefault();e.stopImmediatePropagation();showUi(true);return;
  }
  if(document.activeElement===stage){
   e.preventDefault();e.stopImmediatePropagation();$('#tvPause').click();
  }
 }
},true);
window.EKRAN_TV_PLAYER={open,close,isOpen:()=>!!stage&&!stage.hidden};
})();
