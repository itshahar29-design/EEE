/**
 * EduMemory — 65-maktab Davomat Tizimi
 * Frontend: PIN-kodlarsiz, Telegram WebApp / Avtomatik Rol aniqlash
 * 1. O'qituvchi Menyusi: Faqat 9-A sinfi
 * 2. Admin Menyusi: 9-A sinfi, Ma'muriyat nazorati va O'quvchilar CRUD
 * Qat'iy Time-Lock: 08:00 - 13:30 (13:30 muzlatiladi)
 */

// ==========================================
// 1. TELEGRAM WEBAPP VA HAPTIC INTEGRATSIYASI
// ==========================================
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();

  if (tg.colorScheme === 'dark') {
    document.body.classList.add('telegram-dark');
  }

  try {
    tg.setHeaderColor?.('#ffffff');
    tg.setBackgroundColor?.('#f8fafc');
  } catch (e) {}
}

function triggerHaptic(type = 'light') {
  try {
    if (tg?.HapticFeedback) {
      if (type === 'success' || type === 'error' || type === 'warning') {
        tg.HapticFeedback.notificationOccurred(type);
      } else {
        tg.HapticFeedback.impactOccurred(type);
      }
    }
  } catch (e) {}
}

function formatPhoneDisplay(raw) {
  if (!raw) return 'Raqam kiritilmagan';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length >= 9) {
    const n = digits.slice(-9);
    return `+998 (${n.slice(0, 2)}) ${n.slice(2, 5)}-${n.slice(5, 7)}-${n.slice(7, 9)}`;
  }
  return raw;
}

function escapeHtmlApp(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ==========================================
// 2. DASTUR HOLATI (STATE)
// ==========================================
const state = {
  classes: [],
  currentClassId: null,
  currentClassName: '',
  currentDate: new Date().toISOString().split('T')[0],
  students: [],
  attendanceMap: {},
  botUsername: '',
  schoolName: "65-umumiy o'rta ta'lim maktabi",
  searchQuery: '',
  userRole: 'teacher', // 'teacher' yoki 'admin'
  teacherClassId: null,
  teacherClassName: null,
  userName: '',
  isFrozen: false,
  freezeReason: null,
  selectedExcelFile: null,
  timetableData: [],
  timetableDays: {},
  timetableTimes: {},
  selectedTimetableDay: 1
};

// ==========================================
// 3. DOM ELEMENTLARI
// ==========================================
const roleBadge = document.getElementById('roleBadge');
const schoolSubtitleEl = document.getElementById('schoolSubtitle');
const datePicker = document.getElementById('datePicker');
const refreshBtn = document.getElementById('refreshBtn');

// Dars jadvali (Raspisaniya)
const openTimetableBtn = document.getElementById('openTimetableBtn');
const adminTimetableBtn = document.getElementById('adminTimetableBtn');
const timetableModal = document.getElementById('timetableModal');
const timetableDayTabs = document.getElementById('timetableDayTabs');
const timetableCurrentDayTitle = document.getElementById('timetableCurrentDayTitle');
const timetableLessonCountBadge = document.getElementById('timetableLessonCountBadge');
const timetableCardsContainer = document.getElementById('timetableCardsContainer');

// Admin bloklari (Faqat Adminga ko'rinadi)
const adminToolbar = document.getElementById('adminToolbar');
const classSwitcherSection = document.getElementById('classSwitcherSection');
const classesList = document.getElementById('classesList');
const openAddStudentBtn = document.getElementById('openAddStudentBtn');
const openAdminSummaryBtn = document.getElementById('openAdminSummaryBtn');
const openExcelImportBtn = document.getElementById('openExcelImportBtn');
const openExcelExportBtn = document.getElementById('openExcelExportBtn');
const openTeachersBtn = document.getElementById('openTeachersBtn');
const teachersModal = document.getElementById('teachersModal');
const teachersListContainer = document.getElementById('teachersListContainer');
const teacherFormTitle = document.getElementById('teacherFormTitle');
const cancelTeacherEditBtn = document.getElementById('cancelTeacherEditBtn');
const teacherIdInput = document.getElementById('teacherIdInput');
const teacherClassSelect = document.getElementById('teacherClassSelect');
const teacherNameInput = document.getElementById('teacherNameInput');
const teacherPhoneInput = document.getElementById('teacherPhoneInput');
const saveTeacherBtn = document.getElementById('saveTeacherBtn');

const openBackupBtn = document.getElementById('openBackupBtn');
const backupModal = document.getElementById('backupModal');
const backupModalDbType = document.getElementById('backupModalDbType');
const triggerRestoreBtn = document.getElementById('triggerRestoreBtn');
const restoreBackupFileInput = document.getElementById('restoreBackupFileInput');

// Muzlatish holati banneri (Time-Lock)
const freezeBanner = document.getElementById('freezeBanner');
const freezeBannerText = document.getElementById('freezeBannerText');

// Asosiy kontent
const studentsContainer = document.getElementById('studentsContainer');
const currentClassNameEl = document.getElementById('currentClassName');
const totalStudentsBadge = document.getElementById('totalStudentsBadge');
const searchInput = document.getElementById('searchInput');

// Statistika
const statKeldiEl = document.getElementById('statKeldi');
const statKelmadiEl = document.getElementById('statKelmadi');
const statKechikdiEl = document.getElementById('statKechikdi');
const statSababliEl = document.getElementById('statSababli');
const statLinkedParentsEl = document.getElementById('statLinkedParents');
const statPendingParentsEl = document.getElementById('statPendingParents');
const markedCountEl = document.getElementById('markedCount');
const totalCountEl = document.getElementById('totalCount');

// Tugmalar
const markAllPresentBtn = document.getElementById('markAllPresentBtn');
const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');
const saveBtnText = document.getElementById('saveBtnText');

// Modallar
const adminSummaryModal = document.getElementById('adminSummaryModal');
const summaryModalDate = document.getElementById('summaryModalDate');
const summaryDoneCount = document.getElementById('summaryDoneCount');
const summaryPartialCount = document.getElementById('summaryPartialCount');
const summaryUnmarkedCount = document.getElementById('summaryUnmarkedCount');
const summaryClassesList = document.getElementById('summaryClassesList');
const summaryDispatchStatus = document.getElementById('summaryDispatchStatus');

const studentFormModal = document.getElementById('studentFormModal');
const studentModalTitle = document.getElementById('studentModalTitle');
const editStudentId = document.getElementById('editStudentId');
const studentFullNameInput = document.getElementById('studentFullNameInput');
const studentClassSelect = document.getElementById('studentClassSelect');
const studentPhoneInput = document.getElementById('studentPhoneInput');
const saveStudentFormBtn = document.getElementById('saveStudentFormBtn');

const excelImportModal = document.getElementById('excelImportModal');
const dropZone = document.getElementById('dropZone');
const fileNameLabel = document.getElementById('fileNameLabel');
const excelFileInput = document.getElementById('excelFileInput');
const submitExcelImportBtn = document.getElementById('submitExcelImportBtn');

const excelExportModal = document.getElementById('excelExportModal');
const exportClassSelect = document.getElementById('exportClassSelect');
const exportMonthInput = document.getElementById('exportMonthInput');
const submitExcelExportBtn = document.getElementById('submitExcelExportBtn');

// Toast
const toastEl = document.getElementById('toast');
const toastMessageEl = document.getElementById('toastMessage');
const toastIconEl = document.getElementById('toastIcon');

let toastTimeout = null;
function showToast(message, type = 'success') {
  if (!toastEl) return;
  if (toastTimeout) clearTimeout(toastTimeout);

  toastMessageEl.textContent = message;
  if (type === 'success') {
    toastIconEl.className = 'fa-solid fa-circle-check text-emerald-400';
  } else if (type === 'error') {
    toastIconEl.className = 'fa-solid fa-circle-xmark text-rose-400';
  } else if (type === 'warning') {
    toastIconEl.className = 'fa-solid fa-triangle-exclamation text-amber-400';
  } else {
    toastIconEl.className = 'fa-solid fa-circle-info text-blue-400';
  }

  toastEl.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-[-20px]');
  toastEl.classList.add('opacity-100', 'translate-y-0');

  toastTimeout = setTimeout(() => {
    toastEl.classList.remove('opacity-100', 'translate-y-0');
    toastEl.classList.add('opacity-0', 'pointer-events-none', 'translate-y-[-20px]');
  }, 3000);
}

// ==========================================
// 4. AVTOMATIK ROL VA FOYDALANUVCHI ANIQLASH (PIN-KODSIZ)
// ==========================================
async function resolveAuthAndRole() {
  const urlParams = new URLSearchParams(window.location.search);
  const paramRole = urlParams.get('role');
  const paramClassId = urlParams.get('classId');
  const paramClassName = urlParams.get('class');
  const paramUserId = urlParams.get('userId');
  const tgUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  const userId = paramUserId || tgUserId || '';

  try {
    const query = new URLSearchParams({
      userId: String(userId),
      role: paramRole || '',
      classId: paramClassId || '',
      class: paramClassName || ''
    }).toString();

    const res = await fetch(`/api/auth/me?${query}`);
    const data = await res.json();

    if (data.success) {
      state.userRole = data.role || 'teacher';
      state.teacherClassId = data.classId ? parseInt(data.classId, 10) : null;
      state.teacherClassName = data.className || null;
      state.userName = data.fullName || '';
    }
  } catch (err) {
    console.warn('Avtomatik auth tekshiruvida xatolik:', err);
    // URL orqali fallback
    if (paramRole === 'admin') {
      state.userRole = 'admin';
    } else if (paramRole === 'teacher' || paramClassId || paramClassName) {
      state.userRole = 'teacher';
      state.teacherClassName = paramClassName || '9-A';
    } else {
      state.userRole = 'admin';
    }
  }

  applyRoleUI();
}

function applyRoleUI() {
  const isAdmin = state.userRole === 'admin';

  if (isAdmin) {
    // 👑 BOSH ADMINISTRATOR / ZAVUCH REJIMI:
    if (roleBadge) {
      if (state.userFullName && state.userFullName.includes('Zavuch')) {
        roleBadge.textContent = '🎓 ' + state.userFullName;
      } else {
        roleBadge.textContent = '👑 Bosh Administrator';
      }
      roleBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200';
    }
    if (schoolSubtitleEl) {
      schoolSubtitleEl.textContent = '65-maktab — Ma‘muriyat Boshqaruv Paneli';
    }

    // Admin uskunalarini ko'rsatish
    if (adminToolbar) adminToolbar.classList.remove('hidden');
    if (classSwitcherSection) classSwitcherSection.classList.remove('hidden');
  } else {
    // 👨‍🏫 O'QITUVCHI REJIMI (FAQAT BIRIKTIRILGAN SINF):
    const currentClass = state.teacherClassName || state.currentClassName || '9-A';
    if (roleBadge) {
      roleBadge.textContent = `👨‍🏫 ${currentClass} Sinf Rahbari`;
      roleBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200';
    }
    if (schoolSubtitleEl) {
      schoolSubtitleEl.textContent = `65-maktab — ${currentClass} sinf davomati`;
    }

    // Boshqa sinflar va admin panellarini yashirish (Maksimal sodda interfeys)
    if (adminToolbar) adminToolbar.classList.add('hidden');
    if (classSwitcherSection) classSwitcherSection.classList.add('hidden');
  }
}

// ==========================================
// 5. TIME-LOCK (MUZLATISH: 13:30 DEDLAYN)
// ==========================================
function updateFreezeUI() {
  if (state.isFrozen) {
    if (freezeBanner) {
      freezeBanner.classList.remove('hidden');
      if (freezeBannerText) {
        freezeBannerText.textContent = state.freezeReason || 'Bugungi davomat kiritish vaqti (08:00 - 13:30) yakunlangan. Tizim muzlatilgan.';
      }
    }

    // Tugmalarni nofaol qilish
    if (markAllPresentBtn) {
      markAllPresentBtn.disabled = true;
      markAllPresentBtn.classList.add('opacity-50', 'pointer-events-none');
    }

    if (saveAttendanceBtn) {
      saveAttendanceBtn.disabled = true;
      saveAttendanceBtn.classList.add('opacity-50', 'pointer-events-none');
    }
    if (saveBtnText) saveBtnText.textContent = 'Muzlatilgan (13:30 yakunlangan)';

    if (tg?.MainButton) {
      tg.MainButton.hide();
    }
  } else {
    if (freezeBanner) freezeBanner.classList.add('hidden');
    if (markAllPresentBtn) {
      markAllPresentBtn.disabled = false;
      markAllPresentBtn.classList.remove('opacity-50', 'pointer-events-none');
    }

    if (saveAttendanceBtn) {
      saveAttendanceBtn.disabled = false;
      saveAttendanceBtn.classList.remove('opacity-50', 'pointer-events-none');
    }
    if (saveBtnText) saveBtnText.textContent = 'Davomatni saqlash';
  }
}

async function fetchConfig() {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();

    if (data.schoolName) {
      state.schoolName = data.schoolName;
    }
    if (data.botUsername) {
      state.botUsername = data.botUsername;
    }
    if (data.today) {
      state.currentDate = data.today;
      if (datePicker) datePicker.value = data.today;
    }

    state.isFrozen = Boolean(data.isFrozen);
    state.freezeReason = data.freezeReason || null;
    updateFreezeUI();
  } catch (err) {
    if (datePicker) datePicker.value = state.currentDate;
  }
}

