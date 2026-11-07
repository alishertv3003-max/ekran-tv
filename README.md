# Ekran TV — kino va telekanallar platformasi

## Nimalar tayyor

- Avvalgi Ekran TV dizayni, bosh sahifa va kino katalogi saqlangan.
- Film uchun **faqat Fembed** URL qabul qilinadi, masalan `https://fembed.co/embed/P3z_kD-G5puOo`. YouTube talab qilinmaydi.
- «Oilaviy video» kino ro'yxatida va bosh sahifada mavjud.
- «Telekanallar» katalogida taqdim etilgan `yosso.media.pl.m3u` faylidan **1461 ta xalqaro kanal** bor. Eski 20 ta O‘zbekiston kanali bu katalogdan chiqarildi.
- Kanal qidirish, kategoriyaga ajratish va «Yana kanallarni ko'rsatish» mavjud; yangi **167 ta HTTPS HLS yozuvi** esa mutlaqo alohida «O‘zbek kanallari» bo‘limida.
- Admin panel: `ekran-tv/admin.html` — kino qo'shish, tahrirlash, o'chirish, Fembed havolasi, poster, janr, M3U import va GitHub'ga chiqarish.
- To'liq saytni GitHub'ga joylash uchun `ekran-tv-tools/ekran-tv-panel.html` (alohida joylashgan HTML).

## Kompyuterda ishga tushirish

ZIP'ni oching. Terminalda `ekran-tv` papkasiga o'ting va:

```bash
python -m http.server 8000
```

Brauzerda `http://localhost:8000/` manzilini oching. Faylni to'g'ridan-to'g'ri bosib ham ko'rish mumkin, lekin ayrim brauzer funksiyalari localhost serverida yaxshiroq ishlaydi.

## GitHub Pages'ga joylash

`ekran-tv` papkasining **ichidagi** fayllarni repository'ning root (asosiy) qismiga yuklang. `index.html`, `admin.html`, `data/channels.js`, `data/uz_channels.js`, `data/films.js`, `css/style.css`, `js/app.js` va boshqa fayllar root'dagi tegishli joylarda bo'lishi kerak. Yoki `ekran-tv-tools/ekran-tv-panel.html` orqali GitHub token yordamida o'rnatishni bajaring. Tokenni faqat ishonchli kompyuterda kiriting va hech kimga yubormang. Ish tugagach tokenni o'chiring.

**ZIP faylni to'g'ridan-to'g'ri GitHub'ga bitta fayl sifatida yuklash saytni yangilamaydi**; uning ichidagi fayllarni joylash kerak.

## IPTV cheklovi (MUHIM)

Xalqaro ro‘yxatdagi 1461 ta efir manzili `http://cdn.balelbrus.com/...` orqali ishlaydi; `https://` manzil yo'q. GitHub Pages'dagi HTTPS sayt HTTP oqimlarni bloklaydi (mixed content). Shu sababli katalog ko'rinadi, ammo ko'p/sinovdagi **barcha** efirlar ishlamaydi. Kanal provayderidan haqiqiy HTTPS HLS manzillarini va CORS/joylashtirish ruxsatini so'rang. HTTP manzilini matnda HTTPS'ga almashtirish etarli emas.

**Maxfiylik:** M3U manzillari `token=` parametrlarini o'z ichiga oladi. `data/channels.js` faylini ochiq GitHub'ga qo'ysangiz, ular ommaga oshkor bo'ladi. Ommaga e'lon qilishdan oldin kontentni tarqatishga ruxsatingiz borligini va bu tokenlarni oshkor qilish xavfsizligini tekshiring; kerak bo'lsa provayder bilan HTTPS va serverli integratsiya o'rnating.

Ekran TV 10 ming bir vaqtdagi tomoshabinni ko'tarishi tekshirilmagan: bu stream provayderi va CDN'ga bog'liq. Fembed iframe ham hosting ruxsatiga bog'liq; kod havola haqiqatan ochilishini kafolatlamaydi.

## Admin panel imkoniyatlari

- Kirilgan ma'lumotlar GitHub'ga bevosita yozilishi uchun `GitHub ulanish` bo'limida fine-grained token kiriting.
- GitHub'ga ulanmasangiz `films.js` yoki `channels.js` ni admin panel orqali **eksport** qilib, qo'lda repo'ga joylang.
- Poster rasmlari admin paneldan tanlanganda, GitHub'ga ulangan bo'lsangiz, `posters/` papkasiga yuklanadi.
- GitHub token admin panel sessiyasida saqlanadi; **tokenni sayt kodiga joylashtirmang**, panelni umumiy kompyuterda ishlatmang.
- Kanal katalogini yangilash uchun admin panelning «Telekanallar» qismida yangi M3U fayl yuklang. Keyin `Telekanallarni GitHub'ga chiqarish` ni bosing yoki faylni eksport qiling.

