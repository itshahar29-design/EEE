const path = require('path');

// SQLite ma'lumotlar bazasini ochish (fayl: edumemory.db)
const dbPath = path.join(__dirname, 'edumemory.db');

let db;
let isNodeSqlite = false;

// 1. better-sqlite3 ni yuklashga urinib ko'rish, agar mavjud bo'lmasa Node.js ning o'rnatilgan node:sqlite modulidan foydalanish
try {
  const Database = require('better-sqlite3');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
} catch (err) {
  // Node 22+ da o'rnatilgan node:sqlite moduli
  try {
    const { DatabaseSync } = require('node:sqlite');
    db = new DatabaseSync(dbPath);
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');
    isNodeSqlite = true;
  } catch (innerErr) {
    console.error('❌ SQLite drayverini yuklab bo‘lmadi:', innerErr);
    throw innerErr;
  }
}

/**
 * Har ikkala drayver uchun universal tranzaksiya o'rami (Transaction Wrapper)
 */
function runTransaction(fn) {
  if (!isNodeSqlite && typeof db.transaction === 'function') {
    return db.transaction(fn);
  }
  return (...args) => {
    db.exec('BEGIN TRANSACTION;');
    try {
      const result = fn(...args);
      db.exec('COMMIT;');
      return result;
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  };
}

/**
 * Jadvallarni yaratish va dastlabki test ma'lumotlarini (seed) kiritish
 */
function initDatabase() {
  // 1. classes jadvali
  db.exec(`
    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `);

  // 2. students jadvali
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      class_id INTEGER NOT NULL,
      parent_chat_id INTEGER DEFAULT NULL,
      parent_phone TEXT,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
    );
  `);

  // 3. attendance jadvali
  db.exec(`
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
  `);

  // Indekslar
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
    CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
    CREATE INDEX IF NOT EXISTS idx_students_parent_chat ON students(parent_chat_id);
  `);

  // Test ma'lumotlarini (seed data) kiritish
  seedInitialData();
}

/**
 * Baza bo'sh bo'lsa test sinflari va o'quvchilarni kiritish
 */