// ==========================================
// 6. SINFLAR VA ROLGA KO'RA TANLASH
// ==========================================
async function fetchClasses() {
  try {
    const res = await fetch('/api/classes');
    const result = await res.json();

    if (!result.success || !result.data || result.data.length === 0) {
      if (classesList) classesList.innerHTML = '<span class="text-xs text-slate-400">Sinflar topilmadi</span>';
      state.classes = [];
      return;
    }

    state.classes = result.data;

    // Rolga ko'ra boshlang'ich sinfni tanlash:
    if (state.userRole === 'teacher') {
      // O'qituvchiga faqat uning sinfi ochiladi
      let teacherTarget = null;
      if (state.teacherClassId) {
        teacherTarget = state.classes.find(c => c.id === state.teacherClassId);
      } else if (state.teacherClassName) {
        teacherTarget = state.classes.find(c => c.name.toLowerCase() === state.teacherClassName.toLowerCase());
      }
      if (!teacherTarget) {
        teacherTarget = state.classes[0]; // Fallback (9-A)
      }
      selectClass(teacherTarget.id, teacherTarget.name);
    } else {
      // Adminga 9-A sinfi ko'rsatiladi
      renderClassesTabs();
      const currentStillExists = state.classes.some((c) => c.id === state.currentClassId);
      if (!state.currentClassId || !currentStillExists) {
        selectClass(state.classes[0].id, state.classes[0].name);
      }
    }
  } catch (err) {
    showToast('Sinflarni yuklab bo‘lmadi', 'error');
  }
}

