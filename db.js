const path = require('path');

// 1. DRAYVERNI ANIQLASH (PostgreSQL yoki SQLite)
const hasPostgres = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '');

let pgPool = null;
let sqliteDb = null;
let isNodeSqlite = false;

if (hasPostgres) {
  const { Pool } = require('pg');
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  });
  console.log('🐘 PostgreSQL drayveri faollashtirildi (DATABASE_URL)');
} else {
  const dbPath = path.join(__dirname, 'edumemory.db');
  try {
    const Database = require('better-sqlite3');
    sqliteDb = new Database(dbPath);
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('foreign_keys = ON');
    console.log('📦 SQLite drayveri (better-sqlite3) faollashtirildi');
  } catch (err) {
    try {
      const { DatabaseSync } = require('node:sqlite');
      sqliteDb = new DatabaseSync(dbPath);
      sqliteDb.exec('PRAGMA journal_mode = WAL;');
      sqliteDb.exec('PRAGMA foreign_keys = ON;');
      isNodeSqlite = true;
      console.log('📦 SQLite drayveri (node:sqlite) faollashtirildi');
    } catch (innerErr) {
      console.error('❌ SQLite drayverini yuklab bo‘lmadi:', innerErr);
      throw innerErr;
    }
  }
}

/**
 * Universal SQL so'rov bajaruvchisi
 * ? belgilarini PostgreSQL uchun $1, $2, ... ga o'giradi
 */
async function queryAll(sql, params = []) {
  if (hasPostgres) {
    let pIdx = 1;
    const pgSql = sql.replace(/\?/g, () => `$${pIdx++}`);
    const res = await pgPool.query(pgSql, params);
    return res.rows;
  } else {
    const stmt = sqliteDb.prepare(sql);
    return stmt.all(...params);
  }
}

async function queryOne(sql, params = []) {
  if (hasPostgres) {
    let pIdx = 1;
    const pgSql = sql.replace(/\?/g, () => `$${pIdx++}`);
    const res = await pgPool.query(pgSql, params);
    return res.rows[0] || null;
  } else {
    const stmt = sqliteDb.prepare(sql);
    return stmt.get(...params) || null;
  }
}

async function execute(sql, params = []) {
  if (hasPostgres) {
    let pIdx = 1;
    const pgSql = sql.replace(/\?/g, () => `$${pIdx++}`);
    const res = await pgPool.query(pgSql, params);
    return { changes: res.rowCount, lastInsertRowid: res.rows[0]?.id || null };
  } else {
    const stmt = sqliteDb.prepare(sql);
    const res = stmt.run(...params);
    return { changes: res.changes, lastInsertRowid: res.lastInsertRowid };
  }
}

/**
 * 2. VAQT VA SANA BOSHQARUVI (Asia/Tashkent - UTC+5)
 */
function getTashkentTimeParts() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  });
  
  const parts = formatter.formatToParts(new Date());
  const map = {};
  parts.forEach(p => { map[p.type] = p.value; });

  const year = map.year;
  const month = map.month;
  const day = map.day;
  const hour = parseInt(map.hour, 10);
  const minute = parseInt(map.minute, 10);
  const second = parseInt(map.second, 10);
  const dateStr = `${year}-${month}-${day}`;
  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  
  const d = new Date(`${dateStr}T12:00:00+05:00`);
  const dayOfWeek = d.getDay(); // 0 = Yakshanba, 1..6 = Dushanba-Shanba

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    dateStr,
    timeStr,
    dayOfWeek
  };
}

function getTodayString() {
  return getTashkentTimeParts().dateStr;
}

/**
 * Qat'iy vaqt rejimi (Time-Lock):
 * Davomat faqat dars vaqtida — soat 08:00 dan 13:30 gacha (Asia/Tashkent) kiritilishi va tahrirlanishi mumkin.
 * Soat 13:30 da tizim bugungi kun davomatini avtomatik "MUZLATADI" (FREEZE).
 */
function checkAttendanceWindow(targetDate = null) {
  const t = getTashkentTimeParts();
  const todayStr = t.dateStr;
  const checkDate = targetDate || todayStr;

  if (checkDate !== todayStr) {
    return {
      allowed: false,
      reason: 'Faqat bugungi sana davomati kiritilishi mumkin. O‘tgan yoki kelajak kunlar qat’iy muzlatilgan.',
      isFrozen: true,
      serverTime: t.timeStr,
      today: todayStr
    };
  }

  // Yakshanba kuni dars bo'lmaydi
  if (t.dayOfWeek === 0) {
    return {
      allowed: false,
      reason: 'Bugun yakshanba — dam olish kuni. Davomat kiritish tizim tomonidan to‘xtatilgan.',
      isFrozen: true,
      serverTime: t.timeStr,
      today: todayStr
    };
  }

  const currentMinutes = t.hour * 60 + t.minute;
  const startMinutes = 8 * 60; // 08:00 -> 480 daqiqa
  const endMinutes = 13 * 60 + 30; // 13:30 -> 810 daqiqa

  if (currentMinutes < startMinutes) {
    return {
      allowed: false,
      reason: 'Davomat kiritish vaqti hali boshlanmadi. Qabul vaqti: soat 08:00 dan 13:30 gacha.',
      isFrozen: true,
      serverTime: t.timeStr,
      today: todayStr
    };
  }

  if (currentMinutes >= endMinutes) {
    return {
      allowed: false,
      reason: 'Bugungi davomat qulflangan, tahrirlash vaqti 13:30 da yakunlangan!',
      isFrozen: true,
      serverTime: t.timeStr,
      today: todayStr
    };
  }

  return {
    allowed: true,
    reason: null,
    isFrozen: false,
    serverTime: t.timeStr,
    today: todayStr
  };
}

/**
 * Telefon raqamini normalizatsiya qilish (oxirgi 9 ta raqam: masalan, 996893228)
 */
function normalizePhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length >= 9) {
    return digits.slice(-9);
  }
  return digits;
}

/**
 * Telefon raqamini chiroyli formatlash (+998 (99) 689-32-28)
 */
function formatPhone(raw) {
  const norm = normalizePhone(raw);
  if (norm.length === 9) {
    return `+998 (${norm.slice(0, 2)}) ${norm.slice(2, 5)}-${norm.slice(5, 7)}-${norm.slice(7, 9)}`;
  }
  return raw || '';
}

