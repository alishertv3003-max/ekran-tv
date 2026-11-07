/* EKRAN TV — kinolar ro'yxati. Film uchun bitta Fembed havolasi (video) yetarli.
   Admin panel data/films.js faylini GitHub orqali yangilaydi.
   Faqat huquqingiz bor kontentni joylashtiring. */

window.SITE = {
  name: "Ekran TV",
  email: "info@ekrantv.uz",
  phone: "+998 71 000 00 00",
  heroFilmId: 90001         // Bosh sahifada katta ko'rsatiladigan kino (id)
};

window.FILMS = [
  { id: 90001, title: "Oilaviy video", genre: "Oilaviy", year: 2026, duration: 0, age: "0+", rating: 0, video: "https://fembed.co/embed/P3z_kD-G5puOo", poster: "",
    colors: ["#253047", "#7c5ca8", "#e6cfff"], description: "Oilaviy video (Fembed havolasi)." },
  /* --- Foydalanuvchi yuborgan Fembed kinolar --- */
  {"id":92002,"title":"Karib dengizi qaroqchilari 2","genre":"Sarguzasht","year":2006,"duration":0,"age":"12+","rating":null,"video":"https://fembed.co/embed/vV-VXqnc4h_ga","poster":"","colors":["#062c42","#136d77","#b5c6a3"],"description":"Fembed orqali ko‘rish uchun qo‘shilgan film. Havolaning mavjudligi va namoyish huquqlari tashqi xizmatga bog‘liq."},
  {"id":92003,"title":"Karib dengizi qaroqchilari 3","genre":"Sarguzasht","year":2007,"duration":0,"age":"12+","rating":null,"video":"https://fembed.co/embed/ECf-sQ_l0hfjK","poster":"","colors":["#0c2636","#2c5263","#d6bf8b"],"description":"Fembed orqali ko‘rish uchun qo‘shilgan film. Havolaning mavjudligi va namoyish huquqlari tashqi xizmatga bog‘liq."},
  {"id":92004,"title":"Karib dengizi qaroqchilari 4","genre":"Sarguzasht","year":2011,"duration":0,"age":"12+","rating":null,"video":"https://fembed.co/embed/uLd-i3Ojx_l3W","poster":"","colors":["#132b2f","#306554","#c6b178"],"description":"Fembed orqali ko‘rish uchun qo‘shilgan film. Havolaning mavjudligi va namoyish huquqlari tashqi xizmatga bog‘liq."},
  {"id":92005,"title":"Karib dengizi qaroqchilari 5","genre":"Sarguzasht","year":2017,"duration":0,"age":"12+","rating":null,"video":"https://fembed.co/embed/6_Em-wpQYBaqB","poster":"","colors":["#1b3047","#4f6a7a","#a49b8d"],"description":"Fembed orqali ko‘rish uchun qo‘shilgan film. Havolaning mavjudligi va namoyish huquqlari tashqi xizmatga bog‘liq."},
  {"id":92101,"title":"Transformerlar 1","genre":"Fantastika","year":2007,"duration":0,"age":"12+","rating":null,"video":"https://fembed.co/embed/eo-NnH1_wi5U7","poster":"","colors":["#151f3f","#3759a0","#9ecaf2"],"description":"Fembed orqali ko‘rish uchun qo‘shilgan film. Havolaning mavjudligi va namoyish huquqlari tashqi xizmatga bog‘liq."},
  {"id":92102,"title":"Transformerlar 2","genre":"Fantastika","year":2009,"duration":0,"age":"12+","rating":null,"video":"https://fembed.co/embed/so-E_VkgQKwWu","poster":"","colors":["#301f2d","#77506b","#d09fa3"],"description":"Fembed orqali ko‘rish uchun qo‘shilgan film. Havolaning mavjudligi va namoyish huquqlari tashqi xizmatga bog‘liq."},
  {"id":92103,"title":"Transformerlar 3","genre":"Fantastika","year":2011,"duration":0,"age":"12+","rating":null,"video":"https://fembed.co/embed/H4b_RDOIw-Itq","poster":"","colors":["#10263e","#1b6482","#aac9d7"],"description":"Fembed orqali ko‘rish uchun qo‘shilgan film. Havolaning mavjudligi va namoyish huquqlari tashqi xizmatga bog‘liq."},
  {"id":92104,"title":"Transformerlar 4","genre":"Fantastika","year":2014,"duration":0,"age":"12+","rating":null,"video":"https://fembed.co/embed/sV_6K-SuPCGT4","poster":"","colors":["#35232e","#7b4b4d","#dec09d"],"description":"Fembed orqali ko‘rish uchun qo‘shilgan film. Havolaning mavjudligi va namoyish huquqlari tashqi xizmatga bog‘liq."},
  {"id":92105,"title":"Transformerlar 5","genre":"Fantastika","year":2017,"duration":0,"age":"12+","rating":null,"video":"https://fembed.co/embed/3g-Sw_MuOehdX","poster":"","colors":["#262e4b","#61739c","#b7c2c6"],"description":"Fembed orqali ko‘rish uchun qo‘shilgan film. Havolaning mavjudligi va namoyish huquqlari tashqi xizmatga bog‘liq."},
  {"id":92106,"title":"Transformerlar 6","genre":"Fantastika","year":0,"duration":0,"age":"12+","rating":null,"video":"https://fembed.co/embed/HUb2CtC_m-Tpv","poster":"","colors":["#222c3c","#476f85","#aab9b4"],"description":"Fembed orqali ko‘rish uchun qo‘shilgan film. Havolaning mavjudligi va namoyish huquqlari tashqi xizmatga bog‘liq."},
  /* --- NAMUNA KINOLAR (video ulanmagan, "Tez orada" bo'lib turadi) --- */
  { id: 1, title: "Samarqand tunlari", genre: "Drama", year: 2025, duration: 118, age: "12+", rating: 8.4, poster: "", colors: ["#3a1c71", "#d76d77", "#ffaf7b"],
    description: "Eski shahar ko'chalarida adashgan yosh rassom bir kecha ichida o'z taqdirini o'zgartiradigan odamni uchratadi." },

  { id: 2, title: "Oxirgi poyezd", genre: "Triller", year: 2024, duration: 104, age: "16+", rating: 7.9, poster: "", colors: ["#0f2027", "#2c5364", "#7fd3ff"],
    description: "Toshkent–Nukus yo'nalishidagi tungi poyezdda yo'lovchilardan biri izsiz yo'qoladi. Tong otguncha haqiqatni topish kerak." },

  { id: 3, title: "Bobomning bog'i", genre: "Oilaviy", year: 2023, duration: 96, age: "0+", rating: 8.8, poster: "", colors: ["#134e2a", "#5f9e3b", "#f6e27a"],
    description: "Shahardan qishloqqa kelgan nevaralar bobosining bog'ini saqlab qolish uchun butun yozni birga o'tkazadi." },

  { id: 4, title: "Kumush ip", genre: "Melodrama", year: 2025, duration: 112, age: "12+", rating: 7.6, poster: "", colors: ["#2b1638", "#8e4a8a", "#e9c7e6"],
    description: "Marg'ilonlik ipakchi qiz va chet ellik dizayner o'rtasidagi muhabbat hikoyasi." },

  { id: 5, title: "Qum soati", genre: "Fantastika", year: 2026, duration: 127, age: "12+", rating: 8.1, poster: "", colors: ["#3d2a0f", "#c27a2c", "#ffd98a"],
    description: "Qizilqum cho'lida topilgan qadimiy qurilma vaqtni orqaga burishi mumkin. Lekin har bir burilishning o'z narxi bor." },

  { id: 6, title: "Tog'dagi qor", genre: "Drama", year: 2022, duration: 101, age: "6+", rating: 8.3, poster: "", colors: ["#1d2b4a", "#5a7bb5", "#e6f0ff"],
    description: "Chimyon etagidagi qishloq maktabiga kelgan yosh o'qituvchi va uning o'quvchilari haqida." },

  { id: 7, title: "Shamol ortidan", genre: "Sarguzasht", year: 2024, duration: 109, age: "6+", rating: 7.8, poster: "", colors: ["#0c3b3a", "#2a9d8f", "#e9f5b0"],
    description: "Ikki do'st eski mototsiklda Orol dengizi bo'yigacha sayohatga chiqadi." },

  { id: 8, title: "Ko'k gumbaz", genre: "Tarixiy", year: 2023, duration: 142, age: "12+", rating: 8.6, poster: "", colors: ["#0b1d51", "#1f6fb2", "#9be7ff"],
    description: "XV asr. Ulug'bek rasadxonasi qurilishi davridagi olimlar va ustalar hayoti." },

  { id: 9, title: "Yo'lovchi", genre: "Triller", year: 2026, duration: 98, age: "16+", rating: 7.4, poster: "", colors: ["#1a1a1a", "#7a1f2b", "#ff7a59"],
    description: "Taksi haydovchisi tunda olgan bitta yo'lovchi uni xavfli o'yinga tortadi." },

  { id: 10, title: "Sukunat", genre: "Drama", year: 2025, duration: 93, age: "16+", rating: 8.0, poster: "", colors: ["#232526", "#535a6b", "#d7dde8"],
    description: "Eshitish qobiliyatini yo'qotgan musiqachi musiqani yangidan his qilishni o'rganadi." },

  { id: 11, title: "Kulgi kafesi", genre: "Komediya", year: 2024, duration: 89, age: "6+", rating: 7.2, poster: "", colors: ["#4a1d0f", "#e2582b", "#ffe066"],
    description: "Bankrot bo'lish arafasidagi choyxonani saqlab qolish uchun egasi stend-ap kechalarini boshlaydi." },

  { id: 12, title: "Oy yo'li", genre: "Fantastika", year: 2025, duration: 115, age: "12+", rating: 7.7, poster: "", colors: ["#120c3a", "#4b3b9e", "#c0b5ff"],
    description: "O'zbek muhandisi qizi bilan birga birinchi xususiy oy missiyasiga tayyorlanadi." }
];
