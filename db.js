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

      CREATE INDEX IF NOT EXISTS idx_pg_students_class ON students(class_id);
      CREATE INDEX IF NOT EXISTS idx_pg_students_phone_norm ON students(parent_phone_norm);
      CREATE INDEX IF NOT EXISTS idx_pg_attendance_date ON attendance(date);
      CREATE INDEX IF NOT EXISTS idx_pg_daily_dispatches_date ON daily_dispatches(date);
      CREATE INDEX IF NOT EXISTS idx_pg_staff_phone_norm ON staff(phone_norm);
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

      CREATE INDEX IF NOT EXISTS idx_sqlite_students_class ON students(class_id);
      CREATE INDEX IF NOT EXISTS idx_sqlite_students_phone_norm ON students(parent_phone_norm);
      CREATE INDEX IF NOT EXISTS idx_sqlite_attendance_date ON attendance(date);
      CREATE INDEX IF NOT EXISTS idx_sqlite_daily_dispatches_date ON daily_dispatches(date);
      CREATE INDEX IF NOT EXISTS idx_sqlite_staff_phone_norm ON staff(phone_norm);
    `);
  }

  // 100% PRODUCTION TOZALASH: Faqat 9-A va 9-B qoldiriladi, barcha soxta test ma'lumotlar o'chiriladi
  await cleanAndSetupProduction();
  })();
  return initDbPromise;
}

/**
 * Haqiqiy ishchi holat (Production setup)
 */
async function cleanAndSetupProduction() {
  console.log('🧹 Production holatiga o‘tkazilmoqda: faqat 9-A va 9-B sinflari sozlanmoqda...');

  // 1. 9-A va 9-B dan boshqa har qanday sinflar va ularning o'quvchilarini o'chirish
  await execute(`DELETE FROM classes WHERE name NOT IN ('9-A', '9-B')`);

  // 2. 9-A va 9-B sinflarini bazaga kiritish (agar yo'q bo'lsa)
  for (const className of ['9-A', '9-B']) {
    const existing = await queryOne('SELECT id FROM classes WHERE name = ?', [className]);
    if (!existing) {
      await execute('INSERT INTO classes (name) VALUES (?)', [className]);
    }
  }

  // 3. Test/soxta o'quvchilarni butunlay tozalash (faqat real o'quvchilar kiritiladi)
  const mockCheck = await queryOne(
    `SELECT COUNT(*) as cnt FROM students WHERE full_name LIKE '%Abdullayev%' OR full_name LIKE '%Baxromova%' OR full_name LIKE '%Karimov%'`
  );
  if (mockCheck && Number(mockCheck.cnt) > 0) {
    console.log('🗑️ Sinov tariqasidagi barcha soxta test o‘quvchilar tozalanmoqda...');
    await execute('DELETE FROM attendance');
    await execute('DELETE FROM students');
  }

  // 4. Bosh Admin va Sinf rahbarlarini staff jadvaliga biriktirish
  const cls9A = await queryOne('SELECT id FROM classes WHERE name = ?', ['9-A']);
  const cls9B = await queryOne('SELECT id FROM classes WHERE name = ?', ['9-B']);

  const adminPhone = process.env.ADMIN_PHONE || '+998996893228';
  const adminNorm = normalizePhone(adminPhone) || '996893228';

  // Bosh Adminni kiritish yoki yangilash
  const existingAdmin = await queryOne('SELECT id FROM staff WHERE phone_norm = ?', [adminNorm]);
  if (!existingAdmin) {
    await execute(
      'INSERT INTO staff (full_name, phone, phone_norm, role, class_id) VALUES (?, ?, ?, ?, ?)',
      ['Bosh Administrator', adminPhone, adminNorm, 'admin', null]
    );
  } else {
    await execute(
      'UPDATE staff SET full_name = ?, phone = ?, role = ? WHERE phone_norm = ?',
      ['Bosh Administrator', adminPhone, 'admin', adminNorm]
    );
  }

  // 9-A va 9-B sinf rahbarlari yozuvlari
  const teacher9A = await queryOne('SELECT id FROM staff WHERE phone_norm = ?', ['teacher_9a']);
  if (!teacher9A) {
    await execute(
      'INSERT INTO staff (full_name, phone, phone_norm, role, class_id) VALUES (?, ?, ?, ?, ?)',
      ['9-A Sinf Rahbari', '', 'teacher_9a', 'teacher', cls9A.id]
    );
  }

  const teacher9B = await queryOne('SELECT id FROM staff WHERE phone_norm = ?', ['teacher_9b']);
  if (!teacher9B) {
    await execute(
      'INSERT INTO staff (full_name, phone, phone_norm, role, class_id) VALUES (?, ?, ?, ?, ?)',
      ['9-B Sinf Rahbari', '', 'teacher_9b', 'teacher', cls9B.id]
    );
  }

  console.log('✅ 9-A va 9-B sinflari hamda Bosh Admin (+998996893228) sozlandi.');
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

// ==========================================
// 5. SINFLAR BOSHQARUVI (FAQAT 9-A VA 9-B)
// ==========================================
async function getAllClasses() {
  const sql = `
    SELECT c.id, c.name, COUNT(s.id) as student_count
    FROM classes c
    LEFT JOIN students s ON s.class_id = c.id
    WHERE c.name IN ('9-A', '9-B')
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
     WHERE s.parent_phone_norm = ? AND c.name IN ('9-A', '9-B')`,
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
    WHERE s.parent_chat_id = ? AND c.name IN ('9-A', '9-B')
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
    WHERE c.name IN ('9-A', '9-B')
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
    WHERE c.name IN ('9-A', '9-B')
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
      AND c.name IN ('9-A', '9-B')
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
    WHERE c.name IN ('9-A', '9-B')
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
  isDailyDispatched,
  recordDailyDispatch,
  getUnmarkedClassesToday,
  getClassAttendanceSummary,
  getPendingNotifications,
  markAttendanceAsNotified,
  getAttendanceStats,
  getMonthAttendanceForExport,
  execute
};
