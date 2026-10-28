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
const OFFICIAL_BOT_TOKEN = '8877313297:AAHBIV4kU9g_d287m092fW9b7XOkScZU4Gw';
let effectiveToken = OFFICIAL_BOT_TOKEN;
if (process.env.BOT_TOKEN && process.env.BOT_TOKEN.startsWith('8877313297')) {
  effectiveToken = process.env.BOT_TOKEN.trim();
} else if (process.env.BOT_TOKEN) {
  console.log(`⚠️ Render muhitidagi noto'g'ri/placeholder token (${process.env.BOT_TOKEN.slice(0, 10)}...) inkor qilindi va rasmiy 8877313297 tokeni ishlatilmoqda.`);
}
const OFFICIAL_WEBAPP_URL = 'https://eee-w2yj.onrender.com';
let effectiveWebAppUrl = OFFICIAL_WEBAPP_URL;
if (process.env.WEBAPP_URL && !process.env.WEBAPP_URL.includes('edumemory-65') && process.env.WEBAPP_URL.startsWith('http')) {
  effectiveWebAppUrl = process.env.WEBAPP_URL.trim();
}
const WEBAPP_URL = effectiveWebAppUrl;
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

// Webhook endpoint for Telegram updates
app.post('/telegram-webhook', async (req, res) => {
  try {
    if (bot && req.body) {
      await bot.handleUpdate(req.body, res);
    }
    if (!res.headersSent) {
      res.status(200).send('OK');
    }
  } catch (err) {
    console.error('Webhook error:', err);
    if (!res.headersSent) {
      res.status(200).send('OK');
    }
  }
});

