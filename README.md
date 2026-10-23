# 🎓 65-maktab "EduMemory" — O‘quvchilar Davomati va Ota-onalarni Xabardor Qilish Tizimi

Ushbu to‘liq ishchi tizim 65-maktab o‘quvchilari davomatini yuritish, Telegram Mini App orqali o‘qituvchilarga qulay interfeys taqdim etish va har kuni soat 14:00 da ota-onalarni avtomatik tarzda Telegram orqali xabardor qilish uchun ishlab chiqilgan.

---

## 🛠 Texnologik Stak

- **Backend:** Node.js, Express.js
- **Bot:** Telegraf (Telegram Bot API)
- **Ma'lumotlar bazasi:** SQLite (`better-sqlite3` orqali)
- **Rejali vazifalar (Cron):** `node-cron`
- **Frontend:** Telegram Web App (HTML5, TailwindCSS, Vanilla JS)

---

## 📂 Loyiha Tuzilmasi

```
├── .env                  # Muhit o'zgaruvchilari (maxfiy tokenlar)
├── .env.example          # Muhit o'zgaruvchilari namunasi
├── db.js                 # SQLite bazasi, jadvallar yaratish va seed ma'lumotlar
├── index.js              # Express API server, Telegram Bot va Cron Job
├── package.json          # Loyiha qaramliklari (dependencies)
├── public/               # Telegram Mini App (Frontend)
│   ├── index.html        # Mini App HTML tuzilmasi
│   ├── style.css         # Telegram temalari va maxsus stillar
│   └── app.js            # Frontend JavaScript mantig'i
└── README.md             # Qo'llanma
```

---

## ⚙️ O'rnatish va Ishga Tushirish

### 1. Bog'liqliklarni o'rnatish
Terminalda loyiha papkasiga kiring va qaramliklarni o'rnating:
```bash
npm install
```

### 2. `.env` faylini sozlash
`.env` faylini oching va Telegram bot tokeningizni kiriting:
```env
# @BotFather orqali olingan token
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ

# Web App manzili (lokal sinov uchun ngrok yoki hosting domeni)
WEBAPP_URL=https://your-domain.ngrok-free.app

# Port
PORT=3000

# Maktab nomi
SCHOOL_NAME=65-umumiy o'rta ta'lim maktabi

# Cron job vaqti (Dushanba-Shanba, soat 14:00)
CRON_SCHEDULE=0 14 * * 1-6

# Telegram flood limitdan himoyalanish kechikishi (ms)
MESSAGE_DELAY_MS=50
```

### 3. Serverni ishga tushirish
```bash
# Oddiy rejimda
npm start

# Yoki o'zgarishlarni avtomatik kuzatuvchi rejimda:
npm run dev
```

Server ishga tushgach, avtomatik tarzda:
1. `edumemory.db` SQLite faylini yaratadi;
2. `classes`, `students`, `attendance` jadvallarini tuzadi;
3. 65-maktab uchun test sinflari (9-A, 9-B, 10-A, 11-A) va o‘quvchilar ro‘yxatini (`seed data`) kiritadi;
4. Telegram Bot va Cron Job'ni faollashtiradi.

---

## 🤖 Telegram Bot va Mini App Sozlash

### 1. @BotFather da bot ochish
1. Telegramda [@BotFather](https://t.me/BotFather) ga kiring va `/newbot` buyrug'ini yuboring.
2. Bot nomi va username bering (masalan: `EduMemory65_bot`).
3. Berilgan HTTP API tokenni `.env` dagi `BOT_TOKEN` maydoniga yozing.

### 2. Mini App menyu tugmasini ulash
Mini App Telegramda ochilishi uchun HTTPS manzili (SSL sertifikat) talab etiladi. Lokal rivojlantirishda `ngrok` dan foydalanish mumkin:
```bash
npx ngrok http 3000
```
Hosil bo'lgan `https://xxxx.ngrok-free.app` manzilini `.env` dagi `WEBAPP_URL` maydoniga yozing.

So'ngra @BotFather orqali:
1. `/mybots` -> O'z botingizni tanlang -> `Bot Settings` -> `Menu Button` -> `Configure menu button`.
2. Menyu tugmasi uchun URL manzilini kiriting: `https://xxxx.ngrok-free.app`
3. Tugma nomiga masalan: `📝 Davomat` deb yozing.

---

## 📱 Tizim Funksiyalari va Ishlash Tamoyili

### 1. Ota-onani o'quvchiga biriktirish (Deep Linking):
- O'qituvchi Mini App ichida har bir o'quvchi ro'parasidagi `Ota-onani ulash` tugmasini bosadi.
- Maxsus Telegram havola yaratiladi:
  `https://t.me/EduMemory65_bot?start=student_1`
- Ota-ona ushbu havola orqali botga kirib **Start** tugmasini bosishi bilanoq, uning `chat_id`si bazada o'sha o'quvchiga avtomatik biriktiriladi (`UPDATE students SET parent_chat_id = ...`).
- Ota-onaga tabriknoma va tasdiq xabari yuboriladi.

### 2. O'qituvchi uchun Mini App:
- Sinflarni gorizontal panel orqali oson almashtirish.
- Har bir o'quvchi ro'parasida 4 ta yirik sensorli tugma:
  - **[✅ Keldi]** (yashil)
  - **[❌ Kelmadi]** (qizil)
  - **[⏰ Kechikdi]** (sariq — tanlanganda izoh kiritish maydoni ochiladi)
  - **[📋 Sababli]** (moviy — tanlanganda sabab kiritish maydoni ochiladi)
- **⚡ Barchasini "Keldi" qilish** tezkor tugmasi.
- Haqiqiy vaqtda yangilanib boruvchi statistika hisoblagichlari.
- **💾 Davomatni saqlash** tugmasi bosilganda barcha ma'lumotlar SQLite bazasiga bitta tranzaksiya bilan saqlanadi.

### 3. Avtomatlashtirilgan xabarnoma (Cron Job):
- Har kuni dushanbadan shanbagacha soat **14:00 da** `node-cron` avtomatik ishga tushadi.
- Bugungi sanadagi davomat yozuvlarini tekshiradi va ota-onasi biriktirilgan barcha o'quvchilar bo'yicha chiroyli HTML formatida xabarnoma yuboradi.
- Telegram flood limit cheklovlariga uchramaslik uchun har bir xabar oralig'ida **50 ms** kechikish mavjud.
- Xabar namunasi:
  ```html
  🔔 65-MAKTAB | "EduMemory" DAVOMAT XABARI

  📅 Sana: 23-oktabr, 2026-yil
  👤 O‘quvchi: Aliyev Jasur Rustam o‘g‘li
  🏫 Sinf: 9-A

  📊 Davomat holati: ✅ Darsda qatnashdi (Kelgan)
  ━━━━━━━━━━━━━━━━━━━━
  Hurmatli ota-ona, farzandingizning darslarga o‘z vaqtida qatnashishi kelajakdagi muvaffaqiyati garovidir!
  ```