let initDbPromise = null;
async function initDatabase() {
  if (initDbPromise) return initDbPromise;
  initDbPromise = (async () => {
    if (hasPostgres) {

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        parent_chat_id BIGINT DEFAULT NULL,
        parent_phone VARCHAR(50),
        parent_phone_norm VARCHAR(20)
      );

      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        date VARCHAR(10) NOT NULL,
        status VARCHAR(20),
        reason TEXT,
        notified INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, date)
      );

      CREATE TABLE IF NOT EXISTS daily_dispatches (
        id SERIAL PRIMARY KEY,
        date VARCHAR(10) UNIQUE NOT NULL,
        dispatched_at TIMESTAMPTZ NOT NULL,
        total_sent INTEGER DEFAULT 0,
        total_failed INTEGER DEFAULT 0,
        unmarked_classes TEXT,
        status VARCHAR(20) NOT NULL
      );

      -- Xodimlar (Admin va O'qituvchilar) jadvali
      CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        phone_norm VARCHAR(20) UNIQUE NOT NULL,
        role VARCHAR(30) NOT NULL, -- 'admin', 'teacher'
        class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
        chat_id BIGINT DEFAULT NULL
      );

      -- Dars jadvali (Raspisaniya) jadvali
      CREATE TABLE IF NOT EXISTS timetable (
        id SERIAL PRIMARY KEY,
        class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL,
        lesson_order INTEGER NOT NULL,
        subject VARCHAR(150) NOT NULL,
        teacher_name VARCHAR(255),
        room VARCHAR(50),
        start_time VARCHAR(20),
        end_time VARCHAR(20),
        UNIQUE(class_id, day_of_week, lesson_order)
      );

      CREATE INDEX IF NOT EXISTS idx_pg_students_class ON students(class_id);
      CREATE INDEX IF NOT EXISTS idx_pg_students_phone_norm ON students(parent_phone_norm);
      CREATE INDEX IF NOT EXISTS idx_pg_attendance_date ON attendance(date);
      CREATE INDEX IF NOT EXISTS idx_pg_daily_dispatches_date ON daily_dispatches(date);
      CREATE INDEX IF NOT EXISTS idx_pg_staff_phone_norm ON staff(phone_norm);
      CREATE INDEX IF NOT EXISTS idx_pg_timetable_class_day ON timetable(class_id, day_of_week);
    `);
  } else {
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        class_id INTEGER NOT NULL,
        parent_chat_id INTEGER DEFAULT NULL,
        parent_phone TEXT,
        parent_phone_norm TEXT,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        status TEXT,
        reason TEXT,
        notified INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, date),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS daily_dispatches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT UNIQUE NOT NULL,
        dispatched_at TEXT NOT NULL,
        total_sent INTEGER DEFAULT 0,
        total_failed INTEGER DEFAULT 0,
        unmarked_classes TEXT,
        status TEXT NOT NULL
      );

      -- Xodimlar (Admin va O'qituvchilar) jadvali
      CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        phone TEXT,
        phone_norm TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        class_id INTEGER DEFAULT NULL,
        chat_id INTEGER DEFAULT NULL,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
      );

      -- Dars jadvali (Raspisaniya) jadvali
      CREATE TABLE IF NOT EXISTS timetable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER NOT NULL,
        day_of_week INTEGER NOT NULL,
        lesson_order INTEGER NOT NULL,
        subject TEXT NOT NULL,
        teacher_name TEXT,
        room TEXT,
        start_time TEXT,
        end_time TEXT,
        UNIQUE(class_id, day_of_week, lesson_order),
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_sqlite_students_class ON students(class_id);
      CREATE INDEX IF NOT EXISTS idx_sqlite_students_phone_norm ON students(parent_phone_norm);
      CREATE INDEX IF NOT EXISTS idx_sqlite_attendance_date ON attendance(date);
      CREATE INDEX IF NOT EXISTS idx_sqlite_daily_dispatches_date ON daily_dispatches(date);
      CREATE INDEX IF NOT EXISTS idx_sqlite_staff_phone_norm ON staff(phone_norm);
      CREATE INDEX IF NOT EXISTS idx_sqlite_timetable_class_day ON timetable(class_id, day_of_week);
    `);
  }

  // 100% PRODUCTION TOZALASH: Faqat 9-A qoldiriladi (9-B butunlay o'chirildi), 9-A o'qituvchilari kiritiladi
  await cleanAndSetupProduction();
  })();
  return initDbPromise;
}

/**
 * 9-A sinfining 19 nafar fan o'qituvchilari va sinf rahbari ro'yxati
 */
const TEACHERS_9A = [
  { full_name: 'Muhammadiyeva X. (Sinf rahbari)', phone: '+998 94 484 84 12' },
  { full_name: 'Asatova M. (Ingliz tili)', phone: '+998 95 711 59 19' },
  { full_name: 'Murotqobilova B. (Ingliz tili)', phone: '+998 88 373 07 05' },
  { full_name: 'Rustamova (Geografiya)', phone: '+998 93 282 07 82' },
  { full_name: 'Jamolov Sh. (Rus tili)', phone: '+998 87 053 13 67' },
  { full_name: 'Ismoilova O. (Rus tili)', phone: '+998 77 150 16 25' },
  { full_name: 'Ergashov R. (Jismoniy tarbiya)', phone: '+998 91 333 23 65' },
  { full_name: 'Raxmonov F. (Algebra)', phone: '+998 94 222 37 75' },
  { full_name: 'Jo‘raqulova (Biologiya)', phone: '+998 99 239 72 09' },
  { full_name: 'Asadova D. (O‘zbekiston tarixi)', phone: '+998 93 312 09 67' },
  { full_name: 'Qozoyeva Z. (Kimyo)', phone: '+998 91 254 08 02' },
  { full_name: 'Jumayeva U. (Informatika)', phone: '+998 91 251 26 27' },
  { full_name: 'Norxolova G. (Informatika)', phone: '+998 91 085 80 83' },
  { full_name: 'Xolmurodova L. (Geometriya)', phone: '+998 93 708 82 20' },
  { full_name: 'Sobirova S. (Ona tili)', phone: '+998 99 310 00 35' },
  { full_name: 'Mehriddinova E. (Huquq)', phone: '+998 93 965 68 08' },
  { full_name: 'Xolmirzayeva D. (Adabiyot)', phone: '+998 91 988 36 37' },
  { full_name: 'Boymurodova N. (Chizmachilik)', phone: '+998 94 893 89 99' },
  { full_name: 'Norova A. (Tarbiya)', phone: '+998 95 336 88 14' }
];

