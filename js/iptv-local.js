/* Ekran TV — device-local M3U import for authorized streams.
   URLs are never uploaded, sent to GitHub, or saved to persistent browser storage. */
(function(){
'use strict';
function norm(s){return String(s||'').normalize('NFKC').toLowerCase().replace(/\b(?:hd|fhd|uhd|sd|orig|4k|1080p|720p)\b/g,'').replace(/[^a-zа-яё0-9]+/gi,' ').trim();}
function parse(text){
 const lines=String(text||'').replace(/\r/g,'').split('\n');
 if(!lines[0]?.trim().startsWith('#EXTM3U'))throw Error('M3U fayl noto‘g‘ri: #EXTM3U sarlavhasi yo‘q.');
 const result=[];let meta=null;
 for(const raw of lines){
  const line=raw.trim();if(line.startsWith('#EXTINF:')){
   const split=line.indexOf(',');const header=split===-1?line:line.slice(0,split);
   const attrs={};const re=/([\w-]+)="([^"]*)"/g;let m;while((m=re.exec(header))!==null)attrs[m[1]]=m[2];
   meta={name:(split===-1?'':line.slice(split+1)).trim(),id:attrs['tvg-id']||'',group:attrs['group-title']||''};
  }else if(line&&!line.startsWith('#')&&meta){
   if(/^https?:\/\//i.test(line))result.push({...meta,url:line});
   meta=null;
  }
 }
 return result;
}
function importM3u(text){
 const list=parse(text);
 const catalog=[...(window.UZ_CHANNELS||[]),...(window.TV_CHANNELS||[])];
 const byId=new Map(),byName=new Map();
 for(const item of list){
  if(item.id){const k=norm(item.id);if(!byId.has(k))byId.set(k,[]);byId.get(k).push(item);}
  const k=norm(item.name);if(k){if(!byName.has(k))byName.set(k,[]);byName.get(k).push(item);}
 }
 let assigned=0,secure=0,unencrypted=0,uz=0,foreign=0;
 const taken=new Set();
 for(const ch of catalog){
  const matches=(ch.tvgId?byId.get(norm(ch.tvgId)):null)||byName.get(norm(ch.name))||[];
  const stream=matches.find(x=>!taken.has(x)&&x.name===ch.name&&/^https:\/\//i.test(x.url))
    ||matches.find(x=>!taken.has(x)&&x.name===ch.name)
    ||matches.find(x=>!taken.has(x)&&/^https:\/\//i.test(x.url))
    ||matches.find(x=>!taken.has(x));
  if(!stream)continue;
  taken.add(stream);ch.url=stream.url;assigned++;
  if(/^https:\/\//i.test(stream.url))secure++;else unencrypted++;
  if(ch.group==='Uzbekistan (UZ)')uz++;else foreign++;
 }
 window.dispatchEvent(new CustomEvent('ekran-iptv-import',{detail:{total:list.length,assigned,secure,unencrypted,uz,foreign}}));
 return {total:list.length,assigned,secure,unencrypted,uz,foreign};
}
function init(){
 const input=document.getElementById('iptvLocalFile');
 const status=document.getElementById('iptvLocalStatus');
 if(!input||!status)return;
 input.addEventListener('change',async()=>{
  const file=input.files&&input.files[0];if(!file)return;
  if(file.size>10*1024*1024){status.textContent='M3U fayl 10 MB dan kichik bo‘lishi kerak.';return;}
  try{
   const outcome=importM3u(await file.text());
   status.textContent=outcome.total+' ta M3U yozuvi o‘qildi, '+outcome.assigned+' ta katalog kanaliga oqim ulandi (O‘zbek: '+outcome.uz+', xorijiy: '+outcome.foreign+'). HTTPS: '+outcome.secure+'; HTTP: '+outcome.unencrypted+'. HTTP saytimizda bloklanadi. Sahifani yangilasangiz ulanish yo‘qoladi.';
  }catch(e){status.textContent='Import xatosi: '+e.message;}
  input.value='';
 });
}
window.EKRAN_LOCAL_IPTV={parse,importM3u};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
