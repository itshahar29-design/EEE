require('dotenv').config();
const path = require('path');
const express = require('express');
const { Telegraf } = require('telegraf');
const cron = require('node-cron');
const multer = require('multer');
const xlsx = require('xlsx');
const db = require('./db.js');

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const SCHOOL_NAME = process.env.SCHOOL_NAME || "65-umumiy o'rta ta'lim maktabi";
const TEACHER_PIN = process.env.TEACHER_PIN || '6565';
const ADMIN_PIN = process.env.ADMIN_PIN || '9900';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '+998996893228';
const MESSAGE_DELAY_MS = parseInt(process.env.MESSAGE_DELAY_MS || '50', 10);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getStatusDisplay(status) {
  switch (status) {
    case 'keldi':
      return { emoji: '✅', label: 'Keldi' };
    case 'kelmadi':
      return { emoji: '❌', label: 'Kelmadi' };
    case 'kechikdi':
      return { emoji: '⏱', label: 'Kechikdi' };
    case 'sababli':
      return { emoji: '📋', label: 'Sababli' };
    default:
      return { emoji: '❓', label: 'Belgilanmagan' };
  }
}

function formatUzbekDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = [
    'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
    'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
  ];
  const monthName = months[parseInt(m, 10) - 1] || m;
  return `${parseInt(d, 10)}-${monthName}, ${y}-yil`;
}

// ==========================================
// 1. TELEGRAM BOT INTEGRATSIYASI
// ==========================================
let bot = null;
let botUsername = '';

