require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const { Telegraf } = require('telegraf');

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const SCHOOL_NAME = process.env.SCHOOL_NAME || "65-umumiy o'rta ta'lim maktabi";
const MESSAGE_DELAY_MS = parseInt(process.env.MESSAGE_DELAY_MS, 10) || 50;

// O'zbekiston vaqti (Toshkent UTC+5) bo'yicha bugungi sanani YYYY-MM-DD ko'rinishida olish
function getTodayString() {
  const now = new Date();
  // UTC dan +5 soat qo'shish
  const utcOffset = 5 * 60; // 5 hours in minutes
  const localTime = new Date(now.getTime() + (now.getTimezoneOffset() + utcOffset) * 60000);
  const year = localTime.getFullYear();
  const month = String(localTime.getMonth() + 1).padStart(2, '0');
  const day = String(localTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Chiroyli o'zbekcha sana formati
function formatUzbekDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const months = [
    'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
    'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
  ];
  const mIndex = parseInt(month, 10) - 1;
  return `${parseInt(day, 10)}-${months[mIndex] || month}, ${year}-yil`;
}

// Telegram HTML xabarlari uchun maxsus belgilarni tozalash
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Asinxron uyqu (Telegram flood limit dan himoyalanish)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Status bo'yicha chiroyli matn va emoji
function getStatusDisplay(status) {
  switch (status) {
    case 'keldi':
      return {
        emoji: '✅',
        label: 'Darsda qatnashdi (Kelgan)',
        badgeClass: 'badge-success'
      };
    case 'kelmadi':
      return {
        emoji: '❌',
        label: 'Darsga kelmadi (Sababsiz)',
        badgeClass: 'badge-danger'
      };
    case 'kechikdi':
      return {
        emoji: '⏰',
        label: 'Darsga kechikib keldi',
        badgeClass: 'badge-warning'
      };
    case 'sababli':
      return {
        emoji: '📋',
        label: 'Sababli darsda qatnashmadi',
        badgeClass: 'badge-info'
      };
    default:
      return {
        emoji: '⏳',
        label: 'Davomat belgilanmagan',
        badgeClass: 'badge-secondary'
      };
  }
}

// ==========================================
// 1. EXPRESS SERVER VA MIDDLEWARE SOZLAMALARI
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 2. TELEGRAM BOT INITIALIZATION & HANDLERS
// ==========================================
let bot = null;
let botUsername = '';

if (process.env.BOT_TOKEN && process.env.BOT_TOKEN.trim() !== '' && !process.env.BOT_TOKEN.includes('your_telegram_bot_token')) {
  try {
    bot = new Telegraf(process.env.BOT_TOKEN.trim());

    // Bot haqida ma'lumot olish
    bot.telegram.getMe().then((me) => {
      botUsername = me.username;
      console.log(`🤖 Telegram Bot ishga tushdi: @${botUsername} (${me.first_name})`);
    }).catch((err) => {
      console.error('❌ Bot ma\'lumotlarini olishda xatolik:', err.message);
    });

    // 1. /start buyrug'i va Deep Link orqali ota-onani o'quvchiga biriktirish
    bot.start(async (ctx) => {
      try {
        const payload = ctx.startPayload || '';
        const chatId = ctx.chat.id;

        // Ota-ona deep-link orqali kirgan bo'lsa: ?start=student_123
        if (payload.startsWith('student_')) {
          const studentId = parseInt(payload.replace('student_', ''), 10);
          if (!isNaN(studentId) && studentId > 0) {
            const student = db.linkParentToStudent(studentId, chatId);
            if (student) {
              return ctx.replyWithHTML(
                `🎉 <b>Tabriklaymiz! Muvaffaqiyatli biriktirildi.</b>\n\n` +
                `Hurmatli ota-ona, siz <b>${escapeHtml(SCHOOL_NAME)}</b> ` +
                `o‘quvchisi <b>${escapeHtml(student.full_name)}</b> ` +
                `(${escapeHtml(student.class_name)}-sinf) profiliga biriktirildingiz.\n\n` +
                `🔔 Endilikda farzandingizning darslarga qatnashishi, kelgan/kelmaganligi va kechikishlari haqida ` +
                `har kuni ushbu bot orqali avtomatik bildirishnoma olib turasiz.\n\n` +
                `ℹ️ Farzandingizning bugungi davomat holatini ko'rish uchun <b>/holat</b> buyrug'ini yuboring.`,
                {
                  reply_markup: {
                    keyboard: [[{ text: '📊 Farzandim davomati' }]],
                    resize_keyboard: true
                  }
                }
              );
            } else {
              return ctx.replyWithHTML(
                `❌ <b>Xatolik:</b> ${studentId}-raqamli o‘quvchi bazadan topilmadi yoki havola eskirgan.`
              );
            }
          }
        }

        // Agar foydalanuvchi allaqachon biriktirilgan ota-ona bo'lsa
        const linkedStudents = db.getStudentsByParentChatId(chatId, getTodayString());
        if (linkedStudents && linkedStudents.length > 0) {
          let msg = `👋 <b>Assalomu alaykum, hurmatli ota-ona!</b>\n\n` +
                    `Siz ${escapeHtml(SCHOOL_NAME)} tizimida quyidagi farzandingiz(lar)ga ulangansiz:\n\n`;
          for (const s of linkedStudents) {
            msg += `👤 <b>${escapeHtml(s.full_name)}</b> (${escapeHtml(s.class_name)}-sinf)\n`;
          }
          msg += `\nBugungi davomat holatini tekshirish uchun quyidagi tugmani bosing:`;
          return ctx.replyWithHTML(msg, {
            reply_markup: {
              keyboard: [[{ text: '📊 Farzandim davomati' }]],
              resize_keyboard: true
            }
          });
        }

        // Oddiy /start yoki o'qituvchilar uchun bosh menyu
        const webAppUrl = process.env.WEBAPP_URL || `http://localhost:${PORT}`;
        return ctx.replyWithHTML(
          `🏫 <b>${escapeHtml(SCHOOL_NAME)}</b>\n` +
          `📚 <b>"EduMemory" — O‘quvchilar Davomati Tizimi</b>\n\n` +
          `Assalomu alaykum! Tizim o‘qituvchilar uchun qulay elektron davomat yuritish ` +
          `hamda ota-onalarni farzandlari davomatidan tezkor xabardor qilish uchun yaratilgan.\n\n` +
          `👨‍🏫 <b>O‘qituvchilar uchun:</b> Mini App orqali bir necha soniyada sinf davomatini belgilash;\n` +
          `👨‍👩‍👧 <b>Ota-onalar uchun:</b> Kunlik dars qatnashuvi haqida avtomatik hisobot olish.\n\n` +
          `<i>Davomatni belgilash uchun pastdagi tugmani bosing:</i>`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '📝 Davomatni ochish (Mini App)',
                    web_app: { url: webAppUrl }
                  }
                ],
                [
                  { text: '📢 Ota-onalarga xabar yuborish', callback_data: 'send_daily_reports' },
                  { text: 'ℹ️ Yordam', callback_data: 'bot_help' }
                ]
              ]
            }
          }
        );
      } catch (err) {
        console.error('Bot start error:', err);
        ctx.reply('Xatolik yuz berdi. Iltimos qaytadan urinib ko‘ring.');
      }
    });

    // 2. Farzand davomati holatini tekshirish (/holat yoki tugma)
    bot.hears(['/holat', '📊 Farzandim davomati'], async (ctx) => {
      try {
        const today = getTodayString();
        const students = db.getStudentsByParentChatId(ctx.chat.id, today);

        if (!students || students.length === 0) {
          return ctx.replyWithHTML(
            `ℹ️ <b>Siz hali hech bir o‘quvchiga biriktirilmagansiz.</b>\n\n` +
            `Sinf rahbaringizdan farzandingiz uchun biriktirish havolasini oling ` +
            `va havola orqali botga kiring.`
          );
        }

        let message = `📅 <b>Sana: ${formatUzbekDate(today)}</b>\n`;
        message += `🏫 <b>${escapeHtml(SCHOOL_NAME)}</b>\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        for (const s of students) {
          const statusInfo = getStatusDisplay(s.status);
          message += `👤 <b>O‘quvchi:</b> ${escapeHtml(s.full_name)}\n`;
          message += `🏫 <b>Sinf:</b> ${escapeHtml(s.class_name)}\n`;
          message += `📊 <b>Holat:</b> ${statusInfo.emoji} <b>${statusInfo.label}</b>\n`;
          if (s.reason) {
            message += `📝 <b>Izoh:</b> <i>${escapeHtml(s.reason)}</i>\n`;
          }
          message += `\n`;
        }

        message += `━━━━━━━━━━━━━━━━━━━━\n`;
        message += `<i>Har qanday savol bo‘yicha sinf rahbariga murojaat qilishingiz mumkin.</i>`;

        return ctx.replyWithHTML(message);
      } catch (err) {
        console.error('Holat command error:', err);
        ctx.reply('Ma\'lumotlarni olishda xatolik yuz berdi.');
      }
    });

    // 3. Inline tugma: Ota-onalarga zudlik bilan xabar yuborish
    bot.action('send_daily_reports', async (ctx) => {
      try {
        await ctx.answerCbQuery('Xabarnomalar yuborilmoqda...');
        const today = getTodayString();
        const result = await sendAttendanceNotifications(today);
        await ctx.replyWithHTML(
          `📢 <b>Xabarnoma yakunlandi!</b>\n\n` +
          `📅 Sana: <b>${formatUzbekDate(today)}</b>\n` +
          `👥 Biriktirilgan ota-onalar soni: <b>${result.total}</b>\n` +
          `✅ Muvaffaqiyatli yuborildi: <b>${result.sent}</b>\n` +
          `❌ Yuborilmadi/Xatolik: <b>${result.failed}</b>`
        );
      } catch (err) {
        console.error('Error in send_daily_reports action:', err);
        ctx.reply('Xabarnoma yuborishda xatolik yuz berdi.');
      }
    });

    // 4. Inline tugma: Yordam va Qo'llanma
    bot.action('bot_help', async (ctx) => {
      await ctx.answerCbQuery();
      ctx.replyWithHTML(
        `📖 <b>"EduMemory" Tizimi Qo‘llanmasi:</b>\n\n` +
        `<b>1. O‘qituvchi uchun:</b>\n` +
        `• <b>"Davomatni ochish"</b> tugmasi orqali Mini App interfeysiga kiring.\n` +
        `• O‘z sinfingizni tanlang.\n` +
        `• O‘quvchilar ro‘yxatida [Keldi], [Kelmadi], [Kechikdi], [Sababli] holatlarini belgilang.\n` +
        `• <b>"Davomatni saqlash"</b> tugmasini bosing.\n` +
        `• Har bir o‘quvchi ro‘parasidagi 🔗 tugma orqali ota-onaga maxsus havola yuborishingiz mumkin.\n\n` +
        `<b>2. Ota-onalar uchun:</b>\n` +
        `• O‘qituvchi bergan havola orqali botga kirib "Start" bosing.\n` +
        `• Har kuni dushanbadan shanbagacha soat 14:00 da farzandingizning darsga qatnashuvi haqida avtomatik xabar olasiz.\n` +
        `• Xohlagan vaqtda /holat buyrug‘i orqali tekshirishingiz mumkin.`
      );
    });

    // Botni ishga tushirish (long polling)
    bot.launch().catch((err) => {
      console.error('❌ Bot launch xatosi:', err.message);
    });

    // Xavfsiz to'xtatish
    process.once('SIGINT', () => bot && bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot && bot.stop('SIGTERM'));

  } catch (err) {
    console.error('⚠️ Telegrafni initsializatsiya qilishda xatolik:', err.message);
  }
} else {
  console.log('⚠️ DIQQAT: .env faylida BOT_TOKEN ko\'rsatilmagan! Bot faol emas, lekin Express API va Mini App ishlab turadi.');
}

// ==========================================
// 3. AVTOMATLASHGAN XABARNOMA YUBORISH FUNKSIYASI
// ==========================================
/**
 * Bugungi davomat bo'yicha barcha biriktirilgan ota-onalarga xabar yuborish
 * Telegram API flood limitga tushmaslik uchun 50ms kechikish bilan yuboriladi
 */
async function sendAttendanceNotifications(date, classId = null) {
  if (!bot) {
    console.warn('⚠️ Bot faol emas, xabar yuborish imkoni yo‘q.');
    return { total: 0, sent: 0, failed: 0 };
  }

  const pendingList = db.getPendingNotifications(date, classId);
  const total = pendingList.length;

  console.log(`📤 [${date}] Xabarnoma yuborish boshlandi. Jami xabarlar soni: ${total}`);

  let sent = 0;
  let failed = 0;
  const notifiedIds = [];

  for (const item of pendingList) {
    const statusInfo = getStatusDisplay(item.status);
    const messageText = 
      `🔔 <b>65-MAKTAB | "EduMemory" DAVOMAT XABARI</b>\n\n` +
      `📅 <b>Sana:</b> ${formatUzbekDate(item.date)}\n` +
      `👤 <b>O‘quvchi:</b> ${escapeHtml(item.full_name)}\n` +
      `🏫 <b>Sinf:</b> ${escapeHtml(item.class_name)}\n\n` +
      `📊 <b>Davomat holati:</b> ${statusInfo.emoji} <b>${statusInfo.label}</b>\n` +
      (item.reason ? `📝 <b>Izoh:</b> <i>${escapeHtml(item.reason)}</i>\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `<i>Hurmatli ota-ona, farzandingizning darslarga o‘z vaqtida qatnashishi kelajakdagi muvaffaqiyati garovidir!</i>`;

    try {
      await bot.telegram.sendMessage(item.parent_chat_id, messageText, {
        parse_mode: 'HTML'
      });
      sent++;
      notifiedIds.push(item.attendance_id);
    } catch (err) {
      failed++;
      console.error(`❌ Ota-onaga xabar yuborilmadi (Chat ID: ${item.parent_chat_id}, O'quvchi: ${item.full_name}):`, err.message);
    }

    // Telegram flood limit dan himoyalanish uchun kechikish
    if (MESSAGE_DELAY_MS > 0) {
      await sleep(MESSAGE_DELAY_MS);
    }
  }

  // Yuborilgan xabarlarni bazada belgilab qo'yish
  if (notifiedIds.length > 0) {
    db.markAttendanceAsNotified(notifiedIds);
  }

  console.log(`✅ [${date}] Xabarnoma yakunlandi. Yuborildi: ${sent}, Xato: ${failed}, Jami: ${total}`);
  return { total, sent, failed };
}

// ==========================================
// 4. CRON JOB: HAR KUNI SOAT 14:00 DA ISHGA TUSHISH
// ==========================================
// Dushanbadan Shanbagacha soat 14:00 da (standart: 0 14 * * 1-6)
const cronSchedule = process.env.CRON_SCHEDULE || '0 14 * * 1-6';

cron.schedule(
  cronSchedule,
  async () => {
    const today = getTodayString();
    console.log(`⏰ [CRON JOB] Soat 14:00 bo'ldi. ${today} sanasi uchun xabarnomalar yuborilmoqda...`);
    try {
      await sendAttendanceNotifications(today);
    } catch (err) {
      console.error('❌ Cron job bajarilishida xatolik:', err);
    }
  },
  {
    timezone: 'Asia/Tashkent'
  }
);
console.log(`⏱️ Cron vazifasi rejalashtirildi: Jadval [${cronSchedule}], Vaqt mintaqasi: Asia/Tashkent`);

// ==========================================
// 5. REST API ROUTELARI (FRONTEND UCHUN)
// ==========================================

// Render.com va Uptime monitoring uchun health-check URL
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'EduMemory 65-maktab API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// 1. Tizim konfiguratsiyasi va bot foydalanuvchi nomi
app.get('/api/config', (req, res) => {
  res.json({
    schoolName: SCHOOL_NAME,
    botUsername: botUsername,
    today: getTodayString()
  });
});

// 2. Barcha sinflar ro'yxati
app.get('/api/classes', (req, res) => {
  try {
    const classes = db.getAllClasses();
    res.json({ success: true, data: classes });
  } catch (err) {
    console.error('API Error /api/classes:', err);
    res.status(500).json({ success: false, error: 'Sinflarni yuklashda xatolik yuz berdi' });
  }
});

// 3. Tanlangan sinfdagi o'quvchilar va ularning berilgan sanadagi davomati
app.get('/api/classes/:id/students', (req, res) => {
  try {
    const classId = parseInt(req.params.id, 10);
    const date = req.query.date || getTodayString();

    if (isNaN(classId)) {
      return res.status(400).json({ success: false, error: 'Noto‘g‘ri sinf IDsi' });
    }

    const students = db.getStudentsWithAttendance(classId, date);
    const classInfo = db.getClassById(classId);

    res.json({
      success: true,
      data: {
        class: classInfo,
        date: date,
        students: students
      }
    });
  } catch (err) {
    console.error(`API Error /api/classes/${req.params.id}/students:`, err);
    res.status(500).json({ success: false, error: 'O‘quvchilarni yuklashda xatolik' });
  }
});

// 4. Davomatni saqlash (Batch Upsert)
app.post('/api/attendance', (req, res) => {
  try {
    const { classId, date, records } = req.body;

    if (!date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Sana va davomat yozuvlari kiritilishi shart'
      });
    }

    // Bazaga saqlash
    const savedCount = db.saveAttendanceBatch(records, date);

    res.json({
      success: true,
      message: 'Davomat muvaffaqiyatli saqlandi',
      savedCount: savedCount,
      date: date
    });
  } catch (err) {
    console.error('API Error /api/attendance:', err);
    res.status(500).json({ success: false, error: 'Davomatni saqlashda xatolik yuz berdi' });
  }
});

