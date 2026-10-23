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

// Toshkent vaqti bo'yicha YYYY-MM-DD
function getTodayString() {
  const now = new Date();
  const utcOffset = 5 * 60; // UTC+5
  const localTime = new Date(now.getTime() + (now.getTimezoneOffset() + utcOffset) * 60000);
  const year = localTime.getFullYear();
  const month = String(localTime.getMonth() + 1).padStart(2, '0');
  const day = String(localTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getStatusDisplay(status) {
  switch (status) {
    case 'keldi':
      return { emoji: '✅', label: 'Darsda qatnashdi' };
    case 'kelmadi':
      return { emoji: '❌', label: 'Darsga kelmadi' };
    case 'kechikdi':
      return { emoji: '⏱', label: 'Kechikdi' };
    case 'sababli':
      return { emoji: '📋', label: 'Sababli darsda qatnashmadi' };
    default:
      return { emoji: '⏳', label: 'Belgilanmagan' };
  }
}

// 1. EXPRESS SOZLAMALARI
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 2. TELEGRAM BOT (KONTAKT ORQALI AVTOMATIK BIRIKTIRISH)
let bot = null;
let botUsername = '';

if (process.env.BOT_TOKEN && process.env.BOT_TOKEN.trim() !== '') {
  try {
    bot = new Telegraf(process.env.BOT_TOKEN.trim());

    bot.telegram.getMe().then((me) => {
      botUsername = me.username;
      console.log(`🤖 Telegram Bot ishga tushdi: @${botUsername} (${me.first_name})`);
    }).catch((err) => {
      console.error('❌ Bot ma\'lumotlarini olishda xatolik:', err.message);
    });

    // 1. /start buyrug'i: Ota-onani kutib olish va telefon raqamini so'rash
    bot.start(async (ctx) => {
      try {
        const chatId = ctx.chat.id;
        const today = getTodayString();
        const webAppUrl = process.env.WEBAPP_URL || `http://localhost:${PORT}`;

        // Avval bog'langan bolalari bor-yo'qligini tekshiramiz
        const linkedStudents = db.getStudentsByParentChatId(chatId, today);

        if (linkedStudents && linkedStudents.length > 0) {
          let msg = `👋 <b>Assalomu alaykum, hurmatli ota-ona!</b>\n\n` +
                    `Siz <b>${escapeHtml(SCHOOL_NAME)}</b> davomat tizimiga ulangansiz.\n\n` +
                    `📌 <b>Biriktirilgan farzandingiz(lar):</b>\n`;
          for (const s of linkedStudents) {
            msg += `▫️ <b>${escapeHtml(s.full_name)}</b> (${escapeHtml(s.class_name)}-sinf)\n`;
          }
          msg += `\n🔔 Har kuni soat 14:00 da darslar tugagach davomat shaxsiy profilingizga avtomatik yuboriladi.\n` +
                 `Bugungi davomat holatini tekshirish uchun quyidagi tugmani bosing:`;

          return ctx.replyWithHTML(msg, {
            reply_markup: {
              keyboard: [
                [{ text: '📊 Farzandim davomati' }],
                [{ text: '📱 Telefon raqamimni yangilash', request_contact: true }]
              ],
              resize_keyboard: true
            }
          });
        }

        // Hali birikmagan ota-ona uchun: Bitta katta kontakt ulashish tugmasi
        return ctx.replyWithHTML(
          `🏫 <b>${escapeHtml(SCHOOL_NAME)}</b>\n` +
          `📚 <b>"EduMemory" — O‘quvchilar Davomati Tizimi</b>\n\n` +
          `Assalomu alaykum, hurmatli ota-ona!\n\n` +
          `Farzandingizning darslarga qatnashishi, kelgan-kelmaganligi va kechikishlari haqida ` +
          `har kuni shaxsiy Telegram profilingizga avtomatik hisobot borishi uchun ` +
          `telefon raqamingizni tasdiqlang.\n\n` +
          `👇 <b>Pastdagi "📱 Telefon raqamimni tasdiqlash" tugmasini bosing:</b>`,
          {
            reply_markup: {
              keyboard: [
                [{ text: '📱 Telefon raqamimni tasdiqlash', request_contact: true }]
              ],
              resize_keyboard: true
            }
          }
        );
      } catch (err) {
        console.error('Bot start error:', err);
        ctx.reply('Xatolik yuz berdi. Iltimos qaytadan urinib ko‘ring.');
      }
    });

    // 2. KONTAKT KELGANDA: Telefon raqam orqali barcha farzandlarni avtomatik biriktirish
    bot.on('contact', async (ctx) => {
      try {
        const contact = ctx.message.contact;
        if (!contact || !contact.phone_number) {
          return ctx.reply('Telefon raqami aniqlanmadi.');
        }

        const rawPhone = contact.phone_number;
        const chatId = ctx.chat.id;

        console.log(`📱 Kontakt qabul qilindi. ChatID: ${chatId}, Raqam: ${rawPhone}`);

        // Bazadan shu raqamga tegishli barcha o'quvchilarni topib chat_id ni yozamiz
        const linkedStudents = db.linkParentByPhone(rawPhone, chatId);

        if (linkedStudents && linkedStudents.length > 0) {
          let msg = `✅ <b>Tabriklaymiz! Muvaffaqiyatli ulandingiz.</b>\n\n` +
                    `Siz quyidagi o‘quvchi(lar)ning ota-onasi sifatida tizimga muvaffaqiyatli biriktirildingiz:\n\n`;

          for (const s of linkedStudents) {
            msg += `▫️ <b>${escapeHtml(s.full_name)}</b> (${escapeHtml(s.class_name)}-sinf)\n`;
          }

          msg += `\n🔔 Endilikda har kuni darslar tugagach (soat 14:00 da) davomat hisoboti ` +
                 `ushbu shaxsiy profilingizga avtomatik yuboriladi.\n\n` +
                 `<i>Farzandingiz bugungi davomatini tekshirish uchun pastdagi "📊 Farzandim davomati" tugmasidan foydalanishingiz mumkin.</i>`;

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
          // Bazada bunday raqam topilmasa
          const norm = db.normalizePhone(rawPhone);
          return ctx.replyWithHTML(
            `❌ <b>O‘quvchi topilmadi.</b>\n\n` +
            `Siz yuborgan telefon raqami (<b>${escapeHtml(rawPhone)}</b>) 65-maktab bazasida ` +
            `hech bir o‘quvchining ota-onasi sifatida ro‘yxatga olinmagan.\n\n` +
            `ℹ️ <b>Nima qilish kerak?</b>\n` +
            `Farzandingizning <b>sinf rahbariga</b> murojaat qiling va telefon raqamingizni tizimga kiritishini so‘rang. ` +
            `O‘qituvchi raqamingizni kiritgach, ushbu botga qayta kontakt yuborsangiz profilingiz darhol faollashadi.`,
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
        ctx.reply('Kontaktni qayta ishlashda xatolik yuz berdi.');
      }
    });

    // 3. /holat va "Farzandim davomati" tugmasi
    bot.hears(['/holat', '📊 Farzandim davomati'], async (ctx) => {
      try {
        const today = getTodayString();
        const students = db.getStudentsByParentChatId(ctx.chat.id, today);

        if (!students || students.length === 0) {
          return ctx.replyWithHTML(
            `ℹ️ <b>Siz hali hech bir o‘quvchiga biriktirilmagansiz.</b>\n\n` +
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
        message += `<i>Hurmatli ota-ona, farzandingiz ta'lim-tarbiyasiga befarq bo'lmaganingiz uchun tashakkur!</i>`;

        return ctx.replyWithHTML(message);
      } catch (err) {
        console.error('Holat command error:', err);
        ctx.reply('Ma\'lumotlarni olishda xatolik yuz berdi.');
      }
    });

    // 4. O'qituvchilar uchun Mini App menyu komandasi
    bot.command('admin', (ctx) => {
      const webAppUrl = process.env.WEBAPP_URL || `http://localhost:${PORT}`;
      ctx.replyWithHTML(
        `👨‍🏫 <b>O‘qituvchilar paneli</b>\n\n` +
        `Sinf davomatini yuritish uchun quyidagi tugmani bosing:`,
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
} else {
  console.log('⚠️ BOT_TOKEN o\'rnatilmagan! Bot faol emas.');
}

// 3. DARSLAR TUGAGACH TELEGRAM PROFILIGA XABAR YUBORISH
async function sendAttendanceNotifications(date, classId = null) {
  if (!bot) {
    console.warn('⚠️ Bot faol emas, xabar yuborish imkoni yo‘q.');
    return { total: 0, sent: 0, failed: 0 };
  }

  const pendingList = db.getPendingNotifications(date, classId);
  const total = pendingList.length;

  console.log(`📤 [${date}] Xabarnoma yuborish boshlandi. Jami: ${total} ta xabar.`);

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
    db.markAttendanceAsNotified(notifiedIds);
  }

  console.log(`✅ [${date}] Xabarnoma yakunlandi. Yuborildi: ${sent}, Xato: ${failed}, Jami: ${total}`);
  return { total, sent, failed };
}

// 4. CRON JOB: HAR KUNI SOAT 14:00 DA AVTOMATIK XABARNOMA
const cronSchedule = process.env.CRON_SCHEDULE || '0 14 * * 1-6';

cron.schedule(
  cronSchedule,
  async () => {
    const today = getTodayString();
    console.log(`⏰ [CRON JOB 14:00] ${today} sanasi uchun ota-onalarga hisobot yuborilmoqda...`);
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
console.log(`⏱️ Cron vazifasi rejalashtirildi: [${cronSchedule}], Timezone: Asia/Tashkent`);

// 5. REST API ROUTELARI

// Render Health check
app.get('/ping', (req, res) => res.status(200).send('pong'));
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', uptime: Math.floor(process.uptime()) }));

// Config
app.get('/api/config', (req, res) => {
  res.json({
    schoolName: SCHOOL_NAME,
    botUsername: botUsername,
    today: getTodayString()
  });
});

// Sinflar
app.get('/api/classes', (req, res) => {
  try {
    const classes = db.getAllClasses();
    res.json({ success: true, data: classes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sinf o'quvchilari va davomati
app.get('/api/classes/:id/students', (req, res) => {
  try {
    const classId = parseInt(req.params.id, 10);
    const date = req.query.date || getTodayString();

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
    res.status(500).json({ success: false, error: err.message });
  }
});

// O'quvchi ota-onasi telefon raqamini kiritish yoki tahrirlash
app.post('/api/students/:id/phone', (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    const { phone } = req.body;

    const updated = db.updateStudentParentPhone(studentId, phone);
    res.json({
      success: true,
      message: 'Telefon raqami muvaffaqiyatli saqlandi',
      data: updated
    });
  } catch (err) {
    console.error('API Error /api/students/:id/phone:', err);
    res.status(500).json({ success: false, error: 'Telefon raqamini saqlashda xatolik' });
  }
});

// Davomatni saqlash
app.post('/api/attendance', (req, res) => {
  try {
    const { classId, date, records } = req.body;
    if (!date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, error: 'Ma\'lumotlar to‘liq emas' });
    }

    const savedCount = db.saveAttendanceBatch(records, date);
    res.json({
      success: true,
      message: 'Davomat muvaffaqiyatli saqlandi',
      savedCount: savedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ota-onalarga zudlik bilan xabar yuborish
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
    res.status(500).json({ success: false, error: err.message });
  }
});

// Statistika
app.get('/api/stats', (req, res) => {
  try {
    const date = req.query.date || getTodayString();
    const classId = req.query.classId ? parseInt(req.query.classId, 10) : null;
    const stats = db.getAttendanceStats(date, classId);
    res.json({ success: true, data: stats, date });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 "EduMemory" — 65-maktab Davomat Tizimi Serveri`);
  console.log(`🌐 Server manzili: http://localhost:${PORT}`);
  console.log(`📱 Telegram Mini App tayyor`);
  console.log(`====================================================`);
});