/**
 * Dars qo‘ng‘iroqlari jadvali (Dars vaqtlari)
 */
const LESSON_TIMES = {
  1: { start: '08:00', end: '08:45' },
  2: { start: '08:50', end: '09:35' },
  3: { start: '09:40', end: '10:25' },
  4: { start: '10:35', end: '11:20' },
  5: { start: '11:25', end: '12:10' },
  6: { start: '12:15', end: '13:00' }
};

const DAY_NAMES_UZ = {
  1: 'Dushanba',
  2: 'Seshanba',
  3: 'Chorshanba',
  4: 'Payshanba',
  5: 'Juma',
  6: 'Shanba'
};

/**
 * 9-A sinfining to‘liq haftalik dars jadvali (Raspisaniya)
 */
const TIMETABLE_9A = [
  // 1. DUSHANBA
  { day: 1, order: 1, subject: 'Kelajak soati', teacher: 'Muhammadiyeva X. (Sinf rahbari)' },
  { day: 1, order: 2, subject: 'Ingliz tili', teacher: 'Asatova M. / Murotqobilova B.' },
  { day: 1, order: 3, subject: 'Geografiya / IBA', teacher: 'Rustamova' },
  { day: 1, order: 4, subject: 'Rus tili', teacher: 'Jamolov Sh. / Ismoilova O.' },
  { day: 1, order: 5, subject: 'Fizika', teacher: 'Muhammadiyeva X.' },
  { day: 1, order: 6, subject: 'Jismoniy tarbiya', teacher: 'Davronov B. / Ergashov R.' },

  // 2. SESHANBA
  { day: 2, order: 1, subject: 'Algebra', teacher: 'Raxmonov F.' },
  { day: 2, order: 2, subject: 'Algebra', teacher: 'Raxmonov F.' },
  { day: 2, order: 3, subject: 'Biologiya', teacher: 'Jo‘raqulova X.' },
  { day: 2, order: 4, subject: 'O‘zbekiston tarixi', teacher: 'Asadova D.' },
  { day: 2, order: 5, subject: 'Jahon tarixi', teacher: 'Asadova D.' },
  { day: 2, order: 6, subject: 'Kimyo', teacher: 'Qozoyeva Z.' },

  // 3. CHORSHANBA
  { day: 3, order: 1, subject: 'Informatika', teacher: 'Jumayeva U. / Norxolova G.' },
  { day: 3, order: 2, subject: 'Rus tili', teacher: 'Jamolov Sh. / Ismoilova O.' },
  { day: 3, order: 3, subject: 'Ingliz tili', teacher: 'Asatova M. / Murotqobilova B.' },
  { day: 3, order: 4, subject: 'Geometriya', teacher: 'Xolmurodova L.' },
  { day: 3, order: 5, subject: 'Ona tili', teacher: 'Sobirova S.' },

  // 4. PAYSHANBA
  { day: 4, order: 1, subject: 'Huquq', teacher: 'Mehriddinova E.' },
  { day: 4, order: 2, subject: 'Adabiyot', teacher: 'Xolmirzayeva D.' },
  { day: 4, order: 3, subject: 'Ingliz tili', teacher: 'Asatova M. / Murotqobilova B.' },
  { day: 4, order: 4, subject: 'Geografiya', teacher: 'Rustamova S.' },
  { day: 4, order: 5, subject: 'Chizmachilik', teacher: 'Boymurodova N.' },
  { day: 4, order: 6, subject: 'Jismoniy tarbiya', teacher: 'Davronov B. / Ergashov R.' },

  // 5. JUMA
  { day: 5, order: 1, subject: 'Fizika', teacher: 'Muhammadiyeva X.' },
  { day: 5, order: 2, subject: 'Informatika', teacher: 'Jumayeva U. / Norxolova G.' },
  { day: 5, order: 3, subject: 'Algebra', teacher: 'Raxmonov F.' },
  { day: 5, order: 4, subject: 'Ona tili', teacher: 'Sobirova S.' },
  { day: 5, order: 5, subject: 'O‘zbekiston tarixi', teacher: 'Asadova D.' },
  { day: 5, order: 6, subject: 'Texnologiya', teacher: 'Xolmatova Z. / Boliyeva M.' },

  // 6. SHANBA
  { day: 6, order: 1, subject: 'Kimyo', teacher: 'Qozoyeva Z.' },
  { day: 6, order: 2, subject: 'Geometriya', teacher: 'Xolmurodova L.' },
  { day: 6, order: 3, subject: 'Tarbiya', teacher: 'Norova A.' },
  { day: 6, order: 4, subject: 'Adabiyot', teacher: 'Xolmirzayeva D.' },
  { day: 6, order: 5, subject: 'Biologiya', teacher: 'Jo‘raqulova X.' },
  { day: 6, order: 6, subject: 'Ona tili', teacher: 'Sobirova S.' }
];

/**
 * Haqiqiy ishchi holat (Production setup)
 */
