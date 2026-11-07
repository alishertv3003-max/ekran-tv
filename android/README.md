# Ekran TV local Android APK
- App opens its **bundled** interface and catalog from Android assets, not GitHub Pages.
- Video and IPTV streaming still require internet, licensed content and usable source streams.
- TV remote D-pad, OK, Back, and fullscreen implemented (actual device verification pending).
- The publicly available international-channel catalog does not include provider IPTV tokens, so those streams cannot play until authorized sources are configured.
- Fembed embeds may be refused by the third-party platform.
- Android TV and Google TV supported at APK installation level; Samsung Tizen and LG webOS are not.
- This is a debug APK for device testing only.

## Ekran TV fullscreen player v2
Site bundling uses latest `origin/main` at build time. The new TV player has D-pad channel switching, on-screen Back, pause, mute, fullscreen and a best-effort HLS 15-second latency target. Stream availability depends on licensing/provider. This build includes offline UI/catalog; playback still needs internet.

## Xorijiy kanallarni sinash
Ekran TV asosiy sayti barcha 1 461 ta kanal nomini saqlaydi. Ruxsatli M3U faylni import qilish uchun Telekanallar bo'limidan M3U yuklang; import faqat qurilmada vaqtincha ishlaydi va tokenlar GitHub'ga yuborilmaydi. Rasmiy HTTPS oqimlar tavsiya etiladi.