function renderClassesTabs() {
  if (!classesList || state.userRole === 'teacher') return;
  classesList.innerHTML = '';

  state.classes.forEach((cls) => {
    const btn = document.createElement('button');
    const isActive = cls.id === state.currentClassId;

    btn.type = 'button';
    btn.className = `p-3 rounded-2xl text-xs font-black transition-all flex items-center justify-between select-none shadow-xs active:scale-98 ${
      isActive
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/30'
        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
    }`;
    btn.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="w-7 h-7 rounded-xl ${isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'} flex items-center justify-center text-xs font-bold">
          <i class="fa-solid fa-graduation-cap"></i>
        </span>
        <span class="text-sm font-black tracking-wide">${cls.name}</span>
      </div>
      <span class="text-[11px] font-bold px-2 py-0.5 rounded-full ${
        isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
      }">${cls.student_count || 0} o‘quvchi</span>
    `;

    btn.onclick = () => {
      triggerHaptic('light');
      selectClass(cls.id, cls.name);
    };

    classesList.appendChild(btn);
  });
}

function selectClass(classId, className) {
  state.currentClassId = classId;
  state.currentClassName = className;
  if (currentClassNameEl) currentClassNameEl.textContent = className;
  applyRoleUI();
  renderClassesTabs();
  fetchStudents();
}

// ==========================================
// 7. O'QUVCHILAR RO'YXATI VA DAVOMATNI BELGILASH
// ==========================================
async function fetchStudents() {
  if (!state.currentClassId) return;

  if (studentsContainer) {
    studentsContainer.innerHTML = `
      <div class="text-center py-12 text-slate-400 text-sm">
        <i class="fa-solid fa-spinner fa-spin text-2xl mb-2 text-blue-500"></i>
        <p>${state.currentClassName} sinfi o‘quvchilari yuklanmoqda...</p>
      </div>
    `;
  }

  try {
    const url = `/api/classes/${state.currentClassId}/students?date=${state.currentDate}`;
    const res = await fetch(url);
    const result = await res.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Yuklab bo‘lmadi');
    }

    state.students = result.data.students || [];
    state.attendanceMap = {};

    state.isFrozen = Boolean(result.data.isFrozen);
    state.freezeReason = result.data.freezeReason || null;
    updateFreezeUI();

    state.students.forEach((s) => {
      state.attendanceMap[s.id] = {
        status: s.status || null,
        reason: s.reason || ''
      };
    });

    renderStudentsList();
    updateStats();
  } catch (err) {
    console.error('Fetch students error:', err);
    if (studentsContainer) {
      studentsContainer.innerHTML = `
        <div class="text-center py-8 text-rose-500 text-xs">
          <i class="fa-solid fa-triangle-exclamation text-xl mb-1"></i>
          <p>O‘quvchilarni yuklashda xatolik yuz berdi.</p>
        </div>
      `;
    }
    showToast('O‘quvchilarni yuklab bo‘lmadi', 'error');
  }
}

function renderStudentsList() {
  if (!studentsContainer) return;

  const query = state.searchQuery.toLowerCase().trim();
  const filteredStudents = state.students.filter((s) => {
    const nameMatch = s.full_name.toLowerCase().includes(query);
    const phoneMatch = s.parent_phone && s.parent_phone.includes(query);
    return nameMatch || phoneMatch;
  });

  if (totalStudentsBadge) totalStudentsBadge.textContent = `${state.students.length} o‘quvchi`;
  if (totalCountEl) totalCountEl.textContent = state.students.length;

  const isAdmin = state.userRole === 'admin';
  const isFrozen = state.isFrozen;

  if (filteredStudents.length === 0) {
    studentsContainer.innerHTML = `
      <div class="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
        <i class="fa-regular fa-folder-open text-3xl text-slate-300 mb-2"></i>
        <p class="text-xs text-slate-600 font-semibold mb-3">
          ${query ? 'Qidiruv bo‘yicha o‘quvchi topilmadi' : `"${state.currentClassName}" sinfida hozircha o‘quvchilar mavjud emas.`}
        </p>
        ${isAdmin ? `
          <button 
            type="button" 
            onclick="openAddStudentModal()" 
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition shadow-xs active:scale-95"
          >
            <i class="fa-solid fa-user-plus text-[10px]"></i> + Birinchi o‘quvchini qo‘shish
          </button>
        ` : ''}
      </div>
    `;
    return;
  }

  studentsContainer.innerHTML = '';

  filteredStudents.forEach((student, index) => {
    const currentAtt = state.attendanceMap[student.id] || { status: null, reason: '' };
    const card = document.createElement('div');
    card.className = 'student-card bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs transition-all';
    card.id = `student-card-${student.id}`;

    // Telegram profil holati nishoni (🟢 Ulangan / 🟡 Kutilmoqda / ⚪ Raqam yo'q)
    let statusBadgeHtml = '';
    if (student.parent_status === 'linked') {
      statusBadgeHtml = `
        <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70 shrink-0" title="Telegram xabarlari ulandi">
          <i class="fa-solid fa-circle text-[6px] text-emerald-500"></i> Ulangan
        </span>
      `;
    } else if (student.parent_status === 'pending') {
      statusBadgeHtml = `
        <span class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/70 shrink-0" title="Botda kontakt yuborishi kutilmoqda">
          <i class="fa-solid fa-clock text-[8px] text-amber-500"></i> Kutilmoqda
        </span>
      `;
    } else {
      statusBadgeHtml = `
        <span class="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
          <i class="fa-solid fa-minus text-[8px]"></i> Raqam yo‘q
        </span>
      `;
    }

    const showReason = currentAtt.status === 'kechikdi' || currentAtt.status === 'sababli';
    const disabledAttr = isFrozen ? 'disabled' : '';
    const disabledClass = isFrozen ? 'cursor-not-allowed opacity-80' : '';

    // Admin tahrirlash va o'chirish tugmalari (Faqat adminga ko'rinadi)
    let adminButtonsHtml = '';
    if (isAdmin) {
      adminButtonsHtml = `
        <button 
          type="button" 
          class="edit-student-btn w-6 h-6 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 flex items-center justify-center text-[10px] transition"
          data-id="${student.id}"
          data-name="${escapeQuotes(student.full_name)}"
          data-class-id="${student.class_id}"
          data-phone="${student.parent_phone || ''}"
          title="O‘quvchini tahrirlash"
        >
          <i class="fa-solid fa-gear"></i>
        </button>
        <button 
          type="button" 
          class="delete-student-btn w-6 h-6 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 flex items-center justify-center text-[10px] transition"
          data-id="${student.id}"
          data-name="${escapeQuotes(student.full_name)}"
          title="O‘quvchini o‘chirish"
        >
          <i class="fa-solid fa-trash-can"></i>
        </button>
      `;
    }

    card.innerHTML = `
      <div class="flex items-start justify-between gap-2 mb-2">
        <div class="flex items-start gap-2.5">
          <span class="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
            ${index + 1}
          </span>
          <div>
            <h3 class="text-xs font-bold text-slate-900 leading-tight">${student.full_name}</h3>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                <i class="fa-solid fa-phone text-[9px] text-slate-400"></i>
                <span>${formatPhoneDisplay(student.parent_phone)}</span>
              </span>
              <!-- Telefonni tezkor to'g'rilash (Qalamcha ✏️) -->
              <button 
                type="button" 
                class="quick-edit-phone-btn text-blue-600 hover:text-blue-800 p-0.5 transition"
                data-id="${student.id}"
                data-name="${escapeQuotes(student.full_name)}"
                data-phone="${student.parent_phone || ''}"
                title="Ota-ona telefon raqamini to‘g‘rilash"
              >
                <i class="fa-solid fa-pen text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          ${statusBadgeHtml}
          ${adminButtonsHtml}
        </div>
      </div>

      <!-- Davomat 4 ta holat tugmalari: [Keldi], [Kelmadi], [Kechikdi], [Sababli] -->
      <div class="grid grid-cols-4 gap-1.5 mt-2.5">
        <button 
          type="button" 
          class="status-btn status-btn-keldi py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${disabledClass} ${
            currentAtt.status === 'keldi'
              ? 'active'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-emerald-50/60'
          }"
          data-student-id="${student.id}" 
          data-status="keldi"
          ${disabledAttr}
        >
          <div class="text-[11px]">✅ Keldi</div>
        </button>

        <button 
          type="button" 
          class="status-btn status-btn-kelmadi py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${disabledClass} ${
            currentAtt.status === 'kelmadi'
              ? 'active'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-rose-50/60'
          }"
          data-student-id="${student.id}" 
          data-status="kelmadi"
          ${disabledAttr}
        >
          <div class="text-[11px]">❌ Kelmadi</div>
        </button>

        <button 
          type="button" 
          class="status-btn status-btn-kechikdi py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${disabledClass} ${
            currentAtt.status === 'kechikdi'
              ? 'active'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-amber-50/60'
          }"
          data-student-id="${student.id}" 
          data-status="kechikdi"
          ${disabledAttr}
        >
          <div class="text-[11px]">⏱ Kechikdi</div>
        </button>

        <button 
          type="button" 
          class="status-btn status-btn-sababli py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${disabledClass} ${
            currentAtt.status === 'sababli'
              ? 'active'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-sky-50/60'
          }"
          data-student-id="${student.id}" 
          data-status="sababli"
          ${disabledAttr}
        >
          <div class="text-[11px]">📋 Sababli</div>
        </button>
      </div>

      <!-- Izoh maydoni (Kechikdi yoki Sababli holatida ochiladi) -->
      <div 
        id="reason-box-${student.id}" 
        class="mt-2.5 pt-2 border-t border-slate-100 ${showReason ? 'block' : 'hidden'}"
      >
        <input 
          type="text" 
          placeholder="Sabab yoki kechikish izohi (ixtiyoriy)..." 
          value="${studentEscape(currentAtt.reason || '')}"
          class="reason-input w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition ${disabledClass}"
          data-student-id="${student.id}"
          ${disabledAttr}
        />
      </div>
    `;

    studentsContainer.appendChild(card);
  });

  attachStudentCardListeners();
}

function escapeQuotes(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;');
}

function studentEscape(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function attachStudentCardListeners() {
  // Davomat holatini o'zgartirish
  const statusButtons = studentsContainer.querySelectorAll('.status-btn');
  statusButtons.forEach((btn) => {
    btn.onclick = () => {
      if (state.isFrozen) {
        triggerHaptic('warning');
        showToast('Davomat kiritish vaqti (08:00 - 13:30) yakunlangan! Tizim muzlatilgan.', 'warning');
        return;
      }
      const studentId = parseInt(btn.getAttribute('data-student-id'), 10);
      const newStatus = btn.getAttribute('data-status');
      setStatus(studentId, newStatus);
    };
  });

  // Izoh yozish
  const reasonInputs = studentsContainer.querySelectorAll('.reason-input');
  reasonInputs.forEach((input) => {
    input.oninput = () => {
      if (state.isFrozen) return;
      const studentId = parseInt(input.getAttribute('data-student-id'), 10);
      if (state.attendanceMap[studentId]) {
        state.attendanceMap[studentId].reason = input.value;
      }
    };
  });

  // Qalamcha ✏️ orqali tezkor telefon o'zgartirish
  const quickPhoneButtons = studentsContainer.querySelectorAll('.quick-edit-phone-btn');
  quickPhoneButtons.forEach((btn) => {
    btn.onclick = async () => {
      triggerHaptic('light');
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const currentPhone = btn.getAttribute('data-phone') || '';

      const newPhone = prompt(`"${name}" o‘quvchisining ota-onasi telefon raqamini kiriting:\n(Masalan: +998901234567)`, currentPhone);
      if (newPhone === null) return; // Bekor qilindi

      try {
        const res = await fetch(`/api/students/${id}/phone`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: newPhone.trim() })
        });
        const result = await res.json();
        if (result.success) {
          triggerHaptic('success');
          showToast(`"${name}" telefon raqami yangilandi!`);
          fetchStudents();
        } else {
          throw new Error(result.error || 'Yangilab bo‘lmadi');
        }
      } catch (err) {
        showToast(err.message || 'Xatolik yuz berdi', 'error');
      }
    };
  });

  // To'liq tahrirlash (Ism, sinf, telefon) - Admin uchun
  const editButtons = studentsContainer.querySelectorAll('.edit-student-btn');
  editButtons.forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const classId = btn.getAttribute('data-class-id');
      const phone = btn.getAttribute('data-phone');
      openEditStudentModal(id, name, classId, phone);
    };
  });

  // O'chirish - Admin uchun
  const deleteButtons = studentsContainer.querySelectorAll('.delete-student-btn');
  deleteButtons.forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      await deleteStudentAction(id, name);
    };
  });
}

function setStatus(studentId, status) {
  triggerHaptic('light');

  if (!state.attendanceMap[studentId]) {
    state.attendanceMap[studentId] = { status: null, reason: '' };
  }

  if (state.attendanceMap[studentId].status === status) {
    state.attendanceMap[studentId].status = null;
  } else {
    state.attendanceMap[studentId].status = status;
  }

  const card = document.getElementById(`student-card-${studentId}`);
  if (card) {
    const buttons = card.querySelectorAll('.status-btn');
    buttons.forEach((btn) => {
      const bStatus = btn.getAttribute('data-status');
      if (bStatus === state.attendanceMap[studentId].status) {
        btn.classList.add('active');
        btn.classList.remove('bg-slate-50', 'text-slate-700');
      } else {
        btn.classList.remove('active');
        btn.classList.add('bg-slate-50', 'text-slate-700');
      }
    });

    const reasonBox = document.getElementById(`reason-box-${studentId}`);
    if (reasonBox) {
      const currentSt = state.attendanceMap[studentId].status;
      if (currentSt === 'kechikdi' || currentSt === 'sababli') {
        reasonBox.classList.remove('hidden');
      } else {
        reasonBox.classList.add('hidden');
      }
    }
  }

  updateStats();
}

function updateStats() {
  let keldi = 0;
  let kelmadi = 0;
  let kechikdi = 0;
  let sababli = 0;
  let marked = 0;

  Object.values(state.attendanceMap).forEach((item) => {
    if (item.status) {
      marked++;
      if (item.status === 'keldi') keldi++;
      else if (item.status === 'kelmadi') kelmadi++;
      else if (item.status === 'kechikdi') kechikdi++;
      else if (item.status === 'sababli') sababli++;
    }
  });

  if (statKeldiEl) statKeldiEl.textContent = keldi;
  if (statKelmadiEl) statKelmadiEl.textContent = kelmadi;
  if (statKechikdiEl) statKechikdiEl.textContent = kechikdi;
  if (statSababliEl) statSababliEl.textContent = sababli;
  if (markedCountEl) markedCountEl.textContent = marked;

  let linked = 0;
  let pending = 0;
  state.students.forEach((s) => {
    if (s.parent_status === 'linked') linked++;
    else if (s.parent_status === 'pending') pending++;
  });
  if (statLinkedParentsEl) statLinkedParentsEl.textContent = linked;
  if (statPendingParentsEl) statPendingParentsEl.textContent = pending;

  if (tg?.MainButton) {
    if (marked > 0 && !state.isFrozen) {
      tg.MainButton.setText(`💾 DAVOMATNI SAQLASH (${marked}/${state.students.length})`);
      tg.MainButton.show();
    } else {
      tg.MainButton.hide();
    }
  }
}

// Barchasini "Keldi" qilish
if (markAllPresentBtn) {
  markAllPresentBtn.onclick = () => {
    if (state.isFrozen) {
      showToast('Davomat kiritish vaqti yakunlangan!', 'warning');
      return;
    }
    triggerHaptic('medium');
    if (state.students.length === 0) return;

    state.students.forEach((s) => {
      if (!state.attendanceMap[s.id]) {
        state.attendanceMap[s.id] = { status: 'keldi', reason: '' };
      } else {
        state.attendanceMap[s.id].status = 'keldi';
      }
    });

    renderStudentsList();
    updateStats();
    showToast('Barcha o‘quvchilar "Keldi" deb belgilandi');
  };
}

// Davomatni saqlash
async function saveAttendance() {
  if (state.isFrozen) {
    showToast('Davomat kiritish vaqti (08:00 - 13:30) yakunlangan! Saqlash taqiqlanadi.', 'warning');
    triggerHaptic('warning');
    return;
  }

  if (!state.currentClassId) return;

  const records = Object.entries(state.attendanceMap)
    .filter(([_, data]) => data.status !== null)
    .map(([studentId, data]) => ({
      student_id: parseInt(studentId, 10),
      status: data.status,
      reason: data.reason || null
    }));

  if (records.length === 0) {
    showToast('Hech bo‘lmasa bitta o‘quvchi davomatini belgilang!', 'warning');
    triggerHaptic('warning');
    return;
  }

  // 1. Agar "Kelmadi" (❌) bo'lgan o'quvchilar bo'lsa, o'qituvchini 2-marta ogohlantirib amin bo'lish
  const absentStudents = records
    .filter(r => r.status === 'kelmadi')
    .map(r => state.students.find(s => s.id === r.student_id))
    .filter(Boolean);

  if (absentStudents.length > 0) {
    triggerHaptic('warning');
    const namesList = absentStudents.map((s, idx) => `${idx + 1}. ${s.full_name}`).join('\n');
    const confirmText = 
      `⚠️ DIQQAT! (2-marta amin bo'ling)\n\n` +
      `Quyidagi ${absentStudents.length} nafar o‘quvchi darsda YO‘Q (kelmadi) deb belgilandi:\n\n` +
      `${namesList}\n\n` +
      `"OK" ni bossangiz, ularning ota-onalariga Telegram orqali DARHOL ogohlantirish xabari yuboriladi.\n\n` +
      `Rostdan ham tasdiqlaysizmi?\n` +
      `(Eslatma: Agar o‘quvchi 15 daqiqa ichida yetib kelsa, uni "Kechikdi" deb o‘zgartirishingiz mumkin — ota-onasiga to‘g‘rilash xabari boradi)`;

    const isConfirmed = confirm(confirmText);
    if (!isConfirmed) {
      return; // O'qituvchi bekor qildi, saqlanmaydi va xabar ketmaydi
    }
  }

  if (saveAttendanceBtn) {
    saveAttendanceBtn.disabled = true;
    saveAttendanceBtn.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      <span>Saqlanmoqda...</span>
    `;
  }

  try {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classId: state.currentClassId,
        date: state.currentDate,
        records: records
      })
    });

    const result = await res.json();

    if (res.ok && result.success) {
      triggerHaptic('success');
      const msg = absentStudents.length > 0 
        ? `✅ Saqlandi! ${absentStudents.length} ta o‘quvchi ota-onasiga tezkor xabar yuborildi.` 
        : `✅ ${result.savedCount} ta o‘quvchi davomati saqlandi!`;
      showToast(msg, 'success');
      if (tg?.showAlert) {
        tg.showAlert(`${state.currentClassName} sinfi davomati saqlandi!`);
      }
      fetchStudents();
    } else {
      if (res.status === 403 || result.isFrozen) {
        state.isFrozen = true;
        state.freezeReason = result.error;
        updateFreezeUI();
      }
      throw new Error(result.error || 'Saqlashda xatolik');
    }
  } catch (err) {
    console.error('Save attendance error:', err);
    triggerHaptic('error');
    showToast(err.message || 'Saqlashda xatolik yuz berdi', 'error');
  } finally {
    if (saveAttendanceBtn) {
      saveAttendanceBtn.disabled = state.isFrozen;
      saveAttendanceBtn.innerHTML = `
        <i class="fa-solid fa-floppy-disk"></i>
        <span id="saveBtnText">${state.isFrozen ? 'Muzlatilgan (13:30 yakunlangan)' : 'Davomatni saqlash'}</span>
      `;
    }
  }
}

if (saveAttendanceBtn) saveAttendanceBtn.onclick = saveAttendance;
if (tg?.MainButton) tg.MainButton.onClick(saveAttendance);

// ==========================================
// 8. MA'MURIYAT MONITORINGI (9-A SINF NAZORATI)
// ==========================================
if (openAdminSummaryBtn) {
  openAdminSummaryBtn.onclick = async () => {
    triggerHaptic('light');
    if (summaryModalDate) summaryModalDate.textContent = `${state.currentDate} sanasidagi 9-A sinf nazorati`;
    if (summaryClassesList) summaryClassesList.innerHTML = '<div class="text-center py-6 text-slate-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Ma‘lumotlar tahlil qilinmoqda...</div>';
    if (adminSummaryModal) adminSummaryModal.classList.remove('hidden');

    try {
      const res = await fetch(`/api/admin/summary?date=${state.currentDate}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Yuklab bo‘lmadi');
      }

      let done = 0;
      let partial = 0;
      let unmarked = 0;

      if (summaryClassesList) summaryClassesList.innerHTML = '';
      data.summary.forEach((item) => {
        if (item.status === 'completed') done++;
        else if (item.status === 'partial') partial++;
        else unmarked++;

        const div = document.createElement('div');
        div.className = 'p-3 rounded-xl border border-slate-200/90 bg-slate-50 flex items-center justify-between text-xs';

        let statusBadge = '';
        if (item.status === 'completed') {
          statusBadge = '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">✅ To‘liq</span>';
        } else if (item.status === 'partial') {
          statusBadge = '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">⏱ Qisman</span>';
        } else {
          statusBadge = '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">❌ Kiritilmagan</span>';
        }

        div.innerHTML = `
          <div>
            <div class="font-bold text-slate-900 text-xs">${item.name}-sinf</div>
            <div class="text-[10px] text-slate-500 mt-0.5">
              O‘quvchilar: <b>${item.student_count}</b> | Belgilandi: <b>${item.marked_count}</b>
            </div>
          </div>
          <div class="text-right">
            ${statusBadge}
          </div>
        `;
        if (summaryClassesList) summaryClassesList.appendChild(div);
      });

      if (summaryDoneCount) summaryDoneCount.textContent = done;
      if (summaryPartialCount) summaryPartialCount.textContent = partial;
      if (summaryUnmarkedCount) summaryUnmarkedCount.textContent = unmarked;

      if (summaryDispatchStatus) {
        if (data.isDispatched) {
          summaryDispatchStatus.innerHTML = '<span class="text-emerald-600 font-bold"><i class="fa-solid fa-circle-check"></i> Bugungi hisobot ota-onalarga yuborilgan va qulflangan</span>';
        } else {
          summaryDispatchStatus.innerHTML = '<span class="text-slate-500"><i class="fa-solid fa-clock"></i> Soat 14:00 da avtomat yuboriladi</span>';
        }
      }
    } catch (err) {
      if (summaryClassesList) summaryClassesList.innerHTML = `<div class="text-center py-6 text-rose-500 text-xs">${err.message}</div>`;
    }
  };
}

