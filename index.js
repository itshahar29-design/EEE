require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const { Telegraf } = require('telegraf');
const multer = require('multer');
const xlsx = require('xlsx');

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const SCHOOL_NAME = process.env.SCHOOL_NAME || "65-umumiy o'rta ta'lim maktabi";
const TEACHER_PIN = process.env.TEACHER_PIN || '6565';
const MESSAGE_DELAY_MS = parseInt(process.env.MESSAGE_DELAY_MS, 10) || 50;

// Fayl yuklash (Excel import uchun Multer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB gacha
});

// Toshkent vaqti bo'yicha YYYY-MM-DD
function getTodayString() {
  const now = new Date();
  const utcOffset = 5 * 60; // Toshkent UTC+5
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
      return { emoji: '✅', label: 'Darsda qatnashdi', char: '+' };
    case 'kelmadi':
      return { emoji: '❌', label: 'Darsga kelmadi', char: '-' };
    case 'kechikdi':
      return { emoji: '⏱', label: 'Kechikdi', char: 'K' };
    case 'sababli':
      return { emoji: '📋', label: 'Sababli darsda qatnashmadi', char: 'S' };
    default:
      return { emoji: '⏳', label: 'Belgilanmagan', char: '' };
  }
}

// 1. EXPRESS SOZLAMALARI
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 2. TELEGRAM BOT
let bot = null;
let botUsername = '';

