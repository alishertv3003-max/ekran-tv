/* ================================================================
   EKRAN TV — KINOLAR VA KANALLAR RO'YXATI
   ----------------------------------------------------------------
   Yangi kino qo'shish uchun pastdagi FILMS ro'yxatiga bitta blok
   qo'shing (oxirgi blokdan nusxa olib, qiymatlarini o'zgartiring).

   Maydonlar:
     id          — takrorlanmaydigan raqam (1, 2, 3 ...)
     title       — kino nomi
     genre       — janr (masalan: "Drama", "Komediya")
     year        — chiqqan yili
     duration    — davomiyligi, DAQIQADA (masalan 1 soat 58 daq = 118)
     age         — yosh chegarasi: "0+", "6+", "12+", "16+", "18+"
     rating      — reyting, 10 ballik (masalan 8.4)
     youtube     — YouTube havolasi yoki video ID (Unlisted video).
                   Masalan: "https://youtu.be/AbCdEf12345"
                   Bo'sh qolsa, kino "Tez orada" deb chiqadi.
     poster      — poster rasmi yo'li (masalan "posters/samarqand.jpg").
                   Bo'sh qolsa, sayt ranglardan o'zi poster yasaydi.
     colors      — avtomatik poster ranglari [asosiy, ikkinchi, nur]
     description — qisqa tavsif (1–3 gap)

   Diqqat: har bir blokdan keyin vergul (,) qo'yishni unutmang.
   ================================================================ */

window.SITE = {
  name: "Ekran TV",
  email: "info@ekrantv.uz",
  phone: "+998 71 000 00 00",
  heroFilmId: 101         // Bosh sahifada katta ko'rsatiladigan kino (id)
};

window.FILMS = [
  /* --- SINOV KINOLARI: ochiq litsenziyali (Creative Commons) qisqa filmlar, Blender Foundation.
         O'z kinolaringizni qo'shgach, bularni o'chirib tashlashingiz mumkin. --- */
  { id: 101, title: "Big Buck Bunny", genre: "Animatsiya", year: 2008, duration: 10, age: "0+", rating: 8.2,
    youtube: "https://www.youtube.com/watch?v=aqz-KE-bpKQ", poster: "", colors: ["#1f4d1a", "#7bbf3f", "#fff2a8"],
    description: "Katta va mehribon quyon o'rmondagi uchta bezori kemiruvchidan o'ziga xos usulda o'ch oladi. © Blender Foundation, CC BY 3.0." },

  { id: 102, title: "Sintel", genre: "Animatsiya", year: 2010, duration: 15, age: "12+", rating: 8.0,
    youtube: "https://www.youtube.com/watch?v=eRsGyueVLvQ", poster: "", colors: ["#2a1a12", "#8c4a2f", "#ffcf8a"],
    description: "Yolg'iz qiz o'zi asrab olgan ajdarho bolasini qidirib, xavfli safarga chiqadi. © Blender Foundation, CC BY 3.0." },

  { id: 103, title: "Tears of Steel", genre: "Fantastika", year: 2012, duration: 12, age: "12+", rating: 7.1,
    youtube: "https://www.youtube.com/watch?v=R6MlUcmOul8", poster: "", colors: ["#0e1a24", "#2f5f7a", "#a8e1ff"],
    description: "Kelajakdagi Amsterdam. Bir guruh olimlar dunyoni robotlardan qutqarish uchun o'tmishdagi xatoni tuzatishga urinadi. © Blender Foundation, CC BY 3.0." },

  /* --- NAMUNA KINOLAR (video ulanmagan, "Tez orada" bo'lib turadi) --- */
  { id: 1, title: "Samarqand tunlari", genre: "Drama", year: 2025, duration: 118, age: "12+", rating: 8.4,
    youtube: "", poster: "", colors: ["#3a1c71", "#d76d77", "#ffaf7b"],
    description: "Eski shahar ko'chalarida adashgan yosh rassom bir kecha ichida o'z taqdirini o'zgartiradigan odamni uchratadi." },

  { id: 2, title: "Oxirgi poyezd", genre: "Triller", year: 2024, duration: 104, age: "16+", rating: 7.9,
    youtube: "", poster: "", colors: ["#0f2027", "#2c5364", "#7fd3ff"],
    description: "Toshkent–Nukus yo'nalishidagi tungi poyezdda yo'lovchilardan biri izsiz yo'qoladi. Tong otguncha haqiqatni topish kerak." },

  { id: 3, title: "Bobomning bog'i", genre: "Oilaviy", year: 2023, duration: 96, age: "0+", rating: 8.8,
    youtube: "", poster: "", colors: ["#134e2a", "#5f9e3b", "#f6e27a"],
    description: "Shahardan qishloqqa kelgan nevaralar bobosining bog'ini saqlab qolish uchun butun yozni birga o'tkazadi." },

  { id: 4, title: "Kumush ip", genre: "Melodrama", year: 2025, duration: 112, age: "12+", rating: 7.6,
    youtube: "", poster: "", colors: ["#2b1638", "#8e4a8a", "#e9c7e6"],
    description: "Marg'ilonlik ipakchi qiz va chet ellik dizayner o'rtasidagi muhabbat hikoyasi." },

  { id: 5, title: "Qum soati", genre: "Fantastika", year: 2026, duration: 127, age: "12+", rating: 8.1,
    youtube: "", poster: "", colors: ["#3d2a0f", "#c27a2c", "#ffd98a"],
    description: "Qizilqum cho'lida topilgan qadimiy qurilma vaqtni orqaga burishi mumkin. Lekin har bir burilishning o'z narxi bor." },

  { id: 6, title: "Tog'dagi qor", genre: "Drama", year: 2022, duration: 101, age: "6+", rating: 8.3,
    youtube: "", poster: "", colors: ["#1d2b4a", "#5a7bb5", "#e6f0ff"],
    description: "Chimyon etagidagi qishloq maktabiga kelgan yosh o'qituvchi va uning o'quvchilari haqida." },

  { id: 7, title: "Shamol ortidan", genre: "Sarguzasht", year: 2024, duration: 109, age: "6+", rating: 7.8,
    youtube: "", poster: "", colors: ["#0c3b3a", "#2a9d8f", "#e9f5b0"],
    description: "Ikki do'st eski mototsiklda Orol dengizi bo'yigacha sayohatga chiqadi." },

  { id: 8, title: "Ko'k gumbaz", genre: "Tarixiy", year: 2023, duration: 142, age: "12+", rating: 8.6,
    youtube: "", poster: "", colors: ["#0b1d51", "#1f6fb2", "#9be7ff"],
    description: "XV asr. Ulug'bek rasadxonasi qurilishi davridagi olimlar va ustalar hayoti." },

  { id: 9, title: "Yo'lovchi", genre: "Triller", year: 2026, duration: 98, age: "16+", rating: 7.4,
    youtube: "", poster: "", colors: ["#1a1a1a", "#7a1f2b", "#ff7a59"],
    description: "Taksi haydovchisi tunda olgan bitta yo'lovchi uni xavfli o'yinga tortadi." },

  { id: 10, title: "Sukunat", genre: "Drama", year: 2025, duration: 93, age: "16+", rating: 8.0,
    youtube: "", poster: "", colors: ["#232526", "#535a6b", "#d7dde8"],
    description: "Eshitish qobiliyatini yo'qotgan musiqachi musiqani yangidan his qilishni o'rganadi." },

  { id: 11, title: "Kulgi kafesi", genre: "Komediya", year: 2024, duration: 89, age: "6+", rating: 7.2,
    youtube: "", poster: "", colors: ["#4a1d0f", "#e2582b", "#ffe066"],
    description: "Bankrot bo'lish arafasidagi choyxonani saqlab qolish uchun egasi stend-ap kechalarini boshlaydi." },

  { id: 12, title: "Oy yo'li", genre: "Fantastika", year: 2025, duration: 115, age: "12+", rating: 7.7,
    youtube: "", poster: "", colors: ["#120c3a", "#4b3b9e", "#c0b5ff"],
    description: "O'zbek muhandisi qizi bilan birga birinchi xususiy oy missiyasiga tayyorlanadi." }
];

