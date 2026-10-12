// scripts/generate-stage4.js - Generate Batch 2 (Projects 251 to 300: Intermediate & Advanced)
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROJECTS_DIR = path.join(ROOT_DIR, '06. Loyihalar');
const PROJECTS_JSON = path.join(ROOT_DIR, 'data', 'projects.json');

const STAGE_4_PROJECTS = [
  {
    id: 251,
    title: "Real-Vaqt Birja Qimmatli Qog'ozlar Portfeli va Risklar Tahlili",
    category: "Dashboard",
    tech: ["HTML5", "CSS3", "JavaScript", "Stock Portfolio", "SVG Risk Matrix", "LocalStorage"],
    tags: ["Stock Market", "Portfolio", "Risk Analysis", "Trading", "Dashboard"],
    features: ["Aktivlar (Aksiyalar, Obligatsiyalar, Kripto) bo'yicha diversifikatsiya diagrammasi", "Foyda va zararlar (P&L) hisoblagichi hamda volatilite risk ko'rsatkichi", "Yangi aksiyalarni qo'shish va bozor narxlari simulyatsiyasi"],
    duration: "70 daqiqa"
  },
  {
    id: 252,
    title: "Onlayn Mebel Do'koni Xona Interyeri Vizualizatori",
    category: "E-commerce",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas Room", "Furniture Catalog", "Store"],
    tags: ["Furniture", "Interior Design", "Room Planner", "Canvas", "E-commerce"],
    features: ["Xona o'lchamlari bo'yicha mebellarni (Divan, Stol, Shkaf) Canvasda joylashtirish", "Tanlangan mebellarning jami narxini real vaqtda hisoblash va savatchaga o'tkazish", "Xona maketini rasm (PNG) shaklida saqlash va yuklab olish"],
    duration: "80 daqiqa"
  },
  {
    id: 253,
    title: "Coworking Markazi Joylar va Konferens Zal Bronlash Kalendari",
    category: "Landing",
    tech: ["HTML5", "CSS3", "JavaScript", "Seat Booking", "Calendar Picker", "Price Calculator"],
    tags: ["Coworking", "Office Space", "Desk Booking", "Calendar", "Landing"],
    features: ["Open Space, Shaxsiy kabinet va Meeting Room zonalari bo'yicha joy tanlash", "Soatbay va kunlik tariflar bo'yicha to'lov summasini bir zumda hisoblash", "Mijoz ma'lumotlari kiritiluvchi ko'p parametrli xavfsiz bron formasi"],
    duration: "65 daqiqa"
  },
  {
    id: 254,
    title: "Mikroservislar Holati va Server Klasterlari Salomatligi Monitoringi",
    category: "Admin panel",
    tech: ["HTML5", "CSS3", "JavaScript", "Microservices", "Health Check", "Incident Matrix"],
    tags: ["Microservices", "DevOps", "Cluster Health", "Latency", "Admin Panel"],
    features: ["Klaster tugunlari (Nodes) bo'yicha CPU, RAM va Disk bandligi metrikalari", "Har bir mikroservis (Auth, Payment, Notification) javob vaqti (ms) monitoringi", "Nosozlik yuz berganda avtomatik qayta ishga tushirish (Restart) simulyatsiyasi"],
    duration: "75 daqiqa"
  },
  {
    id: 255,
    title: "Geografik Aholi Demografiyasi va Issiqlik Xaritasi (Heatmap)",
    category: "Data visualization",
    tech: ["HTML5", "CSS3", "JavaScript", "SVG Heatmap", "Demographics", "Filters"],
    tags: ["Demographics", "Heatmap", "Population", "SVG Map", "Visualization"],
    features: ["Hududlar bo'yicha aholi zichligi va yosh toifalari (Bolalar, Yoshlar, Kattalar) taqsimoti", "SVG koordinatali xaritada rang intensivligi bo'yicha dinamik issiqlik xaritasi", "Yillar kesimida demografik o'sish tendentsiyalarini filtrlash"],
    duration: "70 daqiqa"
  },
  {
    id: 256,
    title: "Piksel San'at Labirint Qidiruv va Sarguzasht O'yini (Canvas Game)",
    category: "O'yinlar",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas 2D", "Maze Generator", "Collision Detection"],
    tags: ["Pixel Art", "Maze Game", "Canvas", "Adventure", "Retro"],
    features: ["Algoritmik generatsiya qilingan labirint xaritasida qahramon harakati", "Tanga yig'ish, dushmanlardan qochish va chiqish eshigini topish mexanikasi", "Qadamlar sanagichi, qolgan vaqt va eng yaxshi natijalar jadvali"],
    duration: "80 daqiqa"
  },
  {
    id: 257,
    title: "SVG Vektorli Grafika Tahrirlagichi va Kod Eksporti",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "SVG Editor", "Path Drawing", "Code Generator"],
    tags: ["SVG Editor", "Vector Drawing", "Path Generator", "Graphics", "Editor"],
    features: ["To'rtburchak, aylana, to'g'ri chiziq va erkin egri chiziqlar (Bezier) chizish", "Ranglar, hoshiya qalinligi va shaffoflikni real vaqtda boshqarish", "Chizilgan shaklning toza SVG kodini bir bosishda clipboardga nusxalash"],
    duration: "75 daqiqa"
  },
  {
    id: 258,
    title: "Mahsulot Yo'l Xaritasi (Roadmap) va Kvartal Rejalari Boshqaruvi",
    category: "Kanban",
    tech: ["HTML5", "CSS3", "JavaScript", "Product Roadmap", "Drag and Drop", "Timeline"],
    tags: ["Roadmap", "Product Strategy", "Quarters", "Agile", "Kanban"],
    features: ["Q1, Q2, Q3 va Q4 kvartallari bo'ylab strategik vazifalar taqsimoti", "Vazifalarni ustunlar va ustuvorliklar bo'yicha sudrab ko'chirish (Drag & Drop)", "Rivojlanish bosqichi (Tadqiqot, Ishlanma, Beta, Reliz) foiz hisoblagichi"],
    duration: "65 daqiqa"
  },
  {
    id: 259,
    title: "Dunyo Poytaxtlari Jonli Vaqt Mintaqalari va Quyosh Chiqishi API",
    category: "API loyihalar",
    tech: ["HTML5", "CSS3", "JavaScript", "World Clock", "Timezone API", "Analog Canvas"],
    tags: ["World Time", "Timezones", "Sunrise Sunset", "API Mock", "Clocks"],
    features: ["Toshkent, London, Nyu-York, Tokio shaharlarining real vaqtdagi analog soatlari", "Quyosh chiqishi, botishi va kun uzunligi bo'yicha astronomik ko'rsatkichlar", "Shahar nomi bo'yicha tezkor qidiruv va yangi poytaxtni qo'shish"],
    duration: "70 daqiqa"
  },
  {
    id: 260,
    title: "Shaxsiy Byudjet Xarajatlari va Tejamkorlik Maqsadlari Kuzatuvchisi",
    category: "CRM/To-do",
    tech: ["HTML5", "CSS3", "JavaScript", "Budget Tracker", "Savings Goals", "SVG Progress"],
    tags: ["Budgeting", "Personal Finance", "Savings", "Expenses", "Finance"],
    features: ["Oylik maosh, qo'shimcha daromadlar va xarajatlar toifalari bo'yicha hisob", "Orzudagi xaridlar (Uy, Avtomobil, Sayohat) uchun jamg'arma foizi sanagichi", "Haftalik xarajatlar limitdan oshib ketganda sariq va qizil ogohlantirish"],
    duration: "65 daqiqa"
  },
  {
    id: 261,
    title: "Ipoteka Krediti va Dastlabki To'lov Subsidiya Kalkulyatori",
    category: "Calculator",
    tech: ["HTML5", "CSS3", "JavaScript", "Mortgage Calculator", "Amortization Table", "Export"],
    tags: ["Mortgage", "Loan Calculator", "Subsidy", "Amortization", "Calculator"],
    features: ["Uy qiymati, dastlabki to'lov va kredit muddatiga qarab oylik to'lovni hisoblash", "Davlat subsidiyasi va imtiyozli foiz stavkalarini hisobga olish rejimi", "Oylar va yillar kesimidagi to'lovlar jadvali (Amortizatsiya) eksporti"],
    duration: "65 daqiqa"
  },
  {
    id: 262,
    title: "UX/UI Dizayner Case-Study Portfoliosi va Loyihalar Vitrinasi",
    category: "Portfolio",
    tech: ["HTML5", "CSS3", "JavaScript", "Case Studies", "Lightbox Modal", "Interactive"],
    tags: ["UI UX Portfolio", "Case Study", "Design Showcase", "Prototypes", "Portfolio"],
    features: ["Mobil ilovalar va veb-saytlar dizayni uchun batafsil Case Study slayderi", "Dizayn bosqichlari (Muammo, Tadqiqot, Wireframe, UI Yechim) vizualizatori", "Katta rasm va prototiplarni to'liq ekranda ko'rsatuvchi Lightbox modali"],
    duration: "65 daqiqa"
  },
  {
    id: 263,
    title: "Omborxona Logistikasi va Avtomatlashgan Robotlar Telemetriyasi",
    category: "Dashboard",
    tech: ["HTML5", "CSS3", "JavaScript", "AGV Robots", "Warehouse Grid", "Sensors"],
    tags: ["Warehouse Logistics", "AGV Robotics", "Sensors", "Automation", "Dashboard"],
    features: ["Omborda harakatlanuvchi avtomat robotlar (AGV) akkumulyatori va tezligi nazorati", "Tokchalar bo'shligi va tovarlarni yuklash/tushirish buyurtmalari oqimi", "Kutilmagan to'siqlar yuzaga kelganda avariya signali va zaxira marshruti"],
    duration: "75 daqiqa"
  },
  {
    id: 264,
    title: "Telegram Web Uslubidagi Xabarlar, Stikerlar va Ovozli Xabar UI",
    category: "Chat UI",
    tech: ["HTML5", "CSS3", "JavaScript", "Messenger UI", "Audio Wave", "Stickers"],
    tags: ["Telegram Clone", "Messenger", "Voice Messages", "Stickers", "Chat UI"],
    features: ["Suhbatdoshlar ro'yxati, yozilayotgan xabarlar (typing...) animatsiyasi", "Simulyatsiya qilingan ovozli xabar (Voice Note) to'lqini va pleyeri", "Stikerlar va emojilar to'plami hamda xabarlarni o'chirish/tahrirlash"],
    duration: "70 daqiqa"
  },
  {
    id: 265,
    title: "YouTube Uslubidagi Video Pleyer, Pleylist va Sharhlar Oqimi",
    category: "Clone UI",
    tech: ["HTML5", "CSS3", "JavaScript", "Custom Player", "Comments Engine", "Playlist"],
    tags: ["YouTube Clone", "Video Player", "Playlist", "Comments", "Clone UI"],
    features: ["Shaxsiy video pleyer boshqaruv paneli (Play/Pause, Timeline, Ovoz, Fullscreen)", "Tavsiya etilgan videolar pleylisti va avtomatik keyingi videoga o'tish", "Foydalanuvchi sharhlari kiritish, like bosish va vaqt belgilari (Timestamps)"],
    duration: "75 daqiqa"
  },
  {
    id: 266,
    title: "Moliyaviy Bozor Shamchalar Grafigi va Bollinger Chiziqlari",
    category: "Data visualization",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas Trading", "Bollinger Bands", "MA Indicator"],
    tags: ["Trading Chart", "Candlestick", "Bollinger Bands", "Crypto", "Data Viz"],
    features: ["Canvas orqali 60 ta narx shamchalari va harakatlanuvchi o'rtacha (MA) chizig'i", "Bollinger Bands diapazoni orqali o'zgaruvchanlik (volatility) chegaralari", "Crosshair kursori orqali aniq sana, Open, High, Low, Close qiymatlarini ko'rish"],
    duration: "80 daqiqa"
  },
  {
    id: 267,
    title: "Korporativ Xodimlar KPI va 360 Daraja Baholash Tizimi",
    category: "Admin panel",
    tech: ["HTML5", "CSS3", "JavaScript", "360 Feedback", "Radar Chart", "Employee Matrix"],
    tags: ["HR Management", "360 Evaluation", "KPI", "Radar Chart", "Admin"],
    features: ["Yetakchilik, jamoaviylik, texnik bilim va muloqot bo'yicha SVG radar grafigi", "Hamkasblar va rahbarlar tomonidan anonim baho va izohlar kiritish", "Yillik bonus koeffitsientini avtomatik hisoblash va eksport"],
    duration: "70 daqiqa"
  },
  {
    id: 268,
    title: "Onlayn Zargarlik Do'koni 3D Brilyant Tanlovchi va O'lcham Moslashtirgich",
    category: "E-commerce",
    tech: ["HTML5", "CSS3", "JavaScript", "Jewelry Showcase", "Ring Size Finder", "Store"],
    tags: ["Jewelry Store", "Ring Sizer", "Diamond Selector", "Luxury", "E-commerce"],
    features: ["Brilyant qirralari (Dumaloq, Malika, Zumrad) va metall turi (Oltin, Platina) tanlovi", "Barmog'ingizga mos uzuk o'lchamini topuvchi interaktiv vizual o'lchov vositasi", "Karat, soflik va rang parametrlariga qarab narxni lahzada hisoblash"],
    duration: "70 daqiqa"
  },
  {
    id: 269,
    title: "Odatlar Zanjiri va Kunlik Intizom Gamifikatsiyasi",
    category: "CRM/To-do",
    tech: ["HTML5", "CSS3", "JavaScript", "Habit Chain", "Gamification", "Streak Counter"],
    tags: ["Habit Tracker", "Streaks", "Gamification", "Discipline", "Productivity"],
    features: ["Har kuni odat bajarilganda 'Zanjirni uzma' (Streak) sanagichini oshirish", "Tajriba ballari (XP), yangi unvonlar (Novice, Master, Legend) va nishonlar", "Oylik bajarilish foizini ko'rsatuvchi interaktiv faollik kalendari"],
    duration: "65 daqiqa"
  },
  {
    id: 270,
    title: "Kosmik Teleskoplar Galereyasi va NASA Astronomiya Rasmlari API",
    category: "API loyihalar",
    tech: ["HTML5", "CSS3", "JavaScript", "NASA APOD Mock", "Zoomable Canvas", "Favorites"],
    tags: ["Astronomy", "NASA API", "Space", "Cosmos", "Gallery"],
    features: ["Har kuni yangilanuvchi kosmik fotosuratlar va ilmiy tushuntirishlar", "Koinot tumanliklari va galaktikalarni yaqinlashtirib (Zoom) ko'rish vositasi", "Sevimli astronomik kashfiyotlarni xatcho'plarga saqlash"],
    duration: "65 daqiqa"
  },
  {
    id: 271,
    title: "Soliqlar va Daromad Solig'i Deklaratsiyasi Hisoblagichi",
    category: "Calculator",
    tech: ["HTML5", "CSS3", "JavaScript", "Tax Calculation", "Brackets Matrix", "Report PDF"],
    tags: ["Tax Calculator", "Income Tax", "Deductions", "Finance", "Calculator"],
    features: ["Yillik daromad, soliq imtiyozlari va ushlab qolinadigan summalarni hisoblash", "Progressiv soliq stavkalari pog'onasi bo'yicha to'lovlar tahlili", "Yakuniy hisob-kitob varaqasini chop etishga tayyorlash"],
    duration: "60 daqiqa"
  },
  {
    id: 272,
    title: "SaaS Mahsuloti Konversiya Landing Sahifasi va A/B Test Elementlari",
    category: "Landing",
    tech: ["HTML5", "CSS3", "JavaScript", "A/B Testing UI", "FAQ Accordion", "Pricing Toggle"],
    tags: ["SaaS Landing", "Conversion", "AB Testing", "Pricing Table", "Landing"],
    features: ["Oylik va yillik 20% chegirmali narxlar rejalari almashtirgichi", "Interaktiv ko'p so'raladigan savollar (Accordion) va mijozlar guvohliklari", "Turli tugma sarlavhalari bo'yicha konversiya bosishlarini hisoblovchi A/B test"],
    duration: "65 daqiqa"
  },
  {
    id: 273,
    title: "JSON Formatlovchi, Validator va Daraxtsimon Ko'ruvchi",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "JSON Parser", "Tree Viewer", "Minifier"],
    tags: ["JSON Formatter", "Validator", "Tree View", "Developer Tool", "Editor"],
    features: ["Tartibsiz JSON kodini 2 yoki 4 bo'shliq bilan chiroyli formatlash", "Sintaksis xatolarini qator raqami bilan birgalikda qizil bilan ko'rsatish", "Daraxtsimon (Tree View) interfeysda tugunlarni ochish va yopish imkoniyati"],
    duration: "65 daqiqa"
  },
  {
    id: 274,
    title: "Roguelike Zindon Sarguzashti va Qahramon Inventar Tizimi",
    category: "O'yinlar",
    tech: ["HTML5", "CSS3", "JavaScript", "Roguelike Canvas", "Turn Based", "Inventory"],
    tags: ["Roguelike", "Dungeon Crawler", "Turn-based", "Inventory", "Games"],
    features: ["Qadamma-qadam (Turn-based) harakatlanuvchi qahramon va zindon maxluqlari", "Qilich, qalqon, sehrli ichimliklar yig'iluvchi interaktiv inventar xaltasi", "Jon (HP), tajriba darajasi va zindondan qochish missiyasi"],
    duration: "85 daqiqa"
  },
  {
    id: 275,
    title: "Neumorphic Audio Ekvalayzer va Chastotalar Animatsiyasi",
    category: "Animatsiya",
    tech: ["HTML5", "CSS3", "JavaScript", "Neumorphism", "CSS Equalizer", "Audio Presets"],
    tags: ["Audio Equalizer", "Neumorphic", "Sound Frequencies", "Presets", "Animation"],
    features: ["Bas, O'rta va Yuqori chastotalar (60Hz dan 16kHz gacha) slayderlari", "Tayyor janrlar (Rock, Jazz, Pop, Electronic) sozlamalarini bir zumda yuklash", "Musiqa ritmiga mos harakatlanuvchi rangli neon to'lqinlar animatsiyasi"],
    duration: "65 daqiqa"
  },
  {
    id: 276,
    title: "Freelancer Shartnomalari va Soatlik Ish Vaqti Tahlili",
    category: "Portfolio",
    tech: ["HTML5", "CSS3", "JavaScript", "Time Tracker", "Invoice Generator", "Store"],
    tags: ["Freelance", "Time Tracker", "Invoice", "Hourly Rate", "Portfolio"],
    features: ["Mijozlar loyihalari bo'yicha ish vaqti taymeri (Start / Pause / Finish)", "Soatlik stavkaga asoslanib avtomatik rasmiy hisob-faktura (Invoice) yaratish", "Haftalik va oylik daromad hisoboti hamda CSV eksport"],
    duration: "70 daqiqa"
  },
  {
    id: 277,
    title: "Discord Uslubidagi Serverlar, Ovozli Kanallar va Rollar UI",
    category: "Chat UI",
    tech: ["HTML5", "CSS3", "JavaScript", "Discord Clone", "Voice Channels", "Roles"],
    tags: ["Discord Clone", "Community Server", "Voice Rooms", "Roles", "Chat UI"],
    features: ["Serverlar piktogrammalari, matnli kanallar va ovozli xonalar tuzilishi", "Ovozli xonaga ulanish simulyatsiyasi va gapirayotganda yashil halqa yonishi", "Foydalanuvchilar rollari (Admin, Moderator, Member) va profiling kartasi"],
    duration: "75 daqiqa"
  },
  {
    id: 278,
    title: "Trello Uslubidagi Dinamik Doska, Teglar va Muddatlar",
    category: "Clone UI",
    tech: ["HTML5", "CSS3", "JavaScript", "Trello Clone", "Kanban Board", "Checklists"],
    tags: ["Trello Clone", "Kanban Board", "Due Dates", "Labels", "Clone UI"],
    features: ["Yangi ro'yxatlar (Lists) va kartalar qo'shish, ustunlar bo'ylab sudrash", "Rangli teglar (Labels), bajarilish muddati (Due date) va kichik vazifalar ro'yxati", "Kartalar ichida izoh qoldirish va arxivlash imkoniyati"],
    duration: "75 daqiqa"
  },
  {
    id: 279,
    title: "IT Aktivlari va Korporativ Texnika Inventarizatsiyasi",
    category: "Admin panel",
    tech: ["HTML5", "CSS3", "JavaScript", "IT Asset Management", "Hardware Inventory", "Status"],
    tags: ["Asset Management", "Hardware", "Laptops", "IT Inventory", "Admin"],
    features: ["Noutbuklar, monitorlar va serverlarning seriya raqamlari bo'yicha bazasi", "Texnika holati (Ishlatilmoqda, Ta'mirda, Hisobdan chiqarilgan) nazorati", "Xodimlarga texnika biriktirish va qabul qilish dalolatnomasi"],
    duration: "70 daqiqa"
  },
  {
    id: 280,
    title: "Global Dengiz Yuk Tashuvlari va Portlar Tirbandligi Grafigi",
    category: "Data visualization",
    tech: ["HTML5", "CSS3", "JavaScript", "Maritime Shipping", "Port Congestion", "SVG Map"],
    tags: ["Maritime Logistics", "Cargo Ships", "Ports", "Shipping", "Visualization"],
    features: ["Yirik xalqaro portlar (Shanxay, Rotterdam, Singapur) bo'yicha kemalar soni", "Tirbandlik darajasi (Past, O'rtacha, Yuqori) va kechikish kunlari jadvali", "Yuk kemalarining dengiz yo'llari bo'ylab simulyatsiya qilingan trafigi"],
    duration: "70 daqiqa"
  },
  {
    id: 281,
    title: "Avtoservis Ustaxonasi Navbat va Ishlar Taqsimoti Doskasi",
    category: "Kanban",
    tech: ["HTML5", "CSS3", "JavaScript", "Auto Repair Kanban", "Mechanic Assignment", "Status"],
    tags: ["Auto Repair", "Service Queue", "Workshop", "Mechanics", "Kanban"],
    features: ["Qabul qilindi, Diagnostika, Ehtiyot qismlar kutilmoqda, Tayyor ustunlari", "Har bir avtomobilga usta (mexanik) biriktirish va ta'mirlash qiymati", "Buyurtmachi telefon raqami orqali tezkor qidiruv va statusni yangilash"],
    duration: "65 daqiqa"
  },
  {
    id: 282,
    title: "Xalqaro Valyuta Ayirboshlash Shoxobchalari va API Xaritasi",
    category: "API loyihalar",
    tech: ["HTML5", "CSS3", "JavaScript", "Exchange Branches", "Distance Sort", "Rates API"],
    tags: ["Currency Exchange", "Branch Locator", "Best Rates", "Forex API", "Finance"],
    features: ["Eng yaxshi sotib olish va sotish kurslarini taklif qiluvchi shoxobchalar", "Foydalanuvchi joylashuviga yaqin shoxobchalarni masofa (km) bo'yicha saralash", "Valyutani oldindan band qilish (Rezervatsiya) va komissiyasiz hisob"],
    duration: "65 daqiqa"
  },
  {
    id: 283,
    title: "E-Commerce Buyurtmalar Monitoringi va Logistika Boshqaruvi",
    category: "Dashboard",
    tech: ["HTML5", "CSS3", "JavaScript", "Order Tracking", "Courier Dispatch", "Charts"],
    tags: ["Order Fulfillment", "Dispatch", "E-commerce Logistics", "Fulfillment", "Dashboard"],
    features: ["Yangi tushgan buyurtmalar, qadoqlash va kuryerga topshirish oqimi", "Kuryerlar bo'yicha kunlik yetkazib berish unumdorligi ko'rsatkichi", "Mijoz manzili, to'lov turi va buyurtma tafsilotlari modali"],
    duration: "70 daqiqa"
  },
  {
    id: 284,
    title: "Avtomobil Yoqilg'i Sarfi va Sayohat Xarajatlari Kalkulyatori",
    category: "Calculator",
    tech: ["HTML5", "CSS3", "JavaScript", "Fuel Consumption", "Trip Cost", "Passengers"],
    tags: ["Fuel Calculator", "Road Trip", "Gas Mileage", "Travel Cost", "Calculator"],
    features: ["Bosib o'tiladigan masofa, 100 km uchun yoqilg'i sarfi va benzin narxi hisobi", "Yo'l xarajatini avtomobildagi yo'lovchilar soniga teng taqsimlash kalkulyatori", "Turli yoqilg'i turlari (Benzin, Gaz, Elektr) bo'yicha tejash taqqoslagichi"],
    duration: "60 daqiqa"
  },
  {
    id: 285,
    title: "Kitoblar Do'koni Audio Namuna va Elektron Kutubxona Savdosi",
    category: "E-commerce",
    tech: ["HTML5", "CSS3", "JavaScript", "Book Store", "Audio Sample", "E-library"],
    tags: ["Bookstore", "Audiobooks", "E-books", "Library", "E-commerce"],
    features: ["Badiiy va biznes adabiyotlari katalogi, janrlar bo'yicha filtrlar", "Kitobning birinchi bobini audio tinglab ko'rish interaktiv pleyeri", "Elektron kitobni (PDF/EPUB) savatchaga qo'shish va chegirma kuponi"],
    duration: "70 daqiqa"
  },
  {
    id: 286,
    title: "CSS Box-Shadow, Gradient va Border-Radius Vizual Generator",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "CSS Generator", "Visual Sliders", "Copy CSS"],
    tags: ["CSS Generator", "Box Shadow", "Gradient Maker", "Web Design", "Editor"],
    features: ["Soya siljishi, tarqalishi, xiraligi va shaffofligini slayderlarda boshqarish", "Ko'p qatlamli chiziqli va radial gradientlarni real vaqtda ko'rish", "Bir bosishda tayyor ishlab chiqarish sifatidagi toza CSS kodini nusxalash"],
    duration: "65 daqiqa"
  },
  {
    id: 287,
    title: "Tezkor Matematik Hisoblash va Aql Charxi Turniri",
    category: "O'yinlar",
    tech: ["HTML5", "CSS3", "JavaScript", "Math Quiz", "Speed Timer", "Combo Multiplier"],
    tags: ["Mental Math", "Brain Training", "Speed Math", "Quiz Game", "Games"],
    features: ["60 soniya ichida ketma-ket arifmetik misollarni to'g'ri topish musobaqasi", "Ketma-ket to'g'ri javoblar uchun Combo ko'paytiruvchisi (x2, x3, x5 ballar)", "O'yin yakunida aniqlik foizi va eng yaxshi natijalar jadvali"],
    duration: "60 daqiqa"
  },
  {
    id: 288,
    title: "Kiberxavfsizlik Firewall va Tarmoq Trafiki Oqimi Analitikasi",
    category: "Dashboard",
    tech: ["HTML5", "CSS3", "JavaScript", "Network Firewall", "Traffic Flow", "Threat Log"],
    tags: ["Firewall", "Network Security", "Traffic Flow", "DDoS Protection", "Dashboard"],
    features: ["Kiruvchi va chiquvchi tarmoq paketlari (MB/s) bo'yicha jonli SVG grafigi", "Shubhali IP manzillar va bloklangan hujumlar (DDoS, Brute-force) jurnali", "Firewall qoidalarini (Allow / Block / Drop) kiritish boshqaruv paneli"],
    duration: "75 daqiqa"
  },
  {
    id: 289,
    title: "Parallaks Aylanish va 3D Kartalar Slayderi Animatsiyasi",
    category: "Animatsiya",
    tech: ["HTML5", "CSS3", "JavaScript", "3D Parallax", "Card Carousel", "Perspective"],
    tags: ["Parallax", "3D Slider", "Perspective CSS", "Visual Showcase", "Animation"],
    features: ["Sichqoncha kursoriga qarab 3D chuqurlik burchagi bilan aylanuvchi kartalar", "Slayder orqali kartalarni silliq surish va kattalashtirish effekti", "Animatsiya tezligi va yorug'lik aks etishini (Glare effect) sozlash"],
    duration: "65 daqiqa"
  },
  {
    id: 290,
    title: "Twitter / X Uslubidagi Qisqa Xabarlar, Retvit va Trendlar UI",
    category: "Clone UI",
    tech: ["HTML5", "CSS3", "JavaScript", "Twitter Clone", "Character Counter", "Feed"],
    tags: ["Twitter Clone", "X Feed", "Retweet", "Hashtags", "Clone UI"],
    features: ["280 ta belgigacha xabar kiritish va doiraviy SVG belgi sanagichi", "Xabarlarga Retweet qilish, Like bosish va izoh yozish imkoniyati", "Ommabop mavzular (#Trends) paneli va foydalanuvchilar qidiruvi"],
    duration: "75 daqiqa"
  },
  {
    id: 291,
    title: "Ekologik Turizm Sayohatlari va Gid Yollash Platformasi",
    category: "Landing",
    tech: ["HTML5", "CSS3", "JavaScript", "Eco Tourism", "Guide Booking", "Equipment List"],
    tags: ["Eco Tourism", "Trekking", "Mountain Tours", "Guide Finder", "Landing"],
    features: ["Tog'li hududlar va milliy bog'lar bo'ylab piyoda sayohat yo'nalishlari", "Sertifikatlangan mahalliy gidlar profili va mijozlar sharhlari", "Sayohat uchun zarur anjomlar (Palatka, ryukzak) ro'yxati va buyurtma formasi"],
    duration: "65 daqiqa"
  },
  {
    id: 292,
    title: "Foydali Odatlar Tracker va Pomodoro Fokus Taymeri",
    category: "CRM/To-do",
    tech: ["HTML5", "CSS3", "JavaScript", "Pomodoro Timer", "Habit List", "Sound Alert"],
    tags: ["Pomodoro", "Focus Timer", "Habit Tracker", "Productivity", "Time Management"],
    features: ["25 daqiqa ish va 5 daqiqa dam olish Pomodoro intervallari taymeri", "Vaqt tugaganda ovozli signal va brauzer bildirishnomasi", "Kun davomida bajarilgan fokus seanslari soni va odatlar hisoboti"],
    duration: "65 daqiqa"
  },
  {
    id: 293,
    title: "RegEx (Muntazam Ifodalar) Jonli Sinovchi va Kod Tushuntiruvchi",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "Regex Tester", "Highlight Match", "Flags"],
    tags: ["Regex", "Regular Expression", "Developer Tool", "Pattern Match", "Editor"],
    features: ["Kiritilgan RegEx andozasini matn ichida bir zumda sariq rangda belgilash", "Modifikatorlar (g, i, m, s) va match guruhlarini (Groups) alohida ko'rsatish", "Ko'p ishlatiluvchi tayyor shablonlar (Email, Telefon, URL, Parol) kutubxonasi"],
    duration: "65 daqiqa"
  },
  {
    id: 294,
    title: "Dunyo Muzeylari Eksponatlari API Qidiruvi va Saralash",
    category: "API loyihalar",
    tech: ["HTML5", "CSS3", "JavaScript", "Museum API", "Art Gallery", "Infinite Scroll"],
    tags: ["Museum Art", "Metropolitan Museum", "Artifacts", "Art API", "Culture"],
    features: ["San'atkorlar, asrlar va san'at yo'nalishlari (Rassomchilik, Haykaltaroshlik) bo'yicha filtr", "Eksponatning yuqori aniqlikdagi tasviri va muzey inventar raqami", "Eksponatlarni sevimli kolleksiyaga saqlash va yuklab olish"],
    duration: "70 daqiqa"
  },
  {
    id: 295,
    title: "Avtokredit, Sug'urta va Qayta Moliyalash Matritsasi",
    category: "Calculator",
    tech: ["HTML5", "CSS3", "JavaScript", "Car Loan", "Insurance KASKO", "Comparison"],
    tags: ["Auto Loan", "Car Insurance", "Refinancing", "Calculator", "Finance"],
    features: ["Yangi yoki minilgan avtomobil uchun oylik to'lov va umumiy foizni hisoblash", "Majburiy va ixtiyoriy (KASKO) sug'urta badallarini umumiy xarajatga qo'shish", "Banklar shartlarini yonma-yon solishtirish va eng arzon taklifni aniqlash"],
    duration: "65 daqiqa"
  },
  {
    id: 296,
    title: "Fullstack Dasturchi Texnik Blogi va Interaktiv Loyihalar Karta",
    category: "Portfolio",
    tech: ["HTML5", "CSS3", "JavaScript", "Developer Blog", "Code Blocks", "Search"],
    tags: ["Developer Blog", "Technical Writing", "Case Studies", "Portfolio", "Web Dev"],
    features: ["Dasturlash maqolalari, kod parchalari va arxitektura tushuntirishlari", "Teglar (JavaScript, Node.js, Docker, WebGL) bo'yicha lahzali qidiruv", "Maqolani baholash va muallifga fikr-mulohaza qoldirish formasi"],
    duration: "65 daqiqa"
  },
  {
    id: 297,
    title: "Restoranlar Tarmog'i Filiallari va Franshiza Boshqaruvi",
    category: "Admin panel",
    tech: ["HTML5", "CSS3", "JavaScript", "Franchise Management", "Branch Revenue", "KPI"],
    tags: ["Restaurant Chain", "Franchise", "Branch Sales", "Inventory", "Admin"],
    features: ["Har bir filialning kunlik savdo tushumi, chek o'rtacha qiymati va mijozlar soni", "Kamomad va ombor zaxiralari bo'yicha markaziy ta'minot talabnomalari", "Filiallar reytingi va xodimlar maosh fondi hisoboti"],
    duration: "75 daqiqa"
  },
  {
    id: 298,
    title: "Flowchart Diagrammalar va Blok-Sxemalar Muharriri",
    category: "Editor",
    tech: ["HTML5", "CSS3", "JavaScript", "Flowchart Canvas", "Node Connectors", "Export PNG"],
    tags: ["Flowchart", "Diagram Editor", "Mind Map", "Workflow", "Editor"],
    features: ["Start/End, Jarayon, Qaror (Romb) bloklarini doskaga joylashtirish", "Bloklarni yo'naltiruvchi strelkalar bilan o'zaro bog'lash mexanikasi", "Yaratilgan blok-sxemani rasm (PNG) yoki JSON fayl sifatida saqlash"],
    duration: "80 daqiqa"
  },
  {
    id: 299,
    title: "Zamonaviy Arxitektura Byurosi va Loyihalar Panoramasi",
    category: "Landing",
    tech: ["HTML5", "CSS3", "JavaScript", "Architecture Showcase", "Before After Slider", "Landing"],
    tags: ["Architecture", "Urban Design", "Blueprint", "Interior", "Landing"],
    features: ["Bino va inshootlar loyihalarining chizmalari va 3D vizualizatsiyasi", "Qurilishdan oldingi va keyingi holatni ko'rsatuvchi interaktiv Before/After slayderi", "Loyiha smetasini hisoblash bo'yicha maslahat so'rovnomasi"],
    duration: "65 daqiqa"
  },
  {
    id: 300,
    title: "Scrum Sprint Boshqaruv Doskasi va Burndown Diagrammasi",
    category: "Kanban",
    tech: ["HTML5", "CSS3", "JavaScript", "Scrum Board", "Burndown Chart", "Story Points"],
    tags: ["Scrum Master", "Agile", "Sprint Planning", "Burndown", "Kanban"],
    features: ["Story Pointlar bilan baholangan vazifalar, sprint muddati va mas'ullar", "Kunlar kesimida qolgan vazifalarni ko'rsatuvchi haqiqiy SVG Burndown grafigi", "Vazifalarni to'liq yakunlash va sprintni arxivlash boshqaruvi"],
    duration: "80 daqiqa"
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
          <i class="fa-solid fa-cube"></i>
        </div>
        <div class="brand-text">
          <h1>${p.title}</h1>
          <p class="subtitle">FrontCraft Pro &bull; №${p.id} Loyiha (${p.category})</p>
        </div>
      </div>

      <!-- SPA Navigatsiya -->
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
          <h2><i class="fa-solid fa-circle-plus"></i> Yangi Parametr / Yozuv</h2>
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
                  <option value="Marketing">Marketing / Rivojlanish</option>
                  <option value="Texnik">Texnik ta'minot</option>
                  <option value="Servis">Mijozlar servisi</option>
                </select>
              </div>

              <div class="form-group flex-1">
                <label for="amountInput"><i class="fa-solid fa-coins"></i> Miqdor / Ko'rsatkich:</label>
                <input type="number" id="amountInput" class="form-control" placeholder="100" min="1" value="180" required>
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
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
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

/* MAIN CONTENT */
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
        { id: 1, name: "Boshlang'ich operatsiya", category: "Asosiy", amount: 260, priority: 2, date: "2026-10-02" },
        { id: 2, name: "Optimizatsiya jarayoni", category: "Texnik", amount: 195, priority: 3, date: "2026-10-05" },
        { id: 3, name: "Marketing tahlili", category: "Marketing", amount: 340, priority: 1, date: "2026-10-08" },
        { id: 4, name: "Foydalanuvchilar auditi", category: "Servis", amount: 160, priority: 2, date: "2026-10-11" }
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
            <stop offset="100%" stop-color="#8b5cf6" />
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

    const mockTitles = ["Telemetriya oqimi", "Kriptografik shifrlash", "Baza optimizatsiyasi", "Yangi marshrut tahlili"];
    const randomTitle = mockTitles[Math.floor(Math.random() * mockTitles.length)];
    const randomAmount = Math.floor(Math.random() * 320) + 110;
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
    downloads: 1750 + ((p.id * 83) % 4300),
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

function runStage4() {
  console.log('🚀 BOSQICH 2: 50 ta yangi loyiha (251 - 300) yaratish boshlandi...');

  if (!fs.existsSync(PROJECTS_JSON)) {
    console.error('projects.json topilmadi!');
    process.exit(1);
  }

  const existingProjects = JSON.parse(fs.readFileSync(PROJECTS_JSON, 'utf8'));
  const newProjectEntries = [];

  for (const p of STAGE_4_PROJECTS) {
    const entry = generateProjectFiles(p);
    newProjectEntries.push(entry);
    console.log(`✅ [${p.id}/300] Yaratildi: ${p.title}`);
  }

  // Merge into projects.json
  const existingMap = new Map();
  existingProjects.forEach(p => existingMap.set(p.id, p));
  newProjectEntries.forEach(p => existingMap.set(p.id, p));

  const mergedProjects = Array.from(existingMap.values()).sort((a, b) => a.id - b.id);
  fs.writeFileSync(PROJECTS_JSON, JSON.stringify(mergedProjects, null, 2), 'utf8');

  console.log(`\n🎉 Bosqich 2 yakunlandi! Jami loyihalar soni: ${mergedProjects.length}`);
}

runStage4();
