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
  
  // Toshkent kunduzi bo'yicha hafta kunini hisoblash (0 = Yakshanba, 1 = Dushanba, ..., 6 = Shanba)
  const d = new Date(`${dateStr}T12:00:00+05:00`);
  const dayOfWeek = d.getDay();

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
 * Yakshanba kunlari davomat kiritish man etiladi.
 */
function checkAttendanceWindow(targetDate = null) {
  const t = getTashkentTimeParts();
  const todayStr = t.dateStr;
  const checkDate = targetDate || todayStr;

  // Faqat bugungi kun davomati ochiladi
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

  // 08:00 dan 13:30 gacha
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
 * Telefon raqamini normalizatsiya qilish (oxirgi 9 ta raqam: masalan, 901234567)
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
 * Telefon raqamini chiroyli formatlash (+998 (90) 123-45-67)
 */
function formatPhone(raw) {
  const norm = normalizePhone(raw);
  if (norm.length === 9) {
    return `+998 (${norm.slice(0, 2)}) ${norm.slice(2, 5)}-${norm.slice(5, 7)}-${norm.slice(7, 9)}`;
  }
  return raw || '';
}

/**
 * 3. MA'LUMOTLAR BAZASINI INITSIALIZATSIYA QILISH
 */
async function initDatabase() {
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

      -- Takroriy xabarlarning oldini oluvchi nazorat jadvali
      CREATE TABLE IF NOT EXISTS daily_dispatches (
        id SERIAL PRIMARY KEY,
        date VARCHAR(10) UNIQUE NOT NULL,
        dispatched_at TIMESTAMPTZ NOT NULL,
        total_sent INTEGER DEFAULT 0,
        total_failed INTEGER DEFAULT 0,
        unmarked_classes TEXT,
        status VARCHAR(20) NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_pg_students_class ON students(class_id);
      CREATE INDEX IF NOT EXISTS idx_pg_students_phone_norm ON students(parent_phone_norm);
      CREATE INDEX IF NOT EXISTS idx_pg_attendance_date ON attendance(date);
      CREATE INDEX IF NOT EXISTS idx_pg_daily_dispatches_date ON daily_dispatches(date);
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

      -- Takroriy xabarlarning oldini oluvchi nazorat jadvali
      CREATE TABLE IF NOT EXISTS daily_dispatches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT UNIQUE NOT NULL,
        dispatched_at TEXT NOT NULL,
        total_sent INTEGER DEFAULT 0,
        total_failed INTEGER DEFAULT 0,
        unmarked_classes TEXT,
        status TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sqlite_students_class ON students(class_id);
      CREATE INDEX IF NOT EXISTS idx_sqlite_students_phone_norm ON students(parent_phone_norm);
      CREATE INDEX IF NOT EXISTS idx_sqlite_attendance_date ON attendance(date);
      CREATE INDEX IF NOT EXISTS idx_sqlite_daily_dispatches_date ON daily_dispatches(date);
    `);
  }

  // Boshlang'ich test ma'lumotlari (agar bo'sh bo'lsa)
  await seedInitialData();
}

async function seedInitialData() {
  const existingClass = await queryOne('SELECT id FROM classes LIMIT 1');
  if (existingClass) return;

  console.log('🌱 Baza bo‘sh. 65-maktab uchun boshlang‘ich ma‘lumotlar kiritilmoqda...');

  const classes = ['9-A', '9-B', '10-A', '11-A'];
  for (const name of classes) {
    await execute('INSERT INTO classes (name) VALUES (?)', [name]);
  }

  const cls9A = await queryOne('SELECT id FROM classes WHERE name = ?', ['9-A']);
  const cls9B = await queryOne('SELECT id FROM classes WHERE name = ?', ['9-B']);
  const cls10A = await queryOne('SELECT id FROM classes WHERE name = ?', ['10-A']);

  const sampleStudents = [
    { name: 'Abdullayev Anvar Ikrom o‘g‘li', class_id: cls9A.id, phone: '+998901234567' },
    { name: 'Baxromova Dilnoza Sanjar qizi', class_id: cls9A.id, phone: '+998901234568' },
    { name: 'Karimov Jasur Bobur o‘g‘li', class_id: cls9A.id, phone: '+998901234569' },
    { name: 'Normatova Shahnoza Otabek qizi', class_id: cls9A.id, phone: '+998901234570' },
    { name: 'Rustamov Sardor Ulug‘bek o‘g‘li', class_id: cls9A.id, phone: '+998901234571' },
    { name: 'Tursunov Bekzod Akmal o‘g‘li', class_id: cls9B.id, phone: '+998901234572' },
    { name: 'Xamidova Madina Ilhom qizi', class_id: cls9B.id, phone: '+998901234573' },
    { name: 'Yusupov Doniyor Nodir o‘g‘li', class_id: cls9B.id, phone: '+998901234574' },
    { name: 'Zokirov Eldor Mansur o‘g‘li', class_id: cls10A.id, phone: '+998901234575' }
  ];

  for (const s of sampleStudents) {
    const norm = normalizePhone(s.phone);
    await execute(
      'INSERT INTO students (full_name, class_id, parent_phone, parent_phone_norm) VALUES (?, ?, ?, ?)',
      [s.name, s.class_id, s.phone, norm]
    );
  }

  console.log('✅ Boshlang‘ich ma‘lumotlar muvaffaqiyatli yuklandi.');
}

// ==========================================
// 4. SINFLAR BOSHQARUVI (CRUD)
// ==========================================
async function getAllClasses() {
  const sql = `
    SELECT c.id, c.name, COUNT(s.id) as student_count
    FROM classes c
    LEFT JOIN students s ON s.class_id = c.id
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

async function createClass(name) {
  const trimmed = String(name).trim();
  const existing = await getClassByName(trimmed);
  if (existing) return existing;

  const res = await execute('INSERT INTO classes (name) VALUES (?)', [trimmed]);
  return await getClassByName(trimmed);
}

async function deleteClass(classId) {
  return await execute('DELETE FROM classes WHERE id = ?', [classId]);
}

// ==========================================
// 5. O'QUVCHILAR BOSHQARUVI (CRUD)
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
  
  // Agar ushbu telefon raqam bilan avval boshqa farzand orqali profil ulangan bo'lsa, chat_id ni avtomat biriktiramiz
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
// 6. TELEGRAM KONTAKT VA PROFIL BIRIKTIRISH
// ==========================================
async function linkParentByPhone(rawPhone, chatId) {
  const norm = normalizePhone(rawPhone);
  if (!norm) return [];

  const students = await queryAll(
    `SELECT s.id, s.full_name, c.name as class_name 
     FROM students s 
     JOIN classes c ON s.class_id = c.id 
     WHERE s.parent_phone_norm = ?`,
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
    WHERE s.parent_chat_id = ?
    ORDER BY s.full_name ASC
  `;
  return await queryAll(sql, [date, chatId]);
}

// ==========================================
// 7. DAVOMATNI SAQLASH (TIME-LOCK BILAN)
// ==========================================
async function saveAttendanceBatch(records, date) {
  // 1. Qat'iy vaqt tekshiruvi: 08:00 - 13:30
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

// ==========================================
// 8. CRON VA AVTOMAT DISPATCH (DAILY_DISPATCHES)
// ==========================================

/**
 * Ushbu sana uchun xabarlar allaqachon yuborilganmi?
 */
async function isDailyDispatched(date) {
  const row = await queryOne(
    `SELECT * FROM daily_dispatches WHERE date = ? AND status = 'completed'`,
    [date]
  );
  return Boolean(row);
}

/**
 * Kunlik xabarnoma hisobotini saqlash
 */
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

/**
 * Bugun davomati umuman kiritilmagan sinflarni topish
 */
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

/**
 * Direktor / Zavuch uchun barcha sinflarning bugungi davomat nazorati xulosasi
 */
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

/**
 * Avtomat xabarnoma jo'natish uchun tayyor o'quvchilar ro'yxati
 * Faqat:
 * 1. O'quvchi davomati belgilangan (unmarked emas)
 * 2. Ota-onasi Telegramda ro'yxatdan o'tgan (parent_chat_id mavjud)
 * 3. Hali bugungi kun uchun xabar bormagan (notified = 0)
 */
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
// 9. STATISTIKA VA EXCEL OYLIK JURNAL
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
    LEFT JOIN attendance a ON a.student_id = s.id AND a.date = ?
  `;
  const params = [date];
  if (classId) {
    sql += ' WHERE s.class_id = ?';
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

// Dasturni ishga tushirishda bazani tekshirish
initDatabase().catch((e) => console.error('initDatabase error:', e));

module.exports = {
  hasPostgres,
  getTashkentTimeParts,
  getTodayString,
  checkAttendanceWindow,
  normalizePhone,
  formatPhone,
  initDatabase,
  getAllClasses,
  getClassById,
  getClassByName,
  createClass,
  deleteClass,
  getStudentsWithAttendance,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  updateStudentParentPhone,
  linkParentByPhone,
  getStudentsByParentChatId,
  saveAttendanceBatch,
  isDailyDispatched,
  recordDailyDispatch,
  getUnmarkedClassesToday,
  getClassAttendanceSummary,
  getPendingNotifications,
  markAttendanceAsNotified,
  getAttendanceStats,
  getMonthAttendanceForExport
};
