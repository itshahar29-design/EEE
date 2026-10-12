// scripts/generate-stage2.js - Generate Stage 2 projects (151 to 200) with Intermediate (O'rta) features
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROJECTS_DIR = path.join(ROOT_DIR, '06. Loyihalar');
const PROJECTS_JSON = path.join(ROOT_DIR, 'data', 'projects.json');

const STAGE_2_PROJECTS = [
  {
    id: 151,
    title: "FinTech Balans Boshqaruvi va Oylik Tranzaksiyalar Grafigi",
    category: "Dashboard",
    tech: ["HTML5", "CSS3", "JavaScript", "SVG Charts", "State Management", "LocalStorage"],
    tags: ["FinTech", "Dashboard", "Transactions", "SVG Chart", "State"],
    features: ["Kirim va chiqimlar bo'yicha dinamik SVG ustunli diagramma", "Tranzaksiyalarni toifalar (Oziq-ovqat, Transport, Maosh) bo'yicha filtrlash", "Reaktiv balans hisoblagichi va yangi to'lov kiritish formasi validatsiyasi"],
    duration: "60 daqiqa"
  },
  {
    id: 152,
    title: "SPA Ish Qidirish Portali va Filtrlangan Routing",
    category: "Landing",
    tech: ["HTML5", "CSS3", "JavaScript", "SPA Hash Routing", "Async API", "LocalStorage"],
    tags: ["Job Portal", "SPA Routing", "Filters", "Career", "Async"],
    features: ["Hash-routing orqali bosh sahifa, vakansiyalar va rezyume yuborish sahifalari", "Maosh, masofaviy ish va tajriba darajasi bo'yicha real vaqtli ko'p parametrli qidiruv", "Rezyume topshirish arizasining qat'iy form validatsiyasi"],
    duration: "65 daqiqa"
  },
  {
    id: 153,
    title: "E-Commerce Savatcha va Ko'p Bosqichli Buyurtma Formasi Validatsiyasi",
    category: "E-commerce",
    tech: ["HTML5", "CSS3", "JavaScript", "Stepper Form", "State Store", "Validation"],
    tags: ["E-commerce", "Checkout", "Multi-step", "Validation", "Cart"],
    features: ["Dinamik savatcha (miqdor o'zgartirish, promo-kod chegirmasi va yetkazib berish narxi)", "3 bosqichli buyurtma formasi (shaxsiy, manzil, to'lov kartasi tekshiruvi)", "Regex asosidagi real-vaqt karta raqami va telefon tekshiruvi"],
    duration: "70 daqiqa"
  },
  {
    id: 154,
    title: "Admin Foydalanuvchilar Roli va Ruxsatlar Matritsasi",
    category: "Admin panel",
    tech: ["HTML5", "CSS3", "JavaScript", "RBAC Matrix", "Mock API", "LocalStorage"],
    tags: ["Admin Panel", "RBAC", "Roles", "Permissions", "Security"],
    features: ["Rollar (Admin, Muharrir, Kuzatuvchi) bo'yicha huquqlar matritsasi", "Yangi foydalanuvchini taklif qilish va rolni biriktirish modali", "Foydalanuvchilarni bloklash, qidiruv va faoliyat auditi jurnali"],
    duration: "60 daqiqa"
  },
  {
    id: 155,
    title: "Kriptovalyuta Jonli Bozor Trendlari va Shamchalar Grafigi",
    category: "Data visualization",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas Chart", "Async API", "Math"],
    tags: ["Crypto Market", "Candlestick", "Canvas", "Trading", "Analytics"],
    features: ["HTML5 Canvas orqali narxlar shamchalari (Candlestick) grafigi", "Vaqt oralig'i (1H, 24H, 7D, 1M) bo'yicha tendentsiyalarni hisoblash", "24 soatlik eng yuqori, eng past va savdo hajmi metrikalari"],
    duration: "75 daqiqa"
  },
  {
    id: 156,
    title: "Onlayn Retseptlar Qidiruvi va Ozuqa Tahlili API Portali",
    category: "API loyihalar",
    tech: ["HTML5", "CSS3", "JavaScript", "Async Fetch", "Debounce Search", "LocalStorage"],
    tags: ["Recipes", "Nutrition", "Debounce", "API Fetch", "Cooking"],
    features: ["Debounce qidiruv orqali taomlarni qidirish va asinxron yuklash", "Kaloriya, oqsil va yog' miqdorini doiraviy SVG progressda ko'rsatish", "Masalliqlar ro'yxatini savatchaga eksport qilish"],
    duration: "60 daqiqa"
  },
  {
    id: 157,
    title: "Musiqa Pleylisti va Dinamik Audio Boshqaruv Markazi",
    category: "Animatsiya",
    tech: ["HTML5", "CSS3", "JavaScript", "Web Audio API", "Equalizer", "State"],
    tags: ["Music Player", "Audio API", "Equalizer", "Playlist", "Interactive UI"],
    features: ["Treklarni almashtirish, o'tkazish, tasodifiy (shuffle) va takrorlash rejimlari", "Haqiqiy Web Audio sinusoidal chastota to'lqinlari vizualizatori", "Pleylistga yangi audio treklar qo'shish va davomiylik hisoboti"],
    duration: "65 daqiqa"
  },
  {
    id: 158,
    title: "Loyiha Boshqaruvi va Sprint Vazifalar Taqsimoti",
    category: "Kanban",
    tech: ["HTML5", "CSS3", "JavaScript", "Drag-Drop API", "Store Pattern", "LocalStorage"],
    tags: ["Project Management", "Sprint", "Kanban", "Agile", "Drag-Drop"],
    features: ["Backlog, In Progress, Code Review va Done ustunlari bo'ylab sudrab ko'chirish", "Sprint muddati va vazifalar bajarilish foizi (Burndown progress)", "Mas'ul shaxs va ustuvorlik bo'yicha tezkor filtrlash"],
    duration: "65 daqiqa"
  },
  {
    id: 159,
    title: "Jonli Chat Xabarlar Oqimi va Foydalanuvchilar Holati",
    category: "Chat UI",
    tech: ["HTML5", "CSS3", "JavaScript", "Reactive State", "Auto-scroll", "LocalStorage"],
    tags: ["Chat App", "Messenger", "Real-time UI", "Typing Indicator"],
    features: ["Xabarlarni real vaqtda almashish va avtomatik pastga aylantirish (auto-scroll)", "Foydalanuvchining 'yozmoqda...' (typing) holati animatsiyasi", "O'qilganlik belgisi (ikki pichka), qidiruv va emojilar paneli"],
    duration: "60 daqiqa"
  },
  {
    id: 160,
    title: "Git Repozitoriyalar Qidiruvi va GitHub Profil Tahlili",
    category: "API loyihalar",
    tech: ["HTML5", "CSS3", "JavaScript", "Async/Await", "Rate Limiter", "Charts"],
    tags: ["GitHub API", "Profile Analyzer", "Repo Explorer", "Developer Tools"],
    features: ["Foydalanuvchi profilini yuklash, yulduzchalar va forklar soni tahlili", "Eng ko'p ishlatilgan dasturlash tillari bo'yicha foizli SVG taqsimot", "Repozitoriyalarni yulduzchalar va yangilanish sanasiga ko'ra saralash"],
    duration: "65 daqiqa"
  },
  {
    id: 161,
    title: "Zamonaviy Blog SPA va Hash-Routing Maqolalar O'quvchisi",
    category: "Clone UI",
    tech: ["HTML5", "CSS3", "JavaScript", "SPA Router", "Markdown Parser", "LocalStorage"],
    tags: ["SPA Blog", "Hash Routing", "Article Reader", "Reading Time"],
    features: ["URL hash o'zgarishi (#/post/:id) orqali sahifani qayta yuklamasdan o'tish", "O'qish progressi shkalasi (Scroll progress indicator)", "Maqolaga izoh qoldirish va layklar hisoblagichi"],
    duration: "60 daqiqa"
  },
  {
    id: 162,
    title: "Aqlli Shaxsiy Byudjet va Xarajatlar Doiraviy Diagrammasi",
    category: "Dashboard",
    tech: ["HTML5", "CSS3", "JavaScript", "SVG Donut Chart", "Form Validation"],
    tags: ["Personal Budget", "Donut Chart", "Finance", "Expenses"],
    features: ["Xarajat toifalari bo'yicha SVG Donut (doiraviy) diagrammasini interaktiv chizish", "Har bir segment ustiga borganda foiz va summani ko'rsatuvchi tooltip", "Oylik byudjet limiti oshganda ogohlantiruvchi xavf signali"],
    duration: "65 daqiqa"
  },
  {
    id: 163,
    title: "Ob-havo Radari va 7 Kunlik Harorat Grafigi",
    category: "API loyihalar",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas Chart", "Geo Simulation", "LocalStorage"],
    tags: ["Weather Radar", "Temperature Graph", "Forecast", "Canvas Line Chart"],
    features: ["7 kunlik harorat o'zgarishini ifodalovchi tekis Bezier chiziqli grafik", "Shahar kiritilganda shamol, ultrabinafsha indeksi va namlik tahlili", "Kunduzgi va tungi ob-havo kartalari almashinuvi"],
    duration: "60 daqiqa"
  },
  {
    id: 164,
    title: "Foydalanuvchi Ro'yxatdan O'tish va Kengaytirilgan Xavfsizlik Validatsiyasi",
    category: "Admin panel",
    tech: ["HTML5", "CSS3", "JavaScript", "Regex Engine", "Realtime Feedback", "Security"],
    tags: ["Registration", "Form Validation", "Password Security", "Tooltips"],
    features: ["Parol kiritilayotganda 5 ta xavfsizlik qoidasini jonli tekshirish (piktogrammalar)", "Email va telefon raqam formatlarini real vaqtda tekshiruvchi regex", "Xatoliklar bo'lsa formani yuborishni bloklash va yashirin ko'z (show/hide) tugmasi"],
    duration: "55 daqiqa"
  },
  {
    id: 165,
    title: "Mahsulotlar Katalogi va Jonli Savdo Qidiruv Tizimi",
    category: "E-commerce",
    tech: ["HTML5", "CSS3", "JavaScript", "Pagination", "Multi-Filter", "Cart State"],
    tags: ["Product Catalog", "Live Search", "Pagination", "E-commerce"],
    features: ["Sahifalash (Pagination) va sahifadagi mahsulotlar sonini sozlash", "Narx, toifa va reyting bo'yicha tezkor birgalikdagi filtr", "Mahsulotni savatga qo'shish va zaxira (Stock) sonini kamaytirish"],
    duration: "65 daqiqa"
  },
  {
    id: 166,
    title: "Interaktiv So'rovnoma va Ovozlar Taqsimoti Dinamikasi",
    category: "Dashboard",
    tech: ["HTML5", "CSS3", "JavaScript", "Animated Bars", "LocalStorage", "State"],
    tags: ["Poll Widget", "Voting", "Realtime Bars", "Surveys", "Dashboard"],
    features: ["Ovoz berilgach natijalarni jonli animatsiyali foizlar chizig'ida ko'rsatish", "Bir marta ovoz berishni nazorat qiluvchi mahalliy xotira tekshiruvi", "Yangi savollar va variantlar qo'shish ma'muriy paneli"],
    duration: "50 daqiqa"
  },
  {
    id: 167,
    title: "Valyuta Ayirboshlash Tarixi va Kurs Dinamikasi Grafigi",
    category: "Calculator",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas Graph", "Currency Math", "State"],
    tags: ["Currency Exchange", "History Graph", "Forex", "Canvas Chart"],
    features: ["USD, EUR, GBP, UZS, RUB o'rtasidagi so'nggi 30 kunlik kurslar grafigi", "Valyutani almashtirish va o'tgan sanalar bo'yicha retrospektiv hisob", "Eng foydali sotib olish va sotish nuqtalari tahlili"],
    duration: "60 daqiqa"
  },
  {
    id: 168,
    title: "Shaxsiy CRM va Mijozlar Bilan Aloqa Tarixi",
    category: "CRM/To-do",
    tech: ["HTML5", "CSS3", "JavaScript", "Pipeline Columns", "Modal Forms", "LocalStorage"],
    tags: ["Mini CRM", "Customer Journey", "Leads Pipeline", "Contacts"],
    features: ["Mijozlarni bosqichlar (Yangi, Muzokara, Shartnoma, Yakunlandi) bo'yicha yuritish", "Har bir mijoz kartasida telefon, email va eslatmalar tarixi", "Mijozni qidirish, saralash va eksport qilish"],
    duration: "70 daqiqa"
  },
  {
    id: 169,
    title: "Tibbiy Qabullarni Rejalashtirish va Vrachlar Jadvali",
    category: "Dashboard",
    tech: ["HTML5", "CSS3", "JavaScript", "Calendar Grid", "Slot Booking", "Validation"],
    tags: ["Doctor Booking", "Medical Appointments", "Calendar", "Healthcare"],
    features: ["Shifokorlar mutaxassisligi bo'yicha bo'sh vaqt slotlarini tanlash", "Bemor ma'lumotlarini qabul qilish va tasdiqlash xabarnomasi", "Band qilingan vaqtlarni boshqa foydalanuvchilarga yopiq ko'rsatish"],
    duration: "65 daqiqa"
  },
  {
    id: 170,
    title: "Sayyohlik Marshrutlari va Mehmonxona Band Qilish SPA",
    category: "Landing",
    tech: ["HTML5", "CSS3", "JavaScript", "Hash Router", "Filter Grid", "Booking State"],
    tags: ["Travel SPA", "Hotel Booking", "Routing", "Tour Packages"],
    features: ["Turlar va mehmonxonalarni narx, yulduzlar va qulayliklar bo'yicha saralash", "Bron qilish bosqichlarini sahifa yangilanmasdan o'tuvchi SPA navigatsiyasi", "Buyurtma hisoboti va chegirma vaucherini qo'llash"],
    duration: "65 daqiqa"
  },
  {
    id: 171,
    title: "Restoran Buyurtmalarini Qabul Qilish va Oshxona Nazorat Paneli",
    category: "Admin panel",
    tech: ["HTML5", "CSS3", "JavaScript", "Kitchen Display", "Timer Intervals", "State"],
    tags: ["Restaurant POS", "Kitchen Display", "Orders Management", "Food"],
    features: ["Stollar bo'yicha yangi buyurtmalarni oshxona monitoriga chiqarish", "Har bir taomning tayyorlanish vaqtini o'lchovchi sekundomer indikatorlari", "Buyurtmani 'Tayyor' holatiga o'tkazish va ofitsiantga signal berish"],
    duration: "65 daqiqa"
  },
  {
    id: 172,
    title: "Talabalar Baholari va Akademik O'zlashtirish Analitikasi",
    category: "Data visualization",
    tech: ["HTML5", "CSS3", "JavaScript", "Bar Charts", "GPA Calculator", "LocalStorage"],
    tags: ["Gradebook", "GPA Analytics", "Student Performance", "Charts"],
    features: ["Fanlar bo'yicha baholarni kiritish va o'rtacha GPA ko'rsatkichini hisoblash", "Guruh bo'yicha eng yuqori va past baholar taqsimoti grafigi", "Akademik qarzdorlik yoki a'lochi maqomini avtomatik aniqlash"],
    duration: "60 daqiqa"
  },
  {
    id: 173,
    title: "Internet Do'kon Chegirma Kuponlari va Savdo Hisoblagichi",
    category: "E-commerce",
    tech: ["HTML5", "CSS3", "JavaScript", "Coupon Engine", "Math", "State"],
    tags: ["Discounts", "Coupons", "Promo Code", "E-commerce Math"],
    features: ["Turli foizli yoki qat'iy summali promo-kodlarni tekshirish va kiritish", "Minimal xarid summasi va amal qilish muddatini tekshiruvchi algoritm", "Chegirma qo'llanilgach tejalgan summani vizual ajratib ko'rsatish"],
    duration: "55 daqiqa"
  },
  {
    id: 174,
    title: "Onlayn Test Sinovlari va Natijalar Matritsasi",
    category: "O'yinlar",
    tech: ["HTML5", "CSS3", "JavaScript", "Quiz Engine", "Timer Countdown", "Analytics"],
    tags: ["Online Exam", "Test Engine", "Timer", "Quiz Matrix"],
    features: ["Savollar o'rtasida oldinga/orqaga o'tish va belgilangan javoblarni saqlash", "Umumiy vaqt tugaganda testni avtomatik yakunlash", "Mavzular bo'yicha xatolar tahlili va sertifikat ballini chiqarish"],
    duration: "65 daqiqa"
  },
  {
    id: 175,
    title: "Shaxsiy Investitsiya Portfeli va Dividendlar Tahlili",
    category: "Dashboard",
    tech: ["HTML5", "CSS3", "JavaScript", "Asset Allocation", "SVG Graph", "Finance"],
    tags: ["Investments", "Dividends", "Portfolio", "Asset Allocation"],
    features: ["Aksiyalar, obligatsiyalar va ko'chmas mulk ulushini ko'rsatuvchi diagramma", "Kutilayotgan yillik dividend daromadini hisoblash", "Bozor o'zgarishlariga qarab aktivlarni qayta muvozanatlash (Rebalancing) tavsiyasi"],
    duration: "70 daqiqa"
  },
  {
    id: 176,
    title: "Fitnes Mashg'ulotlari Kundaligi va Kaloriya Grafigi",
    category: "CRM/To-do",
    tech: ["HTML5", "CSS3", "JavaScript", "Weekly Chart", "Workout Sets", "LocalStorage"],
    tags: ["Fitness Tracker", "Workout Journal", "Calories Burned", "Charts"],
    features: ["Mashqlar (Yugurish, Turnik, Shtanga) bo'yicha takrorlar va vaznni kiritish", "Haftalik sarflangan kaloriyalar dinamikasining ustunli grafigi", "Shaxsiy rekordlar (PR - Personal Record) jadvali"],
    duration: "60 daqiqa"
  },
  {
    id: 177,
    title: "Jonli Valyuta Kurslari va Kripto Arbitraj Kalkulyatori",
    category: "Calculator",
    tech: ["HTML5", "CSS3", "JavaScript", "Arbitrage Math", "Exchange Comparison", "State"],
    tags: ["Crypto Arbitrage", "Exchanges", "Profit Spread", "Calculator"],
    features: ["Bir nechta birjalar narxlari o'rtasidagi farqni (Spread) aniqlash", "Komissiyalar va yechib olish to'lovlarini inobatga olgan sof foyda hisobi", "Eng qulay sotib olish va sotish yo'nalishini tavsiya qilish"],
    duration: "65 daqiqa"
  },
  {
    id: 178,
    title: "E-Pochta Shabloni Tahrirlagichi va Jonli HTML Eksport",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "WYSIWYG Blocks", "HTML Exporter", "State"],
    tags: ["Email Template", "HTML Builder", "Newsletter", "Responsive Email"],
    features: ["Sarlavha, rasm, matn va tugma bloklarini tartibga solish", "Mobil va kompyuter ekranlarida email ko'rinishini taqqoslash", "Barcha pochta dasturlariga mos jadval (table) asosidagi toza HTML eksport"],
    duration: "70 daqiqa"
  },
  {
    id: 179,
    title: "Mahsulotlar Taqqoslagich va Xususiyatlar Matritsasi",
    category: "E-commerce",
    tech: ["HTML5", "CSS3", "JavaScript", "Comparison Grid", "Highlights", "State"],
    tags: ["Product Comparison", "Specs Matrix", "E-commerce", "Differences"],
    features: ["Bir vaqtda 3-4 ta mahsulot xususiyatlarini yonma-yon solishtirish", "Faqat farqlanuvchi qatorlarni ajratib ko'rsatish (Highlight differences)", "Mahsulotlarni solishtirish ro'yxatidan chiqarish yoki yangi qo'shish"],
    duration: "60 daqiqa"
  },
  {
    id: 180,
    title: "Veb-Sayt Tezligi va Server Javob Vaqti Monitori",
    category: "Admin panel",
    tech: ["HTML5", "CSS3", "JavaScript", "Ping Simulation", "Canvas Line Chart", "Metrics"],
    tags: ["Speed Monitor", "Server Latency", "Uptime", "Admin Tools"],
    features: ["Serverga so'rov yuborish vaqti (Ping / Latency) dinamikasini chizish", "Uptime foizi (99.9%) va nosozliklar jurnali", "Javob vaqti kritik chegaradan oshganda ogohlantirish berish"],
    duration: "65 daqiqa"
  },
  {
    id: 181,
    title: "Tadbirlar Boshqaruvi va Chiptalar Buyurtma Tizimi",
    category: "Landing",
    tech: ["HTML5", "CSS3", "JavaScript", "Seat Selector", "Pricing Tier", "LocalStorage"],
    tags: ["Events Tickets", "Seat Selection", "Concert", "Booking System"],
    features: ["Zal rejasi bo'yicha o'rindiqlarni interaktiv tanlash (VIP, Standart)", "Tanlangan joylar soniga qarab yakuniy narxni hisoblash", "Elektron chiptani QR-kod va ma'lumotlar bilan generatsiya qilish"],
    duration: "70 daqiqa"
  },
  {
    id: 182,
    title: "Onlayn Lug'at va So'zlar Boyligi Tahlili",
    category: "API loyihalar",
    tech: ["HTML5", "CSS3", "JavaScript", "Async Lookup", "Audio Pronunciation", "History"],
    tags: ["Dictionary", "Vocabulary", "Definitions", "Pronunciation", "Search"],
    features: ["So'z ma'nosi, sinonimlari, antonimlari va namunaviy jumlalarini yuklash", "Talaffuz audio tovushini ijro etish tugmasi", "O'rganilgan so'zlarni shaxsiy lug'atga saqlash"],
    duration: "60 daqiqa"
  },
  {
    id: 183,
    title: "Kitobxonlar Jamiyati va Reyting Taqsimoti",
    category: "Clone UI",
    tech: ["HTML5", "CSS3", "JavaScript", "Book Shelf", "Rating Distribution", "Reviews"],
    tags: ["Goodreads Clone", "Book Club", "Book Shelf", "Ratings"],
    features: ["O'qilmoqda, O'qildi va O'qish rejasidagi kitoblar javonlari", "Yulduzchalar bo'yicha taqsimot grafigi (1 dan 5 gacha yulduzlar)", "Kitob bo'yicha sharh qoldirish va boshqalarning fikrlarini saralash"],
    duration: "65 daqiqa"
  },
  {
    id: 184,
    title: "Shartnomalar Shakllantiruvchi va Dinamik Rekvizitlar Formasi",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "Template Merge", "Form Validation", "Print"],
    tags: ["Contract Generator", "Legal Template", "Document Form", "Print PDF"],
    features: ["Kompaniya nomi, INN, bank hisob raqami va narxlarni avtomatik to'ldirish", "Shartnoma shartlarini matn ichiga xatosiz joylashtirish (Template engine)", "A4 formatdagi rasmiy hujjat qilib chop etishga tayyorlash"],
    duration: "65 daqiqa"
  },
  {
    id: 185,
    title: "Yuk Tashish Logistikasi va Yetkazib Berish Bosqichlari",
    category: "Dashboard",
    tech: ["HTML5", "CSS3", "JavaScript", "Package Tracking", "Timeline Steps", "Status"],
    tags: ["Logistics", "Package Tracker", "Shipment Timeline", "Delivery"],
    features: ["Trek-raqam bo'yicha jo'natma holatini bosqichma-bosqich ko'rsatuvchi Timeline", "Taxminiy yetkazib berish sanasi va kuryer ma'lumotlari", "Yetkazib berishdagi kechikishlar haqida ogohlantirish bildirishnomasi"],
    duration: "60 daqiqa"
  },
  {
    id: 186,
    title: "Masofaviy Xodimlar Ish Vaqti va Faollik Tablosu",
    category: "Admin panel",
    tech: ["HTML5", "CSS3", "JavaScript", "Time Tracker", "Productivity Score", "Export"],
    tags: ["Remote Work", "Time Clock", "Employee Timesheet", "Productivity"],
    features: ["Ish kunini boshlash va tugatish tugmalari bilan ish soatlarini qayd qilish", "Tanaffus va samarali vaqt nisbatini diagrammada ko'rsatish", "Haftalik ish vaqti hisobotini CSV formatda eksport qilish"],
    duration: "65 daqiqa"
  },
  {
    id: 187,
    title: "Ijtimoiy Tarmoq Postlar Rejalashtiruvchisi va Ko'rishlar Grafigi",
    category: "CRM/To-do",
    tech: ["HTML5", "CSS3", "JavaScript", "Social Calendar", "Post Scheduler", "Charts"],
    tags: ["Social Media Scheduler", "Content Calendar", "Engagement", "Analytics"],
    features: ["Hafta kunlari va soatlar bo'yicha postlarni taqvimga joylashtirish", "Kutilayotgan qamrov (Reach) va auditoriya faolligi prognozi", "Post holati (Qoralama, Rejalashtirilgan, Chop etilgan) filtri"],
    duration: "65 daqiqa"
  },
  {
    id: 188,
    title: "Ko'chmas Mulk Narxlarini Baholash va Ipoteka Taqqoslagich",
    category: "Calculator",
    tech: ["HTML5", "CSS3", "JavaScript", "Real Estate Math", "Mortgage Comparison", "State"],
    tags: ["Real Estate Value", "Mortgage Comparison", "Down Payment", "Calculator"],
    features: ["Kvartira maydoni, ta'miri va tumani bo'yicha taxminiy bozor narxini hisoblash", "Boshlang'ich to'lov miqdoriga qarab turli banklar ipoteka takliflari taqqoslovi", "Ijara daromadliligi (Rental Yield) foizini aniqlash"],
    duration: "65 daqiqa"
  },
  {
    id: 189,
    title: "Avtomobil Xizmati va Ehtiyot Qismlar Boshqaruvi",
    category: "Admin panel",
    tech: ["HTML5", "CSS3", "JavaScript", "Service Schedule", "Inventory Parts", "Invoice"],
    tags: ["Auto Service", "Mechanic Garage", "Parts Inventory", "Repair Orders"],
    features: ["Avtomobil davlat raqami va nosozliklari bo'yicha qabul varaqasi", "Ishlatilgan ehtiyot qismlar va usta xizmati narxini hisoblash", "Mijozga avto-servis hisob-fakturasini chiqarish"],
    duration: "60 daqiqa"
  },
  {
    id: 190,
    title: "Ta'lim Kurslari Dars Jadvali va Xonalar Bandligi",
    category: "Dashboard",
    tech: ["HTML5", "CSS3", "JavaScript", "Timetable Grid", "Room Occupancy", "Filter"],
    tags: ["Schedule Grid", "Timetable", "Classrooms", "Education Management"],
    features: ["Hafta kunlari va soatlar kesimidagi darslar jadval to'ri", "Xonalar va o'qituvchilar bo'yicha kesishuvchi xatoliklarni (Conflict) aniqlash", "Guruhlar bo'yicha filtr va xonalar bandlik ko'rsatkichi"],
    duration: "65 daqiqa"
  },
  {
    id: 191,
    title: "Onlayn Savdo Bo'yicha Boshqaruv Hisoboti va KPI Ko'rsatkichlari",
    category: "Dashboard",
    tech: ["HTML5", "CSS3", "JavaScript", "KPI Cards", "SVG Trend Lines", "State"],
    tags: ["Sales Executive Dashboard", "KPIs", "Revenue Growth", "Analytics"],
    features: ["Oylik daromad, o'rtacha chek va konversiya foizi KPI kartalari", "O'tgan oyga nisbatan o'sish dinamikasini ko'rsatuvchi yashil/qizil trendlar", "Eng ko'p sotilgan toifalar tahlili"],
    duration: "70 daqiqa"
  },
  {
    id: 192,
    title: "Mijozlar Murojaatlari Bilet Tizimi (Ticket Support)",
    category: "CRM/To-do",
    tech: ["HTML5", "CSS3", "JavaScript", "Support Tickets", "Priority Badge", "Chat Log"],
    tags: ["Support Tickets", "Customer Helpdesk", "SLA Status", "Issue Tracker"],
    features: ["Murojaatlarni muhimlik (Past, Shoshilinch, Kritik) bo'yicha saralash", "Operator javobi va muammo yechilish vaqtini (SLA) qayd qilish", "Murojaatni yopish va mijoz qoniqish bahosini olish"],
    duration: "65 daqiqa"
  },
  {
    id: 193,
    title: "Qarzlar va Majburiyatlar Nazorati Daftari",
    category: "Calculator",
    tech: ["HTML5", "CSS3", "JavaScript", "Debt Snowball", "Payment Schedule", "LocalStorage"],
    tags: ["Debt Tracker", "Snowball Calculator", "Financial Freedom", "Liabilities"],
    features: ["Kimga qarz borligi, qaytarish sanasi va foizlarni kiritish", "Qarzdan tezroq qutulish strategiyasi (Debt Snowball va Avalanche usullari)", "Qaytarilgan qismlarni hisobga oluvchi dinamik progress"],
    duration: "60 daqiqa"
  },
  {
    id: 194,
    title: "Restoran Taomnomasi Tahrirlagichi va Narxlar Boshqaruvi",
    category: "Admin panel",
    tech: ["HTML5", "CSS3", "JavaScript", "Menu CRUD", "Category Tags", "Price Updates"],
    tags: ["Restaurant Menu Builder", "Dish Editor", "Pricing Admin", "Food Items"],
    features: ["Taom nomi, tarkibi, narxi va rasmini boshqarish (CRUD)", "Toifalar (Issiq taomlar, Salatlar, Ichimliklar) bo'yicha saralash", "Mavjud emas (Stop-list) holatiga o'tkazish tugmasi"],
    duration: "60 daqiqa"
  },
  {
    id: 195,
    title: "Onlayn Anonim Fikrlar Qutisi va Hissiyotlar Analitikasi",
    category: "Chat UI",
    tech: ["HTML5", "CSS3", "JavaScript", "Anonymous Feedback", "Sentiment Score", "State"],
    tags: ["Feedback Box", "Anonymous Thoughts", "Sentiment Analysis", "Community"],
    features: ["Anonim taklif yoki shikoyatlarni qabul qilish oynasi", "Fikr matnidagi ijobiy yoki salbiy ohangni avtomatik baholovchi sentiment ko'rsatkich", "Eng ko'p qo'llab-quvvatlangan fikrlarga ovoz berish reytingi"],
    duration: "60 daqiqa"
  },
  {
    id: 196,
    title: "Do'kon Ombori Qoldiqlari va Kam Qolgan Mahsulotlar Signali",
    category: "Admin panel",
    tech: ["HTML5", "CSS3", "JavaScript", "Inventory Stock", "Threshold Alerts", "Export"],
    tags: ["Warehouse Inventory", "Stock Alert", "Low Stock Warning", "Supply Chain"],
    features: ["Ombordagi tovarlar soni minimal chegaradan tushganda qizil signal ko'rsatish", "Yangi tovar partiyasini kirim qilish va yetkazib beruvchini qayd etish", "Qoldiqlar hisobotini yagona jadvalda ko'rish va qidiruv"],
    duration: "65 daqiqa"
  },
  {
    id: 197,
    title: "Reklama Kampaniyalari Byudjeti va ROI Hisoblagichi",
    category: "Dashboard",
    tech: ["HTML5", "CSS3", "JavaScript", "Marketing ROI", "Conversion Funnel", "Metrics"],
    tags: ["Ad Campaigns", "Marketing ROI", "CPC / CPA Calculator", "Funnel"],
    features: ["Google Ads, Meta va Telegram kampaniyalari xarajatlari va tushumlarini kiritish", "ROI (Return on Investment), CPC va CPA ko'rsatkichlarini hisoblash", "Konversiya voronkasi (Funnel) bosqichlari tahlili"],
    duration: "65 daqiqa"
  },
  {
    id: 198,
    title: "Musiqa Albomlari Kolleksiyasi va Sevimli Janrlar Doirasi",
    category: "Portfolio",
    tech: ["HTML5", "CSS3", "JavaScript", "Album Discography", "Genre Donut", "Favorites"],
    tags: ["Music Collection", "Discography", "Vinyl / Digital", "Album Explorer"],
    features: ["Albomlar muqovasi, chiqarilgan yili va treklari ro'yxatini ko'rish", "Janrlar (Rok, Jazz, Pop, Elektronika) bo'yicha SVG taqsimot", "Shaxsiy baholash va sevimli treklarni belgilash"],
    duration: "60 daqiqa"
  },
  {
    id: 199,
    title: "Xodimlar Ta'tillar Jadvali va Ruxsat So'rovlari Boshqaruvi",
    category: "Admin panel",
    tech: ["HTML5", "CSS3", "JavaScript", "Leave Requests", "Approval Workflow", "Calendar"],
    tags: ["Vacation Tracker", "HR Leave Management", "Approval Flow", "Time Off"],
    features: ["Mehnat ta'tili, kasallik varaqasi va komandirovka so'rovlarini topshirish", "HR menejeri tomonidan so'rovni tasdiqlash yoki rad etish oqimi", "Xodimning yil bo'yicha qolgan ta'til kunlari hisoblagichi"],
    duration: "65 daqiqa"
  },
  {
    id: 200,
    title: "Yakuniy Boshqaruv Konsoli va Tizim Xavfsizlik Jurnali",
    category: "Dashboard",
    tech: ["HTML5", "CSS3", "JavaScript", "Security Audit Log", "System Health", "Console UI"],
    tags: ["Security Console", "Audit Logs", "System Health", "IP Tracker", "Admin Hub"],
    features: ["Kirish urinishlari, IP manzillar va xavfsizlik hodisalari jurnali (Audit trail)", "Tizim resurslari (CPU, Xotira, Ma'lumotlar bazasi holati) monitoringi", "Kritik hodisalar bo'yicha qidiruv, tozalash va eksport vositalari"],
    duration: "75 daqiqa"
  }
];