// ==========================================
// 9. O'QUVCHI CRUD BOSHQARUVI (ADMIN)
// ==========================================
function populateClassDropdown(selectEl, selectedId = null) {
  if (!selectEl) return;
  selectEl.innerHTML = '';
  state.classes.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.name}-sinf`;
    if (selectedId && c.id === parseInt(selectedId, 10)) {
      opt.selected = true;
    }
    selectEl.appendChild(opt);
  });
}

function openAddStudentModal() {
  triggerHaptic('light');
  if (studentModalTitle) studentModalTitle.textContent = 'Yangi o‘quvchi qo‘shish';
  if (editStudentId) editStudentId.value = '';
  if (studentFullNameInput) studentFullNameInput.value = '';
  if (studentPhoneInput) studentPhoneInput.value = '';

  populateClassDropdown(studentClassSelect, state.currentClassId);
  if (studentFormModal) studentFormModal.classList.remove('hidden');
  if (studentFullNameInput) studentFullNameInput.focus();
}

if (openAddStudentBtn) openAddStudentBtn.onclick = openAddStudentModal;

function openEditStudentModal(id, fullName, classId, phone) {
  triggerHaptic('light');
  if (studentModalTitle) studentModalTitle.textContent = 'O‘quvchini tahrirlash';
  if (editStudentId) editStudentId.value = id;
  if (studentFullNameInput) studentFullNameInput.value = fullName || '';
  if (studentPhoneInput) studentPhoneInput.value = phone || '';

  populateClassDropdown(studentClassSelect, classId || state.currentClassId);
  if (studentFormModal) studentFormModal.classList.remove('hidden');
  if (studentFullNameInput) studentFullNameInput.focus();
}

if (saveStudentFormBtn) {
  saveStudentFormBtn.onclick = async () => {
    const fullName = studentFullNameInput?.value.trim();
    const classId = studentClassSelect?.value;
    const phone = studentPhoneInput?.value.trim();
    const studentId = editStudentId?.value;

    if (!fullName) {
      showToast('O‘quvchi F.I.SH kiritilishi shart!', 'warning');
      studentFullNameInput?.focus();
      return;
    }

    if (!classId) {
      showToast('Sinfni tanlang!', 'warning');
      return;
    }

    saveStudentFormBtn.disabled = true;
    saveStudentFormBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saqlanmoqda...';

    try {
      let res;
      if (studentId) {
        res = await fetch(`/api/students/${studentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: fullName,
            class_id: parseInt(classId, 10),
            parent_phone: phone
          })
        });
      } else {
        res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: fullName,
            class_id: parseInt(classId, 10),
            parent_phone: phone
          })
        });
      }

      const result = await res.json();
      if (result.success) {
        triggerHaptic('success');
        showToast(studentId ? 'O‘quvchi muvaffaqiyatli yangilandi!' : 'Yangi o‘quvchi qo‘shildi!');
        if (studentFormModal) studentFormModal.classList.add('hidden');
        await fetchClasses();
        if (parseInt(classId, 10) === state.currentClassId) {
          fetchStudents();
        } else {
          const targetClass = state.classes.find((c) => c.id === parseInt(classId, 10));
          if (targetClass) {
            selectClass(targetClass.id, targetClass.name);
          }
        }
      } else {
        throw new Error(result.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      console.error('Student save error:', err);
      showToast(err.message || 'Saqlashda xatolik', 'error');
    } finally {
      saveStudentFormBtn.disabled = false;
      saveStudentFormBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saqlash';
    }
  };
}