if (process.env.BOT_TOKEN && process.env.BOT_TOKEN.trim() !== '') {
  try {
    bot = new Telegraf(process.env.BOT_TOKEN.trim());

    bot.telegram.getMe().then((me) => {
      botUsername = me.username;
      console.log(`🤖 Telegram Bot ishga tushdi: @${botUsername} (${me.first_name})`);
    }).catch((err) => {
      console.error('❌ Bot getMe xatosi:', err.message);
    });

    // 1. /start: Telefon raqamini tasdiqlash uchun bitta katta tugma
    bot.start(async (ctx) => {
      try {
        const chatId = ctx.chat.id;
        const today = getTodayString();
        const linkedStudents = await db.getStudentsByParentChatId(chatId, today);

        if (linkedStudents && linkedStudents.length > 0) {
          let msg = `👋 <b>Assalomu alaykum, hurmatli ota-ona!</b>\n\n` +
                    `Siz <b>${escapeHtml(SCHOOL_NAME)}</b> davomat tizimiga ulangansiz.\n\n` +
                    `📌 <b>Biriktirilgan farzandingiz(lar):</b>\n`;
          for (const s of linkedStudents) {
            msg += `▫️ <b>${escapeHtml(s.full_name)}</b> (${escapeHtml(s.class_name)}-sinf)\n`;
          }
          msg += `\n🔔 Har kuni soat 14:00 da darslar tugagach davomat shaxsiy profilingizga avtomatik yuboriladi.\n` +
                 `Bugungi davomat holatini tekshirish uchun pastdagi tugmani bosing:`;

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

    // 2. KONTAKT KELGANDA: Barcha farzandlarni avtomatik ulash
    bot.on('contact', async (ctx) => {
      try {
        const contact = ctx.message.contact;
        if (!contact || !contact.phone_number) {
          return ctx.reply('Telefon raqami aniqlanmadi.');
        }

        const rawPhone = contact.phone_number;
        const chatId = ctx.chat.id;
        const linkedStudents = await db.linkParentByPhone(rawPhone, chatId);

        if (linkedStudents && linkedStudents.length > 0) {
          let msg = `✅ <b>Tabriklaymiz! Muvaffaqiyatli ulandingiz.</b>\n\n` +
                    `Siz quyidagi o‘quvchi(lar)ning ota-onasi sifatida tizimga muvaffaqiyatli biriktirildingiz:\n\n`;

          for (const s of linkedStudents) {
            msg += `▫️ <b>${escapeHtml(s.full_name)}</b> (${escapeHtml(s.class_name)}-sinf)\n`;
          }

          msg += `\n🔔 Endilikda har kuni darslar tugagach (soat 14:00 da) davomat hisoboti ` +
                 `ushbu shaxsiy profilingizga avtomatik yuboriladi.`;

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
            `❌ <b>O‘quvchi topilmadi.</b>\n\n` +
            `Siz yuborgan telefon raqami (<b>${escapeHtml(rawPhone)}</b>) 65-maktab bazasida ` +
            `hech bir o‘quvchining ota-onasiga biriktirilmagan.\n\n` +
            `ℹ️ <b>Nima qilish kerak?</b>\n` +
            `Farzandingizning <b>sinf rahbariga</b> murojaat qiling va telefon raqamingiz tizimga to‘g‘ri kiritilganligini tekshirtiring. ` +
            `O‘qituvchi raqamingizni kiritgach, ushbu botga qayta kontakt yuborsangiz darhol ulanasiz.`,
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
        const today = getTodayString();
        const students = await db.getStudentsByParentChatId(ctx.chat.id, today);

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
        message += `<i>Farzandingiz ta'lim-tarbiyasiga befarq bo'lmaganingiz uchun tashakkur!</i>`;

        return ctx.replyWithHTML(message);
      } catch (err) {
        console.error('Holat command error:', err);
        ctx.reply('Ma\'lumotlarni olishda xatolik yuz berdi.');
      }
    });

    bot.command('admin', (ctx) => {
      const webAppUrl = process.env.WEBAPP_URL || `http://localhost:${PORT}`;
      ctx.replyWithHTML(
        `👨‍🏫 <b>O‘qituvchilar paneli</b>\n\n` +
        `Sinf davomatini belgilash uchun pastdagi tugmani bosing:`,
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

// 3. DARSLAR TUGAGACH TELEGRAM PROFILIGA XABAR YUBORISH
async function sendAttendanceNotifications(date, classId = null) {
  if (!bot) {
    console.warn('⚠️ Bot faol emas, xabar yuborish imkoni yo‘q.');
    return { total: 0, sent: 0, failed: 0 };
  }

  const pendingList = await db.getPendingNotifications(date, classId);
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
    await db.markAttendanceAsNotified(notifiedIds);
  }

  console.log(`✅ [${date}] Xabarnoma yakunlandi. Yuborildi: ${sent}, Xato: ${failed}, Jami: ${total}`);
  return { total, sent, failed };
}

// 4. CRON JOB: HAR KUNI SOAT 14:00 DA AVTOMATIK XABAR
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

// ==========================================
// 5. REST API ROUTELARI
// ==========================================

// Render Health check
app.get('/ping', (req, res) => res.status(200).send('pong'));
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', uptime: Math.floor(process.uptime()), db: db.hasPostgres ? 'postgresql' : 'sqlite' }));

// 1. PIN-kodni tekshirish
app.post('/api/verify-pin', (req, res) => {
  const { pin } = req.body;
  if (pin && String(pin).trim() === String(TEACHER_PIN).trim()) {
    return res.json({ success: true, message: 'PIN to‘g‘ri' });
  }
  return res.status(401).json({ success: false, error: 'PIN-kod noto‘g‘ri!' });
});

// 2. Config
app.get('/api/config', (req, res) => {
  res.json({
    schoolName: SCHOOL_NAME,
    botUsername: botUsername,
    today: getTodayString(),
    hasPostgres: db.hasPostgres
  });
});

// 3. Sinflar CRUD
app.get('/api/classes', async (req, res) => {
  try {
    const classes = await db.getAllClasses();
    res.json({ success: true, data: classes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/classes', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Sinf nomi kiritilishi shart' });
    }
    const newClass = await db.createClass(name);
    res.json({ success: true, data: newClass });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/classes/:id', async (req, res) => {
  try {
    const classId = parseInt(req.params.id, 10);
    await db.deleteClass(classId);
    res.json({ success: true, message: 'Sinf muvaffaqiyatli o‘chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. O'quvchilar CRUD
app.get('/api/classes/:id/students', async (req, res) => {
  try {
    const classId = parseInt(req.params.id, 10);
    const date = req.query.date || getTodayString();

    const students = await db.getStudentsWithAttendance(classId, date);
    const classInfo = await db.getClassById(classId);

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

app.delete('/api/students/:id', async (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    await db.deleteStudent(studentId);
    res.json({ success: true, message: 'O‘quvchi o‘chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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

// 5. Davomat saqlash
app.post('/api/attendance', async (req, res) => {
  try {
    const { classId, date, records } = req.body;
    if (!date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, error: 'Ma\'lumotlar to‘liq emas' });
    }

    const savedCount = await db.saveAttendanceBatch(records, date);
    res.json({ success: true, message: 'Davomat muvaffaqiyatli saqlandi', savedCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Ota-onalarga zudlik bilan xabar yuborish
app.post('/api/notify-parents', async (req, res) => {
  try {
    const date = req.body.date || getTodayString();
    const classId = req.body.classId ? parseInt(req.body.classId, 10) : null;
    const result = await sendAttendanceNotifications(date, classId);
    res.json({ success: true, message: 'Xabarlar muvaffaqiyatli jo‘natildi', stats: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Statistika
app.get('/api/stats', async (req, res) => {
  try {
    const date = req.query.date || getTodayString();
    const classId = req.query.classId ? parseInt(req.query.classId, 10) : null;
    const stats = await db.getAttendanceStats(date, classId);
    res.json({ success: true, data: stats, date });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 8. EXCEL IMPORT (OMMAVIY YUKLASH)
// ==========================================
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
    let classesCreatedCount = 0;
    const classesMap = {};

    // Mavjud sinflarni xotiraga yuklash
    const existingClasses = await db.getAllClasses();
    for (const c of existingClasses) {
      classesMap[c.name.toLowerCase().trim()] = c.id;
    }

    for (const row of rawRows) {
      // Ustun nomlarini moslashuvchan izlash
      const classNameRaw = row['Sinf'] || row['sinf'] || row['Class'] || row['class'] || row['Синф'] || row['sinfi'];
      const fullNameRaw = row['O‘quvchi F.I.SH'] || row['O\'quvchi F.I.SH'] || row['F.I.SH'] || row['F.I.O'] || row['Ism'] || row['Full Name'] || row['Ф.И.О'] || row['Oquvchi'] || row['F.I.Sh'];
      const phoneRaw = row['Ota-ona telefoni'] || row['Telefon'] || row['Phone'] || row['Ota-onasi telefoni'] || row['Телефон'] || row['Tel'];

      if (!classNameRaw || !fullNameRaw) continue;

      const className = String(classNameRaw).trim();
      const fullName = String(fullNameRaw).trim();
      const phone = phoneRaw ? String(phoneRaw).trim() : '';

      // Sinf mavjud bo'lmasa, avtomatik yaratamiz
      const classKey = className.toLowerCase();
      let classId = classesMap[classKey];
      if (!classId) {
        const newClass = await db.createClass(className);
        classId = newClass.id;
        classesMap[classKey] = classId;
        classesCreatedCount++;
      }

      await db.createStudent({
        full_name: fullName,
        class_id: classId,
        parent_phone: phone
      });
      importedCount++;
    }

    res.json({
      success: true,
      message: `${importedCount} ta o‘quvchi muvaffaqiyatli yuklandi! (${classesCreatedCount} ta yangi sinf yaratildi)`,
      count: importedCount,
      classesCreated: classesCreatedCount
    });
  } catch (err) {
    console.error('Excel import error:', err);
    res.status(500).json({ success: false, error: 'Excel faylni qayta ishlashda xatolik: ' + err.message });
  }
});

// ==========================================
// 9. EXCEL EXPORT (OYLIK DAVOMAT JURNALI)
// ==========================================
app.get('/api/export/excel', async (req, res) => {
  try {
    const classId = parseInt(req.query.classId, 10);
    const month = req.query.month || getTodayString().slice(0, 7); // YYYY-MM

    if (isNaN(classId)) {
      return res.status(400).send('Sinf tanlanishi shart');
    }

    const exportData = await db.getMonthAttendanceForExport(classId, month);
    if (!exportData || !exportData.class) {
      return res.status(404).send('Sinf ma\'lumotlari topilmadi');
    }

    const [year, monthNum] = month.split('-').map(Number);
    // Shu oydagi kunlar soni
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    // Attendance xaritasi: `${student_id}_${day}` -> status
    const attMap = {};
    for (const a of exportData.attendance) {
      const day = parseInt(a.date.split('-')[2], 10);
      attMap[`${a.student_id}_${day}`] = a.status;
    }

    // Excel satrlari (AOA: Array of Arrays)
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

    // Ustun kengliklari
    ws['!cols'] = [
      { wch: 5 },   // №
      { wch: 32 },  // F.I.SH
      { wch: 20 },  // Telefon
      ...Array(daysInMonth).fill({ wch: 4 }), // Kunlar
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 }
    ];

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, `${exportData.class.name} Davomat`);

    const excelBuffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const fileName = `Davomat_${exportData.class.name}_${month}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.send(excelBuffer);

  } catch (err) {
    console.error('Excel export error:', err);
    res.status(500).send('Excel yaratishda xatolik: ' + err.message);
  }
});

// Bosh sahifa
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 "EduMemory" — 65-maktab Davomat Tizimi Serveri`);
  console.log(`🌐 Server manzili: http://localhost:${PORT}`);
  console.log(`🔐 O'qituvchilar PIN-kodi: ${TEACHER_PIN}`);
  console.log(`📊 Baza turi: ${db.hasPostgres ? 'PostgreSQL' : 'SQLite'}`);
  console.log(`📱 Telegram Mini App tayyor`);
  console.log(`====================================================`);
});