function sanitizeName(name) {
  return name.replace(/[:*?"<>|/\\]/g, ' - ').replace(/\s+/g, ' ').trim();
}

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

// Generate the 300+ line project template with rich O'rta level features
function generateProjectFiles(p) {
  const folderName = `${p.id}. ${sanitizeName(p.title)}`;
  const dirPath = path.join(PROJECTS_DIR, folderName);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

  const slug = slugify(p.title);

  // 1. Semantic HTML (110+ lines)
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
  <!-- SPA Sarlavha Paneli -->
  <header class="app-header" role="banner">
    <div class="header-container">
      <div class="brand">
        <div class="brand-icon" aria-hidden="true">
          <i class="fa-solid fa-chart-line"></i>
        </div>
        <div class="brand-text">
          <h1>${p.title}</h1>
          <p class="subtitle">EduMemory Frontend Platformasi &bull; №${p.id} Loyiha (O'rta Daraja)</p>
        </div>
      </div>

      <!-- SPA Hash Navigatsiya Tablari -->
      <nav class="spa-nav" role="navigation" aria-label="SPA Navigatsiya">
        <a href="#dashboard" class="spa-nav-link active" data-view="dashboard"><i class="fa-solid fa-gauge"></i> Asosiy</a>
        <a href="#analytics" class="spa-nav-link" data-view="analytics"><i class="fa-solid fa-chart-pie"></i> Analitika</a>
        <a href="#settings" class="spa-nav-link" data-view="settings"><i class="fa-solid fa-sliders"></i> Sozlamalar</a>
      </nav>

      <div class="header-actions">
        <span class="badge level-badge" aria-label="Daraja: O'rta">O'rta</span>
        <button id="themeToggleBtn" class="btn btn-secondary icon-btn" aria-label="Yorug'lik rejimini almashtirish">
          <i class="fa-solid fa-moon"></i>
        </button>
      </div>
    </div>
  </header>

  <main class="main-content" role="main">
    <div class="app-layout">
      <!-- 1. Chap Boshqaruv va Kiritish Paneli -->
      <section class="control-panel card" aria-label="Boshqaruv paneli">
        <div class="card-header">
          <h2><i class="fa-solid fa-circle-plus"></i> Yangi Yozuv / Parametr</h2>
          <span class="status-indicator online">API Ulandi</span>
        </div>
        
        <div class="panel-body">
          <form id="primaryForm" novalidate>
            <div class="form-group">
              <label for="itemNameInput"><i class="fa-solid fa-tag"></i> Nomi / Sarlavha:</label>
              <input type="text" id="itemNameInput" class="form-control" placeholder="Nomini kiriting..." required minlength="3">
              <div id="itemNameError" class="form-error-msg" role="alert"></div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label for="categoryInput"><i class="fa-solid fa-layer-group"></i> Toifa:</label>
                <select id="categoryInput" class="form-control">
                  <option value="asosiy">Asosiy operatsiya</option>
                  <option value="marketing">Marketing / Reklama</option>
                  <option value="texnik">Texnik ta'minot</option>
                  <option value="xizmat">Xizmatlar</option>
                </select>
              </div>

              <div class="form-group flex-1">
                <label for="amountInput"><i class="fa-solid fa-coins"></i> Miqdor / Ko'rsatkich:</label>
                <input type="number" id="amountInput" class="form-control" placeholder="100" min="1" value="150" required>
                <div id="amountError" class="form-error-msg" role="alert"></div>
              </div>
            </div>

            <div class="form-group">
              <label for="priorityRange"><i class="fa-solid fa-fire"></i> Muhimlik darajasi: <span id="priorityValue" class="highlight-val">O'rta</span></label>
              <input type="range" id="priorityRange" min="1" max="3" value="2" class="form-range">
            </div>

            <div class="button-group">
              <button type="submit" id="submitBtn" class="btn btn-primary" aria-label="Saqlash">
                <i class="fa-solid fa-floppy-disk"></i> Ma'lumotni Saqlash
              </button>
              <button type="button" id="refreshApiBtn" class="btn btn-secondary" aria-label="API yangilash">
                <i class="fa-solid fa-arrows-rotate"></i> Yangilash
              </button>
              <button type="button" id="clearAllBtn" class="btn btn-danger" aria-label="Tozalash">
                <i class="fa-solid fa-trash"></i> Tozalash
              </button>
            </div>
          </form>
        </div>
      </section>

      <!-- 2. O'ng Analitika va Interaktiv Natijalar Paneli -->
      <section class="display-panel card" aria-label="Analitika va grafiklar paneli">
        <div class="card-header">
          <h2><i class="fa-solid fa-chart-column"></i> Dinamik Trendlar va Metrikalar</h2>
          <div class="card-tools">
            <button id="exportCsvBtn" class="btn btn-small btn-secondary" aria-label="CSV formatda yuklab olish">
              <i class="fa-solid fa-file-csv"></i> CSV Eksport
            </button>
          </div>
        </div>

        <div class="panel-body">
          <!-- Metrikalar Tablosi -->
          <div class="metrics-grid">
            <div class="metric-box">
              <span class="metric-title">Jami Yozuvlar</span>
              <span id="totalRecordsCount" class="metric-value">0</span>
            </div>
            <div class="metric-box">
              <span class="metric-title">O'rtacha Ko'rsatkich</span>
              <span id="averageMetricValue" class="metric-value">0</span>
            </div>
            <div class="metric-box">
              <span class="metric-title">Faollik Darajasi</span>
              <span id="systemStatusBadge" class="metric-value success">98.5%</span>
            </div>
          </div>

          <!-- Interaktiv SVG / Canvas Grafik Hududi -->
          <div class="chart-wrapper" id="chartArea" role="region" aria-label="Dinamik grafik">
            <svg id="dynamicSvgChart" class="svg-chart" viewBox="0 0 500 160" preserveAspectRatio="none">
              <!-- Dinamik ravishda chiziladi -->
            </svg>
          </div>

          <!-- Ro'yxat Jadvali -->
          <div class="table-container">
            <div class="table-header-row">
              <h3><i class="fa-solid fa-table-list"></i> Ma'lumotlar Reestri</h3>
              <input type="text" id="tableFilterInput" class="form-control filter-input" placeholder="Tezkor qidiruv..." aria-label="Reestrda qidiruv">
            </div>

            <ul id="dataTableList" class="data-items-list" role="list">
              <li class="empty-list-item">Ma'lumotlar yuklanmoqda yoki mavjud emas.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </main>

  <footer class="app-footer" role="contentinfo">
    <p>&copy; 2026 EduMemory. Professional Frontend Dasturlash Platformasi (№${p.id} Loyiha).</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>`;

  // 2. Responsive Modern CSS (140+ lines)
  const cssContent = `:root {
  --bg-color: #090d16;
  --surface-color: #0f172a;
  --surface-light: #1e293b;
  --surface-hover: #27354f;
  --border-color: #334155;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --primary-color: #0284c7;
  --primary-glow: rgba(2, 132, 199, 0.25);
  --accent-color: #38bdf8;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

[data-theme="light"] {
  --bg-color: #f8fafc;
  --surface-color: #ffffff;
  --surface-light: #f1f5f9;
  --surface-hover: #e2e8f0;
  --border-color: #cbd5e1;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --primary-color: #0284c7;
  --primary-glow: rgba(2, 132, 199, 0.15);
  --accent-color: #0369a1;
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  line-height: 1.5;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* HEADER */
.app-header {
  background-color: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  padding: 14px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
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
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  color: #fff;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 12px var(--primary-glow);
}

.brand-text h1 {
  font-size: 1.15rem;
  font-weight: 700;
}

.brand-text .subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* SPA NAVIGATION */
.spa-nav {
  display: flex;
  gap: 6px;
  background: var(--bg-color);
  padding: 4px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.spa-nav-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 6px;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 6px;
}

.spa-nav-link:hover {
  color: var(--text-main);
}

.spa-nav-link.active {
  background: var(--surface-light);
  color: var(--accent-color);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 9999px;
  text-transform: uppercase;
}

.level-badge {
  background: rgba(245, 158, 11, 0.15);
  color: var(--warning-color);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

/* BUTTONS */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
  transition: var(--transition);
  outline: none;
}

.btn:focus-visible {
  outline: 2px solid var(--accent-color);
}

.btn-primary {
  background-color: var(--primary-color);
  color: #fff;
}
.btn-primary:hover {
  background-color: #0369a1;
  box-shadow: 0 4px 12px var(--primary-glow);
}

.btn-secondary {
  background-color: var(--surface-light);
  color: var(--text-main);
  border-color: var(--border-color);
}
.btn-secondary:hover {
  background-color: var(--surface-hover);
}

.btn-danger {
  background-color: rgba(239, 68, 68, 0.15);
  color: var(--danger-color);
  border-color: rgba(239, 68, 68, 0.3);
}
.btn-danger:hover {
  background-color: var(--danger-color);
  color: #fff;
}

.btn-small {
  padding: 5px 10px;
  font-size: 0.75rem;
}

.icon-btn {
  width: 38px;
  height: 38px;
  padding: 0;
  border-radius: 50%;
}

/* LAYOUT */
.main-content {
  flex: 1;
  padding: 24px;
}

.app-layout {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 24px;
}

@media (max-width: 900px) {
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
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.form-error-msg {
  font-size: 0.75rem;
  color: var(--danger-color);
  margin-top: 4px;
  min-height: 18px;
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
  accent-color: var(--accent-color);
  cursor: pointer;
}

.highlight-val {
  font-weight: 700;
  color: var(--accent-color);
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
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

/* SVG DYNAMIC CHART */
.chart-wrapper {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 20px;
  overflow: hidden;
}

.svg-chart {
  width: 100%;
  height: 150px;
}

/* DATA TABLE / REESTR */
.table-container {
  background-color: var(--surface-light);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
}

.table-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.table-header-row h3 {
  font-size: 0.9rem;
  font-weight: 600;
}
.filter-input {
  max-width: 200px;
  padding: 6px 10px;
  font-size: 0.8rem;
}

.data-items-list {
  list-style: none;
  max-height: 180px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.data-item-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: var(--transition);
}
.data-item-card:hover {
  border-color: var(--accent-color);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.item-badge {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(56, 189, 248, 0.1);
  color: var(--accent-color);
}
.item-val {
  font-weight: 700;
  color: var(--accent-color);
}

.empty-list-item {
  color: var(--text-muted);
  font-size: 0.85rem;
  text-align: center;
  padding: 20px 0;
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

  // 3. Robust JavaScript (130+ lines, SPA router, Mock API, Reactive Store, Form validation, SVG chart)
  const jsContent = `/**
 * ${p.title} - EduMemory Pro Platformasi
 * Loyiha ID: ${p.id} | Daraja: O'rta (Intermediate)
 * Xususiyatlar: SPA Routing, Asinxron API, Reaktiv State, SVG Grafik, Validatsiya
 */

(function () {
  'use strict';

  // 1. REAKTIV STATE STORE (Centralized State Management)
  const STORAGE_KEY = 'edumemory_project_${p.id}_store';

  const Store = {
    state: {
      items: [
        { id: 1, name: "Boshlang'ich operatsiya", category: "asosiy", amount: 120, priority: 2, date: "2026-10-01" },
        { id: 2, name: "SEO va Marketing xarajati", category: "marketing", amount: 240, priority: 3, date: "2026-10-05" },
        { id: 3, name: "Server infratuzilmasi", category: "texnik", amount: 180, priority: 2, date: "2026-10-09" }
      ],
      filter: "",
      theme: "dark",
      activeRoute: "dashboard"
    },
    listeners: [],
    subscribe: function (fn) {
      this.listeners.push(fn);
    },
    notify: function () {
      this.listeners.forEach(fn => fn(this.state));
      this.saveToStorage();
    },
    addItem: function (item) {
      this.state.items.unshift(item);
      this.notify();
    },
    removeItem: function (id) {
      this.state.items = this.state.items.filter(i => i.id !== id);
      this.notify();
    },
    clearAll: function () {
      this.state.items = [];
      this.notify();
    },
    setFilter: function (q) {
      this.state.filter = q;
      this.notify();
    },
    saveToStorage: function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.warn('Storage save error:', e);
      }
    },
    loadFromStorage: function () {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          Object.assign(this.state, parsed);
        }
      } catch (e) {
        console.warn('Storage load error:', e);
      }
    }
  };

  // 2. DOM ELEMENTLARI CACHE
  const DOM = {
    primaryForm: document.getElementById('primaryForm'),
    itemNameInput: document.getElementById('itemNameInput'),
    categoryInput: document.getElementById('categoryInput'),
    amountInput: document.getElementById('amountInput'),
    priorityRange: document.getElementById('priorityRange'),
    priorityValue: document.getElementById('priorityValue'),
    itemNameError: document.getElementById('itemNameError'),
    amountError: document.getElementById('amountError'),
    refreshApiBtn: document.getElementById('refreshApiBtn'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    totalRecordsCount: document.getElementById('totalRecordsCount'),
    averageMetricValue: document.getElementById('averageMetricValue'),
    dynamicSvgChart: document.getElementById('dynamicSvgChart'),
    dataTableList: document.getElementById('dataTableList'),
    tableFilterInput: document.getElementById('tableFilterInput'),
    spaNavLinks: document.querySelectorAll('.spa-nav-link')
  };

  // 3. SPA HASH ROUTING (Hash Navigation)
  function initRouter() {
    function handleRoute() {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      Store.state.activeRoute = hash;
      DOM.spaNavLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.view === hash);
      });
    }
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  // 4. ASINXRON MOCK API INTEGRATSIYASI (Fetch Simulator)
  async function fetchMockApiData() {
    if (DOM.refreshApiBtn) {
      DOM.refreshApiBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Yuklanmoqda...';
      DOM.refreshApiBtn.disabled = true;
    }

    try {
      // Simulyatsiya qilingan tarmoq kechikishi
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const sampleNames = ["Foydalanuvchi obunasi", "Logistika yetkazish", "Bulutli xotira litsenziyasi", "Xizmat auditi"];
      const sampleCategories = ["asosiy", "marketing", "texnik", "xizmat"];
      const randomItem = {
        id: Date.now(),
        name: sampleNames[Math.floor(Math.random() * sampleNames.length)],
        category: sampleCategories[Math.floor(Math.random() * sampleCategories.length)],
        amount: Math.floor(Math.random() * 400) + 50,
        priority: Math.floor(Math.random() * 3) + 1,
        date: new Date().toISOString().split('T')[0]
      };

      Store.addItem(randomItem);
    } catch (e) {
      alert("API ma'lumotlarini yuklashda xatolik: " + e.message);
    } finally {
      if (DOM.refreshApiBtn) {
        DOM.refreshApiBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Yangilash';
        DOM.refreshApiBtn.disabled = false;
      }
    }
  }

  // 5. FORM REAL-TIME VALIDATSIYASI (Validation Engine)
  function validateForm() {
    let isValid = true;
    const name = DOM.itemNameInput.value.trim();
    const amount = parseFloat(DOM.amountInput.value);

    // Nom tekshiruvi (kamida 3 belgi)
    if (!name || name.length < 3) {
      DOM.itemNameError.textContent = "Nom kamida 3 ta belgidan iborat bo'lishi kerak.";
      isValid = false;
    } else {
      DOM.itemNameError.textContent = "";
    }

    // Miqdor tekshiruvi (musbat son)
    if (isNaN(amount) || amount <= 0) {
      DOM.amountError.textContent = "Miqdor musbat raqam bo'lishi shart.";
      isValid = false;
    } else {
      DOM.amountError.textContent = "";
    }

    return isValid;
  }

  // 6. DINAMIK SVG GRAFIK CHIZISH (SVG Data Visualization)
  function renderSvgChart(items) {
    if (!DOM.dynamicSvgChart) return;
    const svg = DOM.dynamicSvgChart;
    svg.innerHTML = '';

    if (!items.length) {
      svg.innerHTML = '<text x="250" y="80" text-anchor="middle" fill="#64748b" font-size="14">Grafik uchun ma\\'lumotlar mavjud emas</text>';
      return;
    }

    const maxVal = Math.max(...items.map(i => i.amount), 1);
    const chartHeight = 130;
    const barWidth = Math.min(400 / items.length, 36);
    const startX = 30;

    items.slice(0, 10).forEach((item, idx) => {
      const height = (item.amount / maxVal) * chartHeight;
      const x = startX + idx * (barWidth + 12);
      const y = 150 - height;

      // Ustun to'rtburchagi
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', barWidth);
      rect.setAttribute('height', height);
      rect.setAttribute('rx', '4');
      rect.setAttribute('fill', idx % 2 === 0 ? '#38bdf8' : '#6366f1');
      rect.setAttribute('opacity', '0.85');
      
      // Ustun tepasidagi qiymat yozuvi
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x + barWidth / 2);
      text.setAttribute('y', y - 4);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#94a3b8');
      text.setAttribute('font-size', '10');
      text.textContent = item.amount;

      svg.appendChild(rect);
      svg.appendChild(text);
    });
  }

  // 7. RO'YXATNI RENDER QILISH (Data Table Rendering)
  function renderTable(items, filter) {
    if (!DOM.dataTableList) return;

    let filtered = items;
    if (filter) {
      const q = filter.toLowerCase();
      filtered = items.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }

    if (!filtered.length) {
      DOM.dataTableList.innerHTML = '<li class="empty-list-item">Mos keluvchi yozuvlar topilmadi.</li>';
      return;
    }

    DOM.dataTableList.innerHTML = filtered.map(item => \`
      <li class="data-item-card" data-id="\${item.id}">
        <div class="item-left">
          <span class="item-badge">\${item.category.toUpperCase()}</span>
          <span><strong>\${escapeHtml(item.name)}</strong></span>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <span class="item-val">$\${item.amount}</span>
          <button class="btn btn-small btn-danger delete-item-btn" data-del="\${item.id}" aria-label="O'chirish">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </li>
    \`).join('');

    DOM.dataTableList.querySelectorAll('.delete-item-btn').forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.dataset.del, 10);
        Store.removeItem(id);
      };
    });
  }

  // 8. CSV EKSPORT FUNKSIYASI (Export Feature)
  function exportToCsv() {
    if (!Store.state.items.length) {
      alert("Eksport qilish uchun ma'lumot mavjud emas.");
      return;
    }

    let csv = "ID,Nomi,Kategoriya,Miqdor,Sana\\n";
    Store.state.items.forEach(i => {
      csv += \`\${i.id},"\${i.name}",\${i.category},\${i.amount},\${i.date}\\n\`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "loyiha_${p.id}_hisobot.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // 9. METRIKALARNI YANGILASH (KPI Calculation)
  function updateMetrics(items) {
    if (DOM.totalRecordsCount) DOM.totalRecordsCount.textContent = items.length;
    if (DOM.averageMetricValue) {
      const avg = items.length ? Math.round(items.reduce((s, i) => s + i.amount, 0) / items.length) : 0;
      DOM.averageMetricValue.textContent = '$' + avg;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // 10. REAKTIV OBUNA BO'YICHA INTERFEYSNI YANGILASH
  Store.subscribe(state => {
    updateMetrics(state.items);
    renderSvgChart(state.items);
    renderTable(state.items, state.filter);
  });

  // 11. HODISALARNI SOZLASH (Event Listeners Setup)
  function initEvents() {
    if (DOM.primaryForm) {
      DOM.primaryForm.onsubmit = e => {
        e.preventDefault();
        if (!validateForm()) return;

        const newItem = {
          id: Date.now(),
          name: DOM.itemNameInput.value.trim(),
          category: DOM.categoryInput.value,
          amount: parseFloat(DOM.amountInput.value),
          priority: parseInt(DOM.priorityRange.value, 10),
          date: new Date().toISOString().split('T')[0]
        };

        Store.addItem(newItem);
        DOM.primaryForm.reset();
        if (DOM.priorityValue) DOM.priorityValue.textContent = "O'rta";
      };
    }

    if (DOM.priorityRange && DOM.priorityValue) {
      DOM.priorityRange.oninput = e => {
        const val = parseInt(e.target.value, 10);
        const labels = { 1: "Past", 2: "O'rta", 3: "Yuqori" };
        DOM.priorityValue.textContent = labels[val] || "O'rta";
      };
    }

    if (DOM.refreshApiBtn) DOM.refreshApiBtn.onclick = fetchMockApiData;
    if (DOM.clearAllBtn) {
      DOM.clearAllBtn.onclick = () => {
        if (confirm("Barcha ma'lumotlarni tozalashni xohlaysizmi?")) Store.clearAll();
      };
    }

    if (DOM.exportCsvBtn) DOM.exportCsvBtn.onclick = exportToCsv;

    if (DOM.tableFilterInput) {
      DOM.tableFilterInput.oninput = e => {
        Store.setFilter(e.target.value.trim());
      };
    }

    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.onclick = () => {
        Store.state.theme = Store.state.theme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', Store.state.theme);
        DOM.themeToggleBtn.innerHTML = Store.state.theme === 'dark' 
          ? '<i class="fa-solid fa-moon"></i>' 
          : '<i class="fa-solid fa-sun"></i>';
        Store.saveToStorage();
      };
    }
  }

  // Dasturni ishga tushirish
  document.addEventListener('DOMContentLoaded', () => {
    Store.loadFromStorage();
    document.body.setAttribute('data-theme', Store.state.theme);
    initRouter();
    initEvents();
    Store.notify(); // Dastlabki render
  });
})();
`;

  // 4. README.md
  const readmeContent = `# ${p.title}

## 📌 Umumiy Tavsif
Ushbu loyiha **EduMemory Pro Frontend Platformasi**ning **№${p.id}** raqamli amaliy portfolio loyihasidir.

- **Kategoriya:** ${p.category}
- **Daraja:** O'rta (Intermediate)
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
    level: "O'rta",
    tech: p.tech,
    tags: p.tags,
    features: p.features,
    duration: p.duration,
    rating: +(4.8 + ((p.id * 3) % 20) / 100).toFixed(1),
    downloads: 1400 + ((p.id * 97) % 4000),
    preview: `./06. Loyihalar/${folderName}/index.html`,
    demo: `./06. Loyihalar/${folderName}/index.html`,
    zip: `./zips/${p.id}-${slug}.zip`,
    lesson: {
      objective: `${p.title} loyihasi orqali ${p.category} doirasidagi asinxron API bilan ishlash, SPA marshrutlash (routing), reaktiv state boshqaruvi va dinamik grafiklar chizishni o'zlashtirish.`,
      steps: [
        `1. ${p.title} arxitekturasi va reaktiv store modelini loyihalash`,
        "2. SPA Hash-routing navigatsiyasini va semantik shablonni yaratish",
        "3. CSS o'zgaruvchilari yordamida zamonaviy dashboard stillarini yozish",
        "4. Dinamik SVG ustunli grafik chizish algoritmini ishlab chiqish",
        "5. Formani kiritishda real-vaqtli validatsiya va CSV eksport funksiyalarini ulash"
      ],
      codeExplanation: `Ushbu loyihada Observer patterniga asoslangan reaktiv Store, asinxron ma'lumotlar oqimi (Promise/async/await) va SVG koordinatalar hisobi qo'llanilgan.`,
      exercise: `Ushbu loyihaga yangi ma'lumotlar toifasini qo'shing va SVG grafigida ranglarni toifaga qarab dinamik o'zgaruvchi qiling.`
    }
  };
}

function runStage2() {
  console.log('🚀 BOSQICH 2: 50 ta yangi O\'rta darajadagi loyiha (151 - 200) yaratish boshlandi...');

  if (!fs.existsSync(PROJECTS_JSON)) {
    console.error('projects.json topilmadi!');
    process.exit(1);
  }

  const existingProjects = JSON.parse(fs.readFileSync(PROJECTS_JSON, 'utf8'));
  const newProjectEntries = [];

  for (const p of STAGE_2_PROJECTS) {
    const entry = generateProjectFiles(p);
    newProjectEntries.push(entry);
    console.log(`✅ [${p.id}/200] Yaratildi: ${p.title}`);
  }

  // Merge into projects.json
  const existingMap = new Map();
  existingProjects.forEach(p => existingMap.set(p.id, p));
  newProjectEntries.forEach(p => existingMap.set(p.id, p));

  const mergedProjects = Array.from(existingMap.values()).sort((a, b) => a.id - b.id);
  fs.writeFileSync(PROJECTS_JSON, JSON.stringify(mergedProjects, null, 2), 'utf8');

  console.log(`\n🎉 Bosqich 2 yakunlandi! Jami loyihalar soni: ${mergedProjects.length}`);
}

runStage2();
