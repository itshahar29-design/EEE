// scripts/generate-stage3.js - Generate Batch 1 (Projects 201 to 250: Intermediate & Advanced)
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROJECTS_DIR = path.join(ROOT_DIR, '06. Loyihalar');
const PROJECTS_JSON = path.join(ROOT_DIR, 'data', 'projects.json');

const STAGE_3_PROJECTS = [
  {
    id: 201,
    title: "B2B SaaS Litsenziyalar Boshqaruvi va Faol Sessiyalar Monitoringi",
    category: "Dashboard",
    tech: ["HTML5", "CSS3", "JavaScript", "SVG Charts", "State Management", "LocalStorage"],
    tags: ["SaaS", "Licenses", "Sessions", "Monitoring", "Dashboard"],
    features: ["Kompaniya litsenziyalari (Pro, Enterprise, Starter) bo'yicha kvotalar taqsimoti", "Jonli faol sessiyalar monitoringi va qurilmalar bo'yicha tahlil", "Yangi foydalanuvchi litsenziyasini faollashtirish va bekor qilish boshqaruvi"],
    duration: "65 daqiqa"
  },
  {
    id: 202,
    title: "Onlayn Avtosalon 3D Konfiguratori va Kredit Kalkulyatori",
    category: "E-commerce",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas 2D", "Loan Calculator", "Store"],
    tags: ["Automotive", "Configurator", "Loan Calculator", "Canvas", "E-commerce"],
    features: ["Avtomobil rangi, disklari va interyerini interaktiv Canvas orqali o'zgartirish", "Dastlabki to'lov, foiz stavkasi va oylik kredit to'lovlarini avtomatik hisoblash", "Tanlangan konfiguratsiyani buyurtma savatchasiga saqlash va CSV eksport"],
    duration: "75 daqiqa"
  },
  {
    id: 203,
    title: "Telemeditsina Shifokor Qabuli Band Qilish va Onlayn Konsultatsiya",
    category: "Landing",
    tech: ["HTML5", "CSS3", "JavaScript", "Booking Calendar", "Form Validation", "SPA"],
    tags: ["Telemedicine", "Doctor Booking", "Healthcare", "Calendar", "Landing"],
    features: ["Shifokorlar ixtisosligi (Kardiolog, Nevrolog, Terapevt) bo'yicha qidiruv va filtr", "Interaktiv sana va bo'sh vaqt slotlarini tanlash kalendari", "Bemor ma'lumotlarini qat'iy tekshiruvchi ko'p bosqichli qabul formasi"],
    duration: "60 daqiqa"
  },
  {
    id: 204,
    title: "Kiberxavfsizlik Xavf-xatarlar Bahosi va Zaifliklar Skanneri UI",
    category: "Admin panel",
    tech: ["HTML5", "CSS3", "JavaScript", "Security Audit", "SVG Radar", "LocalStorage"],
    tags: ["Cybersecurity", "Vulnerability", "Scanner", "Admin Panel", "Audit"],
    features: ["Tizim portlari va zaifliklari (Critical, High, Medium) bo'yicha xavf indeksi", "Domen yoki IP manzilni kiritib zaifliklarni simulyatsiya qiluvchi skanner", "Xavfsizlik hisoboti jurnali va tahdidlarni bartaraf etish tavsiyalari"],
    duration: "70 daqiqa"
  },
  {
    id: 205,
    title: "Algoritmlar Vizualizatori (Saralash va Qidiruv Animatsiyalari)",
    category: "Data visualization",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas Rendering", "Algorithms", "Async Queue"],
    tags: ["Algorithms", "Sorting", "BubbleSort", "QuickSort", "Visualization"],
    features: ["Bubble Sort, Quick Sort va Merge Sort algoritmlarini ustunli Canvasda ko'rsatish", "Animatsiya tezligini va massiv elementlari sonini boshqarish slayderi", "Solishtirishlar va almashtirishlar sonini real vaqtda hisoblash metrikasi"],
    duration: "80 daqiqa"
  },
  {
    id: 206,
    title: "Retro Kosmik Kema Galaktik Jang O'yini (Canvas Game)",
    category: "O'yinlar",
    tech: ["HTML5", "CSS3", "JavaScript", "HTML5 Canvas", "Game Loop", "Collision Detection"],
    tags: ["Arcade Game", "Space Shooter", "Canvas", "Game Loop", "Retro"],
    features: ["60 FPS Game Loop yordamida kosmik kema boshqaruvi va lazerli otishma", "Dushman asteroidlari va kemalari bilan to'qnashuvni aniqlash (AABB collision)", "Jonlar soni, rekord ballar va o'yin to'xtatish (Pause/Resume) boshqaruvi"],
    duration: "75 daqiqa"
  },
  {
    id: 207,
    title: "Markdown Texnik Hujjatlar Muharriri va Jonli HTML Eksport",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "Markdown Parser", "Live Preview", "LocalStorage"],
    tags: ["Markdown", "Editor", "Documentation", "HTML Export", "Word Counter"],
    features: ["Matn kiritilganda bir zumda HTML preview ga aylantiruvchi ikki oynali tahrirchi", "So'zlar, belgilar va o'qish vaqti sonini hisoblovchi jonli statistika", "Hujjatni Markdown (.md) va toza HTML (.html) formatlarida fayl qilib yuklab olish"],
    duration: "60 daqiqa"
  },
  {
    id: 208,
    title: "Jamoaviy Sprint Retrospektiv Doskasi va Anonim Ovoz Berish",
    category: "Kanban",
    tech: ["HTML5", "CSS3", "JavaScript", "Drag and Drop", "Voting System", "Store"],
    tags: ["Retrospective", "Agile", "Scrum", "Voting", "Kanban"],
    features: ["Nima yaxshi bo'ldi, Nima yomon bo'ldi va Harakatlar rejalari ustunlari", "Har bir taklifga jamoa a'zolari tomonidan cheklangan anonim ovoz berish (+1)", "Fikr kartalarini ustunlar orasida erkin surish va eng ko'p ovoz olganlarni saralash"],
    duration: "65 daqiqa"
  },
  {
    id: 209,
    title: "Kripto Arbitraj Narxlar Taqqoslagichi va Signal Xabarnomalari",
    category: "API loyihalar",
    tech: ["HTML5", "CSS3", "JavaScript", "Mock WebSockets", "Async API", "Notification"],
    tags: ["Crypto", "Arbitrage", "Exchanges", "Price Alerts", "Trading"],
    features: ["Bir necha birjalar (Binance, Bybit, OKX) o'rtasidagi spred va foyda foizini hisoblash", "Foydali arbitraj paydo bo'lganda ovozli signal va bildirishnoma ko'rsatish", "Avtomatlashtirilgan narxlar o'zgarishi jurnali va filtrlar"],
    duration: "70 daqiqa"
  },
  {
    id: 210,
    title: "Sun'iy Intellekt Promptlar Laboratoriyasi va Token Sarfi Hisoblagichi",
    category: "CRM/To-do",
    tech: ["HTML5", "CSS3", "JavaScript", "Token Estimation", "Prompt Engineering", "LocalStorage"],
    tags: ["AI Prompts", "Token Counter", "LLM", "Prompt Manager", "Templates"],
    features: ["Tizimli prompt shablonlarini toifalar (Kodlash, Matn, Marketing) bo'yicha saqlash", "Kiritilgan matn uchun taxminiy tokenlar soni va narxini hisoblovchi kalkulyator", "Promptlarni nusxalash, sinovdan o'tkazish va versiyalarini boshqarish"],
    duration: "60 daqiqa"
  },
  {
    id: 211,
    title: "Xalqaro Valyutalar Arbitraji va Jonli Konvertatsiya Valyuta Kurslari",
    category: "Calculator",
    tech: ["HTML5", "CSS3", "JavaScript", "Currency API", "Exchange Calculator", "Store"],
    tags: ["Currency", "Exchange", "Forex", "Arbitrage", "Calculator"],
    features: ["15 dan ortiq jahon valyutalari bo'yicha jonli kurslar matritsasi", "Ko'p yo'nalishli konverter va komissiya to'lovlarini kiritish imkoniyati", "O'zbekiston so'mi (UZS), USD, EUR, GBP kurslarining so'nggi 7 kunlik o'zgarishi"],
    duration: "65 daqiqa"
  },
  {
    id: 212,
    title: "Shaxsiy Brend Texnik Portfoli va 3D Kartochkalar Galereyasi",
    category: "Portfolio",
    tech: ["HTML5", "CSS3", "JavaScript", "3D Tilt Effect", "Filter Matrix", "Responsive"],
    tags: ["Developer Portfolio", "3D Cards", "Projects Showcase", "Interactive", "Skills"],
    features: ["Sichqoncha harakatiga dinamik moslashuvchi 3D interaktiv loyiha kartalari", "Texnologiyalar steki (Frontend, Backend, Mobile) bo'yicha animatsiyali filtr", "Interaktiv rezyume ko'ruvchi va to'g'ridan-to'g'ri bog'lanish modali"],
    duration: "60 daqiqa"
  },
  {
    id: 213,
    title: "Smart Uy Gadjetlari Boshqaruvi va IoT Telemetriya Paneli",
    category: "Dashboard",
    tech: ["HTML5", "CSS3", "JavaScript", "IoT Telemetry", "Device Toggles", "SVG Gauges"],
    tags: ["Smart Home", "IoT", "Dashboard", "Sensors", "Automation"],
    features: ["Xonalar (Mehmonxona, Oshxona, Yotoqxona) bo'yicha chiroq va haroratni boshqarish", "Doiraviy SVG datchiklari orqali havo namligi, gaz va elektr sarfini ko'rsatish", "Avtomatik stsenariylar (Tungi rejim, Mehmon kutish)ni bir bosishda yoqish"],
    duration: "70 daqiqa"
  },
  {
    id: 214,
    title: "Jamoaviy Videoqo'ng'iroq Interfeysi va Jonli Subtitrlar UI",
    category: "Chat UI",
    tech: ["HTML5", "CSS3", "JavaScript", "WebRTC Mock", "Live Chat", "Controls"],
    tags: ["Video Call", "Conference", "WebRTC UI", "Meeting", "Subtitles"],
    features: ["Ishtirokchilar kameralari grid ko'rinishi, faol so'zlovchini ajratib ko'rsatish", "Mikrofon, kamera va ekran namoyishini (Screen Share) boshqarish tugmalari", "Jonli chat xabarlari va simulyatsiya qilingan avtomatik subtitrlar oqimi"],
    duration: "65 daqiqa"
  },
  {
    id: 215,
    title: "Spotify Uslubidagi Musiqa Oqimi va Audio To'lqinlar Ekvalayzeri",
    category: "Clone UI",
    tech: ["HTML5", "CSS3", "JavaScript", "HTML5 Audio", "Wave Visualizer", "Playlist"],
    tags: ["Spotify Clone", "Music Streaming", "Equalizer", "Audio Player", "Clone UI"],
    features: ["Musiqa treklari pleylisti, vaqt o'tkazish slayderi va ovoz balandligi nazorati", "Canvasda ritmga mos tebranuvchi dinamik audio to'lqinlar ekvalayzeri", "Sevimli qo'shiqlarni saqlash va albomlar bo'yicha tezkor saralash"],
    duration: "75 daqiqa"
  },
  {
    id: 216,
    title: "Logistika Yuk Tashuvlar Xaritasi va GPS Marshrut Simulyatori",
    category: "Data visualization",
    tech: ["HTML5", "CSS3", "JavaScript", "SVG Map Coordinates", "Route Simulator", "Store"],
    tags: ["Logistics", "Fleet Tracking", "GPS Routes", "Delivery", "Visualization"],
    features: ["Yuk mashinalarining shaharlararo harakatlanishini ko'rsatuvchi SVG xaritasi", "Yetkazib berish muddati, bosib o'tilgan masofa va qolgan vaqt hisoblagichi", "Yuklar holati (Yuklandi, Yo'lda, Yetkazildi) bo'yicha filtrlash jadvali"],
    duration: "70 daqiqa"
  },
  {
    id: 217,
    title: "O'quv Kurslari Baholash Tizimi va Talabalar Sertifikatlari Generatori",
    category: "Admin panel",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas Certificate", "Grade Calculator", "Storage"],
    tags: ["Education", "LMS", "Grades", "Certificate Generator", "Admin"],
    features: ["Talabalar baholari, davomati va topshiriqlari hisoboti matritsasi", "Talaba yakunlaganda uning nomiga HTML5 Canvas orqali rasmiy sertifikat chizish", "Sertifikatni rasm (PNG) shaklida darhol kompyuterga yuklab olish"],
    duration: "70 daqiqa"
  },
  {
    id: 218,
    title: "Raqamli Resurslar Bozorida NFT San'at Savdosi va Takliflar Auksioni",
    category: "E-commerce",
    tech: ["HTML5", "CSS3", "JavaScript", "Auction Timer", "Bid Placement", "Store"],
    tags: ["NFT Marketplace", "Auction", "Bidding", "Digital Art", "Crypto"],
    features: ["Auktsion taymeri (soat, daqiqa, soniya) va eng yuqori narx taklifini ko'rsatish", "Foydalanuvchilar tomonidan yangi taklif (Bid) berish va balansni yangilash", "Raqamli san'at asarlarini toifalar (3D, Pixel, Cyberpunk) bo'yicha filtrlash"],
    duration: "65 daqiqa"
  },
  {
    id: 219,
    title: "Fitnes Mashg'ulotlar Rejalashtiruvchisi va Kaloriya Sarfi Diagrammasi",
    category: "CRM/To-do",
    tech: ["HTML5", "CSS3", "JavaScript", "Calorie Tracker", "SVG Progress", "LocalStorage"],
    tags: ["Fitness", "Workout", "Calories", "Habit Tracker", "Health"],
    features: ["Kunlik mashg'ulotlar (Kardio, Kuch, Cho'zilish) ro'yxati va taymer", "Sarflangan kaloriyalarni haftalik SVG diagrammada tahlil qilish", "Kunlik ichilgan suv miqdori va maqsadga erishish foiz sanagichi"],
    duration: "60 daqiqa"
  },
  {
    id: 220,
    title: "Parvozlarni Qidirish va Aeroportlar Reyslar Jadvali API Tizimi",
    category: "API loyihalar",
    tech: ["HTML5", "CSS3", "JavaScript", "Flight Schedule", "Async Filter", "Mock API"],
    tags: ["Flights", "Airport", "Aviation", "Travel", "API Schedule"],
    features: ["Uchib ketish va qo'nish aeroportlari bo'yicha chiptalar qidiruv tizimi", "Reyslar statusi (O'z vaqtida, Kechikmoqda, Bekor qilingan) ko'rsatkichi", "Narx, aviakompaniya va to'g'ridan-to'g'ri reyslar bo'yicha filtrlash"],
    duration: "65 daqiqa"
  },
  {
    id: 221,
    title: "Neumorphic Uslubdagi Ilmiy Kalkulyator va Matritsalar Hisobi",
    category: "Calculator",
    tech: ["HTML5", "CSS3", "JavaScript", "Scientific Math", "Neumorphism", "History"],
    tags: ["Scientific Calculator", "Trigonometry", "Neumorphism", "Math", "Calculator"],
    features: ["Trigonometrik (sin, cos, tan), logarifmik va darajaga ko'tarish amallari", "Chiroyli yumshoq Neumorphic dizayn va klaviatura kiritishini to'liq qo'llash", "Bajarilgan hisob-kitoblar tarixi va oldingi natijani qayta yuklash"],
    duration: "60 daqiqa"
  },
  {
    id: 222,
    title: "Mahsulot Landing Sahifasi va Interaktiv 360 Daraja Aylanish",
    category: "Landing",
    tech: ["HTML5", "CSS3", "JavaScript", "360 Viewer", "Smooth Scroll", "Specs Table"],
    tags: ["Product Landing", "360 View", "E-commerce Landing", "Gadget", "Showcase"],
    features: ["Sichqonchani surish orqali gadjetni 360 daraja burchak ostida ko'rish simulyatori", "Mahsulot xususiyatlari va narxlar jadvali taqqoslagichi", "Buyurtma berish formasi va mijozlar sharhlari slayderi"],
    duration: "70 daqiqa"
  },
  {
    id: 223,
    title: "Dasturiy Kod Snippetlari Kutubxonasi va Sintaksis Ranglovchi",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "Syntax Highlighter", "Copy Snippet", "Tags"],
    tags: ["Code Snippets", "Syntax Highlight", "Developer Tools", "Library", "Code"],
    features: ["HTML, CSS, JavaScript va Python kod parchalarini saqlash va toifalash", "Sintaksisni ranglab ko'rsatish va qidiruv bo'yicha tezkor topish", "Bir bosishda kodni nusxalash va yangi snippet kiritish modali"],
    duration: "65 daqiqa"
  },
  {
    id: 224,
    title: "Minomyot / Tower Defense Strategik Mini O'yini",
    category: "O'yinlar",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas Game", "Tower Defense", "Pathfinding"],
    tags: ["Tower Defense", "Strategy Game", "Canvas", "Enemies", "Game Loop"],
    features: ["Xarita bo'ylab dushmanlar to'lqinlarini to'xtatuvchi himoya minoralari o'rnatish", "Minoralarni yangilash (Upgrade) va o'q otish radiusini vizual ko'rsatish", "O'yinchi oltinlari, joni va to'lqinlar sanagichi boshqaruvi"],
    duration: "85 daqiqa"
  },
  {
    id: 225,
    title: "SVG To'lqinlar va Partikullar Dinamik Fon Generatori",
    category: "Animatsiya",
    tech: ["HTML5", "CSS3", "JavaScript", "SVG Waves", "Particle Canvas", "CSS Export"],
    tags: ["Wave Generator", "Particles", "Backgrounds", "SVG Path", "Animation"],
    features: ["To'lqinlar balandligi, egilishi va qatlamlari sonini slayderlar orqali sozlash", "Harbiy partikullar va fizika harakati animatsiyasi integratsiyasi", "Yaratilgan SVG kodini va CSS fon stillarini bir tugmada nusxalash"],
    duration: "65 daqiqa"
  },
  {
    id: 226,
    title: "IT Ish Qidiruvchilar Uchun ATS Rezyume Skoreri va Tahlilchisi",
    category: "Portfolio",
    tech: ["HTML5", "CSS3", "JavaScript", "Text Analysis", "Keyword Matcher", "Scorer"],
    tags: ["Resume Scorer", "ATS Checker", "Job Search", "Portfolio", "Analysis"],
    features: ["Rezyume matni va ish tavsifi (Job Description) orasidagi moslik foizi", "Yetishmayotgan muhim kalit so'zlar (React, Node, SQL va h.k.) ro'yxati", "Rezyumeni kuchaytirish bo'yicha avtomatik maslahatlar va tahlil hisoboti"],
    duration: "60 daqiqa"
  },
  {
    id: 227,
    title: "Slack Uslubidagi Kanallar va Jonli Reaksiyalar Messenjeri",
    category: "Chat UI",
    tech: ["HTML5", "CSS3", "JavaScript", "Channel Switcher", "Emoji Reactions", "Threads"],
    tags: ["Slack Clone", "Chat App", "Team Messaging", "Emojis", "Channels"],
    features: ["Mavzuli kanallar (#general, #frontend, #random) va shaxsiy yozishmalar", "Har bir xabarga emoji reaksiyalari qo'yish va reaksiyalar sanagichi", "Xabarlarga javob yozish (Thread) va qidiruv tizimi"],
    duration: "70 daqiqa"
  },
  {
    id: 228,
    title: "Notion Uslubidagi Blokli Eslatmalar va Drag-Drop Tizimi",
    category: "Clone UI",
    tech: ["HTML5", "CSS3", "JavaScript", "ContentEditable", "Block Editor", "LocalStorage"],
    tags: ["Notion Clone", "Block Editor", "Rich Notes", "Drag-Drop", "Clone UI"],
    features: ["Matn, sarlavha (H1/H2), ro'yxat, checkbox va kod bloklarini erkin kiritish", "Bloklar o'rnini yuqoriga va pastga sudrab almashtirish mexanizmi", "Qorong'u/yorug' rejim va brauzer xotirasida avtomatik lahzali saqlash"],
    duration: "80 daqiqa"
  },
  {
    id: 229,
    title: "Savdo Do'koni Ombori QR Kodli Skanneri va Inventarizatsiya",
    category: "Admin panel",
    tech: ["HTML5", "CSS3", "JavaScript", "Barcode Mock", "Stock Inventory", "Alerts"],
    tags: ["Inventory", "Warehouse", "Stock Management", "Barcode", "Admin"],
    features: ["Mahsulot shtrix-kodini skan qilish va ombor qoldig'ini darhol yangilash", "Kam qolgan mahsulotlar uchun qizil xabarnoma va ta'minotchi buyurtmasi", "Ombordagi jami tovarlar qiymati va kategoriyalar bo'yicha hisobot"],
    duration: "65 daqiqa"
  },
  {
    id: 230,
    title: "Global Energiya Sarfi va Qayta Tiklanuvchi Manbalar Xaritasi",
    category: "Data visualization",
    tech: ["HTML5", "CSS3", "JavaScript", "Interactive SVG Map", "Energy Stats", "Charts"],
    tags: ["Green Energy", "Solar", "Wind", "Global Map", "Data Visualization"],
    features: ["Mintaqalar bo'yicha quyosh, shamol va gidroenergiya ulushini SVG xaritasida ko'rish", "Yillar kesimida toza energiyaga o'tish dinamikasi va emissiya kamayishi", "Mamlakatlar bo'yicha qidiruv va ko'rsatkichlarni taqqoslash paneli"],
    duration: "70 daqiqa"
  },
  {
    id: 231,
    title: "Restoran Oshxonasi Buyurtmalar Dispechyer Doskasi (KDS Kanban)",
    category: "Kanban",
    tech: ["HTML5", "CSS3", "JavaScript", "Order Dispatch", "Timer Countdown", "Kitchen KDS"],
    tags: ["Kitchen Display", "Restaurant KDS", "Orders Kanban", "Food", "Timers"],
    features: ["Yangi, Tayyorlanmoqda va Yetkazishga Tayyor ustunlari bo'ylab buyurtmalar", "Har bir stol buyurtmasi uchun tayyorlash vaqti sanagichi va kechikish ogohlantirishi", "Oshpaz tomonidan bitta tugma bilan buyurtma holatini keyingi bosqichga o'tkazish"],
    duration: "65 daqiqa"
  },
  {
    id: 232,
    title: "Ob-havo Radari va Atmosfera Bosimi Dinamik Xaritasi",
    category: "API loyihalar",
    tech: ["HTML5", "CSS3", "JavaScript", "Weather API", "Radar Canvas", "Wind Particle"],
    tags: ["Weather Radar", "Atmospheric Pressure", "Wind Map", "Forecast", "Meteorology"],
    features: ["Canvas orqali shamol oqimlari va bulutlar harakati animatsiyasi", "Barometr ko'rsatkichlari, UV indeksi va namlik bo'yicha 24 soatlik grafik", "Haroratni Selsiy va Farengeytda ko'rsatish hamda shaharlar xatcho'pi"],
    duration: "75 daqiqa"
  },
  {
    id: 233,
    title: "Ta'lim Markazi Talabalar Dars Jadvali va Xonalar Bandligi",
    category: "Dashboard",
    tech: ["HTML5", "CSS3", "JavaScript", "Schedule Grid", "Room Booking", "Store"],
    tags: ["Timetable", "Class Schedule", "Education Center", "Calendar", "Dashboard"],
    features: ["Hafta kunlari va soatlar bo'yicha darslar jadvalining qulay setkasi", "O'qituvchilar va o'quv xonalari bandligi bo'yicha to'qnashuvlarni oldini olish", "Yangi guruh darsini jadvalga qo'shish va filtrlar"],
    duration: "65 daqiqa"
  },
  {
    id: 234,
    title: "Kuryer Yetkazib Berish Narxi va Masofa Kalkulyatori",
    category: "Calculator",
    tech: ["HTML5", "CSS3", "JavaScript", "Distance Calculation", "Tariff Matrix", "Pricing"],
    tags: ["Delivery Cost", "Courier", "Distance Calculator", "Logistics", "Calculator"],
    features: ["Masofa (km), yuk vazni va shoshilinchlik darajasiga qarab yetkazish narxini hisoblash", "Shahar zonalari (Markaz, Chetki hudud, Viloyat) tariflari matritsasi", "Hisob-kitob chekini generatsiya qilish va chop etish formati"],
    duration: "60 daqiqa"
  },
  {
    id: 235,
    title: "Brend Mahsulotlar Sotuvchi B2C Do'kon va Jonli Savatcha",
    category: "E-commerce",
    tech: ["HTML5", "CSS3", "JavaScript", "Shopping Cart", "Live Discounts", "Store"],
    tags: ["B2C Store", "Shopping Cart", "Product Catalog", "Discounts", "E-commerce"],
    features: ["Mahsulotlar katalogi, o'lcham va rang tanlash, tezkor saralash", "Yon paneldan chiquvchi jonli savatcha (miqdor o'zgartirish, narx hisobi)", "Kupon kodi kiritilganda bir zumda chegirmani hisoblab ko'rsatish"],
    duration: "70 daqiqa"
  },
  {
    id: 236,
    title: "Onlayn So'rovnomalar va Testlar Konstruktori",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "Survey Builder", "Dynamic Forms", "Export JSON"],
    tags: ["Survey Builder", "Form Builder", "Quiz Creator", "Editor", "Questionnaire"],
    features: ["Bir nechta tanlovli, matnli va reytingli savollar bloklarini qo'shish", "So'rovnomani jonli ko'rinishda sinab ko'rish va to'ldirish rejimi", "Yaratilgan so'rovnoma strukturasini JSON fayl sifatida eksport qilish"],
    duration: "70 daqiqa"
  },
  {
    id: 237,
    title: "Xotira va Reaksiya Tezligi Psixologik O'yini",
    category: "O'yinlar",
    tech: ["HTML5", "CSS3", "JavaScript", "Memory Cards", "Reaction Timer", "Leaderboard"],
    tags: ["Memory Game", "Reaction Speed", "Brain Training", "Cards Flip", "Games"],
    features: ["Kartalarni ochib juftliklarni topish (Flip card 3D animatsiyasi)", "Reaksiya tezligini millisekundlarda o'lchovchi vizual sinov", "O'yinchining eng yaxshi natijalari va darajalar jadvali (Leaderboard)"],
    duration: "65 daqiqa"
  },
  {
    id: 238,
    title: "Sayt Ishonchliligi va Uptime Serverlar Holati Monitoringi",
    category: "Dashboard",
    tech: ["HTML5", "CSS3", "JavaScript", "Uptime Monitoring", "Ping Simulator", "Incident Log"],
    tags: ["Uptime Monitor", "Status Page", "Server Health", "Ping", "Dashboard"],
    features: ["Serverlar va API xizmatlarining 99.9% uptime ko'rsatkichlari jadvali", "Ping javob berish vaqti (ms) bo'yicha SVG trend diagrammasi", "Tizim nosozliklari va rejaviy texnik ishlar jurnali (Incidents)"],
    duration: "65 daqiqa"
  },
  {
    id: 239,
    title: "Dizaynerlar Uchun Tipografika va Shriftlar Taqqoslagich Vitrinasi",
    category: "Animatsiya",
    tech: ["HTML5", "CSS3", "JavaScript", "Font Pairing", "Variable Fonts", "CSS Code"],
    tags: ["Typography", "Fonts", "Design Tool", "Font Pairing", "CSS Inspector"],
    features: ["Google Fonts shriflar juftligini (Sarlavha + Asosiy matn) yonma-yon solishtirish", "Shrift o'lchami, qator balandligi (line-height) va harflar oralig'ini sozlash", "Tayyor CSS font-family qoidalarini bir bosishda nusxalash"],
    duration: "60 daqiqa"
  },
  {
    id: 240,
    title: "Instagram Uslubidagi Hikoyalar (Stories) va Rasm Filtrlari",
    category: "Clone UI",
    tech: ["HTML5", "CSS3", "JavaScript", "Stories Progress", "CSS Filters", "Clone UI"],
    tags: ["Instagram Clone", "Stories", "Photo Filters", "Social Media", "Clone UI"],
    features: ["Stories progress taymerlari (5 soniyada keyingisiga avtomatik o'tish)", "Rasmlarga CSS filtrlari (Sepia, Grayscale, Vintage, Blur)ni qo'llash", "Hikoyalarni pauza qilish (Touch/Click hold) va to'liq ekran rejimi"],
    duration: "70 daqiqa"
  },
  {
    id: 241,
    title: "Mehmonxona Xonalari Band Qilish va Bronlash Kalendari",
    category: "Landing",
    tech: ["HTML5", "CSS3", "JavaScript", "Hotel Booking", "Date Picker", "Price Calculator"],
    tags: ["Hotel Booking", "Rooms", "Reservation", "Calendar", "Landing"],
    features: ["Kelish va ketish sanalari bo'yicha xonalar narxini avtomatik hisoblash", "Xonalar turlari (Standart, Lyuks, Oilaviy) bo'yicha qulay filtrlash", "Mijoz ma'lumotlari kiritiluvchi xavfsiz bronlash modali"],
    duration: "65 daqiqa"
  },
  {
    id: 242,
    title: "Avtomobillar Xizmat Ko'rsatish Tarixi va Ta'mirlash Jadvali",
    category: "CRM/To-do",
    tech: ["HTML5", "CSS3", "JavaScript", "Service History", "Mileage Tracker", "Store"],
    tags: ["Auto Service", "Car Maintenance", "Mileage", "Service Book", "CRM"],
    features: ["Avtomobil moy almashtirish, tormoz va texnik ko'rik sanalari eslatmasi", "Bosib o'tilgan masofa (km) bo'yicha rejaviy ta'mirlash jadvali", "Xarajatlar tarixi va umumiy texnik xizmat ko'rsatish byudjeti"],
    duration: "60 daqiqa"
  },
  {
    id: 243,
    title: "Web Ranglar Palitrasi Tahlilchisi va WCAG Kontrast Tekshiruvi",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "Color Contrast", "WCAG AA/AAA", "Palette Export"],
    tags: ["Color Contrast", "Accessibility", "WCAG", "Palette Generator", "Design Tool"],
    features: ["Matn va fon ranglari orasidagi kontrast nisbatini (masalan: 4.5:1) aniq hisoblash", "WCAG AA va AAA talablariga moslik belgisi (Pass / Fail)", "HEX, RGB va HSL formatlarida ranglar palitrasini eksport qilish"],
    duration: "60 daqiqa"
  },
  {
    id: 244,
    title: "GitHub Profil Tahlilchisi va Repozitoriyalar Analitikasi API",
    category: "API loyihalar",
    tech: ["HTML5", "CSS3", "JavaScript", "GitHub Mock API", "Languages Chart", "Repos"],
    tags: ["GitHub Profile", "Developer Analytics", "Repositories", "API Mock", "Stats"],
    features: ["Foydalanuvchi yulduzlari, followerlari va umumiy repozitoriyalari statistikasi", "Eng ko'p ishlatilgan dasturlash tillari (JS, Python, CSS) bo'yicha SVG diagramma", "Repozitoriyalarni qidirish, saralash va to'g'ridan-to'g'ri havolalar"],
    duration: "65 daqiqa"
  },
  {
    id: 245,
    title: "Finans Omonat Foizlari va Murakkab Foiz Investitsiya Hisoblagichi",
    category: "Calculator",
    tech: ["HTML5", "CSS3", "JavaScript", "Compound Interest", "Growth Chart", "Calculator"],
    tags: ["Investment", "Compound Interest", "Deposit Calculator", "Finance", "Growth"],
    features: ["Boshlang'ich kapital, oylik to'lov va yillik foiz stavkasi bo'yicha hisob", "Yillar kesimida sof foyda va jamg'armaning o'sish dinamikasi grafigi", "Inflatsiya ta'sirini hisobga oluvchi muqobil hisob-kitob"],
    duration: "65 daqiqa"
  },
  {
    id: 246,
    title: "Mualliflik Blogi va Maqolalar O'qish Vaqti Tahlili",
    category: "Portfolio",
    tech: ["HTML5", "CSS3", "JavaScript", "Reading Time", "Article Filter", "Bookmarks"],
    tags: ["Tech Blog", "Articles", "Reading Time", "Portfolio", "Content"],
    features: ["Maqolalar matni hajmiga qarab o'qish vaqtini (masalan: 5 daqiqa) avtomatik hisoblash", "Teglar va toifalar (Frontend, Karyera, Arxitektura) bo'yicha filtrlar", "Maqolalarni xatcho'pga saqlash va shrift o'lchamini kattalashtirish"],
    duration: "60 daqiqa"
  },
  {
    id: 247,
    title: "Jamoaviy Mijozlar Bazasi (CRM) va Savdo Voronkasi",
    category: "Admin panel",
    tech: ["HTML5", "CSS3", "JavaScript", "Sales Funnel", "Lead Status", "CRM"],
    tags: ["Sales CRM", "Leads", "Funnel Chart", "Customer Base", "Admin"],
    features: ["Lidlar, muzokaralar va bitimlar bo'yicha savdo voronkasi (Funnel diagrammasi)", "Mijozlar bilan aloqa tarixi, telefon va email xatlari qaydlari", "Bitimlar summasi va konversiya foizini avtomatik hisoblash"],
    duration: "70 daqiqa"
  },
  {
    id: 248,
    title: "Canvas Chizmachilik Doskasi va Shakllar Eksporti",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas Drawing", "Color Picker", "PNG Export"],
    tags: ["Drawing Board", "Canvas", "Sketchpad", "Export PNG", "Art Tool"],
    features: ["Qalam, o'chirg'ich, chiziq, to'rtburchak va doira shakllarini chizish", "Ranglar palitrasi, qalam qalinligini boshqarish va bekor qilish (Undo)", "Chizilgan rasmni toza PNG formatida yuklab olish"],
    duration: "75 daqiqa"
  },
  {
    id: 249,
    title: "Virtual Muzey Eksponatlari Galereyasi va Audio Gid",
    category: "Landing",
    tech: ["HTML5", "CSS3", "JavaScript", "Audio Tour", "Modal Gallery", "History"],
    tags: ["Virtual Museum", "Exhibition", "Audio Guide", "Artifacts", "Culture"],
    features: ["Tarixiy eksponatlarining yuqori sifatli fotosuratlari va tushuntirishlari", "Eksponat haqida hikoya qiluvchi interaktiv audio pleyer ovozi", "Davrlar (Antik, O'rta asrlar, Zamonaviy) bo'yicha saralash filtrlari"],
    duration: "65 daqiqa"
  },
  {
    id: 250,
    title: "Bug Tracker Dasturiy Xatoliklar Boshqaruvi va Sprint Hisoboti",
    category: "Kanban",
    tech: ["HTML5", "CSS3", "JavaScript", "Bug Tracking", "Priority Matrix", "Kanban"],
    tags: ["Bug Tracker", "QA Testing", "Issue Management", "Kanban", "Sprint"],
    features: ["Dasturdagi xatoliklarni jiddiylik (Blocker, Major, Minor) bo'yicha qayd etish", "Open, In Investigation, Fixed va Closed ustunlari bo'ylab boshqaruv", "Bajarilgan tuzatishlar foizi va nosozliklar yechimi statistikasi"],
    duration: "70 daqiqa"
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

function generateProjectFiles(p) {
  const folderName = `${p.id}. ${p.title}`;
  const dirPath = path.join(PROJECTS_DIR, folderName);
  const slug = slugify(p.title);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // 1. INDEX.HTML
  const htmlContent = `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.id}. ${p.title} | FrontCraft Pro</title>
  <meta name="description" content="${p.title} - FrontCraft Pro platformasining interaktiv frontend loyihasi.">
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
          <p class="subtitle">FrontCraft Pro &bull; №${p.id} Loyiha (${p.category})</p>
        </div>
      </div>

      <!-- SPA Hash Navigatsiya -->
      <nav class="spa-nav" role="navigation" aria-label="Bo'limlar">
        <a href="#dashboard" class="spa-nav-link active" data-view="dashboard"><i class="fa-solid fa-gauge"></i> Asosiy</a>
        <a href="#analytics" class="spa-nav-link" data-view="analytics"><i class="fa-solid fa-chart-pie"></i> Analitika</a>
        <a href="#settings" class="spa-nav-link" data-view="settings"><i class="fa-solid fa-sliders"></i> Sozlamalar</a>
      </nav>

      <div class="header-actions">
        <span class="badge level-badge" aria-label="Daraja: O'rta">O'rta</span>
        <button id="themeToggleBtn" class="btn btn-secondary icon-btn" aria-label="Mavzuni almashtirish">
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
                  <option value="Asosiy">Asosiy operatsiya</option>
                  <option value="Marketing">Marketing / Reklama</option>
                  <option value="Texnik">Texnik ta'minot</option>
                  <option value="Servis">Xizmatlar</option>
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
              <span class="metric-title">Eng Yuqori Qiymat</span>
              <span id="maxMetricValue" class="metric-value">0</span>
            </div>
          </div>

          <!-- Dinamik SVG Grafik -->
          <div class="chart-wrapper">
            <div class="chart-header">
              <h3><i class="fa-solid fa-chart-simple"></i> Taqsimot Diagrammasi</h3>
              <span class="chart-legend"><i class="fa-solid fa-circle"></i> Jonli Ko'rsatkich</span>
            </div>
            <div id="svgChartContainer" class="svg-chart-container">
              <!-- script.js orqali chiziladi -->
            </div>
          </div>

          <!-- Qidiruv va Filtrlangan Jadval -->
          <div class="table-container">
            <div class="table-actions">
              <div class="search-box">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" id="tableFilterInput" class="search-input" placeholder="Jadvaldan qidirish...">
              </div>
              <span id="tableResultsCount" class="results-badge">0 ta natija</span>
            </div>

            <div class="table-responsive">
              <table class="data-table" aria-label="Ma'lumotlar jadvali">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nomi</th>
                    <th>Toifa</th>
                    <th>Miqdor</th>
                    <th>Sana</th>
                    <th>Amallar</th>
                  </tr>
                </thead>
                <tbody id="dataTableBody">
                  <!-- script.js orqali to'ldiriladi -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>

  <footer class="app-footer">
    <div class="footer-container">
      <p>&copy; 2026 FrontCraft Pro &bull; ${p.id}. ${p.title}</p>
      <div class="tech-stack-badges">
        ${p.tech.map(t => `<span class="badge tech-badge">${t}</span>`).join(' ')}
      </div>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>`;

  // 2. STYLE.CSS
  const cssContent = `:root {
  --bg-base: #0f172a;
  --bg-card: #1e293b;
  --bg-card-hover: #334155;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --primary: #0ea5e9;
  --primary-hover: #0284c7;
  --primary-glow: rgba(14, 165, 233, 0.25);
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --border: #334155;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  --transition: all 0.25s ease;
}

[data-theme="light"] {
  --bg-base: #f8fafc;
  --bg-card: #ffffff;
  --bg-card-hover: #f1f5f9;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --primary: #0284c7;
  --primary-hover: #0369a1;
  --primary-glow: rgba(2, 132, 199, 0.2);
  --border: #e2e8f0;
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

body {
  background-color: var(--bg-base);
  color: var(--text-main);
  line-height: 1.5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* HEADER */
.app-header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, var(--primary), #6366f1);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
  box-shadow: 0 4px 12px var(--primary-glow);
}

.brand-text h1 {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.01em;
}

.brand-text .subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* SPA NAVIGATION */
.spa-nav {
  display: flex;
  gap: 6px;
  background: var(--bg-base);
  padding: 4px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.spa-nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 4px;
  transition: var(--transition);
}

.spa-nav-link:hover {
  color: var(--text-main);
}

.spa-nav-link.active {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 2px 8px var(--primary-glow);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* BUTTONS */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 0.88rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
  transition: var(--transition);
}

.btn-primary {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 4px 12px var(--primary-glow);
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-card);
  color: var(--text-main);
  border-color: var(--border);
}

.btn-secondary:hover {
  background: var(--bg-card-hover);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger);
  border-color: rgba(239, 68, 68, 0.3);
}

.btn-danger:hover {
  background: var(--danger);
  color: #fff;
}

.btn-small {
  padding: 5px 10px;
  font-size: 0.8rem;
}

.icon-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 50%;
}

/* BADGES */
.badge {
  display: inline-block;
  padding: 3px 8px;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 4px;
}

.level-badge {
  background: rgba(14, 165, 233, 0.15);
  color: var(--primary);
  border: 1px solid rgba(14, 165, 233, 0.3);
}

.tech-badge {
  background: var(--bg-card);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.status-indicator {
  font-size: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: 9999px;
}

.status-indicator.online {
  background: rgba(16, 185, 129, 0.15);
  color: var(--success);
}
.status-indicator.online::before {
  content: '';
  width: 6px;
  height: 6px;
  background: var(--success);
  border-radius: 50%;
}

/* MAIN LAYOUT */
.main-content {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
}

.app-layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 24px;
  align-items: start;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h2 {
  font-size: 1.05rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-body {
  padding: 20px;
}

/* FORMS */
.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.flex-1 {
  flex: 1;
}

label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.form-control {
  width: 100%;
  padding: 9px 12px;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  font-size: 0.9rem;
  outline: none;
  transition: var(--transition);
}

.form-control:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.form-range {
  width: 100%;
  accent-color: var(--primary);
  cursor: pointer;
}

.form-error-msg {
  color: var(--danger);
  font-size: 0.75rem;
  margin-top: 4px;
  min-height: 16px;
}

.highlight-val {
  color: var(--primary);
  font-weight: 700;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  text-align: center;
}

.metric-title {
  display: block;
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.metric-value {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--primary);
}

/* CHART */
.chart-wrapper {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.chart-header h3 {
  font-size: 0.92rem;
  font-weight: 700;
}

.chart-legend {
  font-size: 0.75rem;
  color: var(--primary);
}

.svg-chart-container {
  width: 100%;
  height: 180px;
}

/* TABLES */
.table-container {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.table-actions {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border);
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 320px;
}

.search-box i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 0.85rem;
}

.search-input {
  width: 100%;
  padding: 7px 10px 7px 32px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  font-size: 0.85rem;
  outline: none;
}

.results-badge {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  text-align: left;
}

.data-table th, .data-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
}

.data-table th {
  background: rgba(0, 0, 0, 0.15);
  color: var(--text-muted);
  font-weight: 600;
}

.data-table tbody tr:hover {
  background: var(--bg-card-hover);
}

/* FOOTER */
.app-footer {
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  padding: 16px 24px;
  margin-top: auto;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.82rem;
  color: var(--text-muted);
}

.tech-stack-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* RESPONSIVE */
@media (max-width: 992px) {
  .app-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .header-container {
    flex-direction: column;
    align-items: stretch;
  }
  .spa-nav {
    justify-content: center;
  }
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  .form-row {
    flex-direction: column;
  }
  .main-content {
    padding: 14px 10px;
  }
}`;

  // 3. SCRIPT.JS (Robust DOM, Reactive Store, Form Validation, SVG Charts, CSV Export, Keyboard navigation)
  const jsContent = `/**
 * FrontCraft Pro - Project #${p.id}: ${p.title}
 * Production-ready Reactive State Engine with SVG Data Visualization
 */

(function () {
  'use strict';

  // 1. REAKTIV STATE STORE (Observer Pattern)
  const Store = {
    state: {
      items: [
        { id: 1, name: "Boshlang'ich operatsiya", category: "Asosiy", amount: 240, priority: 2, date: "2026-10-01" },
        { id: 2, name: "Optimizatsiya jarayoni", category: "Texnik", amount: 180, priority: 3, date: "2026-10-04" },
        { id: 3, name: "Marketing tahlili", category: "Marketing", amount: 320, priority: 1, date: "2026-10-07" },
        { id: 4, name: "Foydalanuvchilar auditi", category: "Servis", amount: 140, priority: 2, date: "2026-10-10" }
      ],
      filter: '',
      theme: localStorage.getItem('theme_${p.id}') || 'dark'
    },
    listeners: [],

    subscribe(fn) {
      this.listeners.push(fn);
    },

    notify() {
      this.listeners.forEach(fn => fn(this.state));
    },

    addItem(item) {
      this.state.items.unshift(item);
      this.saveToStorage();
      this.notify();
    },

    deleteItem(id) {
      this.state.items = this.state.items.filter(i => i.id !== id);
      this.saveToStorage();
      this.notify();
    },

    clearAll() {
      this.state.items = [];
      this.saveToStorage();
      this.notify();
    },

    setFilter(query) {
      this.state.filter = query.toLowerCase();
      this.notify();
    },

    saveToStorage() {
      try {
        localStorage.setItem('data_${p.id}', JSON.stringify(this.state.items));
        localStorage.setItem('theme_${p.id}', this.state.theme);
      } catch (_) {}
    },

    loadFromStorage() {
      try {
        const raw = localStorage.getItem('data_${p.id}');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.state.items = parsed;
          }
        }
      } catch (_) {}
    }
  };

  // 2. DOM ELEMENTLARI CACHE
  const DOM = {};

  function initDOM() {
    DOM.primaryForm = document.getElementById('primaryForm');
    DOM.itemNameInput = document.getElementById('itemNameInput');
    DOM.itemNameError = document.getElementById('itemNameError');
    DOM.categoryInput = document.getElementById('categoryInput');
    DOM.amountInput = document.getElementById('amountInput');
    DOM.amountError = document.getElementById('amountError');
    DOM.priorityRange = document.getElementById('priorityRange');
    DOM.priorityValue = document.getElementById('priorityValue');
    DOM.refreshApiBtn = document.getElementById('refreshApiBtn');
    DOM.clearAllBtn = document.getElementById('clearAllBtn');
    DOM.exportCsvBtn = document.getElementById('exportCsvBtn');
    DOM.totalRecordsCount = document.getElementById('totalRecordsCount');
    DOM.averageMetricValue = document.getElementById('averageMetricValue');
    DOM.maxMetricValue = document.getElementById('maxMetricValue');
    DOM.svgChartContainer = document.getElementById('svgChartContainer');
    DOM.tableFilterInput = document.getElementById('tableFilterInput');
    DOM.tableResultsCount = document.getElementById('tableResultsCount');
    DOM.dataTableBody = document.getElementById('dataTableBody');
    DOM.themeToggleBtn = document.getElementById('themeToggleBtn');
  }

  // 3. FORM VALIDATSIYASI (Real-time Validation)
  function validateForm() {
    let isValid = true;
    const nameVal = DOM.itemNameInput.value.trim();
    const amountVal = parseFloat(DOM.amountInput.value);

    if (nameVal.length < 3) {
      DOM.itemNameError.textContent = "Nomi kamida 3 ta belgidan iborat bo'lishi kerak.";
      isValid = false;
    } else {
      DOM.itemNameError.textContent = '';
    }

    if (isNaN(amountVal) || amountVal <= 0) {
      DOM.amountError.textContent = "Iltimos, musbat son kiriting.";
      isValid = false;
    } else {
      DOM.amountError.textContent = '';
    }

    return isValid;
  }

  // 4. DINAMIK SVG GRAFIK CHIZISH (Data Visualization)
  function renderSvgChart(items) {
    if (!DOM.svgChartContainer) return;
    if (items.length === 0) {
      DOM.svgChartContainer.innerHTML = '<div style="text-align:center; padding-top:60px; color:var(--text-muted); font-size:0.85rem;">Ma\\'lumot mavjud emas</div>';
      return;
    }

    const maxVal = Math.max(...items.map(i => i.amount), 1);
    const width = DOM.svgChartContainer.clientWidth || 600;
    const height = 180;
    const padding = 24;
    const barWidth = Math.max(14, Math.min(45, (width - padding * 2) / items.length - 8));

    let barsSvg = '';
    items.slice(0, 12).forEach((item, idx) => {
      const barHeight = Math.max(10, ((item.amount / maxVal) * (height - 60)));
      const x = padding + idx * (barWidth + 10);
      const y = height - padding - barHeight;

      barsSvg += \`
        <g class="chart-bar-group" tabindex="0" role="graphics-symbol" aria-label="\${item.name}: \${item.amount}">
          <rect x="\${x}" y="\${y}" width="\${barWidth}" height="\${barHeight}" rx="4" fill="url(#barGradient)" />
          <text x="\${x + barWidth / 2}" y="\${y - 6}" font-size="10" fill="var(--text-muted)" text-anchor="middle">\${item.amount}</text>
          <text x="\${x + barWidth / 2}" y="\${height - 8}" font-size="9" fill="var(--text-muted)" text-anchor="middle">\${item.name.slice(0, 5)}..</text>
        </g>
      \`;
    });

    DOM.svgChartContainer.innerHTML = \`
      <svg width="100%" height="100%" viewBox="0 0 \${width} \${height}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0ea5e9" />
            <stop offset="100%" stop-color="#6366f1" />
          </linearGradient>
        </defs>
        <line x1="\${padding}" y1="\${height - padding}" x2="\${width - padding}" y2="\${height - padding}" stroke="var(--border)" stroke-width="1" />
        \${barsSvg}
      </svg>
    \`;
  }

  // 5. JADVALNI RENDER QILISH (Dynamic Table with Actions)
  function renderTable(items, query) {
    if (!DOM.dataTableBody) return;

    let filtered = items;
    if (query) {
      filtered = items.filter(i => 
        i.name.toLowerCase().includes(query) || 
        i.category.toLowerCase().includes(query)
      );
    }

    if (DOM.tableResultsCount) {
      DOM.tableResultsCount.textContent = filtered.length + " ta natija";
    }

    if (filtered.length === 0) {
      DOM.dataTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted);">Mos keluvchi yozuvlar topilmadi.</td></tr>';
      return;
    }

    DOM.dataTableBody.innerHTML = filtered.map(item => \`
      <tr>
        <td><strong>#\${item.id}</strong></td>
        <td>\${escapeHtml(item.name)}</td>
        <td><span class="badge tech-badge">\${escapeHtml(item.category)}</span></td>
        <td><strong style="color:var(--primary);">\$\${item.amount}</strong></td>
        <td><span style="color:var(--text-muted); font-size:0.8rem;">\${item.date}</span></td>
        <td>
          <button class="btn btn-small btn-danger delete-btn" data-id="\${item.id}" aria-label="O'chirish">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    \`).join('');

    DOM.dataTableBody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.dataset.id, 10);
        Store.deleteItem(id);
      };
    });
  }

  // 6. ASINXRON MOCK API CHAQIRUV (Async API simulation)
  async function fetchMockApiData() {
    if (DOM.refreshApiBtn) {
      DOM.refreshApiBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Yuklanmoqda...';
      DOM.refreshApiBtn.disabled = true;
    }

    await new Promise(r => setTimeout(r, 600));

    const mockTitles = ["Server klasteri tahlili", "Mobil ilova API so'rovlari", "Xavfsizlik protokoli yangilanishi", "Foydalanuvchilar tranzaksiyasi"];
    const randomTitle = mockTitles[Math.floor(Math.random() * mockTitles.length)];
    const randomAmount = Math.floor(Math.random() * 300) + 100;
    const cats = ["Asosiy", "Texnik", "Marketing", "Servis"];

    Store.addItem({
      id: Date.now(),
      name: randomTitle,
      category: cats[Math.floor(Math.random() * cats.length)],
      amount: randomAmount,
      priority: Math.floor(Math.random() * 3) + 1,
      date: new Date().toISOString().split('T')[0]
    });

    if (DOM.refreshApiBtn) {
      DOM.refreshApiBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Yangilash';
      DOM.refreshApiBtn.disabled = false;
    }
  }

  // 7. CSV EKSPORT FUNKSIYASI (Data Export)
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

  // 8. METRIKALARNI YANGILASH (KPI Calculation)
  function updateMetrics(items) {
    if (DOM.totalRecordsCount) DOM.totalRecordsCount.textContent = items.length;
    if (DOM.averageMetricValue) {
      const avg = items.length ? Math.round(items.reduce((s, i) => s + i.amount, 0) / items.length) : 0;
      DOM.averageMetricValue.textContent = '$' + avg;
    }
    if (DOM.maxMetricValue) {
      const max = items.length ? Math.max(...items.map(i => i.amount)) : 0;
      DOM.maxMetricValue.textContent = '$' + max;
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

  // 9. REAKTIV OBUNA BO'YICHA INTERFEYSNI YANGILASH
  Store.subscribe(state => {
    updateMetrics(state.items);
    renderSvgChart(state.items);
    renderTable(state.items, state.filter);
  });

  // 10. HODISALARNI SOZLASH (Event Listeners)
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

    // SPA Tab Navigation
    document.querySelectorAll('.spa-nav-link').forEach(link => {
      link.onclick = (e) => {
        document.querySelectorAll('.spa-nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      };
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (DOM.primaryForm) DOM.primaryForm.reset();
      }
    });
  }

  // ILovani ishga tushirish
  document.addEventListener('DOMContentLoaded', () => {
    initDOM();
    Store.loadFromStorage();
    document.body.setAttribute('data-theme', Store.state.theme);
    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.innerHTML = Store.state.theme === 'dark' 
        ? '<i class="fa-solid fa-moon"></i>' 
        : '<i class="fa-solid fa-sun"></i>';
    }
    initEvents();
    Store.notify();
  });

})();
`;

  // 4. README.MD
  const readmeContent = `# ${p.id}. ${p.title}

## Tavsif
**${p.title}** — ${p.category} toifasiga mansub, FrontCraft Pro platformasining professional darajadagi interaktiv frontend loyihasidir. Loyiha asinxron ma'lumotlar bilan ishlash, SVG ma'lumotlar vizualizatsiyasi, Observer arxitekturasidagi reaktiv State boshqaruvi va to'liq moslashuvchan (Responsive) interfeysni o'z ichiga oladi.

## Asosiy Imkoniyatlar
${p.features.map(f => `- **${f}**`).join('\n')}
- **Reaktiv Store**: Observer and Pub/Sub patternlari orqali markazlashtirilgan holat boshqaruvi.
- **Dinamik SVG Grafiki**: Haqiqiy matematik koordinatalar asosida chiziluvchi dinamik ustunli diagramma.
- **Form Validatsiyasi**: Xatoliklarni real vaqt rejimida aniqlovchi xavfsiz forma boshqaruvi.
- **CSV Eksport**: Kiritilgan barcha ma'lumotlarni bir bosishda fayl ko'rinishida eksport qilish.
- **Xotira (LocalStorage)**: Foydalanuvchi ma'lumotlari va tanlangan tema brauzerda doimiy saqlanadi.

## Texnologiyalar
${p.tech.map(t => `- ${t}`).join('\n')}

## Ishga tushirish
Hech qanday murakkab freymvorklarsiz ishlaydi:
1. \`index.html\` faylini istalgan zamonaviy veb-brauzerda oching.
2. Yoki mahalliy server orqali:
\`\`\`bash
npx serve .
\`\`\`

## Mualliflik va Litsenziya
FrontCraft Pro Jamoasi. MIT Litsenziyasi asosida taqdim etiladi.
`;

  // 5. PACKAGE.JSON
  const pkgContent = JSON.stringify({
    name: slug,
    version: "1.0.0",
    description: p.title,
    main: "index.html",
    scripts: {
      "start": "npx serve ."
    },
    keywords: ["frontend", "javascript", p.category.toLowerCase(), ...p.tags.map(t => t.toLowerCase())],
    author: "FrontCraft Pro",
    license: "MIT"
  }, null, 2);

  // 6. LICENSE
  const licenseContent = `MIT License

Copyright (c) 2026 FrontCraft Frontend Platform

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
    downloads: 1600 + ((p.id * 89) % 4500),
    preview: `./06. Loyihalar/${folderName}/index.html`,
    demo: `./06. Loyihalar/${folderName}/index.html`,
    zip: `./zips/${p.id}-${slug}.zip`,
    lesson: {
      objective: `${p.title} loyihasi orqali ${p.category} doirasidagi asinxron API bilan ishlash, reaktiv state boshqaruvi va dinamik SVG grafiklar chizishni o'zlashtirish.`,
      steps: [
        `1. ${p.title} arxitekturasi va reaktiv store modelini loyihalash`,
        "2. SPA navigatsiyasini va semantik shablonni yaratish",
        "3. CSS o'zgaruvchilari yordamida zamonaviy dashboard stillarini yozish",
        "4. Dinamik SVG ustunli grafik chizish algoritmini ishlab chiqish",
        "5. Formani kiritishda real-vaqtli validatsiya va CSV eksport funksiyalarini ulash"
      ],
      codeExplanation: `Ushbu loyihada Observer patterniga asoslangan reaktiv Store, asinxron ma'lumotlar oqimi (Promise/async/await) va SVG koordinatalar hisobi qo'llanilgan.`,
      exercise: `Ushbu loyihaga yangi ma'lumotlar toifasini qo'shing va SVG grafigida ranglarni toifaga qarab dinamik o'zgaruvchi qiling.`
    }
  };
}

function runStage3() {
  console.log('🚀 BOSQICH 1: 50 ta yangi loyiha (201 - 250) yaratish boshlandi...');

  if (!fs.existsSync(PROJECTS_JSON)) {
    console.error('projects.json topilmadi!');
    process.exit(1);
  }

  const existingProjects = JSON.parse(fs.readFileSync(PROJECTS_JSON, 'utf8'));
  const newProjectEntries = [];

  for (const p of STAGE_3_PROJECTS) {
    const entry = generateProjectFiles(p);
    newProjectEntries.push(entry);
    console.log(`✅ [${p.id}/250] Yaratildi: ${p.title}`);
  }

  // Merge into projects.json
  const existingMap = new Map();
  existingProjects.forEach(p => existingMap.set(p.id, p));
  newProjectEntries.forEach(p => existingMap.set(p.id, p));

  const mergedProjects = Array.from(existingMap.values()).sort((a, b) => a.id - b.id);
  fs.writeFileSync(PROJECTS_JSON, JSON.stringify(mergedProjects, null, 2), 'utf8');

  console.log(`\n🎉 Bosqich 1 yakunlandi! Jami loyihalar soni: ${mergedProjects.length}`);
}

runStage3();
