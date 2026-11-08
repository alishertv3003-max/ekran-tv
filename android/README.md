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

## Minimalist player update
The APK now bundles the latest public main branch: automatic fullscreen on channel selection (when the device allows), icon-only controls, and controls hidden after 2 seconds. Buffering indicator remains visible while buffering. No 15-second target label.

## Fullscreen film player update
The latest main branch is bundled into the APK at build time. Native HTTPS MP4/HLS films support TV-remote ±5-second seeking, pause/play and Stop; cross-origin Fembed embeds cannot expose playback controls to the wrapper without provider API support. International-channel catalog remains 1,461 items with safe metadata only (HTTP token-bearing URLs withheld from public repository).

## IPTV catalog update (8 Nov 2026)
The app bundles current main site's new 20 Uzbekistan + 1461 foreign catalog entries. Previous UZ and Cinerama streams are removed. The user can import the supplied permitted M3U playlist into both catalogs locally. Source HTTP URLs are not included in public repo or APK; secure playback requires licensed HTTPS HLS or a properly secured provider integration.