function seedInitialData() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM classes').get();
  if (countRow && countRow.count > 0) {
    return; // Ma'lumotlar allaqachon mavjud
  }

  console.log('🌱 Baza bo‘sh. 65-maktab uchun dastlabki ma\'lumotlar (seed) kiritilmoqda...');

  const insertClass = db.prepare('INSERT INTO classes (name) VALUES (?)');
  const insertStudent = db.prepare(
    'INSERT INTO students (full_name, class_id, parent_phone) VALUES (?, ?, ?)'
  );

  const seedTransaction = runTransaction(() => {
    // 9-A sinfi
    const class9ARes = insertClass.run('9-A');
    const class9A = Number(class9ARes.lastInsertRowid);
    const students9A = [
      ['Aliyev Jasur Rustam o‘g‘li', '+998901234501'],
      ['Karimova Madina Dilshod qizi', '+998901234502'],
      ['Sobirov Azizbek Bobur o‘g‘li', '+998901234503'],
      ['Toshmatova Nilufar Shuhrat qizi', '+998901234504'],
      ['Yo‘ldoshev Diyorbek Ulug‘bek o‘g‘li', '+998901234505'],
      ['Xoliqova Shahnoza Otabek qizi', '+998901234506'],
      ['Ergashev Sanjar Farhod o‘g‘li', '+998901234507'],
      ['Qodirova Zarina Jamshid qizi', '+998901234508']
    ];
    for (const [name, phone] of students9A) {
      insertStudent.run(name, class9A, phone);
    }

    // 9-B sinfi
    const class9BRes = insertClass.run('9-B');
    const class9B = Number(class9BRes.lastInsertRowid);
    const students9B = [
      ['Rahimov Mirjalol Akbar o‘g‘li', '+998911234501'],
      ['Usmonova Diyora Ravshan qizi', '+998911234502'],
      ['Nurmatov Shaxboz Ilhom o‘g‘li', '+998911234503'],
      ['Ismoilova Rayhona Shavkat qizi', '+998911234504'],
      ['Bekmurodov Javohir Elyor o‘g‘li', '+998911234505'],
      ['Mirzayeva Sevara Baxtiyor qizi', '+998911234506']
    ];
    for (const [name, phone] of students9B) {
      insertStudent.run(name, class9B, phone);
    }

    // 10-A sinfi
    const class10ARes = insertClass.run('10-A');
    const class10A = Number(class10ARes.lastInsertRowid);
    const students10A = [
      ['Ahmadov Behruz Farrux o‘g‘li', '+998931234501'],
      ['Mahmudova Feruza Odil qizi', '+998931234502'],
      ['G‘aniyev Sardor Botir o‘g‘li', '+998931234503'],
      ['Fayzullayeva Sevinch Xurshid qizi', '+998931234504'],
      ['Abdullayev Otabek Mansur o‘g‘li', '+998931234505'],
      ['Nazarova Mohira Shuhrat qizi', '+998931234506']
    ];
    for (const [name, phone] of students10A) {
      insertStudent.run(name, class10A, phone);
    }

    // 11-A sinfi
    const class11ARes = insertClass.run('11-A');
    const class11A = Number(class11ARes.lastInsertRowid);
    const students11A = [
      ['Zokirov Doniyor Baxtiyor o‘g‘li', '+998971234501'],
      ['Ne‘matova Kamola Rustam qizi', '+998971234502'],
      ['Ikromov Abbos Anvar o‘g‘li', '+998971234503'],
      ['Samadova Sabina Sherzod qizi', '+998971234504'],
      ['Rustamov Umidjon Faxriddin o‘g‘li', '+998971234505']
    ];
    for (const [name, phone] of students11A) {
      insertStudent.run(name, class11A, phone);
    }
  });

  seedTransaction();
  console.log('✅ 65-maktab ma\'lumotlari muvaffaqiyatli kiritildi!');
}

/**
 * Barcha sinflar ro'yxatini olish
 */
function getAllClasses() {
  const stmt = db.prepare(`
    SELECT c.id, c.name, COUNT(s.id) AS student_count
    FROM classes c
    LEFT JOIN students s ON s.class_id = c.id
    GROUP BY c.id, c.name
    ORDER BY c.name ASC
  `);
  return stmt.all();
}

/**
 * Sinf haqida ma'lumot
 */
function getClassById(classId) {
  return db.prepare('SELECT * FROM classes WHERE id = ?').get(classId);
}

/**
 * Sinfdagi o'quvchilar va ularning berilgan sanadagi davomati
 */
function getStudentsWithAttendance(classId, date) {
  const stmt = db.prepare(`
    SELECT 
      s.id,
      s.full_name,
      s.class_id,
      c.name AS class_name,
      s.parent_chat_id,
      s.parent_phone,
      a.id AS attendance_id,
      a.status,
      a.reason,
      a.notified,
      CASE WHEN s.parent_chat_id IS NOT NULL THEN 1 ELSE 0 END AS is_parent_linked
    FROM students s
    JOIN classes c ON s.class_id = c.id
    LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
    WHERE s.class_id = ?
    ORDER BY s.full_name ASC
  `);
  return stmt.all(date, classId);
}

/**
 * Davomatni to'plam (batch) tarzida saqlash (Upsert)
 */
function saveAttendanceBatch(records, date) {
  const upsertStmt = db.prepare(`
    INSERT INTO attendance (student_id, date, status, reason, notified, updated_at)
    VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
    ON CONFLICT(student_id, date) DO UPDATE SET
      status = excluded.status,
      reason = excluded.reason,
      notified = CASE WHEN attendance.status != excluded.status THEN 0 ELSE attendance.notified END,
      updated_at = CURRENT_TIMESTAMP
  `);

  const transaction = runTransaction((items) => {
    let savedCount = 0;
    for (const item of items) {
      if (!item.student_id || !item.status) continue;
      upsertStmt.run(
        item.student_id,
        date,
        item.status,
        item.reason || null
      );
      savedCount++;
    }
    return savedCount;
  });

  return transaction(records);
}