// Server va Bot salomatlik holatini tekshirish
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    botInitialized: !!bot,
    botUsername: botUsername || null,
    tokenPrefix: BOT_TOKEN ? BOT_TOKEN.slice(0, 10) : null,
    mode: (WEBAPP_URL && WEBAPP_URL.startsWith('https://')) ? 'webhook' : 'polling',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

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

      bot.telegram.setChatMenuButton({
        menu_button: {
          type: 'web_app',
          text: 'EduMemory',
          web_app: { url: WEBAPP_URL }
        }
      }).catch((e) => console.warn('setChatMenuButton xatosi:', e.message));

      bot.telegram.setMyCommands([
        { command: 'start', description: 'Tizimni ishga tushirish / Yangilash' },
        { command: 'holat', description: 'Bugungi davomat ko‘rsatkichi' },
        { command: 'admin', description: 'Boshqaruv paneli' },
        { command: 'yordam', description: 'Qo‘llanma va yordam' }
      ]).catch((e) => console.warn('setMyCommands xatosi:', e.message));
    }).catch((err) => {
      console.warn('⚠️ Bot getMe xatosi:', err.message);
    });

    // ==========================================
    // MENYU TUGMALARI (REPLY KEYBOARDS)
    // ==========================================
    // 1. Hali raqami tasdiqlanmagan foydalanuvchi uchun
    function getUnverifiedKeyboard() {
      return {
        keyboard: [
          [{ text: '📱 Telefon raqamimni tasdiqlash', request_contact: true }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      };
    }

    // 2. Raqami tasdiqlangan ota-ona uchun
    function getParentKeyboard() {
      return {
        keyboard: [
          [{ text: '📊 Farzandim davomati' }],
          [{ text: '📱 Raqamni yangilash', request_contact: true }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      };
    }

    // 3. O'qituvchi uchun (faqat o'z biriktirilgan sinfi)
    function getTeacherKeyboard(webAppUrl, classId, className) {
      const url = `${webAppUrl}?role=teacher&classId=${classId || ''}&class=${encodeURIComponent(className || '')}`;
      return {
        keyboard: [
          [{ text: '📝 Mening sinfim davomati', web_app: { url } }],
          [{ text: 'ℹ️ Yordam' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      };
    }

    // 4. Bosh Administrator uchun (barcha sinflar va monitoring)
    function getAdminKeyboard(webAppUrl) {
      const url = `${webAppUrl}?role=admin`;
      return {
        keyboard: [
          [{ text: '👑 Boshqaruv paneli (Barcha sinflar)', web_app: { url } }],
          [{ text: '📊 Bugungi monitoring' }, { text: 'ℹ️ Yordam' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      };
    }

    // ==========================================
    // 1. /START BUYRUG'I: FOYDALANUVCHI HOLATIGA KO'RA 3 XIL MENYU
    // ==========================================
    bot.start(async (ctx) => {
      try {
        const chatId = ctx.chat.id;
        const today = db.getTodayString();
        const webAppUrl = WEBAPP_URL;

        // 1. Bosh Admin yoki Sinf rahbari tekshiruvi
        const staff = await db.getStaffByChatId(chatId);
        if (staff) {
          if (staff.role === 'admin') {
            return ctx.replyWithHTML(
              `👑 <b>Assalomu alaykum, Bosh Administrator!</b>\n\n` +
              `Siz <b>9-A</b> va <b>9-B</b> sinflari davomat tizimini to‘liq nazorat qilish va boshqarish huquqiga egasiz.\n\n` +
              `👇 Quyidagi menyu orqali boshqaruv paneli yoki bugungi monitoringni oching:`,
              { reply_markup: getAdminKeyboard(webAppUrl) }
            );
          } else {
            return ctx.replyWithHTML(
              `👨‍🏫 <b>Assalomu alaykum, ${escapeHtml(staff.full_name)}!</b>\n\n` +
              `Siz <b>${escapeHtml(staff.class_name || '9-sinf')}</b> rahbari sifatida tizimga ulangansiz.\n` +
              `Dars kunlari soat 08:00 dan 13:30 gacha o‘z sinfingiz davomatini kiritishingiz mumkin.\n\n` +
              `👇 Quyidagi tugma orqali faqat o‘z sinfingiz davomatini oching:`,
              { reply_markup: getTeacherKeyboard(webAppUrl, staff.class_id, staff.class_name) }
            );
          }
        }

        // 2. Raqami tasdiqlangan Ota-ona tekshiruvi
        const students = await db.getStudentsByParentChatId(chatId, today);
        if (students && students.length > 0) {
          let msg = `✅ <b>Assalomu alaykum!</b>\n\n` +
            `Siz quyidagi o‘quvchi(lar)ning ota-onasi sifatida tizimga ulangansiz:\n\n`;

          for (const s of students) {
            msg += `▫️ <b>${escapeHtml(s.full_name)}</b> (${escapeHtml(s.class_name)})\n`;
          }

          msg += `\n🔔 Har kuni soat 14:00 da darslar tugagach davomat shaxsiy profilingizga avtomatik yuboriladi.\n` +
            `Farzandingizning bugungi davomatini bilish uchun pastdagi <b>"📊 Farzandim davomati"</b> tugmasini bosing:`;

          return ctx.replyWithHTML(msg, {
            reply_markup: getParentKeyboard()
          });
        }

        // 3. Hali raqami tasdiqlanmagan foydalanuvchi uchun
        const welcomeText =
          `Assalomu alaykum! <b>65-maktabning "EduMemory"</b> ` +
          `(9-A va 9-B sinflari davomat tizimi) botiga xush kelibsiz.\n\n` +
          `Farzandingizning kunlik maktab davomati haqida shaxsiy Telegram profilingizga ` +
          `avtomatik xabarnomalar olish uchun quyidagi tugmani bosing va <b>telefon raqamingizni tasdiqlang</b>:`;

        return ctx.replyWithHTML(welcomeText, {
          reply_markup: getUnverifiedKeyboard()
        });
      } catch (err) {
        console.error('/start xatosi:', err);
        return ctx.reply('Xatolik yuz berdi. Iltimos, qayta /start buyrug‘ini yuboring.');
      }
    });

    // ==========================================
    // 2. KONTAKT QABUL QILISH (TASDIQLASH VA RAQAMNI YANGILASH)
    // ==========================================
    bot.on('contact', async (ctx) => {
      try {
        const contact = ctx.message.contact;
        if (!contact || !contact.phone_number) {
          return ctx.reply('Telefon raqami aniqlanmadi.');
        }

        const rawPhone = contact.phone_number;
        const chatId = ctx.chat.id;
        const webAppUrl = WEBAPP_URL;

        // 1. Xodimlar (Bosh Admin yoki Sinf rahbari) tekshiruvi
        const staffMember = await db.getStaffByPhone(rawPhone);
        if (staffMember) {
          await db.linkStaffByPhone(rawPhone, chatId);

          if (staffMember.role === 'admin') {
            return ctx.replyWithHTML(
              `👑 <b>Assalomu alaykum, Bosh Administrator!</b>\n\n` +
              `Sizning Telegram profilingiz tizimga muvaffaqiyatli biriktirildi.\n` +
              `Siz <b>9-A</b> va <b>9-B</b> sinflari davomatini to‘liq boshqarish va monitoring qilish huquqiga egasiz.\n\n` +
              `👇 Quyidagi menyudan foydalanishingiz mumkin:`,
              { reply_markup: getAdminKeyboard(webAppUrl) }
            );
          } else {
            return ctx.replyWithHTML(
              `👨‍🏫 <b>Assalomu alaykum, ${escapeHtml(staffMember.full_name)}!</b>\n\n` +
              `Siz <b>${escapeHtml(staffMember.class_name || '9-sinf')}</b> rahbari sifatida tizimga muvaffaqiyatli ulandingiz.\n` +
              `Dars kunlari soat 08:00 dan 13:30 gacha o‘z sinfingiz davomatini belgilashingiz mumkin.\n\n` +
              `👇 Quyidagi tugma orqali faqat o‘z sinfingiz davomatini oching:`,
              { reply_markup: getTeacherKeyboard(webAppUrl, staffMember.class_id, staffMember.class_name) }
            );
          }
        }

        // 2. Ota-onalar tekshiruvi (9-A va 9-B o'quvchilari bilan solishtirish)
        const linkedStudents = await db.linkParentByPhone(rawPhone, chatId);

        if (linkedStudents && linkedStudents.length > 0) {
          let msg = `✅ <b>Tabriklaymiz! Telefon raqamingiz muvaffaqiyatli tasdiqlandi.</b>\n\n` +
                    `Siz quyidagi o‘quvchi(lar)ning ota-onasi sifatida tizimga biriktirildingiz:\n\n`;

          for (const s of linkedStudents) {
            msg += `▫️ <b>${escapeHtml(s.full_name)}</b> (${escapeHtml(s.class_name)})\n`;
          }

          msg += `\n🔔 Har kuni soat 14:00 da darslar tugagach davomat shaxsiy profilingizga avtomatik yuboriladi.\n` +
                 `Quyidagi menyu orqali istalgan vaqtda farzandingiz davomatini tekshirishingiz mumkin:`;

          return ctx.replyWithHTML(msg, {
            reply_markup: getParentKeyboard()
          });
        } else {
          return ctx.replyWithHTML(
            `❌ <b>Siz yuborgan telefon raqami 9-sinflar ro‘yxatida topilmadi.</b>\n\n` +
            `Raqam: <b>${escapeHtml(rawPhone)}</b>\n\n` +
            `Iltimos, farzandingizning <b>sinf rahbariga (9-A yoki 9-B)</b> murojaat qiling va telefon raqamingiz to‘g‘ri kiritilganligini tekshirtiring. ` +
            `O‘qituvchi raqamingizni tizimga kiritgach, qayta kontakt yuborsangiz darhol ulanasiz.`,
            {
              reply_markup: getUnverifiedKeyboard()
            }
          );
        }
      } catch (err) {
        console.error('Contact error:', err);
        ctx.reply('Kontaktni tekshirishda xatolik yuz berdi. Qayta urinib ko‘ring.');
      }
    });

    // ==========================================
    // 3. TUGMALAR VA BUYRUQLAR HANDLERLARI
    // ==========================================

    // A. DAVOMAT VA MONITORING HOLATI (/holat va tugmalar)
    async function handleHolat(ctx) {
      try {
        const today = db.getTodayString();
        const webAppUrl = WEBAPP_URL;
        const staff = await db.getStaffByChatId(ctx.chat.id);

        // 1. Agar xodim (Admin yoki Sinf rahbari) bo'lsa
        if (staff) {
          const summary = await db.getClassAttendanceSummary(today);
          const windowInfo = db.checkAttendanceWindow(today);

          let text = `📊 <b>65-MAKTAB | 9-SINFLAR BUGUNGI DAVOMATI</b>\n`;
          text += `📅 <b>Sana:</b> ${formatUzbekDate(today)}\n`;
          text += `⏱ <b>Vaqt rejimi:</b> ${windowInfo.isFrozen ? '🔒 Muzlatilgan (13:30 yakunlangan)' : '🔓 Ochiq (08:00 - 13:30)'}\n`;
          text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

          let totalStudents = 0;
          let totalMarked = 0;

          for (const c of summary) {
            totalStudents += c.student_count;
            totalMarked += c.marked_count;

            let statusBadge = '';
            if (c.status === 'completed') {
              statusBadge = '✅ To‘liq kiritilgan';
            } else if (c.status === 'partial') {
              statusBadge = '⏱ Qisman kiritilgan';
            } else {
              statusBadge = '❌ Kiritilmagan';
            }

            text += `🏫 <b>${escapeHtml(c.name)}-sinf:</b> ${statusBadge}\n`;
            text += `   👥 O‘quvchilar: <b>${c.student_count}</b> ta | Belgilandi: <b>${c.marked_count}</b> ta\n\n`;
          }

          text += `━━━━━━━━━━━━━━━━━━━━\n`;
          text += `📈 <b>Jami ko‘rsatkich:</b> ${totalMarked} / ${totalStudents} o‘quvchi belgilandi\n`;
          text += `📤 <b>Avtomat xabarnoma:</b> Soat 14:00 da avtomatik yuboriladi`;

          const keyboard = staff.role === 'admin'
            ? getAdminKeyboard(webAppUrl)
            : getTeacherKeyboard(webAppUrl, staff.class_id, staff.class_name);

          return ctx.replyWithHTML(text, { reply_markup: keyboard });
        }

        // 2. Agar ota-ona bo'lsa
        const students = await db.getStudentsByParentChatId(ctx.chat.id, today);
        if (students && students.length > 0) {
          let message = `🔔 <b>65-MAKTAB | FARZANDINGIZ DAVOMATI</b>\n`;
          message += `📅 <b>Sana:</b> ${formatUzbekDate(today)}\n`;
          message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

          for (const s of students) {
            message += `👤 <b>O‘quvchi:</b> ${escapeHtml(s.full_name)}\n`;
            message += `🏫 <b>Sinf:</b> ${escapeHtml(s.class_name)}\n`;

            if (s.status) {
              const statusInfo = getStatusDisplay(s.status);
              message += `📊 <b>Holat:</b> ${statusInfo.emoji} <b>${statusInfo.label}</b>\n`;
              if (s.reason) {
                message += `📝 <b>Izoh:</b> <i>${escapeHtml(s.reason)}</i>\n`;
              }
            } else {
              message += `📊 <b>Holat:</b> ⏳ <i>Bugungi davomat hali o‘qituvchi tomonidan kiritilmadi (soat 13:30 gacha kiritiladi, 14:00 da esa hisobot yuboriladi)</i>\n`;
            }
            message += `\n`;
          }

          message += `━━━━━━━━━━━━━━━━━━━━\n`;
          message += `<i>Farzandingiz ta'lim-tarbiyasiga befarq bo'lmaganingiz uchun tashakkur!</i>`;

          return ctx.replyWithHTML(message, { reply_markup: getParentKeyboard() });
        }

        // 3. Hali tasdiqlanmagan foydalanuvchi
        return ctx.replyWithHTML(
          `ℹ️ <b>Siz hali tizimda tasdiqlanmagansiz.</b>\n\n` +
          `Iltimos, pastdagi <b>"📱 Telefon raqamimni tasdiqlash"</b> tugmasini bosing:`,
          { reply_markup: getUnverifiedKeyboard() }
        );
      } catch (err) {
        console.error('Holat error:', err);
        ctx.reply('Ma\'lumotlarni olishda xatolik yuz berdi.');
      }
    }

    bot.command('holat', handleHolat);
    bot.hears(['📊 Farzandim davomati', '📊 Bugungi monitoring', '📊 Bugungi holat'], handleHolat);

    // B. QO'LLANMA VA YORDAM (/yordam va 'ℹ️ Yordam')
    async function handleYordam(ctx) {
      try {
        const today = db.getTodayString();
        const webAppUrl = WEBAPP_URL;
        const staff = await db.getStaffByChatId(ctx.chat.id);

        if (staff) {
          const isBoss = staff.role === 'admin';
          const helpText =
            `ℹ️ <b>EduMemory — 65-maktab Davomat Tizimi</b>\n\n` +
            `📌 <b>Qoidalar va vaqt tartibi:</b>\n` +
            `• <b>08:00 - 13:30</b>: Sinf rahbarlari davomatni kiritish va saqlash oynasi.\n` +
            `• <b>13:30</b>: Tizim davomatni avtomatik muzlatadi (tahrirlash qulflanadi).\n` +
            `• <b>14:00</b>: Ulangan barcha ota-onalar profiliga kunlik hisobot avtomat yuboriladi.\n\n` +
            `🔐 <b>Avtomatik kirish:</b> Hech qanday PIN-kod kiritish shart emas, tizim sizni Telegram orqali taniydi.\n\n` +
            `📞 <b>Bosh Administrator:</b> ${escapeHtml(ADMIN_PHONE)}\n` +
            `🌐 <b>Mini App manzili:</b> ${webAppUrl}`;

          const keyboard = isBoss
            ? getAdminKeyboard(webAppUrl)
            : getTeacherKeyboard(webAppUrl, staff.class_id, staff.class_name);

          return ctx.replyWithHTML(helpText, { reply_markup: keyboard });
        }

        const students = await db.getStudentsByParentChatId(ctx.chat.id, today);
        if (students && students.length > 0) {
          const parentHelp =
            `ℹ️ <b>EduMemory — Ota-onalar uchun ma‘lumot</b>\n\n` +
            `• Farzandingizning davomati har kuni darslar tugagach, soat <b>14:00 da</b> shaxsiy profilingizga avtomatik yuboriladi.\n` +
            `• Kun davomida istalgan vaqtda <b>"📊 Farzandim davomati"</b> tugmasi orqali joriy holatni tekshirishingiz mumkin.\n` +
            `• Agar telefon raqamingiz o‘zgarsa, <b>"📱 Raqamni yangilash"</b> tugmasini bosing.\n\n` +
            `📞 Savollar bo‘yicha sinf rahbariga yoki maktab ma‘muriyatiga murojaat qiling.`;

          return ctx.replyWithHTML(parentHelp, { reply_markup: getParentKeyboard() });
        }

        return ctx.replyWithHTML(
          `ℹ️ <b>EduMemory — 65-maktab Davomat Tizimi</b>\n\n` +
          `Farzandingiz davomati haqida xabardor bo‘lish uchun iltimos, pastdagi tugma orqali telefon raqamingizni tasdiqlang:`,
          { reply_markup: getUnverifiedKeyboard() }
        );
      } catch (err) {
        console.error('Yordam error:', err);
        ctx.reply('Ma\'lumotni olishda xatolik yuz berdi.');
      }
    }

    bot.command('yordam', handleYordam);
    bot.hears('ℹ️ Yordam', handleYordam);

    // C. ADMIN BOSHQARUV PANEL BUYRUG'I
    bot.command('admin', async (ctx) => {
      const chatId = ctx.chat.id;
      const text = (ctx.message.text || '').trim();
      const webAppUrl = process.env.WEBAPP_URL || WEBAPP_URL;

      // Agar /admin 9900 deb yozilsa, profilni darhol Bosh Admin sifatida biriktirish
      if (text.includes('9900')) {
        await db.linkStaffByPhone(ADMIN_PHONE, chatId);
        return ctx.replyWithHTML(
          `👑 <b>Tabriklaymiz! Siz Bosh Administrator sifatida tizimga muvaffaqiyatli ulandingiz.</b>\n\n` +
          `Sizga barcha boshqaruv tugmalari faollashtirildi:`,
          {
            reply_markup: getAdminKeyboard(webAppUrl)
          }
        );
      }

      const staff = await db.getStaffByChatId(chatId);
      const keyboard = staff && staff.role === 'admin' 
        ? getAdminKeyboard(webAppUrl) 
        : (staff ? getTeacherKeyboard(webAppUrl, staff.class_id, staff.class_name) : getUnverifiedKeyboard());

      return ctx.replyWithHTML(
        `👨‍🏫 <b>EduMemory — 9-sinflar Davomat Tizimi</b>\n\n` +
        `Davomat kiritish (08:00 - 13:30) yoki nazorat qilish uchun pastdagi tugmani bosing:` +
        (!staff ? `\n\n<i>Maslahat: Bosh Admin sifatida darhol ulanish uchun <code>/admin 9900</code> buyrug‘ini yuboring.</i>` : ''),
        {
          reply_markup: keyboard
        }
      );
    });

    // ==========================================
    // 4. BOTNI ISHGA TUSHIRISH (WEBHOOK / POLLING)
    // ==========================================
    if (WEBAPP_URL && WEBAPP_URL.startsWith('https://')) {
      const webhookUrl = `${WEBAPP_URL}/telegram-webhook`;
      bot.telegram.setWebhook(webhookUrl, { drop_pending_updates: false })
        .then(() => {
          console.log(`🚀 Telegram Webhook muvaffaqiyatli ulandi: ${webhookUrl}`);
        })
        .catch((err) => {
          console.warn(`⚠️ Webhook o'rnatishda xatolik (${err.message}), polling ga o'tilmoqda...`);
          bot.launch().catch((e) => console.error('❌ Bot launch xatosi:', e.message));
        });
    } else {
      bot.telegram.deleteWebhook().catch(() => {}).then(() => {
        bot.launch().catch((err) => {
          console.error('❌ Bot launch xatosi:', err.message);
        });
      });
    }

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

// 1. PIN-kodlarsiz avtomatik foydalanuvchi va rol aniqlash
app.get('/api/auth/me', async (req, res) => {
  try {
    const { userId, role: queryRole, classId: queryClassId, class: queryClassName } = req.query;

    // A. Telegram userId orqali tekshirish
    if (userId) {
      const staff = await db.getStaffByChatId(userId);
      if (staff) {
        return res.json({
          success: true,
          authenticated: true,
          role: staff.role, // 'admin' yoki 'teacher'
          fullName: staff.full_name,
          classId: staff.class_id || null,
          className: staff.class_name || null
        });
      }
    }

    // B. URL parametrida rol yoki sinf berilgan bo'lsa (masalan: ?role=teacher&classId=1 yoki ?class=9-A)
    if (queryRole === 'teacher' || queryClassId || queryClassName) {
      let classObj = null;
      if (queryClassId) {
        classObj = await db.getClassById(parseInt(queryClassId, 10));
      } else if (queryClassName) {
        classObj = await db.getClassByName(queryClassName);
      } else {
        const classes = await db.getAllClasses();
        classObj = classes[0] || null;
      }

      return res.json({
        success: true,
        authenticated: true,
        role: 'teacher',
        fullName: classObj ? `${classObj.name} Sinf Rahbari` : 'Sinf Rahbari',
        classId: classObj ? classObj.id : null,
        className: classObj ? classObj.name : null
      });
    }

    // C. Bosh Admin roli (masalan: ?role=admin yoki to'g'ridan-to'g'ri brauzerdan ochilganda)
    return res.json({
      success: true,
      authenticated: true,
      role: 'admin',
      fullName: 'Bosh Administrator',
      classId: null,
      className: null
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
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