## Izoh

Kino bo'limida bir nechta avvalgi namuna kinolar «Tez orada» sifatida qoldirilgan, chunki ularning videosi ulanmagan. Ularni admin orqali olib tashlashingiz mumkin.

## O‘zbek kanallari (yangi)

- `data/uz_channels.js` — `UZ.m3u` faylidan ajratilgan 167 HTTPS HLS manzil (HD/SD variantlar bilan).
- `data/channels.js` — O‘zbekiston kanallarisiz 1461 ta xalqaro kanal.
- O‘zbek kanallari «Telekanallar»ning umumiy katalogi yoki filtrida chiqmaydi.
- Admin paneldagi alohida «O‘zbek kanallari» tabida yangi M3U import/eksport va GitHub’ga nashr mavjud.
- Eski M3U HTTP manbalari HTTPS saytga bevosita ulanmaydi; video xizmatlarining ishlashi tekshirilmagan.

## 2026-11-07: Yangi UZ.m3u (HD/SD)

- Eski 34 ta kanal ro‘yxati butunlay almashtirildi.
- Yangi M3U ichida 360 yozuv bor, ularning 10 tasi NEXO mp4/audio va boshqa xorijiy oqimlar ham mavjud.
- Faqat O‘zbekiston kanaliga oid HTTPS + .m3u8 havolalar, aniq takroriy URLlar chiqarilgach, 167 ta manzil ajratildi. HTTP oqimlar GitHub HTTPS sahifasida bloklanishi sababli kiritilmadi.
- Bir kanal HD va SD sifatida kelgan bo‘lsa, katalogda ikki alohida variant ko‘rinadi. Sifat yorlig‘i manba nomidan olingan; real piksel o‘lchami tasdiqlanmagan.
- **BU NOMZOD RO‘YXAT**. Model ishlayotgan internetga ega emasligi sababli IPTV serveriga ulanib, jonli efirlarni to‘liq tekshira olmadi. Kanal nomining borligi efir ishlashini anglatmaydi.
- Tekshirish uchun arxivning `kanal-tekshiruv/tekshir_uz.py` skriptini internetga ulangan kompyuteringizda ishga tushiring; keyin `--apply` bilan ishlamagan kanal URLlarini olib tashlangan yangi `uz_channels.js` yarating. Ma'lumotlar ommaviy GitHub'ga joylanishidan oldin provayderdan huquqlar oling.
- **CORS**: serverdan tekshiruv muvaffaqiyatli o‘tgan bo‘lsa ham, brauzerda CORS yoki geografik cheklov tufayli bloklanishi mumkin.

## 2026-11-07 — Yangi filmlar va telekanallar

- Foydalanuvchi bergan 10 ta Fembed video: Karib dengizi qaroqchilari 2–5 (4 ta), Transformerlar 1–6 (6 ta), oilaviy video saqlangan. Faqat kino nomi va URL tasdiqlangan, videoning mazmuni/ishlashi tekshirilmagan.
- Kinolar boshlang‘ich saralashda video havolasi mavjud bo‘lganlari birinchi chiqadi. Transformerlar 6 ning aniq chiqarilgan yili ko‘rsatilmagan.
- O‘zbek kanallari UZ.m3u asosida oldingi versiyada yangilangan: 167 ta HTTPS/HLS nomzodi, xalqaro katalog alohida saqlanadi. Oqimlar tarmoqdan tekshirilmagan.
- `kanal-tekshiruv/tekshir_uz.py` internetli Windows/kompyuterda playlist va video segment mavjudligini tekshiradi. `--apply` natijada faqat muvaffaqiyatli URLlarni alohida .js faylga chiqaradi. Bu brauzerdagi CORS, HD/SD sifati yoki kontent litsenziyasini tekshirmaydi.
- Fembed yoki telekanal havolalarining mavjudligi ularni ommaga namoyish qilish huquqini bermaydi.


### Ochiq GitHub va IPTV xavfsizligi
`data/channels.js` ichida 1461 ta kanal metama'lumoti mavjud, ammo original
M3U manbasining tokenli HTTP URLlari bu PUBLIC repozitoriydan chiqarilgan.
Shu sababli xalqaro kanallar ro'yxati ko'rinadi, efiri hozircha ochilmaydi.
167 ta O'zbek kanali uchun HTTPS URLlar saqlangan. Jonli efir ishlashi
server va namoyish huquqlariga bog'liq, onlayn ishlashi tasdiqlanmagan.

Bu repozitoriyda video kontent yoki maxfiy IPTV tokenlarini saqlamang.