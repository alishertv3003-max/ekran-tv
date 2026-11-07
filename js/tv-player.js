/* Ekran TV Live Player — TV pult, full screen, 15-second HLS latency target. */
(function(){
'use strict';
var stage=null,video=null,hls=null,active=null,index=0,isUz=false,focusBefore=null,delayPoll=null,timeout=null;
var $=s=>stage?.querySelector(s);
function make(){
 if(stage)return;
 stage=document.createElement('section');stage.id='tvStage';stage.className='tv-stage';stage.hidden=true;stage.setAttribute('role','dialog');stage.setAttribute('aria-label','Jonli telekanal');
 stage.innerHTML='<div class="tv-video" id="tvVideo"></div><div class="tv-shade"></div>'+
 '<header class="tv-top"><button class="tv-btn" id="tvExit">← Kanallar</button><div class="tv-title"><strong id="tvName"></strong><small id="tvGroup"></small></div><span class="tv-live">● JONLI EFIR</span></header>'+
 '<div class="tv-status" id="tvStatus"><span class="tv-spin"></span><strong id="tvStatusTitle">Efir yuklanmoqda…</strong><small id="tvStatusText"></small><button class="tv-btn" id="tvRetry" hidden>↻ Qayta urinish</button></div>'+
 '<footer class="tv-bottom"><div class="tv-head"><strong id="tvNameBottom"></strong><span id="tvDelay">⏱ 15 soniya maqsad</span></div>'+
 '<div class="tv-buttons"><button class="tv-btn" id="tvPrev">⏮ Oldingi</button><button class="tv-btn" id="tvPause">⏸ Pauza</button><button class="tv-btn" id="tvMute">🔊 Ovoz</button><button class="tv-btn" id="tvNext">Keyingi ⏭</button><button class="tv-btn tv-max" id="tvMax">⛶ Katta ekran</button></div>'+
 '<small class="tv-help">TV pulti: chap/o‘ng — kanal, OK — pauza, Back — chiqish. 15 soniya manbaga bog‘liq.</small></footer>';
 document.body.appendChild(stage);
 $('#tvExit').onclick=close;
 $('#tvRetry').onclick=()=>{if(active)open(active,index,isUz);};
 $('#tvPrev').onclick=()=>switchChannel(-1);
 $('#tvNext').onclick=()=>switchChannel(1);
 $('#tvPause').onclick=()=>{if(!video)return;video.paused?video.play().catch(()=>{}):video.pause();sync();};
 $('#tvMute').onclick=()=>{if(!video)return;video.muted=!video.muted;sync();};
 $('#tvMax').onclick=()=>{
   if(document.fullscreenElement){document.exitFullscreen?.();return;}
   if(stage.requestFullscreen){Promise.resolve(stage.requestFullscreen({navigationUI:'hide'})).catch(()=>{video?.webkitEnterFullscreen?.();});}
   else video?.webkitEnterFullscreen?.();
 };
 stage.onmousemove=showUi;stage.onclick=showUi;
}
var idle;
function showUi(){
 if(!stage||stage.hidden)return;
 stage.classList.remove('tv-idle');clearTimeout(idle);
 idle=setTimeout(()=>{if(stage&&!stage.hidden&&!stage.contains(document.activeElement)&&$('#tvStatus').hidden)stage.classList.add('tv-idle');},7000);
}
function status(title,info='',retry=false){
 $('#tvStatus').hidden=false;$('#tvStatusTitle').textContent=title;$('#tvStatusText').textContent=info;
 $('#tvRetry').hidden=!retry;stage.classList.toggle('tv-failed',retry);showUi();
}
function sync(){
 if(!video||!stage)return;
 $('#tvPause').textContent=video.paused?'▶ Davom ettirish':'⏸ Pauza';
 $('#tvMute').textContent=video.muted?'🔇 Ovoz yoqish':'🔊 Ovoz';
}
function cleanup(){
 clearTimeout(timeout);clearTimeout(idle);clearInterval(delayPoll);timeout=idle=delayPoll=null;
 if(hls){try{hls.destroy()}catch{}hls=null;}
 if(video){try{video.pause();video.removeAttribute('src');video.load();video.remove();}catch{}video=null;}
}
function close(){
 if(!stage||stage.hidden)return;
 cleanup();stage.hidden=true;stage.classList.remove('tv-idle');document.body.classList.remove('tv-active');
 if(document.fullscreenElement===stage)document.exitFullscreen?.().catch?.(()=>{});
 active=null;
 if(/^#(?:kanal|uzkanal)-\d+$/.test(location.hash))history.replaceState(null,'',location.pathname+location.search);
 focusBefore?.focus?.();
}
function switchChannel(d){
 var list=isUz?(window.UZ_CHANNELS||[]):(window.TV_CHANNELS||[]);
 if(!list.length)return;
 var n=(index+d+list.length)%list.length;open(list[n],n,isUz);
}
function nativeDelay(){
 if(!video||!active)return;
 try{var r=video.seekable;if(!r.length)return;var end=r.end(r.length-1),start=r.start(r.length-1);
 if(end-start<17)return;var goal=Math.max(start,end-15);
 if(Math.abs(video.currentTime-goal)>5)video.currentTime=goal;
 $('#tvDelay').textContent='⏱ ~15 s (DVR)';
 }catch{}
}
function open(c,n,uz){
 if(!c)return;make();
 if(stage.hidden)focusBefore=document.activeElement;
 cleanup();index=n||0;isUz=!!uz;active=c;
 stage.hidden=false;stage.classList.remove('tv-idle');document.body.classList.add('tv-active');
 $('#tvName').textContent=$('#tvNameBottom').textContent=c.name||'Telekanal';
 $('#tvGroup').textContent=c.group||'';
 $('#tvDelay').textContent='⏱ 15 soniya maqsad';
 $('#tvVideo').replaceChildren();
 $('#tvExit').focus();
 var hash='#'+(isUz?'uzkanal':'kanal')+'-'+index;
 if(location.hash!==hash)history.replaceState(null,'',hash);
 status('Efir yuklanmoqda…','Manbaga ulanmoqda');
 var src=String(c.url||'').trim();
 if(!/^https:\/\//i.test(src)){status('Efir manzili ulanmagan','Provayderning ruxsatli HTTPS oqimi kerak.',true);return;}
 video=document.createElement('video');video.className='tv-media';video.playsInline=true;video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');
 video.autoplay=true;video.controls=false;video.preload='auto';video.disablePictureInPicture=true;
 $('#tvVideo').appendChild(video);var v=video;
 var fail=()=>{if(v===video)status('Efir ochilmadi','Server, CORS, havola yoki hududiy cheklovni tekshiring.',true);};
 v.addEventListener('error',fail);
 v.addEventListener('playing',()=>{if(v===video){$('#tvStatus').hidden=true;stage.classList.remove('tv-failed');sync();showUi();}});
 v.addEventListener('waiting',()=>{if(v===video)status('Buferlanmoqda…','Internet va server tekshirilmoqda');});
 v.addEventListener('pause',sync);v.addEventListener('play',sync);
 var play=()=>{if(v!==video)return;v.play().catch(()=>{status('OK tugmasini bosing','Avtomatik ijro bloklangan');$('#tvPause').focus();});};
 if(v.canPlayType('application/vnd.apple.mpegurl')){
   v.src=src;v.addEventListener('loadedmetadata',()=>{nativeDelay();play();});delayPoll=setInterval(nativeDelay,5000);play();
 }else{
   loadHls().then(Hls=>{if(v!==video)return;if(!Hls.isSupported()){fail();return;}
      hls=new Hls({lowLatencyMode:false,liveSyncDuration:15,liveMaxLatencyDuration:45,maxBufferLength:35,backBufferLength:35});
      hls.on(Hls.Events.ERROR,(_,d)=>{if(d.fatal)fail();});
      hls.on(Hls.Events.MANIFEST_PARSED,play);
      hls.on(Hls.Events.LEVEL_UPDATED,()=>{if(v===video)$('#tvDelay').textContent='⏱ ~15 s (HLS)';});
      hls.attachMedia(v);hls.loadSource(src);
   }).catch(fail);
 }
 timeout=setTimeout(()=>{if(v===video&&v.readyState===0)fail();},20000);
 sync();showUi();
}
var hlsPromise=null;
function loadHls(){
 if(window.Hls)return Promise.resolve(window.Hls);
 if(hlsPromise)return hlsPromise;
 hlsPromise=new Promise((ok,bad)=>{var sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';sc.onload=()=>window.Hls?ok(window.Hls):bad(Error('HLS missing'));sc.onerror=bad;document.head.append(sc);});
 return hlsPromise;
}
document.addEventListener('keydown',e=>{
 if(!stage||stage.hidden)return;
 showUi();
 if(['Escape','Backspace','BrowserBack'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();close();return;}
 if((e.key==='ArrowLeft'||e.key==='ArrowRight')&&!e.target.closest?.('.tv-buttons')){
   e.preventDefault();e.stopImmediatePropagation();switchChannel(e.key==='ArrowRight'?1:-1);
 }
},true);
document.addEventListener('fullscreenchange',()=>{if(stage&&!stage.hidden)$('#tvMax').textContent=document.fullscreenElement?'⤢ Chiqish':'⛶ Katta ekran';});
window.EKRAN_TV_PLAYER={open,close,isOpen:()=>!!stage&&!stage.hidden};
})();