if (BOT_TOKEN && BOT_TOKEN.trim() !== '') {
  try {
    bot = new Telegraf(BOT_TOKEN);

    bot.telegram.getMe().then((me) => {
      botUsername = me.username;
      console.log(`🤖 Telegram Bot faol: @${botUsername}`);
    }).catch((err) => {
      console.warn('⚠️ Bot getMe xatosi:', err.message);
    });

    // 1. /start buyrug'i: Faqat bitta qulay kontakt yuborish tugmasi
    bot.start(async (ctx) => {
      const welcomeText =
        `Assalomu alaykum! <b>65-maktabning "EduMemory"</b> ` +
        `(9-A va 9-B sinflari davomat tizimi) botiga xush kelibsiz.\n\n` +
        `Farzandingizning kunlik maktab davomati haqida shaxsiy Telegram profilingizga ` +
        `avtomatik xabarnomalar olish uchun quyidagi tugmani bosing va <b>telefon raqamingizni tasdiqlang</b>:`;

      return ctx.replyWithHTML(welcomeText, {
        reply_markup: {
          keyboard: [
            [{ text: '📱 Telefon raqamimni tasdiqlash', request_contact: true }]
          ],
          resize_keyboard: true,
          one_time_keyboard: false
        }
      });
    });

    // 2. Kontakt kartasini qabul qilish: Bosh Admin, Sinf rahbarlari va Ota-onalar
    bot.on('contact', async (ctx) => {
      try {
        const contact = ctx.message.contact;
        if (!contact || !contact.phone_number) {
          return ctx.reply('Telefon raqami aniqlanmadi.');
        }

        const rawPhone = contact.phone_number;
        const chatId = ctx.chat.id;
        const webAppUrl = process.env.WEBAPP_URL || `http://localhost:${PORT}`;

        // 1. Xodimlar (Bosh Admin yoki Sinf rahbari) tekshiruvi
        const staffMember = await db.getStaffByPhone(rawPhone);
        if (staffMember) {
          await db.linkStaffByPhone(rawPhone, chatId);

          if (staffMember.role === 'admin') {
            return ctx.replyWithHTML(
              `👑 <b>Assalomu alaykum, Bosh Administrator!</b>\n\n` +
              `Sizning Telegram profilingiz tizimga muvaffaqiyatli biriktirildi.\n` +
              `Siz <b>9-A</b> va <b>9-B</b> sinflari davomatini to‘liq boshqarish va monitoring qilish huquqiga egasiz.\n\n` +
              `👇 Tizimni ochish uchun pastdagi tugmani bosing:`,
              {
                reply_markup: {
                  keyboard: [
                    [{ text: '📝 Davomatni ochish (Mini App)', web_app: { url: webAppUrl } }],
                    [{ text: '📊 Umumiy davomat holati' }]
                  ],
                  resize_keyboard: true
                }
              }
            );
          } else if (staffMember.role === 'teacher') {
            return ctx.replyWithHTML(
              `👨‍🏫 <b>Assalomu alaykum, ${escapeHtml(staffMember.full_name)}!</b>\n\n` +
              `Siz <b>${escapeHtml(staffMember.class_name || '9-sinf')}</b> rahbari sifatida tizimga muvaffaqiyatli ulandingiz.\n` +
              `Dars kunlari soat 08:00 dan 13:30 gacha o‘z sinfingiz davomatini belgilashingiz mumkin.\n\n` +
              `👇 Davomatni ochish uchun pastdagi tugmani bosing:`,
              {
                reply_markup: {
                  keyboard: [
                    [{ text: '📝 Davomatni ochish (Mini App)', web_app: { url: webAppUrl } }],
                    [{ text: '📊 Sinfim davomati' }]
                  ],
                  resize_keyboard: true
                }
              }
            );
          }
        }

        // 2. Ota-onalar tekshiruvi (9-A va 9-B o'quvchilari bilan solishtirish)
        const linkedStudents = await db.linkParentByPhone(rawPhone, chatId);

        if (linkedStudents && linkedStudents.length > 0) {
          let msg = `✅ <b>Assalomu alaykum!</b>\n\n` +
                    `Siz quyidagi o‘quvchi(lar)ning ota-onasi sifatida tizimga muvaffaqiyatli ulandingiz:\n\n`;

          for (const s of linkedStudents) {
            msg += `▫️ <b>${escapeHtml(s.full_name)}</b> (${escapeHtml(s.class_name)})\n`;
          }

          msg += `\n🔔 Har kuni soat 14:00 da darslar tugagach davomat shaxsiy profilingizga avtomatik yuboriladi.`;

          return ctx.replyWithHTML(msg, {
            reply_markup: {
              keyboard: [
                [{ text: '📊 Farzandim davomati' }],
                [{ text: '🔄 Raqamni qayta tekshirish', request_contact: true }]
              ],
              resize_keyboard: true
            }
          });
        } else {
          return ctx.replyWithHTML(
            `❌ <b>Siz yuborgan telefon raqami 9-sinflar ro'yxatida topilmadi.</b>\n\n` +
            `Raqam: <b>${escapeHtml(rawPhone)}</b>\n\n` +
            `Iltimos, farzandingizning <b>sinf rahbariga (9-A yoki 9-B)</b> murojaat qiling va telefon raqamingiz to‘g‘ri kiritilganligini tekshirtiring. ` +
            `O‘qituvchi raqamingizni tizimga kiritgach, qayta kontakt yuborsangiz darhol ulanasiz.`,
            {
              reply_markup: {
                keyboard: [
                  [{ text: '📱 Telefon raqamimni tasdiqlash', request_contact: true }]
                ],
                resize_keyboard: true
              }
            }
          );
        }
      } catch (err) {
        console.error('Contact error:', err);
        ctx.reply('Kontaktni tekshirishda xatolik yuz berdi.');
      }
    });

    // 3. Farzand davomati hisoboti
    bot.hears(['/holat', '📊 Farzandim davomati'], async (ctx) => {
      try {
        const today = db.getTodayString();
        const students = await db.getStudentsByParentChatId(ctx.chat.id, today);

        if (!students || students.length === 0) {
          return ctx.replyWithHTML(
            `ℹ️ <b>Siz hali hech bir 9-sinf o‘quvchisiga biriktirilmagansiz.</b>\n\n` +
            `Iltimos, pastdagi <b>"📱 Telefon raqamimni tasdiqlash"</b> tugmasini bosing:`,
            {
              reply_markup: {
                keyboard: [
                  [{ text: '📱 Telefon raqamimni tasdiqlash', request_contact: true }]
                ],
                resize_keyboard: true
              }
            }
          );
        }

        let message = `🔔 <b>65-MAKTAB | DAVOMAT HISOBOTI</b>\n`;
        message += `📅 <b>Sana:</b> ${formatUzbekDate(today)}\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        for (const s of students) {
          const statusInfo = getStatusDisplay(s.status);
          message += `👤 <b>O'quvchi:</b> ${escapeHtml(s.full_name)}\n`;
          message += `🏫 <b>Sinf:</b> ${escapeHtml(s.class_name)}\n`;
          message += `📊 <b>Holat:</b> ${statusInfo.emoji} <b>${statusInfo.label}</b>\n`;
          if (s.reason) {
            message += `📝 <b>Izoh:</b> <i>${escapeHtml(s.reason)}</i>\n`;
          }
          message += `\n`;
        }

        message += `━━━━━━━━━━━━━━━━━━━━\n`;
        message += `<i>Farzandingiz ta'lim-tarbiyasiga befarq bo'lmaganingiz uchun tashakkur!</i>`;

        return ctx.replyWithHTML(message);
      } catch (err) {
        console.error('Holat command error:', err);
        ctx.reply('Ma\'lumotlarni olishda xatolik yuz berdi.');
      }
    });

    // 4. Admin buyrug'i
    bot.command('admin', (ctx) => {
      const webAppUrl = process.env.WEBAPP_URL || `http://localhost:${PORT}`;
      ctx.replyWithHTML(
        `👨‍🏫 <b>EduMemory — 9-sinflar Davomat Tizimi</b>\n\n` +
        `Davomat kiritish (08:00 - 13:30) yoki nazorat qilish uchun pastdagi tugmani bosing:`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '📝 Davomatni ochish (Mini App)', web_app: { url: webAppUrl } }]
            ]
          }
        }
      );
    });

    bot.launch().catch((err) => {
      console.error('❌ Bot launch xatosi:', err.message);
    });

    process.once('SIGINT', () => bot && bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot && bot.stop('SIGTERM'));

  } catch (err) {
    console.error('⚠️ Telegraf xatosi:', err.message);
  }
}