// 5. Ota-onalarga zudlik bilan qo'lda xabar yuborish
app.post('/api/notify-parents', async (req, res) => {
  try {
    const date = req.body.date || getTodayString();
    const classId = req.body.classId ? parseInt(req.body.classId, 10) : null;

    const result = await sendAttendanceNotifications(date, classId);

    res.json({
      success: true,
      message: 'Xabarlar muvaffaqiyatli jo‘natildi',
      stats: result
    });
  } catch (err) {
    console.error('API Error /api/notify-parents:', err);
    res.status(500).json({ success: false, error: 'Xabarnomalarni yuborishda xatolik yuz berdi' });
  }
});

// 6. Statistika
app.get('/api/stats', (req, res) => {
  try {
    const date = req.query.date || getTodayString();
    const classId = req.query.classId ? parseInt(req.query.classId, 10) : null;
    const stats = db.getAttendanceStats(date, classId);
    res.json({ success: true, data: stats, date });
  } catch (err) {
    console.error('API Error /api/stats:', err);
    res.status(500).json({ success: false, error: 'Statistikani yuklashda xatolik' });
  }
});

// 7. Bosh sahifa (Mini App)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================
// 6. SERVERNI ISHGA TUSHIRISH
// ==========================================
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 "EduMemory" — 65-maktab Davomat Tizimi Serveri`);
  console.log(`🌐 Server manzili: http://localhost:${PORT}`);
  console.log(`📱 Telegram Mini App tayyor`);
  console.log(`📅 Bugungi sana: ${getTodayString()}`);
  console.log(`====================================================`);
});
