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
 * Ma'lumotlar bazasini initsializatsiya qilish
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

      CREATE INDEX IF NOT EXISTS idx_pg_students_class ON students(class_id);
      CREATE INDEX IF NOT EXISTS idx_pg_students_phone_norm ON students(parent_phone_norm);
      CREATE INDEX IF NOT EXISTS idx_pg_attendance_date ON attendance(date);
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
        status TEXT CHECK(status IN ('keldi', 'kelmadi', 'kechikdi', 'sababli')),
        reason TEXT DEFAULT NULL,
        notified INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE(student_id, date)
      );

      CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
      CREATE INDEX IF NOT EXISTS idx_students_phone_norm ON students(parent_phone_norm);
      CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
    `);
  }

  await seedInitialData();
}

/**
 * Baza bo'sh bo'lsa test sinflari va o'quvchilarni kiritish
 */
async function seedInitialData() {
  const countRow = await queryOne('SELECT COUNT(*) as count FROM classes');
  if (countRow && Number(countRow.count) > 0) return;

  console.log('🌱 Baza bo‘sh. 65-maktab uchun boshlang‘ich ma\'lumotlar kiritilmoqda...');

  const sampleClasses = [
    {
      name: '9-A',
      students: [
        ['Aliyev Jasur Rustam o‘g‘li', '+998901234501'],
        ['Karimova Madina Dilshod qizi', '+998901234502'],
        ['Sobirov Azizbek Bobur o‘g‘li', '+998901234503'],
        ['Toshmatova Nilufar Shuhrat qizi', '+998901234504'],
        ['Yo‘ldoshev Diyorbek Ulug‘bek o‘g‘li', '+998901234505'],
        ['Xoliqova Shahnoza Otabek qizi', '+998901234506'],
        ['Ergashev Sanjar Farhod o‘g‘li', '+998901234507'],
        ['Qodirova Zarina Jamshid qizi', '+998901234508']
      ]
    },
    {
      name: '9-B',
      students: [
        ['Rahimov Mirjalol Akbar o‘g‘li', '+998911234501'],
        ['Usmonova Diyora Ravshan qizi', '+998911234502'],
        ['Nurmatov Shaxboz Ilhom o‘g‘li', '+998911234503'],
        ['Ismoilova Rayhona Shavkat qizi', '+998911234504'],
        ['Bekmurodov Javohir Elyor o‘g‘li', '+998911234505']
      ]
    },
    {
      name: '10-A',
      students: [
        ['Aliyeva Zarina Rustam qizi', '+998901234501'], // Jasurning singlisi (bir xil raqam)
        ['Mahmudova Feruza Odil qizi', '+998931234502'],
        ['G‘aniyev Sardor Botir o‘g‘li', '+998931234503'],
        ['Fayzullayeva Sevinch Xurshid qizi', '+998931234504'],
        ['Abdullayev Otabek Mansur o‘g‘li', '+998931234505']
      ]
    },
    {
      name: '11-A',
      students: [
        ['Zokirov Doniyor Baxtiyor o‘g‘li', '+998971234501'],
        ['Ne‘matova Kamola Rustam qizi', '+998971234502'],
        ['Ikromov Abbos Anvar o‘g‘li', '+998971234503'],
        ['Samadova Sabina Sherzod qizi', '+998971234504']
      ]
    }
  ];

  for (const c of sampleClasses) {
    const cls = await createClass(c.name);
    for (const [name, phone] of c.students) {
      await createStudent({
        full_name: name,
        class_id: cls.id,
        parent_phone: phone
      });
    }
  }

  console.log('✅ 65-maktab boshlang‘ich ma\'lumotlari muvaffaqiyatli kiritildi!');
}

// ==========================================
// SINFLAR BOSHQARUVI (CRUD)
// ==========================================
async function getAllClasses() {
  const sql = `
    SELECT c.id, c.name, COUNT(s.id) AS student_count
    FROM classes c
    LEFT JOIN students s ON s.class_id = c.id
    GROUP BY c.id, c.name
    ORDER BY c.name ASC
  `;
  const rows = await queryAll(sql);
  return rows.map((r) => ({
    id: Number(r.id),
    name: r.name,
    student_count: Number(r.student_count || 0)
  }));
}

async function getClassById(classId) {
  return await queryOne('SELECT * FROM classes WHERE id = ?', [classId]);
}

async function getClassByName(name) {
  return await queryOne('SELECT * FROM classes WHERE LOWER(name) = LOWER(?)', [name.trim()]);
}

async function createClass(name) {
  const trimmed = name.trim();
  const existing = await getClassByName(trimmed);
  if (existing) return existing;

  if (hasPostgres) {
    const res = await queryOne('INSERT INTO classes (name) VALUES (?) RETURNING *', [trimmed]);
    return res;
  } else {
    const res = await execute('INSERT INTO classes (name) VALUES (?)', [trimmed]);
    return { id: res.lastInsertRowid, name: trimmed };
  }
}

async function deleteClass(classId) {
  return await execute('DELETE FROM classes WHERE id = ?', [classId]);
}

// ==========================================
// O'QUVCHILAR BOSHQARUVI (CRUD)
// ==========================================
async function getStudentsWithAttendance(classId, date) {
  const sql = `
    SELECT 
      s.id,
      s.full_name,
      s.class_id,
      c.name AS class_name,
      s.parent_chat_id,
      s.parent_phone,
      s.parent_phone_norm,
      a.id AS attendance_id,
      a.status,
      a.reason,
      a.notified,
      CASE 
        WHEN s.parent_chat_id IS NOT NULL THEN 'linked'
        WHEN s.parent_phone_norm IS NOT NULL AND s.parent_phone_norm != '' THEN 'pending'
        ELSE 'no_phone'
      END AS parent_status
    FROM students s
    JOIN classes c ON s.class_id = c.id
    LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
    WHERE s.class_id = ?
    ORDER BY s.full_name ASC
  `;
  return await queryAll(sql, [date, classId]);
}

async function getStudentById(studentId) {
  const sql = `
    SELECT s.*, c.name AS class_name,
      CASE 
        WHEN s.parent_chat_id IS NOT NULL THEN 'linked'
        WHEN s.parent_phone_norm IS NOT NULL AND s.parent_phone_norm != '' THEN 'pending'
        ELSE 'no_phone'
      END AS parent_status
    FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE s.id = ?
  `;
  return await queryOne(sql, [studentId]);
}

async function createStudent({ full_name, class_id, parent_phone }) {
  const normPhone = normalizePhone(parent_phone);

  // Agar bu telefon raqami bazada avval Telegram ga ulangan bo'lsa, chat_id sini avtomat ulaymiz!
  let existingChatId = null;
  if (normPhone) {
    const prev = await queryOne(
      'SELECT parent_chat_id FROM students WHERE parent_phone_norm = ? AND parent_chat_id IS NOT NULL LIMIT 1',
      [normPhone]
    );
    if (prev && prev.parent_chat_id) {
      existingChatId = prev.parent_chat_id;
    }
  }

  const sql = `
    INSERT INTO students (full_name, class_id, parent_phone, parent_phone_norm, parent_chat_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  const res = await execute(sql, [
    full_name.trim(),
    class_id,
    parent_phone || null,
    normPhone || null,
    existingChatId
  ]);

  const newId = hasPostgres ? (await queryOne('SELECT MAX(id) as id FROM students')).id : res.lastInsertRowid;
  return await getStudentById(newId);
}