// ==========================================
// 2. QAT'IY 14:00 CRON JOB VA AVTOMAT DISPATCH
// ==========================================
async function runDailyAttendanceDispatch() {
  const today = db.getTodayString();
  console.log(`⏰ [CRON 14:00] ${today} sanasi uchun 9-A va 9-B xabarnomasi boshlandi.`);

  // 1. TAKRORIY XABARLARNI BLOKLASH
  const alreadyDispatched = await db.isDailyDispatched(today);
  if (alreadyDispatched) {
    console.log(`⚠️ [CRON 14:00] ${today} sanasi uchun xabarlar allaqachon yuborilgan! Qayta yuborish to‘xtatildi.`);
    return;
  }

  // 2. DAVOMAT QILINMAGAN SINFLAR NAZORATI (9-A va 9-B)
  const unmarkedClasses = await db.getUnmarkedClassesToday(today);
  const unmarkedNames = unmarkedClasses.map(c => c.name);

  if (unmarkedClasses.length > 0) {
    console.warn(`⚠️ [CRON 14:00] Bugun davomat kiritilmagan sinflar:`, unmarkedNames.join(', '));

    // Bosh Administratorga ogohlantirish yuborish
    const adminChatIds = await db.getAdminChatIds();
    if (bot && adminChatIds.length > 0) {
      for (const cls of unmarkedClasses) {
        const adminAlert = 
          `⚠️ <b>DIQQAT! 65-MAKTAB MA'MURIYATI NAZORATIGA:</b>\n\n` +
          `Bugun <b>${escapeHtml(cls.name)}</b> sinfi davomati o‘qituvchi tomonidan kiritilmadi!\n` +
          `❌ Ota-onalarga xabar bormadi.\n\n` +
          `📅 Sana: ${today}\n` +
          `⏱ Dedlayn: 13:30 da yakunlangan.`;

        for (const chatId of adminChatIds) {
          try {
            await bot.telegram.sendMessage(chatId, adminAlert, { parse_mode: 'HTML' });
            await sleep(MESSAGE_DELAY_MS);
          } catch (err) {
            console.error(`❌ Admin alert xatosi (${chatId}):`, err.message);
          }
        }
      }
    }
  }

  // 3. OTA-ONALARGA BUGUNGI DAVOMAT XABARNOMASINI YUBORISH
  if (!bot) {
    console.warn('⚠️ Telegram bot mavjud emas.');
    await db.recordDailyDispatch({
      date: today,
      total_sent: 0,
      total_failed: 0,
      unmarked_classes: unmarkedNames,
      status: 'completed'
    });
    return;
  }

  const pendingList = await db.getPendingNotifications(today);
  console.log(`📤 [CRON 14:00] ${today} bo‘yicha yuboriladigan xabarlar soni: ${pendingList.length} ta.`);

  let sent = 0;
  let failed = 0;
  const notifiedIds = [];

  for (const item of pendingList) {
    const statusInfo = getStatusDisplay(item.status);
    const messageText = 
      `🔔 <b>65-MAKTAB | DAVOMAT HISOBOTI</b>\n\n` +
      `👤 <b>O'quvchi:</b> ${escapeHtml(item.full_name)}\n` +
      `🏫 <b>Sinf:</b> ${escapeHtml(item.class_name)}\n` +
      `📅 <b>Sana:</b> ${item.date}\n` +
      `📊 <b>Holat:</b> ${statusInfo.emoji} <b>${statusInfo.label}</b>\n` +
      (item.reason ? `📝 <b>Izoh:</b> <i>${escapeHtml(item.reason)}</i>\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `<i>Farzandingiz ta'lim-tarbiyasiga befarq bo'lmaganingiz uchun tashakkur!</i>`;

    try {
      await bot.telegram.sendMessage(item.parent_chat_id, messageText, {
        parse_mode: 'HTML'
      });
      sent++;
      notifiedIds.push(item.attendance_id);
    } catch (err) {
      failed++;
      console.error(`❌ Xabar yuborilmadi (Chat ID: ${item.parent_chat_id}):`, err.message);
    }

    if (MESSAGE_DELAY_MS > 0) {
      await sleep(MESSAGE_DELAY_MS);
    }
  }

  if (notifiedIds.length > 0) {
    await db.markAttendanceAsNotified(notifiedIds);
  }

  // 4. daily_dispatches jadvaliga qayd etish
  await db.recordDailyDispatch({
    date: today,
    total_sent: sent,
    total_failed: failed,
    unmarked_classes: unmarkedNames,
    status: 'completed'
  });

  console.log(`✅ [CRON 14:00] ${today} sanasi uchun xabarlar yakunlandi. Yuborildi: ${sent}, Xato: ${failed}.`);
}

// Har kuni Dushanba-Shanba soat 14:00 da (Asia/Tashkent)
const cronSchedule = process.env.CRON_SCHEDULE || '0 14 * * 1-6';

cron.schedule(
  cronSchedule,
  async () => {
    try {
      await runDailyAttendanceDispatch();
    } catch (err) {
      console.error('❌ Cron job bajarilishida xatolik:', err);
    }
  },
  {
    timezone: 'Asia/Tashkent'
  }
);
console.log(`⏱️ Cron avtomat xabarnoma rejalashtirildi: [${cronSchedule}], Timezone: Asia/Tashkent`);

// ==========================================
// 3. REST API ROUTELARI
// ==========================================

app.get('/ping', (req, res) => res.status(200).send('pong'));
app.get('/health', (req, res) => res.status(200).json({
  status: 'ok',
  uptime: Math.floor(process.uptime()),
  db: db.hasPostgres ? 'postgresql' : 'sqlite',
  tashkentTime: db.getTashkentTimeParts()
}));

// 1. PIN tekshiruvi (O'qituvchi: 6565, Bosh Admin: 9900)
app.post('/api/verify-pin', (req, res) => {
  const { pin } = req.body;
  const cleanPin = String(pin || '').trim();

  if (cleanPin === String(ADMIN_PIN).trim()) {
    return res.json({
      success: true,
      role: 'admin',
      message: 'Bosh Administrator (Ma’muriyat) sifatida kirdingiz'
    });
  }

  if (cleanPin === String(TEACHER_PIN).trim()) {
    return res.json({
      success: true,
      role: 'teacher',
      message: 'Sinf rahbari sifatida kirdingiz'
    });
  }

  return res.status(401).json({
    success: false,
    error: 'PIN-kod noto‘g‘ri!'
  });
});

// 2. Config va Time-Lock holati
app.get('/api/config', (req, res) => {
  const today = db.getTodayString();
  const timeInfo = db.checkAttendanceWindow(today);

  res.json({
    schoolName: SCHOOL_NAME,
    botUsername: botUsername,
    today: today,
    serverTime: timeInfo.serverTime,
    isFrozen: timeInfo.isFrozen,
    freezeReason: timeInfo.reason,
    editWindow: { start: '08:00', end: '13:30' },
    hasPostgres: db.hasPostgres
  });
});

// 3. Sinflar ro'yxati (Faqat 9-A va 9-B)
app.get('/api/classes', async (req, res) => {
  try {
    const classes = await db.getAllClasses();
    res.json({ success: true, data: classes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. O'quvchilar va davomat (Faqat 9-A yoki 9-B)
app.get('/api/classes/:id/students', async (req, res) => {
  try {
    const classId = parseInt(req.params.id, 10);
    const date = req.query.date || db.getTodayString();

    const students = await db.getStudentsWithAttendance(classId, date);
    const classInfo = await db.getClassById(classId);
    const windowInfo = db.checkAttendanceWindow(date);

    res.json({
      success: true,
      data: {
        class: classInfo,
        date: date,
        students: students,
        isFrozen: windowInfo.isFrozen,
        freezeReason: windowInfo.reason
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. O'quvchi qo'shish (Real o'quvchi)
app.post('/api/students', async (req, res) => {
  try {
    const { full_name, class_id, parent_phone } = req.body;
    if (!full_name || !class_id) {
      return res.status(400).json({ success: false, error: 'F.I.SH va sinf tanlanishi shart' });
    }
    const newStudent = await db.createStudent({ full_name, class_id: parseInt(class_id, 10), parent_phone });
    res.json({ success: true, data: newStudent });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. O'quvchini tahrirlash
app.put('/api/students/:id', async (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    const { full_name, class_id, parent_phone } = req.body;
    const updated = await db.updateStudent(studentId, { full_name, class_id: parseInt(class_id, 10), parent_phone });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. O'quvchini o'chirish
app.delete('/api/students/:id', async (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    await db.deleteStudent(studentId);
    res.json({ success: true, message: 'O‘quvchi o‘chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Ota-ona telefon raqamini tezkor yangilash
app.post('/api/students/:id/phone', async (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    const { phone } = req.body;
    const updated = await db.updateStudentParentPhone(studentId, phone);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Davomat saqlash (Qat'iy 08:00 - 13:30 Time-Lock)
app.post('/api/attendance', async (req, res) => {
  try {
    const { date, records } = req.body;
    const targetDate = date || db.getTodayString();

    const windowCheck = db.checkAttendanceWindow(targetDate);
    if (!windowCheck.allowed) {
      return res.status(403).json({
        success: false,
        error: windowCheck.reason,
        isFrozen: true
      });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, error: 'Ma\'lumotlar to‘liq emas' });
    }

    const savedCount = await db.saveAttendanceBatch(records, targetDate);
    res.json({ success: true, message: 'Davomat muvaffaqiyatli saqlandi', savedCount });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, error: err.message });
  }
});

// 10. Ma'muriyat monitoringi (9-A va 9-B xulosasi)
app.get('/api/admin/summary', async (req, res) => {
  try {
    const date = req.query.date || db.getTodayString();
    const summary = await db.getClassAttendanceSummary(date);
    const isDispatched = await db.isDailyDispatched(date);
    const timeInfo = db.checkAttendanceWindow(date);

    res.json({
      success: true,
      date,
      isDispatched,
      isFrozen: timeInfo.isFrozen,
      freezeReason: timeInfo.reason,
      summary
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Statistika
app.get('/api/stats', async (req, res) => {
  try {
    const date = req.query.date || db.getTodayString();
    const classId = req.query.classId ? parseInt(req.query.classId, 10) : null;
    const stats = await db.getAttendanceStats(date, classId);
    res.json({ success: true, data: stats, date });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. Excel Import (Real o'quvchilarni ommaviy yuklash)
app.post('/api/import/excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, error: 'Excel fayl tanlanmagan!' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = xlsx.utils.sheet_to_json(worksheet);

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ success: false, error: 'Excel faylda ma\'lumotlar topilmadi!' });
    }

    let importedCount = 0;
    const classesMap = {};

    const existingClasses = await db.getAllClasses();
    for (const c of existingClasses) {
      classesMap[c.name.toUpperCase().trim()] = c.id;
    }

    for (const row of rawRows) {
      const classNameRaw = row['Sinf'] || row['sinf'] || row['Class'] || row['class'];
      const fullNameRaw = row['O‘quvchi F.I.SH'] || row['O\'quvchi F.I.SH'] || row['F.I.SH'] || row['Ism'] || row['Full Name'];
      const phoneRaw = row['Ota-ona telefoni'] || row['Telefon'] || row['Phone'] || row['Tel'];

      if (!classNameRaw || !fullNameRaw) continue;

      const className = String(classNameRaw).toUpperCase().trim();
      const fullName = String(fullNameRaw).trim();
      const phone = phoneRaw ? String(phoneRaw).trim() : '';

      // Faqat 9-A yoki 9-B ga yuklashga ruxsat
      const classId = classesMap[className];
      if (!classId) continue;

      await db.createStudent({
        full_name: fullName,
        class_id: classId,
        parent_phone: phone
      });
      importedCount++;
    }

    res.json({
      success: true,
      message: `${importedCount} ta o‘quvchi 9-sinflar ro‘yxatiga muvaffaqiyatli yuklandi!`,
      count: importedCount
    });
  } catch (err) {
    console.error('Excel import error:', err);
    res.status(500).json({ success: false, error: 'Excel faylni qayta ishlashda xatolik: ' + err.message });
  }
});

// 13. Excel Export (Oylik Davomat Jurnali)
app.get('/api/export/excel', async (req, res) => {
  try {
    const classId = parseInt(req.query.classId, 10);
    const month = req.query.month || db.getTodayString().slice(0, 7);

    if (isNaN(classId)) {
      return res.status(400).send('Sinf tanlanishi shart');
    }

    const exportData = await db.getMonthAttendanceForExport(classId, month);
    if (!exportData || !exportData.class) {
      return res.status(404).send('Sinf ma\'lumotlari topilmadi');
    }

    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    const attMap = {};
    for (const a of exportData.attendance) {
      const day = parseInt(a.date.split('-')[2], 10);
      attMap[`${a.student_id}_${day}`] = a.status;
    }

    const headerRow1 = [
      `65-MAKTAB | "${exportData.class.name}" SINFI OYLIK DAVOMAT JURNALI (${month})`
    ];
    const headerRow2 = [
      '№',
      'O‘quvchi F.I.SH',
      'Ota-ona telefoni'
    ];

    for (let d = 1; d <= daysInMonth; d++) {
      headerRow2.push(String(d));
    }
    headerRow2.push('Keldi (+)', 'Kelmadi (-)', 'Kechikdi (K)', 'Sababli (S)', 'Qatnashuv %');

    const aoa = [headerRow1, [], headerRow2];

    exportData.students.forEach((student, index) => {
      let keldi = 0;
      let kelmadi = 0;
      let kechikdi = 0;
      let sababli = 0;
      let markedDays = 0;

      const row = [
        index + 1,
        student.full_name,
        db.formatPhone(student.parent_phone) || 'Yo‘q'
      ];

      for (let d = 1; d <= daysInMonth; d++) {
        const st = attMap[`${student.id}_${d}`];
        if (st) {
          markedDays++;
          if (st === 'keldi') { keldi++; row.push('+'); }
          else if (st === 'kelmadi') { kelmadi++; row.push('-'); }
          else if (st === 'kechikdi') { kechikdi++; row.push('K'); }
          else if (st === 'sababli') { sababli++; row.push('S'); }
          else row.push('');
        } else {
          row.push('');
        }
      }

      const percent = markedDays > 0 ? `${Math.round(((keldi + kechikdi) / markedDays) * 100)}%` : '0%';
      row.push(keldi, kelmadi, kechikdi, sababli, percent);
      aoa.push(row);
    });

    const ws = xlsx.utils.aoa_to_sheet(aoa);

    const cols = [{ wch: 5 }, { wch: 32 }, { wch: 18 }];
    for (let d = 1; d <= daysInMonth; d++) {
      cols.push({ wch: 4 });
    }
    cols.push({ wch: 10 }, { wch: 12 }, { wch: 13 }, { wch: 12 }, { wch: 14 });
    ws['!cols'] = cols;

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Davomat');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = `Davomat_${exportData.class.name}_${month}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(buffer);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).send('Excel generatsiyasida xatolik: ' + err.message);
  }
});

// ==========================================
// 4. SERVERNI ISHGA TUSHIRISH
// ==========================================
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 "EduMemory" — 65-maktab 9-A va 9-B Davomat Tizimi`);
  console.log(`🌐 Server manzili: http://localhost:${PORT}`);
  console.log(`👑 Bosh Administrator: ${ADMIN_PHONE}`);
  console.log(`🔐 O'qituvchilar PIN-kodi: ${TEACHER_PIN}`);
  console.log(`👑 Ma'muriyat (Admin) PIN-kodi: ${ADMIN_PIN}`);
  console.log(`📊 Baza turi: ${db.hasPostgres ? 'PostgreSQL' : 'SQLite'}`);
  console.log(`⏱️ Dars davomat vaqti: 08:00 - 13:30 (Asia/Tashkent)`);
  console.log(`🤖 Avtomat xabarnoma: 14:00 (Dushanba-Shanba)`);
  console.log(`====================================================`);
});