async function cleanAndSetupProduction() {
  console.log('🧹 Production holatiga o‘tkazilmoqda: faqat 9-A sinfi va uning 19 nafar o‘qituvchilari sozlanmoqda...');

  // 1. 9-B va boshqa har qanday sinflar va ularning o'quvchilarini o'chirish (Faqat 9-A qoladi)
  await execute(`DELETE FROM classes WHERE name != '9-A'`);

  // 2. 9-A sinfini bazaga kiritish (agar yo'q bo'lsa)
  let cls9A = await queryOne('SELECT id FROM classes WHERE name = ?', ['9-A']);
  if (!cls9A) {
    await execute('INSERT INTO classes (name) VALUES (?)', ['9-A']);
    cls9A = await queryOne('SELECT id FROM classes WHERE name = ?', ['9-A']);
  }

  // 3. 9-B ga yoki noaniq sinflarga tegishli o'qituvchilarni, shuningdek eski 'teacher_%' placeholderlarni o'chirish
  await execute(
    "DELETE FROM staff WHERE role = 'teacher' AND (class_id IS NULL OR class_id != ? OR phone_norm LIKE 'teacher_%')",
    [cls9A.id]
  );

  // 4. Bosh Adminni kiritish yoki yangilash
  const adminPhone = process.env.ADMIN_PHONE || '+998996893228';
  const adminNorm = normalizePhone(adminPhone) || '996893228';

  const existingAdmin = await queryOne('SELECT id FROM staff WHERE phone_norm = ?', [adminNorm]);
  if (!existingAdmin) {
    await execute(
      'INSERT INTO staff (full_name, phone, phone_norm, role, class_id) VALUES (?, ?, ?, ?, ?)',
      ['Bosh Administrator', adminPhone, adminNorm, 'admin', null]
    );
  }

  // 4.1 Zavuch D.Bekmurodov (+998944822717) ga to'liq ma'muriy (admin) huquqini berish
  const zavuchPhone = '+998 94 482 27 17';
  const zavuchNorm = normalizePhone(zavuchPhone); // '944822717'
  const existingZavuch = await queryOne('SELECT id FROM staff WHERE phone_norm = ?', [zavuchNorm]);
  if (existingZavuch) {
    await execute(
      "UPDATE staff SET full_name = ?, phone = ?, role = 'admin', class_id = NULL WHERE id = ?",
      ['D.Bekmurodov (Zavuch)', zavuchPhone, existingZavuch.id]
    );
  } else {
    await execute(
      "INSERT INTO staff (full_name, phone, phone_norm, role, class_id) VALUES (?, ?, ?, 'admin', NULL)",
      ['D.Bekmurodov (Zavuch)', zavuchPhone, zavuchNorm]
    );
  }

  // 5. 9-A sinfining 19 nafar barcha fan o'qituvchilarini bazaga kiritish / yangilash
  for (const t of TEACHERS_9A) {
    const norm = normalizePhone(t.phone);
    const existing = await queryOne('SELECT id FROM staff WHERE phone_norm = ?', [norm]);
    if (existing) {
      await execute(
        "UPDATE staff SET full_name = ?, phone = ?, role = 'teacher', class_id = ? WHERE id = ?",
        [t.full_name, t.phone, cls9A.id, existing.id]
      );
    } else {
      await execute(
        "INSERT INTO staff (full_name, phone, phone_norm, role, class_id) VALUES (?, ?, ?, 'teacher', ?)",
        [t.full_name, t.phone, norm, cls9A.id]
      );
    }
  }

  // 6. 9-A sinfining dars jadvalini (raspisaniyasini) sozlash
  await execute('DELETE FROM timetable WHERE class_id = ?', [cls9A.id]);
  for (const item of TIMETABLE_9A) {
    const times = LESSON_TIMES[item.order] || { start: '', end: '' };
    await execute(
      `INSERT INTO timetable (class_id, day_of_week, lesson_order, subject, teacher_name, start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cls9A.id, item.day, item.order, item.subject, item.teacher, times.start, times.end]
    );
  }

  console.log('✅ Baza jadvallari, Bosh Admin, Zavuch D.Bekmurodov, 19 nafar o‘qituvchi va 9-A dars jadvali sozlandi.');
}

// ==========================================
// 4. STAFF (ADMIN VA SINF RAHBARLARI) BOSHQARUVI
// ==========================================
async function getStaffByPhone(rawPhone) {
  const norm = normalizePhone(rawPhone);
  if (!norm) return null;
  const sql = `
    SELECT s.*, c.name as class_name 
    FROM staff s 
    LEFT JOIN classes c ON s.class_id = c.id 
    WHERE s.phone_norm = ? 
    LIMIT 1
  `;
  return await queryOne(sql, [norm]);
}

async function linkStaffByPhone(rawPhone, chatId) {
  const norm = normalizePhone(rawPhone);
  if (!norm) return null;
  await execute('UPDATE staff SET chat_id = ? WHERE phone_norm = ?', [chatId, norm]);
  return await getStaffByPhone(rawPhone);
}

async function getStaffByChatId(chatId) {
  if (!chatId) return null;
  const sql = `
    SELECT s.*, c.name as class_name 
    FROM staff s 
    LEFT JOIN classes c ON s.class_id = c.id 
    WHERE s.chat_id = ? 
    LIMIT 1
  `;
  const staff = await queryOne(sql, [chatId]);
  if (staff) return staff;

  if (process.env.ADMIN_CHAT_ID && String(process.env.ADMIN_CHAT_ID) === String(chatId)) {
    return {
      id: 0,
      full_name: 'Bosh Administrator',
      phone: process.env.ADMIN_PHONE || '+998996893228',
      phone_norm: '996893228',
      role: 'admin',
      class_id: null,
      chat_id: chatId,
      class_name: null
    };
  }
  return null;
}

async function getAdminChatIds() {
  const rows = await queryAll(`SELECT chat_id FROM staff WHERE role = 'admin' AND chat_id IS NOT NULL`);
  const ids = rows.map(r => r.chat_id);
  if (process.env.ADMIN_CHAT_ID && !ids.includes(Number(process.env.ADMIN_CHAT_ID))) {
    ids.push(Number(process.env.ADMIN_CHAT_ID));
  }
  return ids;
}

async function getAllStaff() {
  const sql = `
    SELECT s.id, s.full_name, s.phone, s.phone_norm, s.role, s.class_id, s.chat_id, c.name as class_name
    FROM staff s
    LEFT JOIN classes c ON s.class_id = c.id
    ORDER BY s.role ASC, s.id ASC
  `;
  return await queryAll(sql);
}

async function getTeachers() {
  const sql = `
    SELECT s.id, s.full_name, s.phone, s.phone_norm, s.role, s.class_id, s.chat_id, c.name as class_name
    FROM staff s
    LEFT JOIN classes c ON s.class_id = c.id
    WHERE s.role IN ('admin', 'teacher')
    ORDER BY CASE WHEN s.role = 'admin' THEN 1 ELSE 2 END, c.name ASC, s.id ASC
  `;
  return await queryAll(sql);
}

async function saveTeacher({ id, full_name, phone, class_id }) {
  const norm = normalizePhone(phone) || (id ? null : `teacher_${Date.now()}`);
  const targetClassId = class_id ? parseInt(class_id, 10) : null;
  const name = full_name ? full_name.trim() : 'Sinf Rahbari';
  const cleanPhone = phone ? phone.trim() : '';

  if (id) {
    const updateSql = norm 
      ? `UPDATE staff SET full_name = ?, phone = ?, phone_norm = ?, class_id = ? WHERE id = ?`
      : `UPDATE staff SET full_name = ?, phone = ?, class_id = ? WHERE id = ?`;
    const params = norm ? [name, cleanPhone, norm, targetClassId, id] : [name, cleanPhone, targetClassId, id];
    await execute(updateSql, params);
    return await queryOne('SELECT s.*, c.name as class_name FROM staff s LEFT JOIN classes c ON s.class_id = c.id WHERE s.id = ?', [id]);
  } else {
    // 1. Agar sinfda placeholder yoki eski rahbar bo'lsa, o'shani yangilaymiz
    if (targetClassId) {
      const existingInClass = await queryOne(
        "SELECT id, phone_norm FROM staff WHERE class_id = ? AND role = 'teacher'",
        [targetClassId]
      );
      if (existingInClass && (!existingInClass.phone_norm || existingInClass.phone_norm.startsWith('teacher_'))) {
        const updateParams = norm
          ? [name, cleanPhone, norm, targetClassId, existingInClass.id]
          : [name, cleanPhone, targetClassId, existingInClass.id];
        const updateSql = norm
          ? "UPDATE staff SET full_name = ?, phone = ?, phone_norm = ?, class_id = ? WHERE id = ?"
          : "UPDATE staff SET full_name = ?, phone = ?, class_id = ? WHERE id = ?";
        await execute(updateSql, updateParams);
        return await queryOne('SELECT s.*, c.name as class_name FROM staff s LEFT JOIN classes c ON s.class_id = c.id WHERE s.id = ?', [existingInClass.id]);
      }
    }

    // 2. Telefon raqami bo'yicha mavjud bo'lsa yangilaymiz
    if (norm) {
      const existing = await queryOne('SELECT id FROM staff WHERE phone_norm = ?', [norm]);
      if (existing) {
        await execute(
          "UPDATE staff SET full_name = ?, phone = ?, role = 'teacher', class_id = ? WHERE id = ?",
          [name, cleanPhone, targetClassId, existing.id]
        );
        return await queryOne('SELECT s.*, c.name as class_name FROM staff s LEFT JOIN classes c ON s.class_id = c.id WHERE s.id = ?', [existing.id]);
      }
    }

    // 3. Yangi qilib kiritamiz
    await execute(
      'INSERT INTO staff (full_name, phone, phone_norm, role, class_id) VALUES (?, ?, ?, ?, ?)',
      [name, cleanPhone, norm, 'teacher', targetClassId]
    );
    return await queryOne('SELECT s.*, c.name as class_name FROM staff s LEFT JOIN classes c ON s.class_id = c.id WHERE phone_norm = ?', [norm]);
  }
}

async function deleteTeacher(id) {
  return await execute("DELETE FROM staff WHERE id = ? AND role = 'teacher'", [id]);
}

// ==========================================
// 4.1 BAZA ZAXIRASI VA QAYTA TIKLASH (BACKUP & RESTORE)
// ==========================================
async function exportBackup() {
  const classes = await queryAll('SELECT id, name FROM classes ORDER BY id ASC');
  const students = await queryAll('SELECT id, full_name, class_id, parent_chat_id, parent_phone, parent_phone_norm FROM students ORDER BY id ASC');
  const staff = await queryAll('SELECT id, full_name, phone, phone_norm, role, class_id, chat_id FROM staff ORDER BY id ASC');
  const attendance = await queryAll('SELECT id, student_id, date, status, reason, notified FROM attendance ORDER BY date DESC, id ASC');

  return {
    version: '1.0',
    exported_at: new Date().toISOString(),
    system: 'EduMemory 65-maktab Davomat Tizimi',
    classes,
    students,
    staff,
    attendance
  };
}

async function restoreBackup(backupData) {
  if (!backupData || !Array.isArray(backupData.classes) || !Array.isArray(backupData.students)) {
    throw new Error('Noto‘g‘ri zaxira fayli formati. Zaxirada classes va students bo‘lishi shart.');
  }

  // 1. Sinflarni tiklash va xarita hosil qilish
  const classMap = {};
  for (const c of backupData.classes) {
    let existing = await queryOne('SELECT id FROM classes WHERE name = ?', [c.name]);
    if (!existing) {
      await execute('INSERT INTO classes (name) VALUES (?)', [c.name]);
      existing = await queryOne('SELECT id FROM classes WHERE name = ?', [c.name]);
    }
    if (existing) {
      classMap[c.id] = existing.id;
      classMap[c.name] = existing.id;
    }
  }

  // 2. O'quvchilarni tiklash va xarita
  const studentMap = {};
  if (Array.isArray(backupData.students)) {
    for (const s of backupData.students) {
      const targetClassId = classMap[s.class_id] || (s.class_id <= 2 ? s.class_id : 1);
      const normPhone = s.parent_phone_norm || normalizePhone(s.parent_phone);

      let existing = await queryOne(
        'SELECT id FROM students WHERE full_name = ? AND class_id = ?',
        [s.full_name, targetClassId]
      );

      if (existing) {
        await execute(
          'UPDATE students SET parent_chat_id = ?, parent_phone = ?, parent_phone_norm = ? WHERE id = ?',
          [s.parent_chat_id || null, s.parent_phone || '', normPhone, existing.id]
        );
        studentMap[s.id] = existing.id;
      } else {
        await execute(
          'INSERT INTO students (full_name, class_id, parent_chat_id, parent_phone, parent_phone_norm) VALUES (?, ?, ?, ?, ?)',
          [s.full_name, targetClassId, s.parent_chat_id || null, s.parent_phone || '', normPhone]
        );
        const inserted = await queryOne(
          'SELECT id FROM students WHERE full_name = ? AND class_id = ?',
          [s.full_name, targetClassId]
        );
        if (inserted) {
          studentMap[s.id] = inserted.id;
        }
      }
    }
  }

  // 3. Xodimlarni tiklash
  if (Array.isArray(backupData.staff)) {
    for (const st of backupData.staff) {
      if (st.phone_norm) {
        const targetClassId = st.class_id ? (classMap[st.class_id] || st.class_id) : null;
        const existing = await queryOne('SELECT id FROM staff WHERE phone_norm = ?', [st.phone_norm]);
        if (existing) {
          await execute(
            'UPDATE staff SET full_name = ?, phone = ?, role = ?, class_id = ?, chat_id = ? WHERE id = ?',
            [st.full_name, st.phone || '', st.role, targetClassId, st.chat_id || null, existing.id]
          );
        } else {
          await execute(
            'INSERT INTO staff (full_name, phone, phone_norm, role, class_id, chat_id) VALUES (?, ?, ?, ?, ?, ?)',
            [st.full_name, st.phone || '', st.phone_norm, st.role, targetClassId, st.chat_id || null]
          );
        }
      }
    }
  }

  // 4. Davomat yozuvlarini tiklash
  if (Array.isArray(backupData.attendance)) {
    for (const att of backupData.attendance) {
      const newStudentId = studentMap[att.student_id] || att.student_id;
      if (newStudentId) {
        const existingAtt = await queryOne(
          'SELECT id FROM attendance WHERE student_id = ? AND date = ?',
          [newStudentId, att.date]
        );
        if (existingAtt) {
          await execute(
            'UPDATE attendance SET status = ?, reason = ?, notified = ? WHERE id = ?',
            [att.status, att.reason || '', att.notified || 0, existingAtt.id]
          );
        } else {
          await execute(
            'INSERT INTO attendance (student_id, date, status, reason, notified) VALUES (?, ?, ?, ?, ?)',
            [newStudentId, att.date, att.status, att.reason || '', att.notified || 0]
          );
        }
      }
    }
  }

  return { success: true };
}

// ==========================================
// 5. SINFLAR BOSHQARUVI (FAQAT 9-A)
// ==========================================
async function getAllClasses() {
  const sql = `
    SELECT c.id, c.name, COUNT(s.id) as student_count
    FROM classes c
    LEFT JOIN students s ON s.class_id = c.id
    WHERE c.name = '9-A'
    GROUP BY c.id, c.name
    ORDER BY c.name ASC
  `;
  const rows = await queryAll(sql);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    student_count: Number(r.student_count || 0)
  }));
}

async function getClassById(classId) {
  return await queryOne('SELECT * FROM classes WHERE id = ?', [classId]);
}

async function getClassByName(name) {
  return await queryOne('SELECT * FROM classes WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))', [name]);
}

// ==========================================
// 6. O'QUVCHILAR BOSHQARUVI (CRUD)
// ==========================================
async function getStudentsWithAttendance(classId, date) {
  const sql = `
    SELECT 
      s.id,
      s.full_name,
      s.class_id,
      s.parent_chat_id,
      s.parent_phone,
      s.parent_phone_norm,
      a.status,
      a.reason,
      a.notified,
      CASE 
        WHEN s.parent_chat_id IS NOT NULL THEN 'linked'
        WHEN s.parent_phone IS NOT NULL AND s.parent_phone != '' THEN 'pending'
        ELSE 'no_phone'
      END as parent_status
    FROM students s
    LEFT JOIN attendance a ON a.student_id = s.id AND a.date = ?
    WHERE s.class_id = ?
    ORDER BY s.full_name ASC
  `;
  return await queryAll(sql, [date, classId]);
}

async function getStudentById(studentId) {
  return await queryOne(
    `SELECT s.*, c.name as class_name 
     FROM students s 
     JOIN classes c ON s.class_id = c.id 
     WHERE s.id = ?`,
    [studentId]
  );
}

async function createStudent({ full_name, class_id, parent_phone }) {
  const norm = normalizePhone(parent_phone);
  
  // Agar ushbu telefon raqam orqali ota-onaning chat_id si mavjud bo'lsa, avtomatik biriktiriladi
  let existingChatId = null;
  if (norm) {
    const matched = await queryOne(
      'SELECT parent_chat_id FROM students WHERE parent_phone_norm = ? AND parent_chat_id IS NOT NULL LIMIT 1',
      [norm]
    );
    if (matched) {
      existingChatId = matched.parent_chat_id;
    }
  }

  await execute(
    'INSERT INTO students (full_name, class_id, parent_phone, parent_phone_norm, parent_chat_id) VALUES (?, ?, ?, ?, ?)',
    [full_name.trim(), class_id, parent_phone ? parent_phone.trim() : null, norm, existingChatId]
  );

  return await queryOne(
    'SELECT * FROM students WHERE full_name = ? AND class_id = ? ORDER BY id DESC LIMIT 1',
    [full_name.trim(), class_id]
  );
}

async function updateStudent(studentId, { full_name, class_id, parent_phone }) {
  const norm = normalizePhone(parent_phone);
  
  let existingChatId = null;
  if (norm) {
    const matched = await queryOne(
      'SELECT parent_chat_id FROM students WHERE parent_phone_norm = ? AND parent_chat_id IS NOT NULL LIMIT 1',
      [norm]
    );
    if (matched) {
      existingChatId = matched.parent_chat_id;
    }
  }

  await execute(
    `UPDATE students 
     SET full_name = ?, class_id = ?, parent_phone = ?, parent_phone_norm = ?,
         parent_chat_id = COALESCE(?, parent_chat_id)
     WHERE id = ?`,
    [full_name.trim(), class_id, parent_phone ? parent_phone.trim() : null, norm, existingChatId, studentId]
  );

  return await getStudentById(studentId);
}

async function deleteStudent(studentId) {
  return await execute('DELETE FROM students WHERE id = ?', [studentId]);
}

async function updateStudentParentPhone(studentId, rawPhone) {
  const norm = normalizePhone(rawPhone);
  
  let existingChatId = null;
  if (norm) {
    const matched = await queryOne(
      'SELECT parent_chat_id FROM students WHERE parent_phone_norm = ? AND parent_chat_id IS NOT NULL LIMIT 1',
      [norm]
    );
    if (matched) {
      existingChatId = matched.parent_chat_id;
    }
  }

  await execute(
    `UPDATE students 
     SET parent_phone = ?, parent_phone_norm = ?, parent_chat_id = COALESCE(?, parent_chat_id)
     WHERE id = ?`,
    [rawPhone ? rawPhone.trim() : null, norm, existingChatId, studentId]
  );

  return await getStudentById(studentId);
}

// ==========================================
// 7. TELEGRAM KONTAKT VA PROFIL BIRIKTIRISH
// ==========================================
async function linkParentByPhone(rawPhone, chatId) {
  const norm = normalizePhone(rawPhone);
  if (!norm) return [];

  const students = await queryAll(
    `SELECT s.id, s.full_name, c.name as class_name 
     FROM students s 
     JOIN classes c ON s.class_id = c.id 
     WHERE s.parent_phone_norm = ? AND c.name = '9-A'`,
    [norm]
  );

  if (students.length > 0) {
    await execute('UPDATE students SET parent_chat_id = ? WHERE parent_phone_norm = ?', [chatId, norm]);
  }

  return students;
}

async function getStudentsByParentChatId(chatId, date) {
  const sql = `
    SELECT 
      s.id,
      s.full_name,
      c.name as class_name,
      a.status,
      a.reason
    FROM students s
    JOIN classes c ON s.class_id = c.id
    LEFT JOIN attendance a ON a.student_id = s.id AND a.date = ?
    WHERE s.parent_chat_id = ? AND c.name = '9-A'
    ORDER BY s.full_name ASC
  `;
  return await queryAll(sql, [date, chatId]);
}

// ==========================================
// 8. DAVOMATNI SAQLASH (TIME-LOCK 08:00 - 13:30)
// ==========================================
async function saveAttendanceBatch(records, date) {
  const windowCheck = checkAttendanceWindow(date);
  if (!windowCheck.allowed) {
    const err = new Error(windowCheck.reason);
    err.status = 403;
    throw err;
  }

  let count = 0;
  for (const record of records) {
    const { student_id, status, reason } = record;
    if (!student_id || !status) continue;

    if (hasPostgres) {
      await pgPool.query(
        `INSERT INTO attendance (student_id, date, status, reason, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (student_id, date) 
         DO UPDATE SET status = EXCLUDED.status, reason = EXCLUDED.reason, updated_at = CURRENT_TIMESTAMP`,
        [student_id, date, status, reason || null]
      );
    } else {
      sqliteDb.prepare(
        `INSERT INTO attendance (student_id, date, status, reason, updated_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(student_id, date) 
         DO UPDATE SET status = excluded.status, reason = excluded.reason, updated_at = CURRENT_TIMESTAMP`
      ).run(student_id, date, status, reason || null);
    }
    count++;
  }
  return count;
}

async function getPreviousAttendanceMap(studentIds, date) {
  if (!studentIds || studentIds.length === 0) return {};
  const placeholders = studentIds.map(() => '?').join(',');
  const rows = await queryAll(
    `SELECT student_id, status, reason, updated_at FROM attendance WHERE date = ? AND student_id IN (${placeholders})`,
    [date, ...studentIds]
  );
  const map = {};
  for (const r of rows) {
    map[r.student_id] = r;
  }
  return map;
}

// ==========================================
// 9. CRON VA AVTOMAT DISPATCH (DAILY_DISPATCHES)
// ==========================================
async function isDailyDispatched(date) {
  const row = await queryOne(
    `SELECT * FROM daily_dispatches WHERE date = ? AND status = 'completed'`,
    [date]
  );
  return Boolean(row);
}

async function recordDailyDispatch({ date, total_sent, total_failed, unmarked_classes, status }) {
  const unmarkedStr = Array.isArray(unmarked_classes) ? unmarked_classes.join(', ') : (unmarked_classes || '');
  const now = new Date().toISOString();

  if (hasPostgres) {
    await pgPool.query(
      `INSERT INTO daily_dispatches (date, dispatched_at, total_sent, total_failed, unmarked_classes, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (date)
       DO UPDATE SET dispatched_at = EXCLUDED.dispatched_at, total_sent = EXCLUDED.total_sent,
                     total_failed = EXCLUDED.total_failed, unmarked_classes = EXCLUDED.unmarked_classes,
                     status = EXCLUDED.status`,
      [date, now, total_sent, total_failed, unmarkedStr, status]
    );
  } else {
    sqliteDb.prepare(
      `INSERT INTO daily_dispatches (date, dispatched_at, total_sent, total_failed, unmarked_classes, status)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (date)
       DO UPDATE SET dispatched_at = excluded.dispatched_at, total_sent = excluded.total_sent,
                     total_failed = excluded.total_failed, unmarked_classes = excluded.unmarked_classes,
                     status = excluded.status`
    ).run(date, now, total_sent, total_failed, unmarkedStr, status);
  }
}

async function getUnmarkedClassesToday(date) {
  const sql = `
    SELECT 
      c.id, 
      c.name, 
      COUNT(s.id) as student_count,
      COUNT(CASE WHEN a.status IS NOT NULL THEN 1 END) as marked_count
    FROM classes c
    LEFT JOIN students s ON s.class_id = c.id
    LEFT JOIN attendance a ON a.student_id = s.id AND a.date = ?
    WHERE c.name = '9-A'
    GROUP BY c.id, c.name
    HAVING marked_count = 0 AND student_count > 0
    ORDER BY c.name ASC
  `;
  const rows = await queryAll(sql, [date]);
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    student_count: Number(r.student_count || 0),
    marked_count: Number(r.marked_count || 0)
  }));
}

async function getClassAttendanceSummary(date) {
  const sql = `
    SELECT 
      c.id, 
      c.name, 
      COUNT(s.id) as student_count,
      COUNT(CASE WHEN a.status IS NOT NULL THEN 1 END) as marked_count,
      MAX(a.updated_at) as last_marked_at
    FROM classes c
    LEFT JOIN students s ON s.class_id = c.id
    LEFT JOIN attendance a ON a.student_id = s.id AND a.date = ?
    WHERE c.name = '9-A'
    GROUP BY c.id, c.name
    ORDER BY c.name ASC
  `;
  const rows = await queryAll(sql, [date]);
  return rows.map(r => {
    const studentCount = Number(r.student_count || 0);
    const markedCount = Number(r.marked_count || 0);
    let status = 'unmarked';
    if (markedCount > 0 && markedCount >= studentCount) {
      status = 'completed';
    } else if (markedCount > 0) {
      status = 'partial';
    }
    return {
      id: r.id,
      name: r.name,
      student_count: studentCount,
      marked_count: markedCount,
      last_marked_at: r.last_marked_at || null,
      status
    };
  });
}

async function getPendingNotifications(date) {
  const sql = `
    SELECT 
      a.id as attendance_id,
      a.date,
      a.status,
      a.reason,
      s.id as student_id,
      s.full_name,
      s.parent_chat_id,
      s.parent_phone,
      c.name as class_name
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN classes c ON s.class_id = c.id
    WHERE a.date = ? 
      AND a.notified = 0 
      AND a.status IS NOT NULL
      AND s.parent_chat_id IS NOT NULL
      AND c.name = '9-A'
    ORDER BY c.name ASC, s.full_name ASC
  `;
  return await queryAll(sql, [date]);
}

async function markAttendanceAsNotified(attendanceIds) {
  if (!attendanceIds || attendanceIds.length === 0) return;

  if (hasPostgres) {
    const placeholders = attendanceIds.map((_, i) => `$${i + 1}`).join(',');
    await pgPool.query(
      `UPDATE attendance SET notified = 1, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
      attendanceIds
    );
  } else {
    const placeholders = attendanceIds.map(() => '?').join(',');
    sqliteDb.prepare(
      `UPDATE attendance SET notified = 1, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`
    ).run(...attendanceIds);
  }
}

// ==========================================
// 10. STATISTIKA VA EXCEL OYLIK JURNAL
// ==========================================
async function getAttendanceStats(date, classId = null) {
  let sql = `
    SELECT 
      COUNT(s.id) as total_students,
      COUNT(CASE WHEN a.status = 'keldi' THEN 1 END) as count_keldi,
      COUNT(CASE WHEN a.status = 'kelmadi' THEN 1 END) as count_kelmadi,
      COUNT(CASE WHEN a.status = 'kechikdi' THEN 1 END) as count_kechikdi,
      COUNT(CASE WHEN a.status = 'sababli' THEN 1 END) as count_sababli,
      COUNT(CASE WHEN a.status IS NOT NULL THEN 1 END) as total_marked,
      COUNT(CASE WHEN s.parent_chat_id IS NOT NULL THEN 1 END) as parents_linked,
      COUNT(CASE WHEN s.parent_chat_id IS NULL AND s.parent_phone IS NOT NULL AND s.parent_phone != '' THEN 1 END) as parents_pending
    FROM students s
    JOIN classes c ON s.class_id = c.id
    LEFT JOIN attendance a ON a.student_id = s.id AND a.date = ?
    WHERE c.name = '9-A'
  `;
  const params = [date];
  if (classId) {
    sql += ' AND s.class_id = ?';
    params.push(classId);
  }

  const result = await queryOne(sql, params);
  return {
    total_students: Number(result?.total_students || 0),
    count_keldi: Number(result?.count_keldi || 0),
    count_kelmadi: Number(result?.count_kelmadi || 0),
    count_kechikdi: Number(result?.count_kechikdi || 0),
    count_sababli: Number(result?.count_sababli || 0),
    total_marked: Number(result?.total_marked || 0),
    parents_linked: Number(result?.parents_linked || 0),
    parents_pending: Number(result?.parents_pending || 0)
  };
}

async function getMonthAttendanceForExport(classId, yearMonth) {
  const classInfo = await getClassById(classId);
  if (!classInfo) return null;

  const students = await queryAll(
    'SELECT id, full_name, parent_phone FROM students WHERE class_id = ? ORDER BY full_name ASC',
    [classId]
  );

  const attendanceRows = await queryAll(
    `SELECT a.student_id, a.date, a.status, a.reason
     FROM attendance a
     JOIN students s ON a.student_id = s.id
     WHERE s.class_id = ? AND a.date LIKE ?`,
    [classId, `${yearMonth}%`]
  );

  return {
    class: classInfo,
    yearMonth,
    students,
    attendance: attendanceRows
  };
}

/**
 * Sinf dars jadvalini olish
 */
async function getTimetable(classId, dayOfWeek = null) {
  let sql = `
    SELECT id, class_id, day_of_week, lesson_order, subject, teacher_name, room, start_time, end_time
    FROM timetable
    WHERE class_id = ?
  `;
  const params = [classId];
  if (dayOfWeek !== null && dayOfWeek !== undefined && Number(dayOfWeek) > 0) {
    sql += ' AND day_of_week = ?';
    params.push(Number(dayOfWeek));
  }
  sql += ' ORDER BY day_of_week ASC, lesson_order ASC';
  return await queryAll(sql, params);
}

initDatabase().catch((e) => console.error('initDatabase error:', e));

module.exports = {
  hasPostgres,
  getTashkentTimeParts,
  getTodayString,
  checkAttendanceWindow,
  normalizePhone,
  formatPhone,
  initDatabase,
  getStaffByPhone,
  getStaffByChatId,
  linkStaffByPhone,
  getAdminChatIds,
  getAllStaff,
  getTeachers,
  saveTeacher,
  deleteTeacher,
  exportBackup,
  restoreBackup,
  getAllClasses,
  getClassById,
  getClassByName,
  getStudentsWithAttendance,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  updateStudentParentPhone,
  linkParentByPhone,
  getStudentsByParentChatId,
  saveAttendanceBatch,
  getPreviousAttendanceMap,
  isDailyDispatched,
  recordDailyDispatch,
  getUnmarkedClassesToday,
  getClassAttendanceSummary,
  getPendingNotifications,
  markAttendanceAsNotified,
  getAttendanceStats,
  getMonthAttendanceForExport,
  getTimetable,
  TIMETABLE_9A,
  LESSON_TIMES,
  DAY_NAMES_UZ,
  execute
};