async function updateStudent(id, { full_name, class_id, parent_phone }) {
  const normPhone = normalizePhone(parent_phone);

  let existingChatId = null;
  if (normPhone) {
    const prev = await queryOne(
      'SELECT parent_chat_id FROM students WHERE parent_phone_norm = ? AND parent_chat_id IS NOT NULL LIMIT 1',
      [normPhone]
    );
    if (prev && prev.parent_chat_id) {
      existingChatId = prev.parent_chat_id;
    }
  }

  const sql = `
    UPDATE students
    SET full_name = ?, class_id = ?, parent_phone = ?, parent_phone_norm = ?, parent_chat_id = ?
    WHERE id = ?
  `;
  await execute(sql, [full_name.trim(), class_id, parent_phone || null, normPhone || null, existingChatId, id]);
  return await getStudentById(id);
}

async function deleteStudent(studentId) {
  return await execute('DELETE FROM students WHERE id = ?', [studentId]);
}

async function updateStudentParentPhone(studentId, newPhone) {
  const normPhone = normalizePhone(newPhone);
  let existingChatId = null;

  if (normPhone) {
    const prev = await queryOne(
      'SELECT parent_chat_id FROM students WHERE parent_phone_norm = ? AND parent_chat_id IS NOT NULL LIMIT 1',
      [normPhone]
    );
    if (prev && prev.parent_chat_id) {
      existingChatId = prev.parent_chat_id;
    }
  }

  const sql = `
    UPDATE students 
    SET parent_phone = ?, parent_phone_norm = ?, parent_chat_id = ?
    WHERE id = ?
  `;
  await execute(sql, [newPhone || null, normPhone || null, existingChatId, studentId]);
  return await getStudentById(studentId);
}

// ==========================================
// TELEGRAM ORQALI BIRIKTIRISH
// ==========================================
async function linkParentByPhone(rawPhone, parentChatId) {
  const normPhone = normalizePhone(rawPhone);
  if (!normPhone || normPhone.length < 9) return [];

  await execute('UPDATE students SET parent_chat_id = ? WHERE parent_phone_norm = ?', [
    parentChatId,
    normPhone
  ]);

  const sql = `
    SELECT s.id, s.full_name, s.class_id, c.name AS class_name, s.parent_phone
    FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE s.parent_phone_norm = ?
    ORDER BY s.full_name ASC
  `;
  return await queryAll(sql, [normPhone]);
}