/**
 * O'quvchi ma'lumotlarini ID bo'yicha olish
 */
function getStudentById(studentId) {
  const stmt = db.prepare(`
    SELECT s.*, c.name AS class_name
    FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE s.id = ?
  `);
  return stmt.get(studentId);
}

/**
 * Ota-ona chat_id sini o'quvchiga biriktirish (Deep link orqali)
 */
function linkParentToStudent(studentId, parentChatId) {
  const updateStmt = db.prepare(`
    UPDATE students 
    SET parent_chat_id = ? 
    WHERE id = ?
  `);
  const result = updateStmt.run(parentChatId, studentId);
  if (result.changes > 0) {
    return getStudentById(studentId);
  }
  return null;
}

/**
 * Ota-onaga biriktirilgan o'quvchilar ro'yxati va bugungi davomati
 */
function getStudentsByParentChatId(parentChatId, date) {
  const stmt = db.prepare(`
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
  `);
  return stmt.all(date, parentChatId);
}

/**
 * Xabarnoma yuborilishi kerak bo'lgan davomat yozuvlarini olish
 */
function getPendingNotifications(date, classId = null) {
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

  const stmt = db.prepare(query);
  return stmt.all(...params);
}

/**
 * Yuborilgan xabarlarni notified = 1 qilib belgilash
 */
function markAttendanceAsNotified(attendanceIds) {
  if (!attendanceIds || attendanceIds.length === 0) return;
  const placeholders = attendanceIds.map(() => '?').join(',');
  const stmt = db.prepare(`
    UPDATE attendance 
    SET notified = 1 
    WHERE id IN (${placeholders})
  `);
  return stmt.run(...attendanceIds);
}

/**
 * Sana bo'yicha umumiy statistika
 */
function getAttendanceStats(date, classId = null) {
  let query = `
    SELECT 
      COUNT(s.id) AS total_students,
      COUNT(a.id) AS marked_students,
      SUM(CASE WHEN a.status = 'keldi' THEN 1 ELSE 0 END) AS keldi,
      SUM(CASE WHEN a.status = 'kelmadi' THEN 1 ELSE 0 END) AS kelmadi,
      SUM(CASE WHEN a.status = 'kechikdi' THEN 1 ELSE 0 END) AS kechikdi,
      SUM(CASE WHEN a.status = 'sababli' THEN 1 ELSE 0 END) AS sababli,
      SUM(CASE WHEN s.parent_chat_id IS NOT NULL THEN 1 ELSE 0 END) AS parents_linked
    FROM students s
    LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
  `;
  const params = [date];
  if (classId) {
    query += ' WHERE s.class_id = ?';
    params.push(classId);
  }
  const stmt = db.prepare(query);
  const result = stmt.get(...params);
  return {
    total_students: Number(result.total_students || 0),
    marked_students: Number(result.marked_students || 0),
    keldi: Number(result.keldi || 0),
    kelmadi: Number(result.kelmadi || 0),
    kechikdi: Number(result.kechikdi || 0),
    sababli: Number(result.sababli || 0),
    unmarked: Number(result.total_students || 0) - Number(result.marked_students || 0),
    parents_linked: Number(result.parents_linked || 0)
  };
}

// Baza ishga tushirish
initDatabase();

module.exports = {
  db,
  getAllClasses,
  getClassById,
  getStudentsWithAttendance,
  saveAttendanceBatch,
  getStudentById,
  linkParentToStudent,
  getStudentsByParentChatId,
  getPendingNotifications,
  markAttendanceAsNotified,
  getAttendanceStats
};
