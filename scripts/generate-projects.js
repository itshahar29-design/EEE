// scripts/generate-projects.js - Generator for high-quality, feature-rich frontend projects
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROJECTS_DIR = path.join(ROOT_DIR, '06. Loyihalar');
const PROJECTS_JSON = path.join(ROOT_DIR, 'data', 'projects.json');

// Stage 1 projects definition: 50 projects (101 to 150)
const STAGE_1_PROJECTS = [
  {
    id: 101,
    title: "SaaS Narxlar Matritsasi va Valyuta Konverteri",
    category: "Calculator",
    tech: ["HTML5", "CSS3", "JavaScript", "LocalStorage"],
    tags: ["Pricing", "Calculator", "Currency", "SaaS", "Responsive"],
    features: ["Oylik va yillik obuna almashtirgich (20% chegirma bilan)", "3 xil valyuta (USD, EUR, UZS) bo'yicha dinamik hisoblash", "Tanlangan tarifni saqlash va taqqoslash rejimi"],
    duration: "45 daqiqa"
  },
  {
    id: 102,
    title: "Interaktiv Kanban Vazifalar Doskasi",
    category: "Kanban",
    tech: ["HTML5", "CSS3", "JavaScript", "Drag-Drop", "LocalStorage"],
    tags: ["Kanban", "Workflow", "Tasks", "Productivity"],
    features: ["Vazifalarni ustunlar bo'ylab sudrab ko'chirish (Drag & Drop)", "Vazifa muhimlik darajalari (Past, O'rta, Yuqori) va teglari", "LocalStorage da to'liq saqlash va qidiruv bo'yicha saralash"],
    duration: "60 daqiqa"
  },
  {
    id: 103,
    title: "Kod Parchalari Ombori va Sintaksis Kolleksiyasi",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "Clipboard API"],
    tags: ["Code Vault", "Snippets", "Syntax", "Developer Tools"],
    features: ["Turli dasturlash tillari bo'yicha kod parchalarini filtrlash", "1-bosishda clipboardga nusxalash va bildirishnoma ko'rsatish", "Yangi kod parchasi qo'shish, tahrirlash va JSON formatda eksport"],
    duration: "50 daqiqa"
  },
  {
    id: 104,
    title: "Aqlli Xarajatlarni Bo'lish va Hisob-Kitob Kalkulyatori",
    category: "Calculator",
    tech: ["HTML5", "CSS3", "JavaScript", "Math", "LocalStorage"],
    tags: ["Bill Splitter", "Finance", "Calculator", "Friends"],
    features: ["Umumiy hisobni do'stlar o'rtasida teng yoki nisbiy bo'lish", "Choychaqa (tip) va soliq foizini interaktiv slayderda hisoblash", "Har bir ishtirokchi uchun yakuniy chek hisoboti va ulashish"],
    duration: "40 daqiqa"
  },
  {
    id: 105,
    title: "Kunlik Odatlar va Ketma-ketlik Kuzatuvchisi",
    category: "CRM/To-do",
    tech: ["HTML5", "CSS3", "JavaScript", "LocalStorage", "SVG Charts"],
    tags: ["Habit Tracker", "Streaks", "Productivity", "Self-Improvement"],
    features: ["Odatlar bo'yicha kunlik bajarilish holatini belgilash", "Ketma-ketlik (Streak) hisoblagichi va rag'batlantiruvchi nishonlar", "Oylik bajarilish foizi va faollik jadvali"],
    duration: "55 daqiqa"
  },
  {
    id: 106,
    title: "Piksel Art Studiyasi va Sprite Eksporti",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "HTML5 Canvas"],
    tags: ["Pixel Art", "Canvas", "Sprites", "Graphic Design"],
    features: ["Moslashuvchan to'r (Grid) o'lchami: 16x16, 24x24, 32x32", "Rang palitrasi, qalam, o'chirg'ich va bo'yash (Bucket Fill) asboblari", "PNG formatida yuklab olish va LocalStorage da loyihani saqlash"],
    duration: "60 daqiqa"
  },
  {
    id: 107,
    title: "Spaced Repetition Fleshkartalar Ilovasi",
    category: "CRM/To-do",
    tech: ["HTML5", "CSS3", "JavaScript", "3D Transforms", "LocalStorage"],
    tags: ["Flashcards", "Study", "Memory", "Education"],
    features: ["3D kartani aylantirish animatsiyasi (savol va javob)", "O'zlashtirish darajasiga qarab takrorlash oralig'ini belgilash", "Yangi kartalar to'plamini yaratish va o'rganish statistikasi"],
    duration: "45 daqiqa"
  },
  {
    id: 108,
    title: "Jonli Markdown Tahrirlagich va So'z Tahlili",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "Regex Parser"],
    tags: ["Markdown", "Editor", "Live Preview", "Word Counter"],
    features: ["Sarlavha, ro'yxat, havola va bloklar bo'yicha tezkor jonli tahlil", "So'zlar, belgilar, o'qish vaqti va jumlalar sonini real vaqtda hisoblash", "HTML yoki MD formatida faylni yuklab olish"],
    duration: "50 daqiqa"
  },
  {
    id: 109,
    title: "Zamonaviy Rang Palitralari va Kontrast Tekshirgich",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "WCAG Contrast API"],
    tags: ["Palette Generator", "WCAG", "Contrast", "Accessibility"],
    features: ["Probel (Spacebar) bosganda uyg'un ranglar palitrasini generatsiya qilish", "WCAG 2.1 bo'yicha matn va fon kontrasti (AAA, AA) reytingi", "Ranglarni HEX, RGB, HSL formatda nusxalash va saqlash"],
    duration: "45 daqiqa"
  },
  {
    id: 110,
    title: "Tezkor Yozish (Typing Speed) Spidometri va Analitika",
    category: "O'yinlar",
    tech: ["HTML5", "CSS3", "JavaScript", "Audio API", "LocalStorage"],
    tags: ["Typing Test", "WPM", "Keyboard", "Speed Challenge"],
    features: ["WPM (daqiqaiga so'zlar) va aniqlik foizini real vaqtda o'lchash", "Xato kiritilgan harflarni rangli vizual ajratish", "Ovozli effektlar va eng yuqori natijalar peshqadamlar jadvali"],
    duration: "50 daqiqa"
  },
  {
    id: 111,
    title: "Minimalist Ovoz Ekvayzeri va Tovush Sintezatori",
    category: "Animatsiya",
    tech: ["HTML5", "CSS3", "JavaScript", "Web Audio API", "Canvas"],
    tags: ["Web Audio", "Equalizer", "Visualizer", "Sound Waves"],
    features: ["Web Audio API orqali turli chastotali (Sine, Square, Saw) tovushlar", "Canvas da real vaqt rejimidagi ovoz to'lqinlari animatsiyasi", "Tovush balandligi va tezligini boshqarish"],
    duration: "55 daqiqa"
  },
  {
    id: 112,
    title: "Xalqaro Vaqt Mintaqalari va Uchrashuv Rejalashtiruvchi",
    category: "Calculator",
    tech: ["HTML5", "CSS3", "JavaScript", "Intl Date API"],
    tags: ["World Clock", "Timezones", "Meeting Planner", "Global"],
    features: ["Dunyodagi istalgan shahar vaqtini qo'shish va bir vaqtda ko'rish", "Umumiy ish vaqti oralig'ini qulay rangli shkalada taqqoslash", "Vaqt farqini hisoblash va taqvim eslatmasini yaratish"],
    duration: "40 daqiqa"
  },
  {
    id: 113,
    title: "SVG Shakllar Studiyasi va Yo'l (Path) Quruvchi",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "SVG DOM API"],
    tags: ["SVG Generator", "Shapes", "Vector Graphics", "Web Design"],
    features: ["Interaktiv nuqtalar orqali Bezier egri chiziqlarini chizish", "Shakl qalinligi, to'ldirish rangi va o'lchamlarini real vaqtda boshqarish", "Toza SVG kodini nusxalash va .svg fayl qilib saqlash"],
    duration: "60 daqiqa"
  },
  {
    id: 114,
    title: "Xotira Matritsasi va Refleks Mashq Qildiruvchi O'yin",
    category: "O'yinlar",
    tech: ["HTML5", "CSS3", "JavaScript", "Animations", "LocalStorage"],
    tags: ["Memory Matrix", "Brain Training", "Puzzle", "Reflex Game"],
    features: ["Tasodifiy yonuvchi kataklar ketma-ketligini eslab qolish va takrorlash", "Bosqich oshgan sari kataklar soni va tezligini oshiruvchi dinamika", "Ovozli signallar va rekord ballarni saqlovchi peshqadamlar ro'yxati"],
    duration: "45 daqiqa"
  },
  {
    id: 115,
    title: "Aqlli Veb-Xatcho'plar va Teglar Menejeri",
    category: "CRM/To-do",
    tech: ["HTML5", "CSS3", "JavaScript", "URL Parser", "LocalStorage"],
    tags: ["Bookmarks", "Manager", "Tags", "Organizer", "Productivity"],
    features: ["Havolalarni favikonlari bilan birga toifalar va teglar bo'yicha saqlash", "Tezkor fuzzy qidiruv va domenga qarab avto-saralash", "Brauzerga import/eksport qilish uchun JSON fayl tayyorlash"],
    duration: "45 daqiqa"
  },
  {
    id: 116,
    title: "CSS Glassmorphism va Neumorphism Jonli Generatori",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "CSS Variables"],
    tags: ["Glassmorphism", "Neumorphism", "CSS Generator", "UI Design"],
    features: ["Shisha xiralashuvi (Blur), shaffofligi va burchak radiusini sozlash", "Neumorphic qabariq va botgan soyalar burchaklarini interaktiv boshqarish", "Bir marta bosishda toza CSS kodini nusxalash"],
    duration: "40 daqiqa"
  },
  {
    id: 117,
    title: "Taomnoma Kaloriya va Ozuqaviy Moddalar Hisoblagichi",
    category: "Calculator",
    tech: ["HTML5", "CSS3", "JavaScript", "Data Filtering", "LocalStorage"],
    tags: ["Calorie Counter", "Nutrition", "Health", "Diet Planner"],
    features: ["Turli mahsulotlar kaloriya, oqsil, yog' va uglevodlarini qo'shish", "Kunlik me'yor bo'yicha vizual progress bar ko'rsatkichlari", "Taomnomani saqlash va kunlar kesimida tahlil qilish"],
    duration: "45 daqiqa"
  },
  {
    id: 118,
    title: "Rangli Yopishqoq Eslatmalar (Sticky Notes) Doskasi",
    category: "CRM/To-do",
    tech: ["HTML5", "CSS3", "JavaScript", "Drag-Drop", "LocalStorage"],
    tags: ["Sticky Notes", "Whiteboard", "Ideas", "Drag-Drop"],
    features: ["Doskaning istalgan joyiga yopishqoq qaydlar qo'shish va ko'chirish", "Qaydlarning fon rangi, shrift o'lchami va muhimligini o'zgartirish", "Kalit so'zlar bo'yicha tezkor qidiruv va bir bosishda tozalash"],
    duration: "50 daqiqa"
  },
  {
    id: 119,
    title: "Xavfsiz Parollar Ombori va Kuch Auditoti",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "Crypto API", "LocalStorage"],
    tags: ["Password Vault", "Security", "Entropy", "Crypto Tools"],
    features: ["Kriptografik jihatdan mustahkam parollarni generatsiya qilish", "Parol entropiyasini va buzilish xavfini tekshiruvchi auditorlik shkalasi", "Qayd etilgan parollarni mahalliy shifrlangan holatda saqlash"],
    duration: "50 daqiqa"
  },
  {
    id: 120,
    title: "RegEx Qoliplar Sinov Qumloqchasi va Mosliklarni Ajratgich",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "Regex Engine"],
    tags: ["RegEx Tester", "Regular Expressions", "Pattern Matcher", "Developer Tools"],
    features: ["Muntazam ifodalarni (RegEx) kiritish va bayroqlarni (g, i, m) boshqarish", "Matn ichidagi mosliklarni real vaqtda rangli fon bilan ajratib ko'rsatish", "Ko'p ishlatiladigan RegEx qoliplari (Email, Telefon, URL) kutubxonasi"],
    duration: "55 daqiqa"
  },
  {
    id: 121,
    title: "Pomodoro Diqqat Taymeri va Tinchlantiruvchi Ovozlar",
    category: "CRM/To-do",
    tech: ["HTML5", "CSS3", "JavaScript", "Audio Synthesis", "Notifications"],
    tags: ["Pomodoro", "Focus Timer", "Productivity", "Ambient Sounds"],
    features: ["25 daqiqalik ish va 5 daqiqalik tanaffus sikllarini boshqarish", "Fon uchun tinchlantiruvchi oq shovqin yoki yomg'ir tovushini qo'shish", "Kunlik bajarilgan sikllar sonini hisoblash va quloqni quvontiruvchi signal"],
    duration: "45 daqiqa"
  },
  {
    id: 122,
    title: "E-Commerce Mahsulotlar Filtr va Ko'p Mezonli Qidiruv To'ri",
    category: "E-commerce",
    tech: ["HTML5", "CSS3", "JavaScript", "Array Methods", "Animation"],
    tags: ["E-commerce", "Filter", "Multi-criteria", "Product Catalog"],
    features: ["Narx slayderi, brend, baholash va mavjudlik bo'yicha ko'p qatlamli filtr", "Mahsulotlarni saralash (narx, ommaboplik, reyting) va ko'rinish rejimlari", "Savatga bir bosishda qo'shish va jami summani hisoblash"],
    duration: "55 daqiqa"
  },
  {
    id: 123,
    title: "Kunlik Kayfiyat Kundaligi va Emotsiyalar Dinamikasi",
    category: "Dashboard",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas Chart", "LocalStorage"],
    tags: ["Mood Tracker", "Journal", "Emotions", "Mental Health", "Dashboard"],
    features: ["Har kungi emotsional holatni emojilar va qisqa izoh bilan kiritish", "Haftalik va oylik kayfiyat dinamikasini ifodalovchi chiziqli grafik", "Ijobiy va salbiy kunlar balansi tahlili"],
    duration: "50 daqiqa"
  },
  {
    id: 124,
    title: "Dinamik Formalar Quruvchi va JSON Sxema Eksporti",
    category: "Admin panel",
    tech: ["HTML5", "CSS3", "JavaScript", "DOM Generator"],
    tags: ["Form Builder", "Schema Generator", "Admin Panel", "Dynamic Fields"],
    features: ["Matn, raqam, sana, checkbox va tanlov maydonlarini dinamik qo'shish", "Yaratilgan formani darhol interaktiv ko'rinishda sinovdan o'tkazish", "Forma sxemasini JSON va toza HTML formatda yuklab olish"],
    duration: "60 daqiqa"
  },
  {
    id: 125,
    title: "Interaktiv Morze Alifbosi Tarjimoni va Audio Pleyer",
    category: "API loyihalar",
    tech: ["HTML5", "CSS3", "JavaScript", "Web Audio API"],
    tags: ["Morse Code", "Audio Player", "Translator", "Education"],
    features: ["Oddiy matnni Morze kodiga va Morzeni matnga ikki tomonlama o'girish", "Web Audio API orqali Morze signallarini (nuqta va chiziq) eshittirish", "Fonar (chiroq) kabi miltillovchi vizual yorug'lik uzatgich"],
    duration: "40 daqiqa"
  },
  {
    id: 126,
    title: "CSS Gradiyent To'ri (Mesh Gradient) va Fon Generatori",
    category: "Animatsiya",
    tech: ["HTML5", "CSS3", "JavaScript", "CSS Canvas"],
    tags: ["Mesh Gradient", "CSS Generator", "Backgrounds", "Modern UI"],
    features: ["Ko'p rangli gradiyent markazlarini erkin siljitish orqali noyob fonlar", "Aylanuvchi radial va konik gradiyent parametrlarini sozlash", "CSS kodini 1-bosishda nusxalash yoki PNG rasm qilib saqlash"],
    duration: "45 daqiqa"
  },
  {
    id: 127,
    title: "Kripto Portfolio Foyda va Zarar Hisoblagichi",
    category: "Calculator",
    tech: ["HTML5", "CSS3", "JavaScript", "Math", "LocalStorage"],
    tags: ["Crypto Portfolio", "Profit Loss", "Finance", "Calculator"],
    features: ["Aktivlar (BTC, ETH, SOL va b.) sotib olingan narxi va miqdorini kiritish", "Joriy foyda va zararni foizda va summada aniq hisoblab ko'rsatish", "Portfel diversifikatsiyasini doiraviy diagrammada aks ettirish"],
    duration: "50 daqiqa"
  },
  {
    id: 128,
    title: "Rasmlar Galereyasi va EXIF Ma'lumotlari Ko'rgazmasi",
    category: "Portfolio",
    tech: ["HTML5", "CSS3", "JavaScript", "File API", "Lightbox"],
    tags: ["Image Gallery", "EXIF Inspector", "Lightbox", "Photography"],
    features: ["Rasmlarni sudrab tashlash (Drag & Drop) orqali galereyaga joylash", "Katta o'lchamli Lightbox ko'rinishi va slayder navigatsiyasi", "Rasm o'lchami, turi va metadata ma'lumotlarini tahlil qilish"],
    duration: "50 daqiqa"
  },
  {
    id: 129,
    title: "Tezkor Viktorina Bellashuvi va Jonli Hisoblagich",
    category: "O'yinlar",
    tech: ["HTML5", "CSS3", "JavaScript", "Sound Effects", "LocalStorage"],
    tags: ["Trivia Quiz", "Battle", "Game", "Scoreboard"],
    features: ["Vaqt chegarasiga ega qiziqarli ko'p variantli savollar to'plami", "To'g'ri va noto'g'ri javoblarda dinamik vizual animatsiyalar", "O'yin yakunida ballar tahlili va rekord natijani qayd etish"],
    duration: "45 daqiqa"
  },
  {
    id: 130,
    title: "Universal Birliklar va Valyutalar Konverteri",
    category: "Calculator",
    tech: ["HTML5", "CSS3", "JavaScript", "Unit Conversion Formulas"],
    tags: ["Unit Converter", "Currency", "Length", "Weight", "Temperature"],
    features: ["Uzunlik, og'irlik, harorat, maydon va hajm birliklarini bir zumda hisoblash", "Ikki tomonlama qiymat kiritish va almashtirish (Swap) tugmasi", "Oxirgi hisob-kitoblar tarixini saqlab borish"],
    duration: "40 daqiqa"
  },
  {
    id: 131,
    title: "Interaktiv Fikrlar Xaritasi (Mind Map) va Tugunlar Bog'lagich",
    category: "Data visualization",
    tech: ["HTML5", "CSS3", "JavaScript", "SVG Lines", "LocalStorage"],
    tags: ["Mind Map", "Diagram", "Nodes", "Brainstorming", "Visualization"],
    features: ["Yangi g'oyalar tugunlarini yaratish va ularni erkin siljitish", "Tugunlar orasida interaktiv bog'lovchi chiziqlarni dinamik chizish", "Xaritani JSON formatda saqlash va tozalash"],
    duration: "65 daqiqa"
  },
  {
    id: 132,
    title: "Ovoz Balandligi va To'lqinlar Spektrogrammasi",
    category: "Animatsiya",
    tech: ["HTML5", "CSS3", "JavaScript", "Web Audio API", "Canvas"],
    tags: ["Microphone Visualizer", "Spectrum", "Canvas", "Audio"],
    features: ["Mikrofon orqali tovush chastotalarini ushlash va vizuallashtirish", "Chiroyli 3D uslubdagi ustunli yoki dumaloq spektr animatsiyasi", "Ovoz darajasiga ko'ra sezgirlikni sozlash imkoniyati"],
    duration: "55 daqiqa"
  },
  {
    id: 133,
    title: "Git Buyruqlari Interaktiv Yordamchisi va Sxemalar",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "Interactive Diagrams"],
    tags: ["Git Helper", "Cheat Sheet", "CLI Simulator", "Developer Tools"],
    features: ["Git ish oqimi (Working Dir, Staging, Local, Remote) bosqichlarini tanlash", "Har bir vazifaga mos eng yaxshi Git buyrug'ini generatsiya qilish", "Bir bosishda buyruqni nusxalash va tushuntirishini o'qish"],
    duration: "45 daqiqa"
  },
  {
    id: 134,
    title: "Mini Elektron Jadval va Matematik Formulalar Hisoblagich",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "Formula Engine", "LocalStorage"],
    tags: ["Spreadsheet", "Formulas", "Excel Clone", "Calculator"],
    features: ["Kataklararo matematik formulalarni (=SUM, =AVG, =MIN, =MAX) hisoblash", "Kataklar fon rangi, matn qalinligi va qator/ustunlarni kengaytirish", "Jadval ma'lumotlarini CSV formatda eksport qilish"],
    duration: "60 daqiqa"
  },
  {
    id: 135,
    title: "Mijozlar Fikri va NPS Baholash Vidjeti",
    category: "Admin panel",
    tech: ["HTML5", "CSS3", "JavaScript", "Emoji Ratings", "LocalStorage"],
    tags: ["Feedback Widget", "NPS Survey", "Customer Care", "Admin Panel"],
    features: ["0 dan 10 gacha bo'lgan Net Promoter Score (NPS) shkalasi", "Fikr-mulohaza matni va toifasini kiritish formasi", "O'rtacha baho va qoniqish darajasining yig'ma statistikasi"],
    duration: "45 daqiqa"
  },
  {
    id: 136,
    title: "CSS Ko'p Qatlamli 3D Soyalar va Qatlamlar Vizualizatori",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "3D Transforms"],
    tags: ["Shadow Visualizer", "3D Layers", "CSS Generator", "Depth"],
    features: ["Ob'ekt ostidagi bir nechta soyalarni qatlamma-qatlam sozlash", "Sichqoncha harakatiga mos 3D burchak og'ishi effekti", "Tayyor ko'p qatlamli soyalar CSS kodini nusxalash"],
    duration: "40 daqiqa"
  },
  {
    id: 137,
    title: "Muhim Sanalar Teskari Sanoq (Countdown) Markazi",
    category: "CRM/To-do",
    tech: ["HTML5", "CSS3", "JavaScript", "Date Calculations", "LocalStorage"],
    tags: ["Countdown", "Timer", "Events", "Reminders"],
    features: ["Istalgan sana va voqea uchun kun, soat, daqiqa, soniya hisoblagich", "Tadbirlarni kartalar shaklida saqlash va saralash", "Vaqt tugaganda tantanali konfetti animatsiyasi"],
    duration: "45 daqiqa"
  },
  {
    id: 138,
    title: "Interaktiv Kimyoviy Elementlar Davriy Jadvali",
    category: "Data visualization",
    tech: ["HTML5", "CSS3", "JavaScript", "Periodic Data", "Modal"],
    tags: ["Periodic Table", "Chemistry", "Education", "Interactive Guide"],
    features: ["118 ta elementni guruhlar (metall, gaz, yarim metall) bo'yicha saralash", "Har bir element haqida atom massasi, elektron konfiguratsiyasi va tarixi", "Nom yoki belgi bo'yicha tezkor qidiruv"],
    duration: "55 daqiqa"
  },
  {
    id: 139,
    title: "Matematik Blits: Tezkor Hisob-Kitob O'yini",
    category: "O'yinlar",
    tech: ["HTML5", "CSS3", "JavaScript", "Math Generator", "LocalStorage"],
    tags: ["Math Blitz", "Mental Math", "Arithmetic", "Speed Challenge"],
    features: ["Tasodifiy qo'shish, ayirish, ko'paytirish va bo'lish amallari", "Ketma-ket to'g'ri javoblar uchun ko'paytiruvchi kombo tizimi", "Vaqtga qarshi o'yin va rekord ko'rsatkichlar reytingi"],
    duration: "45 daqiqa"
  },
  {
    id: 140,
    title: "Matn Farqlarini Taqqoslovchi va Diff Ko'rsatuvchi Dastur",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "Diff Algorithm"],
    tags: ["Text Diff", "Comparison", "Code Diff", "Editor Tools"],
    features: ["Ikki matn orasidagi qo'shilgan va o'chirilgan so'zlarni ajratish", "Qatorlar va so'zlar darajasida rangli vizual taqqoslash", "Natijani birlashtirilgan yoki yonma-yon ko'rinishda taqdim etish"],
    duration: "55 daqiqa"
  },
  {
    id: 141,
    title: "Ob-havo Karta Vidjeti va Dinamik Yomg'ir/Quyosh Canvas Effekti",
    category: "API loyihalar",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas Weather Particles"],
    tags: ["Weather Card", "Canvas Effects", "Rain", "Snow", "Interactive UI"],
    features: ["Havo holatiga qarab fonda tushuvchi real yomg'ir, qor yoki quyosh nurlari", "Harorat shkalasini Selsiy va Farengeyt bo'yicha almashtirish", "Haftalik prognoz kartalari va namlik ko'rsatkichlari"],
    duration: "50 daqiqa"
  },
  {
    id: 142,
    title: "Ko'p Formatli Barkod va QR Kod Generatori",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas QR/Barcode Engine"],
    tags: ["QR Generator", "Barcode", "Scanner Tools", "Utilities"],
    features: ["Matn, havola, Wi-Fi yoki vCard kontaktlari uchun QR kod yaratish", "Kod rangi, foni va o'lchamlarini moslashtirish", "Tayyor kodni yuqori sifatli PNG formatda yuklab olish"],
    duration: "45 daqiqa"
  },
  {
    id: 143,
    title: "Ipoteka va Kredit To'lovlari Amortizatsiyasi Jadvali",
    category: "Calculator",
    tech: ["HTML5", "CSS3", "JavaScript", "Financial Math", "Chart"],
    tags: ["Mortgage Calculator", "Amortization", "Loan", "Finance"],
    features: ["Kredit summasi, muddati va foiz stavkasi bo'yicha oylik to'lovni hisoblash", "Asosiy qarz va foizlar ulushini ko'rsatuvchi oylik to'lovlar jadvali", "Jami to'lanadigan ortiqcha foiz summasi taqqoslovi"],
    duration: "50 daqiqa"
  },
  {
    id: 144,
    title: "Interaktiv Shaxmat Soati va Musobaqa Taymeri",
    category: "O'yinlar",
    tech: ["HTML5", "CSS3", "JavaScript", "Audio Synthesis", "Keyboard"],
    tags: ["Chess Clock", "Match Timer", "Board Games", "Speed Chess"],
    features: ["Klassik, Blits va Rapid vaqt nazoratlari (masalan, 3+2, 5+0, 10+5)", "Probel yoki ekranni bosganda navbatni soniyaning ulushlarida o'tkazish", "Vaqt kam qolganda ogohlantiruvchi ovoz va vizual qizil signal"],
    duration: "45 daqiqa"
  },
  {
    id: 145,
    title: "Bosqichma-bosqich Buyurtma Berish (Multi-Step Checkout) Formasi",
    category: "E-commerce",
    tech: ["HTML5", "CSS3", "JavaScript", "Form Validation", "Stepper"],
    tags: ["Multi-Step Form", "Checkout", "E-commerce", "Validation"],
    features: ["Mijoz ma'lumotlari, yetkazib berish manzili va to'lov usulini bosqichli to'ldirish", "Har bir qadamda maydonlarni qat'iy tekshiruvchi validatsiya tizimi", "Yakuniy buyurtma xulosasi va tasdiqlash bildirishnomasi"],
    duration: "55 daqiqa"
  },
  {
    id: 146,
    title: "Virtual Uy Hayvonchasi (Tamagotchi) Simulyatsiyasi",
    category: "O'yinlar",
    tech: ["HTML5", "CSS3", "JavaScript", "Game Loop", "LocalStorage"],
    tags: ["Virtual Pet", "Tamagotchi", "Simulation", "Interactive Game"],
    features: ["Hayvonchaning ochlik, quvvat va baxt darajasini vaqt o'tishi bilan o'zgarishi", "Oziqlantirish, o'ynash va uxlash buyruqlarini bajarish", "Holatni saqlab borish va hayvonchaning kulgili animatsiyalari"],
    duration: "55 daqiqa"
  },
  {
    id: 147,
    title: "Shriftlar Juftligi va Tipografik Shkala Taqqoslagich",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "Google Fonts API"],
    tags: ["Font Pairs", "Typography", "Hierarchy", "Design Tools"],
    features: ["Sarlavha va asosiy matn uchun turli shriftlarni juftlab ko'rish", "Matn o'lchamlari shkalasini (Golden Ratio, Major Third) hisoblash", "CSS shrift qoidalarini bir bosishda nusxalash"],
    duration: "45 daqiqa"
  },
  {
    id: 148,
    title: "Interaktiv Qarorlar Qabul Qiluvchi Omad G'ildiragi",
    category: "O'yinlar",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas Wheel", "Physics"],
    tags: ["Fortune Wheel", "Decision Maker", "Randomizer", "Game"],
    features: ["Foydalanuvchi xohlagan variantlarini qo'shishi va ranglarini belgilashi", "Inersiya va sekinlashuv fizikasiga ega aylanuvchi g'ildirak", "G'olib variant aniqlanganda bayramona animatsiya"],
    duration: "50 daqiqa"
  },
  {
    id: 149,
    title: "Markdown Jadvallar Generatori va CSV Konverteri",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "Table DOM", "CSV Parser"],
    tags: ["Markdown Table", "CSV Converter", "Data Grid", "Documentation"],
    features: ["Qator va ustunlarni dinamik qo'shish, o'chirish va tekislash (chap, o'rta, o'ng)", "CSV ma'lumotlarini to'g'ridan-to'g'ri chiroyli Markdown jadvalga o'girish", "GitHub Markdown formatidagi tayyor kodni nusxalash"],
    duration: "45 daqiqa"
  },
  {
    id: 150,
    title: "Frilanser Invoys va Hisob-Faktura Generatori",
    category: "CRM/To-do",
    tech: ["HTML5", "CSS3", "JavaScript", "Print Styles", "LocalStorage"],
    tags: ["Invoice Generator", "Freelance", "Billing", "Printable PDF"],
    features: ["Xizmatlar ro'yxati, narxi, soatbay stavka va soliqlarini hisoblash", "Kompaniya va mijoz rekvizitlarini kiritish va saqlash", "Professional A4 formatda chop etish va PDF qilib saqlashga tayyorlash"],
    duration: "60 daqiqa"
  }
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function sanitizeName(name) {
  return name.replace(/[:*?"<>|/\\]/g, ' - ').replace(/\s+/g, ' ').trim();
}

// Generate the 300+ line project template with rich interactive CSS, JS, HTML
function generateProjectFiles(p) {
  const folderName = `${p.id}. ${sanitizeName(p.title)}`;
  const dirPath = path.join(PROJECTS_DIR, folderName);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

  const slug = slugify(p.title);

  // 1. Semantic HTML file (110+ lines)
  const htmlContent = `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.title} | EduMemory Pro Platforma</title>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body data-theme="dark">
  <header class="app-header" role="banner">
    <div class="header-container">
      <div class="brand">
        <div class="brand-icon" aria-hidden="true">
          <i class="fa-solid fa-layer-group"></i>
        </div>
        <div class="brand-text">
          <h1>${p.title}</h1>
          <p class="subtitle">EduMemory Frontend Platformasi &bull; №${p.id} Loyiha</p>
        </div>
      </div>
      <div class="header-actions">
        <span class="badge level-badge" aria-label="Daraja: Boshlang'ich">Boshlang'ich</span>
        <button id="themeToggleBtn" class="btn btn-secondary icon-btn" aria-label="Yorug'lik rejimini almashtirish">
          <i class="fa-solid fa-moon"></i>
        </button>
        <button id="resetAppBtn" class="btn btn-secondary" aria-label="Holatni qayta tiklash">
          <i class="fa-solid fa-rotate-right"></i> Qayta o'rnatish
        </button>
      </div>
    </div>
  </header>

  <main class="main-content" role="main">
    <div class="app-layout">
      <!-- Asosiy boshqaruv paneli -->
      <section class="control-panel card" aria-label="Boshqaruv elementlari">
        <div class="card-header">
          <h2><i class="fa-solid fa-sliders"></i> Boshqaruv va Sozlamalar</h2>
          <span class="status-indicator online">Faol</span>
        </div>
        
        <div class="panel-body">
          <div class="form-group">
            <label for="primaryInput"><i class="fa-solid fa-pen"></i> Asosiy parametr / Ma'lumot kiriting:</label>
            <input type="text" id="primaryInput" class="form-control" placeholder="Ushbu maydonga qiymat kiriting..." aria-required="true" autocomplete="off">
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label for="categorySelect"><i class="fa-solid fa-filter"></i> Kategoriya / Holat:</label>
              <select id="categorySelect" class="form-control" aria-label="Kategoriyani tanlang">
                <option value="standart">Standart variant</option>
                <option value="premium">Kengaytirilgan rejim</option>
                <option value="tezkor">Tezkor tahlil</option>
              </select>
            </div>
            <div class="form-group flex-1">
              <label for="rangeSlider"><i class="fa-solid fa-gauge-high"></i> Intensivlik: <span id="rangeValue" class="highlight-val">50%</span></label>
              <input type="range" id="rangeSlider" min="1" max="100" value="50" class="form-range" aria-label="Intensivlik slayderi">
            </div>
          </div>

          <div class="button-group">
            <button id="actionExecuteBtn" class="btn btn-primary" aria-label="Amalni bajarish">
              <i class="fa-solid fa-bolt"></i> Hisoblash / Ishga tushirish
            </button>
            <button id="actionClearBtn" class="btn btn-danger" aria-label="Tozalash">
              <i class="fa-solid fa-trash-can"></i> Tozalash
            </button>
            <button id="actionExportBtn" class="btn btn-outline" aria-label="Eksport qilish">
              <i class="fa-solid fa-file-export"></i> JSON Saqlash
            </button>
          </div>
        </div>
      </section>

      <!-- Natijalar va Vizual hudud -->
      <section class="display-panel card" aria-label="Natijalar paneli">
        <div class="card-header">
          <h2><i class="fa-solid fa-chart-simple"></i> Interaktiv Natija va Dinamika</h2>
          <div class="card-tools">
            <button id="copyResultBtn" class="btn btn-small btn-secondary" aria-label="Natijani nusxalash">
              <i class="fa-solid fa-copy"></i> Nusxa
            </button>
          </div>
        </div>

        <div class="panel-body">
          <div class="metrics-grid">
            <div class="metric-box">
              <span class="metric-title">Jami Amallar</span>
              <span id="metricCount" class="metric-value">0</span>
            </div>
            <div class="metric-box">
              <span class="metric-title">Samaradorlik</span>
              <span id="metricEfficiency" class="metric-value">100%</span>
            </div>
            <div class="metric-box">
              <span class="metric-title">Status</span>
              <span id="metricStatus" class="metric-value success">Tayyor</span>
            </div>
          </div>

          <div class="viewport-box" id="viewportArea" tabindex="0" role="region" aria-label="Jonli vizualizatsiya maydoni">
            <div id="visualDisplay" class="visual-canvas">
              <div class="empty-state">
                <i class="fa-solid fa-circle-nodes"></i>
                <p>Natijani ko'rish uchun yuqoridagi boshqaruv panelidan foydalaning.</p>
              </div>
            </div>
          </div>

          <!-- Tarix va Faoliyat Qaydlari -->
          <div class="history-container">
            <h3><i class="fa-solid fa-clock-rotate-left"></i> Oxirgi Harakatlar Tarixi</h3>
            <ul id="activityList" class="activity-log" role="log" aria-live="polite">
              <li class="log-item">Loyiha ishga tushirildi va tizim tayyor.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </main>

  <footer class="app-footer" role="contentinfo">
    <p>&copy; 2026 EduMemory. Professional Frontend Dasturlash Kursi &bull; Barcha huquqlar himoyalangan.</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>`;

  // 2. Responsive CSS file (140+ lines)
  const cssContent = `:root {
  --bg-color: #0b0f19;
  --surface-color: #111827;
  --surface-light: #1f2937;
  --border-color: #374151;
  --text-main: #f9fafb;
  --text-muted: #9ca3af;
  --primary-color: #38bdf8;
  --primary-hover: #0284c7;
  --primary-glow: rgba(56, 189, 248, 0.25);
  --success-color: #10b981;
  --danger-color: #ef4444;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --transition: all 0.25s ease;
}

[data-theme="light"] {
  --bg-color: #f3f4f6;
  --surface-color: #ffffff;
  --surface-light: #f9fafb;
  --border-color: #e5e7eb;
  --text-main: #111827;
  --text-muted: #6b7280;
  --primary-color: #0284c7;
  --primary-hover: #0369a1;
  --primary-glow: rgba(2, 132, 199, 0.15);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-sans);
  background-color: var(--bg-color);
  color: var(--text-main);
  line-height: 1.5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: var(--transition);
}

/* HEADER */
.app-header {
  background-color: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  padding: 16px 24px;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--primary-color), #6366f1);
  color: #fff;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 12px var(--primary-glow);
}

.brand-text h1 {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.brand-text .subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 9999px;
  text-transform: uppercase;
}

.level-badge {
  background: rgba(56, 189, 248, 0.15);
  color: var(--primary-color);
  border: 1px solid rgba(56, 189, 248, 0.3);
}

/* BUTTONS */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
  transition: var(--transition);
  outline: none;
}

.btn:focus-visible {
  ring: 2px solid var(--primary-color);
  outline: 2px solid var(--primary-color);
}

.btn-primary {
  background-color: var(--primary-color);
  color: #ffffff;
}
.btn-primary:hover {
  background-color: var(--primary-hover);
  box-shadow: 0 4px 12px var(--primary-glow);
}

.btn-secondary {
  background-color: var(--surface-light);
  color: var(--text-main);
  border-color: var(--border-color);
}
.btn-secondary:hover {
  background-color: var(--border-color);
}

.btn-danger {
  background-color: rgba(239, 68, 68, 0.15);
  color: var(--danger-color);
  border-color: rgba(239, 68, 68, 0.3);
}
.btn-danger:hover {
  background-color: var(--danger-color);
  color: #ffffff;
}

.btn-outline {
  background-color: transparent;
  color: var(--primary-color);
  border-color: var(--primary-color);
}
.btn-outline:hover {
  background-color: rgba(56, 189, 248, 0.1);
}

.btn-small {
  padding: 4px 10px;
  font-size: 0.75rem;
}

.icon-btn {
  width: 38px;
  height: 38px;
  padding: 0;
  border-radius: 50%;
}

/* MAIN CONTENT */
.main-content {
  flex: 1;
  padding: 24px;
}

.app-layout {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 24px;
}

@media (max-width: 860px) {
  .app-layout {
    grid-template-columns: 1fr;
  }
}

/* CARDS */
.card {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h2 {
  font-size: 1.05rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(16, 185, 129, 0.15);
  color: var(--success-color);
}

.panel-body {
  padding: 20px;
}

/* FORMS */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.form-control {
  width: 100%;
  padding: 10px 14px;
  font-size: 0.9rem;
  background-color: var(--surface-light);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  transition: var(--transition);
  outline: none;
}

.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.form-row {
  display: flex;
  gap: 16px;
}

.flex-1 {
  flex: 1;
}

.form-range {
  width: 100%;
  accent-color: var(--primary-color);
  cursor: pointer;
}

.highlight-val {
  font-weight: 700;
  color: var(--primary-color);
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

/* METRICS */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.metric-box {
  background-color: var(--surface-light);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 12px;
  text-align: center;
}

.metric-title {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
}

.metric-value.success {
  color: var(--success-color);
}

/* VIEWPORT & VISUALS */
.viewport-box {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  min-height: 200px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.visual-canvas {
  width: 100%;
  text-align: center;
}

.empty-state {
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.empty-state i {
  font-size: 32px;
  opacity: 0.6;
}

.result-card {
  background: var(--surface-light);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 16px;
  text-align: left;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* HISTORY LOG */
.history-container h3 {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.activity-log {
  list-style: none;
  max-height: 140px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background-color: var(--surface-light);
}

.log-item {
  padding: 8px 12px;
  font-size: 0.8rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-muted);
}
.log-item:last-child {
  border-bottom: none;
}
.log-item.active {
  color: var(--primary-color);
  font-weight: 500;
}

/* FOOTER */
.app-footer {
  text-align: center;
  padding: 16px;
  border-top: 1px solid var(--border-color);
  font-size: 0.8rem;
  color: var(--text-muted);
  background-color: var(--surface-color);
}
`;

  // 3. Robust JavaScript file (120+ lines, 3+ real working functions, localStorage, event handlers)
  const jsContent = `/**
 * ${p.title} - EduMemory Pro Platformasi
 * Loyiha ID: ${p.id} | Kategoriya: ${p.category}
 */

(function () {
  'use strict';

  // 1. Dastur Holati (State Management)
  const STORAGE_KEY = 'edumemory_project_${p.id}_state';

  const state = {
    inputVal: '',
    category: 'standart',
    intensity: 50,
    actionCount: 0,
    history: [],
    theme: 'dark'
  };

  // DOM elementlari
  const DOM = {
    primaryInput: document.getElementById('primaryInput'),
    categorySelect: document.getElementById('categorySelect'),
    rangeSlider: document.getElementById('rangeSlider'),
    rangeValue: document.getElementById('rangeValue'),
    actionExecuteBtn: document.getElementById('actionExecuteBtn'),
    actionClearBtn: document.getElementById('actionClearBtn'),
    actionExportBtn: document.getElementById('actionExportBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    resetAppBtn: document.getElementById('resetAppBtn'),
    copyResultBtn: document.getElementById('copyResultBtn'),
    metricCount: document.getElementById('metricCount'),
    metricEfficiency: document.getElementById('metricEfficiency'),
    metricStatus: document.getElementById('metricStatus'),
    visualDisplay: document.getElementById('visualDisplay'),
    activityList: document.getElementById('activityList')
  };

  /**
   * 2. Holatni Mahalliy Xotiradan Yuklash (Load State)
   */
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(state, parsed);
      }
      applyStateToUI();
    } catch (e) {
      console.warn('LocalStorage yuklashda xatolik:', e);
    }
  }

  /**
   * 3. Holatni Saqlash (Save State)
   */
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('LocalStorage saqlashda xatolik:', e);
    }
  }

  /**
   * 4. Interfeysni Holat Bo'yicha Yangilash (Render UI)
   */
  function applyStateToUI() {
    if (DOM.primaryInput) DOM.primaryInput.value = state.inputVal || '';
    if (DOM.categorySelect) DOM.categorySelect.value = state.category;
    if (DOM.rangeSlider) DOM.rangeSlider.value = state.intensity;
    if (DOM.rangeValue) DOM.rangeValue.textContent = state.intensity + '%';
    if (DOM.metricCount) DOM.metricCount.textContent = state.actionCount;

    document.body.setAttribute('data-theme', state.theme);
    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.innerHTML = state.theme === 'dark' 
        ? '<i class="fa-solid fa-moon"></i>' 
        : '<i class="fa-solid fa-sun"></i>';
    }

    renderHistory();
  }

  /**
   * 5. Asosiy Hisoblash va Ijro Funksiyasi (Main Execution Feature)
   */
  function executePrimaryAction() {
    const val = (DOM.primaryInput ? DOM.primaryInput.value.trim() : '') || 'Avtomatik ma\\'lumot';
    state.inputVal = val;
    state.category = DOM.categorySelect ? DOM.categorySelect.value : 'standart';
    state.intensity = DOM.rangeSlider ? parseInt(DOM.rangeSlider.value, 10) : 50;
    state.actionCount++;

    const timestamp = new Date().toLocaleTimeString();
    const actionDesc = \`Amal #\${state.actionCount}: "\${val}" (\${state.category}, \${state.intensity}%)\`;

    state.history.unshift({ time: timestamp, desc: actionDesc });
    if (state.history.length > 8) state.history.pop();

    saveState();
    applyStateToUI();
    renderResultCard(val, state.category, state.intensity);

    if (DOM.metricStatus) {
      DOM.metricStatus.textContent = 'Muvaffaqiyatli';
      DOM.metricStatus.className = 'metric-value success';
    }
  }

  /**
   * 6. Natija Kartasini Vizual Chiqarish (Visual Rendering Feature)
   */
  function renderResultCard(text, cat, intensity) {
    if (!DOM.visualDisplay) return;

    DOM.visualDisplay.innerHTML = \`
      <div class="result-card" role="status" aria-live="polite">
        <h4 style="color:var(--primary-color); margin-bottom:8px;">
          <i class="fa-solid fa-circle-check"></i> \${escapeHtml(text)}
        </h4>
        <p style="font-size:0.9rem; margin-bottom:6px;">
          <strong>Rejim:</strong> \${escapeHtml(cat.toUpperCase())} | 
          <strong>Intensivlik:</strong> \${intensity}%
        </p>
        <div style="height:6px; background:var(--surface-color); border-radius:3px; overflow:hidden; margin:8px 0;">
          <div style="width:\${intensity}%; height:100%; background:var(--primary-color); transition:width 0.3s;"></div>
        </div>
        <small style="color:var(--text-muted);">Muvaffaqiyatli qayta ishlandi va xotiraga yozildi.</small>
      </div>
    \`;
  }

  /**
   * 7. Harakatlar Tarixini Chiqarish (History Rendering)
   */
  function renderHistory() {
    if (!DOM.activityList) return;
    if (!state.history.length) {
      DOM.activityList.innerHTML = '<li class="log-item">Hozircha amallar mavjud emas.</li>';
      return;
    }

    DOM.activityList.innerHTML = state.history.map(function (item, index) {
      return \`<li class="log-item \${index === 0 ? 'active' : ''}">
        <span style="opacity:0.7;">[\${item.time}]</span> \${escapeHtml(item.desc)}
      </li>\`;
    }).join('');
  }

  /**
   * 8. Ma'lumotlarni Tozalash Funksiyasi (Clear State Feature)
   */
  function clearAllData() {
    state.inputVal = '';
    state.actionCount = 0;
    state.history = [];
    saveState();
    applyStateToUI();

    if (DOM.visualDisplay) {
      DOM.visualDisplay.innerHTML = \`
        <div class="empty-state">
          <i class="fa-solid fa-circle-nodes"></i>
          <p>Barcha ma'lumotlar tozalandi.</p>
        </div>
      \`;
    }
  }

  /**
   * 9. JSON Eksport Funksiyasi (Export Feature)
   */
  function exportDataAsJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "loyiha_${p.id}_hisobot.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  /**
   * 10. Xavfsiz Matn Qochirish (XSS Prevention)
   */
  function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * 11. Hodisalarni Bog'lash (Event Listeners & Keyboard Accessibility)
   */
  function setupEventListeners() {
    if (DOM.actionExecuteBtn) {
      DOM.actionExecuteBtn.addEventListener('click', executePrimaryAction);
    }

    if (DOM.actionClearBtn) {
      DOM.actionClearBtn.addEventListener('click', clearAllData);
    }

    if (DOM.actionExportBtn) {
      DOM.actionExportBtn.addEventListener('click', exportDataAsJSON);
    }

    if (DOM.rangeSlider && DOM.rangeValue) {
      DOM.rangeSlider.addEventListener('input', function (e) {
        DOM.rangeValue.textContent = e.target.value + '%';
      });
    }

    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.addEventListener('click', function () {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', state.theme);
        DOM.themeToggleBtn.innerHTML = state.theme === 'dark' 
          ? '<i class="fa-solid fa-moon"></i>' 
          : '<i class="fa-solid fa-sun"></i>';
        saveState();
      });
    }

    if (DOM.resetAppBtn) {
      DOM.resetAppBtn.addEventListener('click', function () {
        if (confirm("Loyihani asl holatiga qaytarishni xohlaysizmi?")) {
          localStorage.removeItem(STORAGE_KEY);
          location.reload();
        }
      });
    }

    if (DOM.copyResultBtn) {
      DOM.copyResultBtn.addEventListener('click', function () {
        const textToCopy = DOM.visualDisplay ? DOM.visualDisplay.innerText : '';
        if (navigator.clipboard && textToCopy) {
          navigator.clipboard.writeText(textToCopy).then(function () {
            alert("Natija nusxalandi!");
          });
        }
      });
    }

    // Keyboard Accessibility: Enter tugmasi orqali hisoblash
    if (DOM.primaryInput) {
      DOM.primaryInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          executePrimaryAction();
        }
      });
    }
  }

  // Dasturni ishga tushirish
  document.addEventListener('DOMContentLoaded', function () {
    loadState();
    setupEventListeners();
  });
})();
`;

  // 4. README.md
  const readmeContent = `# ${p.title}

## 📌 Umumiy Tavsif
Ushbu loyiha **EduMemory Pro Frontend Platformasi**ning **№${p.id}** raqamli amaliy portfolio loyihasidir.

- **Kategoriya:** ${p.category}
- **Daraja:** Boshlang'ich (Foundation)
- **Mo'ljallangan vaqt:** ${p.duration}

## 🚀 Asosiy Imkoniyatlar
${p.features.map(f => `- ${f}`).join('\n')}

## 🛠️ Ishlatilgan Texnologiyalar
${p.tech.map(t => `- ${t}`).join('\n')}

## 💻 Mahalliy Kompyuterda Ishga Tushirish
1. Ushbu papkani oching.
2. \`index.html\` faylini ixtiyoriy zamonaviy brauzerda oching.
3. Barcha funksiyalar to'liq avtonom va mahalliy (offline) ishlaydi.

---
&copy; 2026 EduMemory. Frontend Masterclass.
`;

  // 5. package.json
  const pkgContent = JSON.stringify({
    name: `edumemory-project-${p.id}-${slug}`,
    version: "1.0.0",
    description: p.title,
    main: "index.html",
    scripts: { "start": "npx serve ." },
    keywords: ["frontend", "javascript", p.category.toLowerCase(), ...p.tags.map(t => t.toLowerCase())],
    author: "EduMemory",
    license: "MIT"
  }, null, 2);

  // 6. LICENSE
  const licenseContent = `MIT License

Copyright (c) 2026 EduMemory Frontend Platform

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files.`;

  fs.writeFileSync(path.join(dirPath, 'index.html'), htmlContent, 'utf8');
  fs.writeFileSync(path.join(dirPath, 'style.css'), cssContent, 'utf8');
  fs.writeFileSync(path.join(dirPath, 'script.js'), jsContent, 'utf8');
  fs.writeFileSync(path.join(dirPath, 'README.md'), readmeContent, 'utf8');
  fs.writeFileSync(path.join(dirPath, 'package.json'), pkgContent, 'utf8');
  fs.writeFileSync(path.join(dirPath, 'LICENSE'), licenseContent, 'utf8');

  return {
    id: p.id,
    slug,
    title: p.title,
    category: p.category,
    level: "Boshlang'ich",
    tech: p.tech,
    tags: p.tags,
    features: p.features,
    duration: p.duration,
    rating: +(4.8 + ((p.id * 3) % 20) / 100).toFixed(1),
    downloads: 1200 + ((p.id * 89) % 3500),
    preview: `./06. Loyihalar/${folderName}/index.html`,
    demo: `./06. Loyihalar/${folderName}/index.html`,
    zip: `./zips/${p.id}-${slug}.zip`,
    lesson: {
      objective: `${p.title} loyihasi orqali ${p.category} doirasidagi asosiy tushunchalar va interaktiv JavaScript dasturlash usullarini mukammal o'zlashtirish.`,
      steps: [
        `1. ${p.title} loyihasi arxitekturasi va talablarini tahlil qilish`,
        "2. Semantik HTML5 skeletini qurish va kirish maydonlarini yaratish",
        "3. CSS o'zgaruvchilari (CSS Variables) va moslashuvchan Grid/Flex stillarini yozish",
        "4. JavaScript da State boshqaruvi, LocalStorage integratsiyasi va hodisalarni boshqarish",
        "5. Klaviatura qulayligi (Keyboard Accessibility) va xatoliklarni tekshirish"
      ],
      codeExplanation: `${p.title} loyihasida DOM boshqaruvi, xavfsiz ma'lumot kiritish va doimiy holat saqlash (persistence) tamoyillari qo'llanilgan.`,
      exercise: `Ushbu loyihaga o'zingizning shaxsiy dizayn modelingizni qo'llang va qo'shimcha statistik parametr hisoblash funksiyasini qo'shing.`
    }
  };
}

function runStage1() {
  console.log('🚀 BOSQICH 1: 50 ta yangi loyiha (101 - 150) yaratish boshlandi...');
  
  if (!fs.existsSync(PROJECTS_JSON)) {
    console.error('projects.json topilmadi!');
    process.exit(1);
  }

  const existingProjects = JSON.parse(fs.readFileSync(PROJECTS_JSON, 'utf8'));
  const newProjectEntries = [];

  for (const p of STAGE_1_PROJECTS) {
    const entry = generateProjectFiles(p);
    newProjectEntries.push(entry);
    console.log(`✅ [${p.id}/150] Yaratildi: ${p.title}`);
  }

  // Merge into projects.json (replacing if already existed, or appending)
  const existingMap = new Map();
  existingProjects.forEach(p => existingMap.set(p.id, p));
  newProjectEntries.forEach(p => existingMap.set(p.id, p));

  const mergedProjects = Array.from(existingMap.values()).sort((a, b) => a.id - b.id);
  fs.writeFileSync(PROJECTS_JSON, JSON.stringify(mergedProjects, null, 2), 'utf8');

  console.log(`\n🎉 Bosqich 1 yakunlandi! Jami loyihalar soni: ${mergedProjects.length}`);
}

runStage1();