async function deleteStudentAction(id, name) {
  const proceed = confirm(`Haqiqatan ham "${name}" o‘quvchisini o‘chirmoqchimisiz?\nUning barcha davomat yozuvlari ham o‘chiriladi.`);
  if (!proceed) return;

  try {
    const res = await fetch(`/api/students/${id}`, {
      method: 'DELETE'
    });
    const result = await res.json();
    if (result.success) {
      triggerHaptic('success');
      showToast('O‘quvchi muvaffaqiyatli o‘chirildi!');
      await fetchClasses();
      fetchStudents();
    } else {
      throw new Error(result.error || 'O‘chirib bo‘lmadi');
    }
  } catch (err) {
    console.error('Delete student error:', err);
    showToast(err.message || 'O‘chirishda xatolik', 'error');
  }
}

// ==========================================
// 10. EXCEL IMPORT (OMMAVIY YUKLASH - ADMIN)
// ==========================================
if (openExcelImportBtn) {
  openExcelImportBtn.onclick = () => {
    triggerHaptic('light');
    state.selectedExcelFile = null;
    if (excelFileInput) excelFileInput.value = '';
    if (fileNameLabel) fileNameLabel.textContent = '.xlsx yoki .xls faylni tanlang';
    if (excelImportModal) excelImportModal.classList.remove('hidden');
  };
}