async function getStudentsByParentChatId(parentChatId, date) {
  const sql = `
    SELECT 
      s.id,
      s.full_name,
      s.class_id,
      c.name AS class_name,
      s.parent_phone,
      a.status,
      a.reason,
      a.notified,
      a.date
    FROM students s
    JOIN classes c ON s.class_id = c.id
    LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
    WHERE s.parent_chat_id = ?
    ORDER BY s.full_name ASC
  `;
  return await queryAll(sql, [date, parentChatId]);
}

// ==========================================
// DAVOMAT BOSHQARUVI
// ==========================================
async function saveAttendanceBatch(records, date) {
  let savedCount = 0;
  for (const item of records) {
    if (!item.student_id || !item.status) continue;

    const sql = `
      INSERT INTO attendance (student_id, date, status, reason, notified, updated_at)
      VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
      ON CONFLICT(student_id, date) DO UPDATE SET
        status = excluded.status,
        reason = excluded.reason,
        notified = CASE WHEN attendance.status != excluded.status THEN 0 ELSE attendance.notified END,
        updated_at = CURRENT_TIMESTAMP
    `;
    await execute(sql, [item.student_id, date, item.status, item.reason || null]);
    savedCount++;
  }
  return savedCount;
}

async function getPendingNotifications(date, classId = null) {
  let query = `
    SELECT 
      a.id AS attendance_id,
      a.status,
      a.reason,
      a.date,
      a.notified,
      s.id AS student_id,
      s.full_name,
      s.parent_chat_id,
      s.parent_phone,
      c.id AS class_id,
      c.name AS class_name
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN classes c ON s.class_id = c.id
    WHERE a.date = ? 
      AND s.parent_chat_id IS NOT NULL 
      AND a.status IS NOT NULL
  `;
  const params = [date];
  if (classId) {
    query += ' AND c.id = ?';
    params.push(classId);
  }
  return await queryAll(query, params);
}

async function markAttendanceAsNotified(attendanceIds) {
  if (!attendanceIds || attendanceIds.length === 0) return;
  const placeholders = attendanceIds.map(() => '?').join(',');
  const sql = `UPDATE attendance SET notified = 1 WHERE id IN (${placeholders})`;
  return await execute(sql, attendanceIds);
}

async function getAttendanceStats(date, classId = null) {
  let query = `
    SELECT 
      COUNT(s.id) AS total_students,
      COUNT(a.id) AS marked_students,
      SUM(CASE WHEN a.status = 'keldi' THEN 1 ELSE 0 END) AS keldi,
      SUM(CASE WHEN a.status = 'kelmadi' THEN 1 ELSE 0 END) AS kelmadi,
      SUM(CASE WHEN a.status = 'kechikdi' THEN 1 ELSE 0 END) AS kechikdi,
      SUM(CASE WHEN a.status = 'sababli' THEN 1 ELSE 0 END) AS sababli,
      SUM(CASE WHEN s.parent_chat_id IS NOT NULL THEN 1 ELSE 0 END) AS parents_linked,
      SUM(CASE WHEN s.parent_chat_id IS NULL AND s.parent_phone_norm IS NOT NULL AND s.parent_phone_norm != '' THEN 1 ELSE 0 END) AS parents_pending
    FROM students s
    LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
  `;
  const params = [date];
  if (classId) {
    query += ' WHERE s.class_id = ?';
    params.push(classId);
  }
  const result = await queryOne(query, params);
  return {
    total_students: Number(result?.total_students || 0),
    marked_students: Number(result?.marked_students || 0),
    keldi: Number(result?.keldi || 0),
    kelmadi: Number(result?.kelmadi || 0),
    kechikdi: Number(result?.kechikdi || 0),
    sababli: Number(result?.sababli || 0),
    unmarked: Number(result?.total_students || 0) - Number(result?.marked_students || 0),
    parents_linked: Number(result?.parents_linked || 0),
    parents_pending: Number(result?.parents_pending || 0)
  };
}

// ==========================================
// EXCEL OYLIK JURNAL EXPORT UCHUN MA'LUMOT
// ==========================================
async function getMonthAttendanceForExport(classId, yearMonth) {
  const classInfo = await getClassById(classId);
  if (!classInfo) return null;

  // Shu sinfdagi barcha o'quvchilar
  const students = await queryAll(
    'SELECT id, full_name, parent_phone FROM students WHERE class_id = ? ORDER BY full_name ASC',
    [classId]
  );

  // Shu oyning barcha davomat yozuvlari
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
  getPendingNotifications,
  markAttendanceAsNotified,
  getAttendanceStats,
  getMonthAttendanceForExport
};
