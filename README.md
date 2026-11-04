# Ekran TV — yo'riqnoma

Bu papkada saytning barcha fayllari bor:

| Fayl | Nima uchun |
|---|---|
| `index.html` | Saytning asosiy sahifasi |
| `css/style.css` | Dizayn (ranglar, shriftlar) |
| `js/app.js` | Sayt dasturi (pleyer, efir, qidiruv) |
| `data/films.js` | **Kinolar va kanallar ro'yxati — asosan shu faylni o'zgartirasiz** |
| `posters/` | Kino posterlari uchun papka |
| `icons/` | Ilova ikonkalari |
| `manifest.webmanifest`, `sw.js` | Telefonga ilova sifatida o'rnatish uchun |

---

## 0. Eng oson yo'l: Boshqaruv paneli

`ekran-tv-panel.html` ni (yoki saytdagi `admin.html` ni) oching, GitHub tokeningiz bilan ulaning va kinolarni forma orqali qo'shing. Video havolasi sifatida quyidagilar ishlaydi:

- **YouTube** (Unlisted) havolasi
- **Bunny Stream** embed havolasi (`iframe.mediadelivery.net/embed/...`)
- **Vimeo** video havolasi
- **Har qanday bulutdagi ommaviy .mp4 fayl** havolasi (Cloudflare R2, Backblaze B2, o'z serveringiz)

Google Drive havolalari ishlamaydi. Quyidagi bo'limlar faylni qo'lda tahrirlash uchun.

## 1. Kinoni YouTube'ga yuklash

1. youtube.com → o'ng yuqoridagi **Yaratish → Video yuklash**.
2. Kinoni tanlang, nom va tavsif yozing.
3. **"Ko'rinishi" (Visibility)** bosqichida **"Ro'yxatda yo'q" (Unlisted)** ni tanlang. *Shaxsiy (Private) emas!*
4. "Batafsil" bo'limida **"Joylashtirishga ruxsat berish" (Allow embedding)** belgisi yoqilganini tekshiring.
5. Video havolasini nusxalang, masalan: `https://youtu.be/AbCdEf12345`.

## 2. Kinoni saytga qo'shish

`data/films.js` faylini oching. Har bir kino shunday blok:

```js
{ id: 13, title: "Kino nomi", genre: "Drama", year: 2026, duration: 110, age: "12+", rating: 8.0,
  youtube: "https://youtu.be/AbCdEf12345", poster: "posters/kino-nomi.jpg", colors: ["#1d2b4a", "#5a7bb5", "#e6f0ff"],
  description: "Kino haqida qisqa tavsif." },
```

- `id` — har bir kinoga yangi raqam bering.
- `duration` — **daqiqada** (1 soat 50 daq = 110). Efir jadvali shu raqam bo'yicha tuziladi, shuning uchun aniq yozing.
- `poster` — rasmni `posters/` papkasiga qo'yib, nomini yozing (vertikal rasm, masalan 600×900). Bo'sh qoldirsangiz (`""`), sayt o'zi rangli poster yasaydi.
- `youtube` bo'sh bo'lsa, kino "Tez orada" deb ko'rsatiladi.
- Namuna kinolarni o'chirib, o'zingiznikini qo'ying.

Bosh sahifadagi katta kino: faylning boshidagi `heroFilmId` raqami.

## 2.1. Hamkor telekanalni ulash

`data/films.js` faylining oxiridagi `LIVE_CHANNELS` bo'limiga kanalni qo'shing (namuna blok oldidagi `//` belgilarini o'chiring):

```js
{ id: "hamkor1", name: "Kanal nomi", number: 5, color: "#9b5de5", short: "H", logo: "",
  stream: "https://...../index.m3u8", youtube: "",
  description: "Kanal haqida qisqa ma'lumot." },
```

- `stream` — kanal egasi bergan efir havolasi (.m3u8). Yoki `youtube` — kanalning rasmiy YouTube jonli efiri.
- Havola **https://** bilan boshlanishi shart (http:// havolalar xavfsiz saytda ishlamaydi).
- Kanalning texnik xodimidan saytingiz manzili uchun **CORS ruxsatini** yoqishni so'rang, aks holda efir faqat iPhone'da ochilib, boshqa brauzerlarda ochilmasligi mumkin.
- Kanal bilan kelishuvni (ruxsat xati yoki shartnoma) yozma ravishda saqlab qo'ying.

## 3. Saytni internetga chiqarish (GitHub Pages, bepul)

1. **github.com** da ro'yxatdan o'ting.
2. O'ng yuqorida **+ → New repository**. Nomi: masalan `ekran-tv`. **Public** ni tanlang → **Create repository**.
3. Ochilgan sahifada **"uploading an existing file"** havolasini bosing.
4. Shu papkadagi **barcha fayl va papkalarni** sudrab tashlang (index.html, css, js, data, icons, posters, manifest.webmanifest, sw.js) → **Commit changes**.
5. Repository'da **Settings → Pages**. "Branch" da **main** va **/(root)** ni tanlang → **Save**.
6. 1–2 daqiqadan keyin sayt manzili chiqadi: `https://LOGININGIZ.github.io/ekran-tv/`.

Keyinchalik kino qo'shsangiz: GitHub'da `data/films.js` faylini oching → qalam belgisi (Edit) → o'zgartiring → **Commit changes**. Sayt 1–2 daqiqada yangilanadi.

## 4. O'z domeningizni ulash (masalan, ekrantv.uz)

1. Domenni .uz domen sotuvchisidan sotib oling.
2. Domen sozlamalarida (DNS) GitHub Pages uchun yozuvlar qo'shing (GitHub'ning "Managing a custom domain" yo'riqnomasidagi IP manzillar).
3. GitHub'da **Settings → Pages → Custom domain** ga domeningizni yozing va **Enforce HTTPS** ni yoqing.

## 5. Telefonga ilova sifatida o'rnatish

- **Android (Chrome):** saytni oching → "Ilovani o'rnatish" tugmasi yoki menyu → "Ilovani o'rnatish".
- **iPhone (Safari):** saytni oching → pastdagi "Ulashish" → "Bosh ekranga qo'shish".

## Muhim eslatmalar

- `data/films.js` ni o'zgartirganda vergul va qo'shtirnoqlarni o'chirib yubormang. Sayt bo'sh ochilsa, odatda sababi shu.
- Faylga katta o'zgartirish kiritsangiz, `sw.js` dagi `VERSION` ni oshiring (`ekran-v2`), shunda telefonlardagi eski nusxa yangilanadi.
- Saytning pastidagi email va telefon raqami — `data/films.js` boshidagi `SITE` bo'limida.
- Sayt sinovdan o'tkazilishi uchun brauzerda shunchaki `index.html` ni ochsangiz ham ishlaydi, lekin YouTube videolari va ilova o'rnatish faqat internetga joylangan saytda to'liq ishlaydi.