if (dropZone) {
  dropZone.onclick = () => {
    excelFileInput?.click();
  };

  dropZone.ondragover = (e) => {
    e.preventDefault();
    dropZone.classList.add('bg-blue-50', 'border-blue-400');
  };
  dropZone.ondragleave = () => {
    dropZone.classList.remove('bg-blue-50', 'border-blue-400');
  };
  dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.classList.remove('bg-blue-50', 'border-blue-400');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      state.selectedExcelFile = file;
      if (fileNameLabel) fileNameLabel.innerHTML = `Tanlandi: <b>${file.name}</b> (${Math.round(file.size / 1024)} KB)`;
      triggerHaptic('light');
    }
  };
}

if (excelFileInput) {
  excelFileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      state.selectedExcelFile = file;
      if (fileNameLabel) fileNameLabel.innerHTML = `Tanlandi: <b>${file.name}</b> (${Math.round(file.size / 1024)} KB)`;
      triggerHaptic('light');
    }
  };
}

if (submitExcelImportBtn) {
  submitExcelImportBtn.onclick = async () => {
    if (!state.selectedExcelFile) {
      showToast('Iltimos, avval Excel (.xlsx) faylini tanlang!', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', state.selectedExcelFile);

    submitExcelImportBtn.disabled = true;
    submitExcelImportBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Yuklanmoqda...';

    try {
      const res = await fetch('/api/import/excel', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();

      if (result.success) {
        triggerHaptic('success');
        showToast(result.message || 'Excel muvaffaqiyatli yuklandi!');
        if (excelImportModal) excelImportModal.classList.add('hidden');
        await fetchClasses();
        fetchStudents();
      } else {
        throw new Error(result.error || 'Yuklashda xatolik');
      }
    } catch (err) {
      console.error('Excel import error:', err);
      showToast(err.message || 'Excel yuklashda xatolik', 'error');
    } finally {
      submitExcelImportBtn.disabled = false;
      submitExcelImportBtn.innerHTML = '<i class="fa-solid fa-upload"></i> Faylni yuklash';
    }
  };
}

// ==========================================
// 11. EXCEL EXPORT (OYLIK DAVOMAT JURNALI - ADMIN)
// ==========================================
if (openExcelExportBtn) {
  openExcelExportBtn.onclick = () => {
    triggerHaptic('light');
    populateClassDropdown(exportClassSelect, state.currentClassId);
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (exportMonthInput) exportMonthInput.value = currentMonthStr;
    if (excelExportModal) excelExportModal.classList.remove('hidden');
  };
}

if (submitExcelExportBtn) {
  submitExcelExportBtn.onclick = () => {
    const classId = exportClassSelect?.value;
    const month = exportMonthInput?.value;

    if (!classId) {
      showToast('Sinfni tanlang!', 'warning');
      return;
    }
    if (!month) {
      showToast('Oyni tanlang!', 'warning');
      return;
    }

    triggerHaptic('success');
    showToast('Oylik jurnal shakllanmoqda, yuklab olish boshlandi...');
    if (excelExportModal) excelExportModal.classList.add('hidden');

    const downloadUrl = `/api/export/excel?classId=${classId}&month=${month}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `Davomat_${month}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
}

// ==========================================
// 11.1 O'QITUVCHILAR VA SINF RAHBARLARI BOSHQARUVI
// ==========================================
async function fetchTeachers() {
  if (!teachersListContainer) return;
  teachersListContainer.innerHTML = `
    <div class="p-4 text-center text-slate-400 text-xs">
      <i class="fa-solid fa-spinner fa-spin text-base mb-1 block text-purple-600"></i>
      O‘qituvchilar ro‘yxati yuklanmoqda...
    </div>
  `;

  try {
    const res = await fetch('/api/teachers');
    const data = await res.json();

    if (!data.success || !Array.isArray(data.data)) {
      teachersListContainer.innerHTML = `<div class="p-3 text-center text-rose-500 text-xs font-semibold">Yuklab bo‘lmadi: ${data.error || 'Noma‘lum xato'}</div>`;
      return;
    }

    const teachers = data.data;
    if (teachers.length === 0) {
      teachersListContainer.innerHTML = `
        <div class="p-4 text-center text-slate-400 text-xs">
          Biriktirilgan o‘qituvchilar topilmadi. Pastdagi forma orqali sinf rahbarini qo‘shing.
        </div>
      `;
      return;
    }

    teachersListContainer.innerHTML = teachers.map((t) => {
      const isLinked = Boolean(t.chat_id);
      const isPlaceholder = !t.phone || t.phone_norm?.startsWith('teacher_');
      const displayPhone = isPlaceholder ? 'Telefon kiritilmagan' : formatPhoneDisplay(t.phone);
      const statusHtml = isLinked
        ? `<span class="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold"><i class="fa-solid fa-circle-check"></i> Telegram: Ulangan</span>`
        : `<span class="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full font-semibold"><i class="fa-regular fa-clock"></i> Telegram: Kutilmoqda</span>`;

      const isAdmin = t.role === 'admin';
      const roleBadge = isAdmin
        ? `<span class="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-indigo-200 uppercase">${escapeHtmlApp(t.full_name?.includes('Zavuch') ? 'Zavuch' : 'Ma‘muriyat')}</span>`
        : `<span class="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-purple-200 uppercase">${escapeHtmlApp(t.class_name || '9-sinf')}</span>`;

      const deleteBtn = isAdmin
        ? ''
        : `<button class="delete-teacher-btn p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" 
              data-id="${t.id}" 
              data-name="${escapeHtmlApp(t.full_name)}"
              title="O‘chirish">
              <i class="fa-solid fa-trash-can"></i>
            </button>`;

      return `
        <div class="bg-white border ${isAdmin ? 'border-indigo-200 bg-indigo-50/20' : 'border-slate-200'} rounded-xl p-3 flex items-center justify-between gap-2 shadow-2xs hover:border-purple-200 transition">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 mb-1">
              ${roleBadge}
              <span class="font-bold text-xs text-slate-900 truncate">${escapeHtmlApp(t.full_name)}</span>
            </div>
            <div class="text-[11px] text-slate-600 flex items-center gap-1.5 flex-wrap">
              <span class="font-medium"><i class="fa-solid fa-phone text-[10px] text-slate-400"></i> ${displayPhone}</span>
              ${statusHtml}
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button class="edit-teacher-btn p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition" 
              data-id="${t.id}" 
              data-name="${escapeHtmlApp(t.full_name)}" 
              data-phone="${escapeHtmlApp(t.phone || '')}" 
              data-class="${t.class_id || 1}"
              title="Tahrirlash">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            ${deleteBtn}
          </div>
        </div>
      `;
    }).join('');

    // Tahrirlash tugmalari
    teachersListContainer.querySelectorAll('.edit-teacher-btn').forEach((btn) => {
      btn.onclick = () => {
        triggerHaptic('light');
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const phone = btn.dataset.phone;
        const classId = btn.dataset.class;

        if (teacherIdInput) teacherIdInput.value = id;
        if (teacherNameInput) teacherNameInput.value = name;
        if (teacherPhoneInput) teacherPhoneInput.value = phone;
        if (teacherClassSelect) teacherClassSelect.value = classId;
        if (teacherFormTitle) teacherFormTitle.textContent = 'O‘qituvchini tahrirlash';
        if (cancelTeacherEditBtn) cancelTeacherEditBtn.classList.remove('hidden');
        if (teacherNameInput) teacherNameInput.focus();
      };
    });

    // O'chirish tugmalari
    teachersListContainer.querySelectorAll('.delete-teacher-btn').forEach((btn) => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        if (!confirm(`Haqiqatan ham "${name}" o‘qituvchisini ro‘yxatdan o‘chirmoqchimisiz?`)) return;

        triggerHaptic('warning');
        try {
          const res = await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
          const resData = await res.json();
          if (resData.success) {
            showToast('O‘qituvchi muvaffaqiyatli o‘chirildi', 'success');
            fetchTeachers();
          } else {
            showToast(resData.error || 'O‘chirishda xatolik', 'error');
          }
        } catch (err) {
          showToast('Server bilan bog‘lanishda xatolik', 'error');
        }
      };
    });

  } catch (err) {
    console.error('fetchTeachers xatosi:', err);
    teachersListContainer.innerHTML = `<div class="p-3 text-center text-rose-500 text-xs">Yuklashda xatolik yuz berdi.</div>`;
  }
}

function resetTeacherForm() {
  if (teacherIdInput) teacherIdInput.value = '';
  if (teacherNameInput) teacherNameInput.value = '';
  if (teacherPhoneInput) teacherPhoneInput.value = '';
  if (teacherClassSelect) teacherClassSelect.value = '1';
  if (teacherFormTitle) teacherFormTitle.textContent = 'Rahbar biriktirish / o‘zgartirish';
  if (cancelTeacherEditBtn) cancelTeacherEditBtn.classList.add('hidden');
}

if (cancelTeacherEditBtn) {
  cancelTeacherEditBtn.onclick = () => {
    resetTeacherForm();
  };
}

if (openTeachersBtn) {
  openTeachersBtn.onclick = () => {
    triggerHaptic('light');
    resetTeacherForm();
    if (teachersModal) teachersModal.classList.remove('hidden');
    fetchTeachers();
  };
}

if (saveTeacherBtn) {
  saveTeacherBtn.onclick = async () => {
    const id = teacherIdInput ? teacherIdInput.value : '';
    const full_name = teacherNameInput ? teacherNameInput.value.trim() : '';
    const phone = teacherPhoneInput ? teacherPhoneInput.value.trim() : '';
    const class_id = teacherClassSelect ? teacherClassSelect.value : '1';

    if (!full_name) {
      showToast('O‘qituvchi F.I.SH ni kiriting', 'error');
      if (teacherNameInput) teacherNameInput.focus();
      return;
    }

    triggerHaptic('medium');
    saveTeacherBtn.disabled = true;
    saveTeacherBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saqlanmoqda...';

    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, full_name, phone, class_id })
      });
      const data = await res.json();

      if (data.success) {
        showToast('O‘qituvchi muvaffaqiyatli saqlandi va sinfga biriktirildi!', 'success');
        resetTeacherForm();
        fetchTeachers();
      } else {
        showToast(data.error || 'Saqlashda xatolik', 'error');
      }
    } catch (err) {
      showToast('Server bilan bog‘lanishda xatolik', 'error');
    } finally {
      saveTeacherBtn.disabled = false;
      saveTeacherBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saqlash va biriktirish';
    }
  };
}

