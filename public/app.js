/**
 * EduMemory — 65-maktab Davomat Tizimi
 * Frontend: 9-A va 9-B sinflari uchun to'liq Production boshqaruvi
 * Qat'iy Time-Lock (13:30 dedlayn), Telefon orqali kontakt integratsiyasi
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
  enteredPin: '',
  userRole: localStorage.getItem('edumemory_role') || 'teacher', // 'teacher' yoki 'admin'
  isFrozen: false,
  freezeReason: null,
  selectedExcelFile: null
};

// ==========================================
// 3. DOM ELEMENTLARI
// ==========================================
// PIN Lockscreen
const pinScreen = document.getElementById('pinScreen');
const pinDots = document.querySelectorAll('.pin-dot');
const pinError = document.getElementById('pinError');
const pinClearBtn = document.getElementById('pinClearBtn');
const pinBackspaceBtn = document.getElementById('pinBackspaceBtn');
const pinKeys = document.querySelectorAll('.pin-key');
const lockAppBtn = document.getElementById('lockAppBtn');
const roleBadge = document.getElementById('roleBadge');

// Muzlatish holati banneri
const freezeBanner = document.getElementById('freezeBanner');
const freezeBannerText = document.getElementById('freezeBannerText');

// Asosiy boshqaruv
const datePicker = document.getElementById('datePicker');
const classesList = document.getElementById('classesList');
const refreshBtn = document.getElementById('refreshBtn');
const studentsContainer = document.getElementById('studentsContainer');
const currentClassNameEl = document.getElementById('currentClassName');
const totalStudentsBadge = document.getElementById('totalStudentsBadge');
const schoolSubtitleEl = document.getElementById('schoolSubtitle');
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

// Ma'muriyat va CRUD tugmalari
const openAdminSummaryBtn = document.getElementById('openAdminSummaryBtn');
const openAddStudentBtn = document.getElementById('openAddStudentBtn');
const openExcelImportBtn = document.getElementById('openExcelImportBtn');
const openExcelExportBtn = document.getElementById('openExcelExportBtn');

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
// 4. PIN-KOD VA ROLLAR BOSHQARUVI
// ==========================================
const PIN_STORAGE_KEY = 'edumemory_pin_verified';
const ROLE_STORAGE_KEY = 'edumemory_role';

function applyRoleUI() {
  if (!roleBadge) return;
  if (state.userRole === 'admin') {
    roleBadge.textContent = '👑 Bosh Admin';
    roleBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200';
    document.querySelectorAll('.admin-only').forEach((el) => el.classList.remove('hidden'));
    if (openAdminSummaryBtn) openAdminSummaryBtn.classList.remove('hidden');
  } else {
    roleBadge.textContent = '👨‍🏫 Sinf Rahbari';
    roleBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200';
    document.querySelectorAll('.admin-only').forEach((el) => el.classList.add('hidden'));
    if (openAdminSummaryBtn) openAdminSummaryBtn.classList.add('hidden');
  }
}

function checkPinAuth() {
  const isVerified = localStorage.getItem(PIN_STORAGE_KEY) === 'true';
  if (isVerified) {
    if (pinScreen) pinScreen.classList.add('hidden');
    applyRoleUI();
  } else {
    if (pinScreen) pinScreen.classList.remove('hidden');
    resetPin();
  }
}

function updatePinDotsUI() {
  pinDots.forEach((dot, index) => {
    if (index < state.enteredPin.length) {
      dot.classList.add('active', 'bg-blue-500', 'border-blue-500');
    } else {
      dot.classList.remove('active', 'bg-blue-500', 'border-blue-500');
    }
  });
}

function resetPin() {
  state.enteredPin = '';
  updatePinDotsUI();
  if (pinError) {
    pinError.classList.remove('opacity-100');
    pinError.classList.add('opacity-0');
  }
}

async function verifyEnteredPin() {
  if (state.enteredPin.length !== 4) return;

  try {
    const res = await fetch('/api/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: state.enteredPin })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      triggerHaptic('success');
      localStorage.setItem(PIN_STORAGE_KEY, 'true');
      localStorage.setItem(ROLE_STORAGE_KEY, data.role || 'teacher');
      state.userRole = data.role || 'teacher';

      if (pinScreen) pinScreen.classList.add('hidden');
      resetPin();
      applyRoleUI();

      showToast(data.message || 'Tizimga muvaffaqiyatli kirdingiz.');

      if (state.classes.length === 0) {
        await initAppData();
      }
    } else {
      throw new Error(data.error || 'PIN-kod noto‘g‘ri!');
    }
  } catch (err) {
    triggerHaptic('error');
    if (pinError) {
      pinError.textContent = err.message || 'PIN-kod noto‘g‘ri!';
      pinError.classList.remove('opacity-0');
      pinError.classList.add('opacity-100');
    }

    const dotsContainer = document.getElementById('pinDots');
    if (dotsContainer) {
      dotsContainer.classList.add('shake');
      setTimeout(() => dotsContainer.classList.remove('shake'), 400);
    }

    setTimeout(() => {
      resetPin();
    }, 600);
  }
}

pinKeys.forEach((key) => {
  key.onclick = () => {
    if (state.enteredPin.length < 4) {
      triggerHaptic('light');
      state.enteredPin += key.getAttribute('data-val');
      updatePinDotsUI();
      if (pinError) pinError.classList.add('opacity-0');

      if (state.enteredPin.length === 4) {
        verifyEnteredPin();
      }
    }
  };
});

if (pinBackspaceBtn) {
  pinBackspaceBtn.onclick = () => {
    if (state.enteredPin.length > 0) {
      triggerHaptic('light');
      state.enteredPin = state.enteredPin.slice(0, -1);
      updatePinDotsUI();
      if (pinError) pinError.classList.add('opacity-0');
    }
  };
}

if (pinClearBtn) {
  pinClearBtn.onclick = () => {
    triggerHaptic('light');
    resetPin();
  };
}

if (lockAppBtn) {
  lockAppBtn.onclick = () => {
    triggerHaptic('light');
    localStorage.removeItem(PIN_STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);
    resetPin();
    if (pinScreen) pinScreen.classList.remove('hidden');
    showToast('Tizim qulflandi', 'info');
  };
}

// ==========================================
// 5. TIME-LOCK (MUZLATISH) VA CONFIG YUKLASH
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

    if (data.schoolName && schoolSubtitleEl) {
      state.schoolName = data.schoolName;
      schoolSubtitleEl.textContent = `${data.schoolName} — 9-sinflar davomati`;
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
// 6. SINF TANLASH TABS (FAQAT 9-A VA 9-B)
// ==========================================
async function fetchClasses() {
  try {
    const res = await fetch('/api/classes');
    const result = await res.json();

    if (!result.success || !result.data || result.data.length === 0) {
      if (classesList) classesList.innerHTML = '<span class="text-xs text-slate-400">9-A va 9-B sinflari topilmadi</span>';
      state.classes = [];
      return;
    }

    state.classes = result.data;
    renderClassesTabs();

    const currentStillExists = state.classes.some((c) => c.id === state.currentClassId);
    if (!state.currentClassId || !currentStillExists) {
      selectClass(state.classes[0].id, state.classes[0].name);
    }
  } catch (err) {
    showToast('Sinflarni yuklab bo‘lmadi', 'error');
  }
}

function renderClassesTabs() {
  if (!classesList) return;
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

  if (filteredStudents.length === 0) {
    studentsContainer.innerHTML = `
      <div class="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
        <i class="fa-regular fa-folder-open text-3xl text-slate-300 mb-2"></i>
        <p class="text-xs text-slate-600 font-semibold mb-3">
          ${query ? 'Qidiruv bo‘yicha o‘quvchi topilmadi' : `"${state.currentClassName}" sinfida hozircha haqiqiy o‘quvchilar kiritilmagan.`}
        </p>
        <button 
          type="button" 
          onclick="openAddStudentModal()" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition shadow-xs active:scale-95"
        >
          <i class="fa-solid fa-user-plus text-[10px]"></i> + Birinchi o‘quvchini qo‘shish
        </button>
      </div>
    `;
    return;
  }

  studentsContainer.innerHTML = '';
  const isFrozen = state.isFrozen;

  filteredStudents.forEach((student, index) => {
    const currentAtt = state.attendanceMap[student.id] || { status: null, reason: '' };
    const card = document.createElement('div');
    card.className = 'student-card bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs transition-all';
    card.id = `student-card-${student.id}`;

    // Telegram profil holati nishoni (🟢 Ulangan / 🟡 Kutilmoqda / ⚪ Raqam yo'q)
    let statusBadgeHtml = '';
    if (student.parent_status === 'linked') {
      statusBadgeHtml = `
        <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70 shrink-0" title="Telegram xabarlari ulandi">
          <i class="fa-solid fa-circle text-[6px] text-emerald-500"></i> Ulangan
        </span>
      `;
    } else if (student.parent_status === 'pending') {
      statusBadgeHtml = `
        <span class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/70 shrink-0" title="Botda kontakt yuborishi kutilmoqda">
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
          <!-- O'quvchini tahrirlash / o'chirish -->
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

  // To'liq tahrirlash (Ism, sinf, telefon)
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

  // O'chirish
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
      showToast(`✅ ${result.savedCount} ta o‘quvchi davomati saqlandi!`, 'success');
      if (tg?.showAlert) {
        tg.showAlert(`${state.currentClassName} sinfi davomati muvaffaqiyatli saqlandi!`);
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
// 8. MA'MURIYAT MONITORINGI (9-A VA 9-B NAZORATI)
// ==========================================
if (openAdminSummaryBtn) {
  openAdminSummaryBtn.onclick = async () => {
    triggerHaptic('light');
    if (summaryModalDate) summaryModalDate.textContent = `${state.currentDate} sanasidagi 9-sinflar nazorati`;
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
          summaryDispatchStatus.innerHTML = '<span class="text-emerald-600 font-bold"><i class="fa-solid fa-circle-check"></i> Bugungi xabarnoma ota-onalarga yuborilgan va qulflangan</span>';
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
// 9. O'QUVCHI CRUD BOSHQARUVI
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
// 10. EXCEL IMPORT (OMMAVIY YUKLASH)
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
// 11. EXCEL EXPORT (OYLIK DAVOMAT JURNALI)
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
// 12. MODALLARNI YOPISH
// ==========================================
document.querySelectorAll('.close-modal-btn').forEach((btn) => {
  btn.onclick = () => {
    const modalId = btn.getAttribute('data-modal');
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  };
});

[adminSummaryModal, studentFormModal, excelImportModal, excelExportModal].forEach((modal) => {
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
// 14. INIT
// ==========================================
async function initAppData() {
  await fetchConfig();
  await fetchClasses();
}

(async function init() {
  checkPinAuth();
  await initAppData();
})();