/* ================================================================
   TELEKANALLAR
   genres — kanalda qaysi janrdagi kinolar ko'rsatiladi.
            null bo'lsa, hamma kinolar ko'rsatiladi.
   color  — kanal rangi; short — logotipdagi harf.
   Efir har kuni soat 06:00 da boshlanadi va kinolar navbat bilan
   ketadi. Kinolar orasida "break" daqiqa tanaffus bo'ladi.
   ================================================================ */

window.CHANNELS = [
  { id: "ekran", name: "Ekran TV",    number: 1, color: "#f4b63f", short: "E", genres: null },
  { id: "kino",  name: "Ekran Kino",  number: 2, color: "#ff5a5f", short: "K", genres: ["Triller", "Fantastika", "Sarguzasht"] },
  { id: "oila",  name: "Ekran Oila",  number: 3, color: "#4fae5b", short: "O", genres: ["Oilaviy", "Komediya", "Drama", "Animatsiya"] },
  { id: "tarix", name: "Ekran Tarix", number: 4, color: "#3b8de0", short: "T", genres: ["Tarixiy", "Melodrama", "Drama"] }
];

window.SCHEDULE = { startHour: 6, breakMinutes: 12 };

/* ================================================================
   HAMKOR TELEKANALLAR (jonli efir)
   ----------------------------------------------------------------
   Faqat egasidan ruxsat olingan kanallarni qo'shing.
   Har bir kanal uchun ikkita usuldan BIRINI to'ldiring:

     stream  — kanal egasi bergan efir havolasi (.m3u8 bilan tugaydi).
               Muhim: havola "https://" bilan boshlanishi kerak, va
               kanal serveri saytingizga ruxsat bergan (CORS) bo'lishi
               kerak. Bu haqda kanalning texnik xodimidan so'rang.
     youtube — kanalning rasmiy YouTube jonli efiri havolasi
               (masalan "https://www.youtube.com/live/AbCdEf12345").

   logo    — logotip rasmi (masalan "icons/kanal-logo.png"), bo'sh
             bo'lsa, rangli harf ko'rsatiladi.
   Ro'yxat bo'sh bo'lsa, saytda "Hamkor kanallar" joyi ko'rinadi.
   ================================================================ */

window.LIVE_CHANNELS = [
  // SINOV: ochiq sinov efiri (Big Buck Bunny, CC BY). Haqiqiy hamkor kanal qo'shgach, o'chiring.
  { id: "sinov", name: "Sinov efiri", number: 9, color: "#9b5de5", short: "S", logo: "",
    stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", youtube: "",
    description: "Pleyerni tekshirish uchun ochiq sinov oqimi" },
  // { id: "hamkor1", name: "Kanal nomi", number: 5, color: "#9b5de5", short: "H", logo: "",
  //   stream: "https://...../index.m3u8", youtube: "",
  //   description: "Kanal haqida qisqa ma'lumot." },
];