// ==========================================
// 11.2 SERVER VA BAZA ZAXIRASI (BACKUP & RESTORE)
// ==========================================
if (openBackupBtn) {
  openBackupBtn.onclick = async () => {
    triggerHaptic('light');
    if (backupModal) backupModal.classList.remove('hidden');
    if (backupModalDbType) {
      backupModalDbType.textContent = 'Tekshirilmoqda...';
      try {
        const res = await fetch('/health');
        const data = await res.json();
        if (data && data.db === 'postgresql') {
          backupModalDbType.innerHTML = '<span class="text-purple-600 font-bold">🐘 PostgreSQL (Doimiy bulutli)</span>';
        } else {
          backupModalDbType.innerHTML = '<span class="text-amber-600 font-bold">📦 SQLite (Lokal xotira)</span>';
        }
      } catch (e) {
        backupModalDbType.textContent = 'SQLite / Server faol';
      }
    }
  };
}

if (triggerRestoreBtn && restoreBackupFileInput) {
  triggerRestoreBtn.onclick = () => {
    triggerHaptic('light');
    restoreBackupFileInput.value = '';
    restoreBackupFileInput.click();
  };

  restoreBackupFileInput.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Haqiqatan ham ushbu zaxira faylidan barcha ma‘lumotlarni bazaga tiklamoqchimisiz?')) {
      return;
    }

    triggerHaptic('medium');
    triggerRestoreBtn.disabled = true;
    triggerRestoreBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Tiklanmoqda...';

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupData)
      });
      const data = await res.json();

      if (data.success) {
        showToast('Baza ma‘lumotlari muvaffaqiyatli tiklandi!', 'success');
        if (backupModal) backupModal.classList.add('hidden');
        fetchClasses();
        fetchStudents();
      } else {
        showToast(data.error || 'Tiklashda xatolik', 'error');
      }
    } catch (err) {
      showToast('Noto‘g‘ri JSON fayl yoki server xatosi: ' + err.message, 'error');
    } finally {
      triggerRestoreBtn.disabled = false;
      triggerRestoreBtn.innerHTML = '<i class="fa-solid fa-upload"></i> Faylni tanlash va Tiklash';
    }
  };
}

// ==========================================
// 11.3 DARS JADVALI (RASPISANIYA) BOSHQARUVI
// ==========================================
async function openTimetableModal() {
  triggerHaptic('light');
  if (timetableModal) timetableModal.classList.remove('hidden');

  // Bugungi hafta kunini aniqlash (1=Du, ..., 6=Shan)
  const todayDay = new Date().getDay();
  state.selectedTimetableDay = (todayDay >= 1 && todayDay <= 6) ? todayDay : 1;

  await fetchTimetableData();
  renderTimetableTabs();
  renderTimetableLessons();
}

if (openTimetableBtn) {
  openTimetableBtn.onclick = openTimetableModal;
}

if (adminTimetableBtn) {
  adminTimetableBtn.onclick = openTimetableModal;
}

async function fetchTimetableData() {
  if (state.timetableData && state.timetableData.length > 0) return;

  if (timetableCardsContainer) {
    timetableCardsContainer.innerHTML = `
      <div class="text-center py-8 text-slate-400 text-xs">
        <i class="fa-solid fa-spinner fa-spin text-xl mb-1 text-blue-500"></i>
        <p>Dars jadvali yuklanmoqda...</p>
      </div>
    `;
  }

  try {
    const classId = state.currentClassId || 1;
    const res = await fetch(`/api/classes/${classId}/timetable`);
    const result = await res.json();
    if (result.success) {
      state.timetableData = result.data || [];
      state.timetableDays = result.days || {
        1: 'Dushanba', 2: 'Seshanba', 3: 'Chorshanba', 4: 'Payshanba', 5: 'Juma', 6: 'Shanba'
      };
      state.timetableTimes = result.times || {};
    } else {
      showToast('Dars jadvalini yuklashda xatolik', 'error');
    }
  } catch (err) {
    showToast('Server bilan bog‘lanishda xatolik', 'error');
  }
}

function renderTimetableTabs() {
  if (!timetableDayTabs) return;
  timetableDayTabs.innerHTML = '';

  const dayList = [
    { id: 1, name: 'Dushanba', short: 'Du' },
    { id: 2, name: 'Seshanba', short: 'Se' },
    { id: 3, name: 'Chorshanba', short: 'Chor' },
    { id: 4, name: 'Payshanba', short: 'Pay' },
    { id: 5, name: 'Juma', short: 'Jum' },
    { id: 6, name: 'Shanba', short: 'Shan' }
  ];

  dayList.forEach(day => {
    const isSelected = state.selectedTimetableDay === day.id;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition active:scale-95 ${
      isSelected
        ? 'bg-blue-600 text-white shadow-xs'
        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
    }`;
    btn.innerHTML = `<span>${day.short}</span> <span class="hidden sm:inline">${day.name.slice(2)}</span>`;
    btn.onclick = () => {
      triggerHaptic('light');
      state.selectedTimetableDay = day.id;
      renderTimetableTabs();
      renderTimetableLessons();
    };
    timetableDayTabs.appendChild(btn);
  });
}

function renderTimetableLessons() {
  if (!timetableCardsContainer) return;
  const dayId = state.selectedTimetableDay;
  const dayName = state.timetableDays[dayId] || 'Dushanba';

  if (timetableCurrentDayTitle) {
    timetableCurrentDayTitle.textContent = dayName;
  }

  const dayLessons = (state.timetableData || []).filter(item => item.day_of_week === dayId);

  if (timetableLessonCountBadge) {
    timetableLessonCountBadge.textContent = `${dayLessons.length} ta dars`;
  }

  if (dayLessons.length === 0) {
    timetableCardsContainer.innerHTML = `
      <div class="text-center py-8 text-slate-400 text-xs">
        <i class="fa-regular fa-calendar-xmark text-2xl mb-1 text-slate-300"></i>
        <p>Bu kunga darslar belgilanmagan</p>
      </div>
    `;
    return;
  }

  let html = '';
  dayLessons.forEach(lesson => {
    const timeStr = (lesson.start_time && lesson.end_time)
      ? `${lesson.start_time} - ${lesson.end_time}`
      : (state.timetableTimes[lesson.lesson_order]
          ? `${state.timetableTimes[lesson.lesson_order].start} - ${state.timetableTimes[lesson.lesson_order].end}`
          : '');

    html += `
      <div class="bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-3 transition shadow-2xs flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
          ${lesson.lesson_order}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <h4 class="font-bold text-slate-900 text-xs sm:text-sm truncate leading-snug">
              ${escapeHtmlApp(lesson.subject)}
            </h4>
            ${timeStr ? `
              <span class="text-[10px] font-semibold text-blue-700 bg-blue-100/70 border border-blue-200/60 px-1.5 py-0.5 rounded-md shrink-0">
                ${timeStr}
              </span>
            ` : ''}
          </div>
          <div class="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
            <i class="fa-solid fa-chalkboard-user text-purple-500 text-[10px]"></i>
            <span class="truncate">${escapeHtmlApp(lesson.teacher_name || 'Biriktirilmagan')}</span>
          </div>
        </div>
      </div>
    `;
  });

  timetableCardsContainer.innerHTML = html;
}

// ==========================================
// 12. MODALLARNI YOPISH
// ==========================================
document.querySelectorAll('.close-modal-btn').forEach((btn) => {
  btn.onclick = () => {
    const modalId = btn.getAttribute('data-modal');
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  };
});

[adminSummaryModal, studentFormModal, excelImportModal, excelExportModal, teachersModal, backupModal, timetableModal].forEach((modal) => {
  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    };
  }
});

// ==========================================
// 13. SANA VA QIDIRUV
// ==========================================
if (datePicker) {
  datePicker.onchange = () => {
    state.currentDate = datePicker.value;
    triggerHaptic('light');
    fetchStudents();
  };
}

if (refreshBtn) {
  refreshBtn.onclick = () => {
    triggerHaptic('light');
    fetchConfig();
    fetchClasses();
    fetchStudents();
  };
}

if (searchInput) {
  searchInput.oninput = (e) => {
    state.searchQuery = e.target.value;
    renderStudentsList();
  };
}

// ==========================================
// 14. INITALIZATSIYA
// ==========================================
(async function init() {
  await fetchConfig();
  await resolveAuthAndRole();
  await fetchClasses();
})();
