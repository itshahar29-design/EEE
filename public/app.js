/**
 * EduMemory — 65-maktab Davomat Tizimi
 * Telegram Mini App Frontend (To'liq CRUD, Excel Import/Export, PIN-kod xavfsizligi)
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

// Telefon raqamni formatlash (+998 (90) 123-45-67)
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

// Harakat tugmalari
const markAllPresentBtn = document.getElementById('markAllPresentBtn');
const sendNotifyClassBtn = document.getElementById('sendNotifyClassBtn');
const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');

// CRUD va Excel Tugmalari
const openAddClassBtn = document.getElementById('openAddClassBtn');
const openAddStudentBtn = document.getElementById('openAddStudentBtn');
const openExcelImportBtn = document.getElementById('openExcelImportBtn');
const openExcelExportBtn = document.getElementById('openExcelExportBtn');

// Modallar
const addClassModal = document.getElementById('addClassModal');
const newClassNameInput = document.getElementById('newClassNameInput');
const saveNewClassBtn = document.getElementById('saveNewClassBtn');

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
  }, 2800);
}

// ==========================================
// 4. PIN-KOD XAVFSIZLIK VA LOCKSCREEN
// ==========================================
const PIN_STORAGE_KEY = 'edumemory_pin_verified';

function checkPinAuth() {
  const isVerified = localStorage.getItem(PIN_STORAGE_KEY) === 'true';
  if (isVerified) {
    pinScreen.classList.add('hidden');
  } else {
    pinScreen.classList.remove('hidden');
    resetPin();
  }
}

function updatePinDotsUI() {
  pinDots.forEach((dot, index) => {
    if (index < state.enteredPin.length) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

function resetPin() {
  state.enteredPin = '';
  updatePinDotsUI();
  pinError.classList.remove('opacity-100');
  pinError.classList.add('opacity-0');
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
      pinScreen.classList.add('hidden');
      resetPin();
      showToast('Xush kelibsiz! Tizimga muvaffaqiyatli kirdingiz.');
      
      // Agar ma'lumotlar yuklanmagan bo'lsa, yuklaymiz
      if (state.classes.length === 0) {
        await initAppData();
      }
    } else {
      throw new Error(data.error || 'PIN-kod noto‘g‘ri!');
    }
  } catch (err) {
    triggerHaptic('error');
    pinError.textContent = err.message || 'PIN-kod noto‘g‘ri!';
    pinError.classList.remove('opacity-0');
    pinError.classList.add('opacity-100');

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

// Keypad hodisalari
pinKeys.forEach((key) => {
  key.onclick = () => {
    if (state.enteredPin.length < 4) {
      triggerHaptic('light');
      state.enteredPin += key.getAttribute('data-val');
      updatePinDotsUI();
      pinError.classList.add('opacity-0');

      if (state.enteredPin.length === 4) {
        verifyEnteredPin();
      }
    }
  };
});

pinBackspaceBtn.onclick = () => {
  if (state.enteredPin.length > 0) {
    triggerHaptic('light');
    state.enteredPin = state.enteredPin.slice(0, -1);
    updatePinDotsUI();
    pinError.classList.add('opacity-0');
  }
};

pinClearBtn.onclick = () => {
  triggerHaptic('light');
  resetPin();
};

lockAppBtn.onclick = () => {
  triggerHaptic('light');
  localStorage.removeItem(PIN_STORAGE_KEY);
  resetPin();
  pinScreen.classList.remove('hidden');
  showToast('Tizim qulflandi', 'info');
};

// ==========================================
// 5. SERVER MA'LUMOTLARINI YUKLASH
// ==========================================
async function fetchConfig() {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    if (data.schoolName) {
      state.schoolName = data.schoolName;
      schoolSubtitleEl.textContent = data.schoolName;
    }
    if (data.botUsername) {
      state.botUsername = data.botUsername;
    }
    if (data.today) {
      state.currentDate = data.today;
      datePicker.value = data.today;
    }
  } catch (err) {
    datePicker.value = state.currentDate;
  }
}

async function fetchClasses() {
  try {
    const res = await fetch('/api/classes');
    const result = await res.json();

    if (!result.success || !result.data || result.data.length === 0) {
      classesList.innerHTML = '<span class="text-xs text-slate-400">Sinflar mavjud emas</span>';
      state.classes = [];
      return;
    }

    state.classes = result.data;
    renderClassesTabs();

    // Agar sinf tanlanmagan bo'lsa yoki joriy sinf ro'yxatda bo'lmasa, birinchisini tanlaymiz
    const currentStillExists = state.classes.some((c) => c.id === state.currentClassId);
    if (!state.currentClassId || !currentStillExists) {
      selectClass(state.classes[0].id, state.classes[0].name);
    }
  } catch (err) {
    showToast('Sinflarni yuklab bo‘lmadi', 'error');
  }
}

function renderClassesTabs() {
  classesList.innerHTML = '';
  state.classes.forEach((cls) => {
    const btn = document.createElement('button');
    const isActive = cls.id === state.currentClassId;

    btn.className = `px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 select-none ${
      isActive
        ? 'active-class-pill text-white'
        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
    }`;
    btn.innerHTML = `
      <span>${cls.name}</span>
      <span class="text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
        isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
      }">${cls.student_count || 0}</span>
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
  currentClassNameEl.textContent = className;
  renderClassesTabs();
  fetchStudents();
}

async function fetchStudents() {
  if (!state.currentClassId) return;

  studentsContainer.innerHTML = `
    <div class="text-center py-12 text-slate-400 text-sm">
      <i class="fa-solid fa-spinner fa-spin text-2xl mb-2 text-blue-500"></i>
      <p>${state.currentClassName} sinfi yuklanmoqda...</p>
    </div>
  `;

  try {
    const url = `/api/classes/${state.currentClassId}/students?date=${state.currentDate}`;
    const res = await fetch(url);
    const result = await res.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Yuklab bo‘lmadi');
    }

    state.students = result.data.students || [];
    state.attendanceMap = {};

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
    studentsContainer.innerHTML = `
      <div class="text-center py-8 text-rose-500 text-xs">
        <i class="fa-solid fa-triangle-exclamation text-xl mb-1"></i>
        <p>O‘quvchilarni yuklashda xatolik yuz berdi.</p>
      </div>
    `;
    showToast('O‘quvchilarni yuklab bo‘lmadi', 'error');
  }
}

// ==========================================
// 6. O'QUVCHILAR RO'YXATI VA CRUD INTERFEYSI
// ==========================================
function renderStudentsList() {
  const query = state.searchQuery.toLowerCase().trim();
  const filteredStudents = state.students.filter((s) => {
    const nameMatch = s.full_name.toLowerCase().includes(query);
    const phoneMatch = s.parent_phone && s.parent_phone.includes(query);
    return nameMatch || phoneMatch;
  });

  totalStudentsBadge.textContent = `${state.students.length} o‘quvchi`;
  totalCountEl.textContent = state.students.length;

  if (filteredStudents.length === 0) {
    studentsContainer.innerHTML = `
      <div class="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
        <i class="fa-regular fa-folder-open text-3xl text-slate-300 mb-2"></i>
        <p class="text-xs text-slate-500 font-medium">
          ${query ? 'Qidiruv bo‘yicha o‘quvchi topilmadi' : 'Bu sinfda hozircha o‘quvchilar mavjud emas'}
        </p>
        <button onclick="openAddStudentModal()" class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100 transition">
          <i class="fa-solid fa-user-plus text-[10px]"></i> Birinchi o‘quvchini qo‘shish
        </button>
      </div>
    `;
    return;
  }

  studentsContainer.innerHTML = '';

  filteredStudents.forEach((student, index) => {
    const currentAtt = state.attendanceMap[student.id] || { status: null, reason: '' };
    const card = document.createElement('div');
    card.className =
      'student-card bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs transition-all';
    card.id = `student-card-${student.id}`;

    // Telegram profil holati nishoni (Badge)
    let statusBadgeHtml = '';
    if (student.parent_status === 'linked') {
      statusBadgeHtml = `
        <span class="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 shrink-0" title="Telegram shaxsiy xabarnomasi faol">
          <i class="fa-solid fa-circle text-[6px] text-emerald-500"></i> Ulangan
        </span>
      `;
    } else if (student.parent_status === 'pending') {
      statusBadgeHtml = `
        <span class="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 shrink-0" title="Botga kontakt yuborishi kutilmoqda">
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

    card.innerHTML = `
      <!-- O'quvchi ma'lumotlari va Amallar -->
      <div class="flex items-start justify-between gap-2 mb-2">
        <div class="flex items-start gap-2.5">
          <span class="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
            ${index + 1}
          </span>
          <div>
            <h3 class="text-xs font-bold text-slate-800 leading-tight">${student.full_name}</h3>
            
            <!-- Telefon raqam -->
            <div class="flex items-center gap-2 mt-1">
              <span class="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <i class="fa-solid fa-phone text-[9px] text-slate-400"></i>
                <span>${formatPhoneDisplay(student.parent_phone)}</span>
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          ${statusBadgeHtml}
          
          <!-- Tahrirlash tugmasi -->
          <button 
            type="button" 
            class="edit-student-btn w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 flex items-center justify-center text-xs transition"
            data-id="${student.id}"
            data-name="${escapeQuotes(student.full_name)}"
            data-class-id="${student.class_id}"
            data-phone="${student.parent_phone || ''}"
            title="O‘quvchini tahrirlash"
          >
            <i class="fa-solid fa-pen"></i>
          </button>

          <!-- O'chirish tugmasi -->
          <button 
            type="button" 
            class="delete-student-btn w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 flex items-center justify-center text-xs transition"
            data-id="${student.id}"
            data-name="${escapeQuotes(student.full_name)}"
            title="O‘quvchini o‘chirish"
          >
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>

      <!-- Davomat tugmalari: [Keldi], [Kelmadi], [Kechikdi], [Sababli] -->
      <div class="grid grid-cols-4 gap-1.5 mt-2.5">
        <button 
          type="button" 
          class="status-btn status-btn-keldi py-2 px-1 text-center rounded-xl text-xs font-bold border ${
            currentAtt.status === 'keldi'
              ? 'active'
              : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-emerald-50/60'
          }"
          data-student-id="${student.id}" 
          data-status="keldi"
        >
          <div class="text-[11px]">✅ Keldi</div>
        </button>

        <button 
          type="button" 
          class="status-btn status-btn-kelmadi py-2 px-1 text-center rounded-xl text-xs font-bold border ${
            currentAtt.status === 'kelmadi'
              ? 'active'
              : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-rose-50/60'
          }"
          data-student-id="${student.id}" 
          data-status="kelmadi"
        >
          <div class="text-[11px]">❌ Kelmadi</div>
        </button>

        <button 
          type="button" 
          class="status-btn status-btn-kechikdi py-2 px-1 text-center rounded-xl text-xs font-bold border ${
            currentAtt.status === 'kechikdi'
              ? 'active'
              : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-amber-50/60'
          }"
          data-student-id="${student.id}" 
          data-status="kechikdi"
        >
          <div class="text-[11px]">⏱ Kechikdi</div>
        </button>

        <button 
          type="button" 
          class="status-btn status-btn-sababli py-2 px-1 text-center rounded-xl text-xs font-bold border ${
            currentAtt.status === 'sababli'
              ? 'active'
              : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-sky-50/60'
          }"
          data-student-id="${student.id}" 
          data-status="sababli"
        >
          <div class="text-[11px]">📋 Sababli</div>
        </button>
      </div>

      <!-- Izoh maydoni (Kechikdi yoki Sababli holatida) -->
      <div 
        id="reason-box-${student.id}" 
        class="mt-2.5 pt-2 border-t border-slate-100 ${showReason ? 'block' : 'hidden'}"
      >
        <input 
          type="text" 
          placeholder="Sabab yoki kechikish izohi (ixtiyoriy)..." 
          value="${studentEscape(currentAtt.reason || '')}"
          class="reason-input w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white transition"
          data-student-id="${student.id}"
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
  // Davomat status tugmalari
  const statusButtons = studentsContainer.querySelectorAll('.status-btn');
  statusButtons.forEach((btn) => {
    btn.onclick = () => {
      const studentId = parseInt(btn.getAttribute('data-student-id'), 10);
      const newStatus = btn.getAttribute('data-status');
      setStatus(studentId, newStatus);
    };
  });

  // Izoh o'zgarishi
  const reasonInputs = studentsContainer.querySelectorAll('.reason-input');
  reasonInputs.forEach((input) => {
    input.oninput = () => {
      const studentId = parseInt(input.getAttribute('data-student-id'), 10);
      if (state.attendanceMap[studentId]) {
        state.attendanceMap[studentId].reason = input.value;
      }
    };
  });

  // Tahrirlash (Edit) tugmalari
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

  // O'chirish (Delete) tugmalari
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
        btn.classList.remove('bg-slate-50', 'text-slate-600');
      } else {
        btn.classList.remove('active');
        btn.classList.add('bg-slate-50', 'text-slate-600');
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

  statKeldiEl.textContent = keldi;
  statKelmadiEl.textContent = kelmadi;
  statKechikdiEl.textContent = kechikdi;
  statSababliEl.textContent = sababli;
  markedCountEl.textContent = marked;

  // Profil ulanish ko'rsatkichlari
  let linked = 0;
  let pending = 0;
  state.students.forEach((s) => {
    if (s.parent_status === 'linked') linked++;
    else if (s.parent_status === 'pending') pending++;
  });
  statLinkedParentsEl.textContent = linked;
  statPendingParentsEl.textContent = pending;

  if (tg?.MainButton) {
    if (marked > 0) {
      tg.MainButton.setText(`💾 DAVOMATNI SAQLASH (${marked}/${state.students.length})`);
      tg.MainButton.show();
    } else {
      tg.MainButton.hide();
    }
  }
}

// Barchasini "Keldi" qilish
markAllPresentBtn.onclick = () => {
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

// Davomatni saqlash
async function saveAttendance() {
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

  saveAttendanceBtn.disabled = true;
  saveAttendanceBtn.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i>
    <span>Saqlanmoqda...</span>
  `;

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

    if (result.success) {
      triggerHaptic('success');
      showToast(`✅ ${result.savedCount} ta o‘quvchi davomati saqlandi!`, 'success');
      if (tg?.showAlert) {
        tg.showAlert(`${state.currentClassName} sinfi davomati muvaffaqiyatli saqlandi!`);
      }
      fetchStudents();
    } else {
      throw new Error(result.error || 'Saqlashda xatolik');
    }
  } catch (err) {
    console.error('Save attendance error:', err);
    triggerHaptic('error');
    showToast('Saqlashda xatolik yuz berdi', 'error');
  } finally {
    saveAttendanceBtn.disabled = false;
    saveAttendanceBtn.innerHTML = `
      <i class="fa-solid fa-floppy-disk"></i>
      <span>Davomatni saqlash</span>
    `;
  }
}

saveAttendanceBtn.onclick = saveAttendance;
if (tg?.MainButton) {
  tg.MainButton.onClick(saveAttendance);
}

// Ota-onalarga xabar yuborish
sendNotifyClassBtn.onclick = async () => {
  if (!state.currentClassId) return;

  const confirmMsg = `${state.currentClassName} sinfida Telegram profili ulangan barcha ota-onalarga bugungi hisobot yuborilsinmi?`;
  const proceed = confirm(confirmMsg);
  if (!proceed) return;

  sendNotifyClassBtn.disabled = true;
  sendNotifyClassBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Yuborilmoqda...`;

  try {
    const res = await fetch('/api/notify-parents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classId: state.currentClassId,
        date: state.currentDate
      })
    });
    const result = await res.json();
    if (result.success) {
      triggerHaptic('success');
      const s = result.stats;
      showToast(`Xabar yuborildi: ${s.sent} ta (Jami: ${s.total})`, 'success');
    } else {
      throw new Error(result.error || 'Xatolik');
    }
  } catch (err) {
    console.error('Notify parents error:', err);
    showToast('Xabar yuborishda xatolik yuz berdi', 'error');
  } finally {
    sendNotifyClassBtn.disabled = false;
    sendNotifyClassBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Xabar yuborish`;
  }
};

// ==========================================
// 7. SINF QO'SHISH BOSHQARUVI
// ==========================================
openAddClassBtn.onclick = () => {
  triggerHaptic('light');
  newClassNameInput.value = '';
  addClassModal.classList.remove('hidden');
  newClassNameInput.focus();
};

saveNewClassBtn.onclick = async () => {
  const name = newClassNameInput.value.trim();
  if (!name) {
    showToast('Sinf nomini kiriting!', 'warning');
    newClassNameInput.focus();
    return;
  }

  saveNewClassBtn.disabled = true;
  saveNewClassBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saqlanmoqda...';

  try {
    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const result = await res.json();

    if (result.success && result.data) {
      triggerHaptic('success');
      showToast(`"${result.data.name}" sinfi muvaffaqiyatli ochildi!`);
      addClassModal.classList.add('hidden');
      await fetchClasses();
      selectClass(result.data.id, result.data.name);
    } else {
      throw new Error(result.error || 'Xatolik');
    }
  } catch (err) {
    console.error('Create class error:', err);
    showToast(err.message || 'Sinfni ochishda xatolik', 'error');
  } finally {
    saveNewClassBtn.disabled = false;
    saveNewClassBtn.innerHTML = '<i class="fa-solid fa-check"></i> Sinfni saqlash';
  }
};

// ==========================================
// 8. O'QUVCHI QO'SHISH VA TAHRIRLASH MODALI
// ==========================================
function populateClassDropdown(selectEl, selectedId = null) {
  selectEl.innerHTML = '';
  state.classes.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    if (selectedId && c.id === parseInt(selectedId, 10)) {
      opt.selected = true;
    }
    selectEl.appendChild(opt);
  });
}

function openAddStudentModal() {
  triggerHaptic('light');
  studentModalTitle.textContent = 'Yangi o‘quvchi qo‘shish';
  editStudentId.value = '';
  studentFullNameInput.value = '';
  studentPhoneInput.value = '';

  populateClassDropdown(studentClassSelect, state.currentClassId);
  studentFormModal.classList.remove('hidden');
  studentFullNameInput.focus();
}

openAddStudentBtn.onclick = openAddStudentModal;

function openEditStudentModal(id, fullName, classId, phone) {
  triggerHaptic('light');
  studentModalTitle.textContent = 'O‘quvchini tahrirlash';
  editStudentId.value = id;
  studentFullNameInput.value = fullName || '';
  studentPhoneInput.value = phone || '';

  populateClassDropdown(studentClassSelect, classId || state.currentClassId);
  studentFormModal.classList.remove('hidden');
  studentFullNameInput.focus();
}

saveStudentFormBtn.onclick = async () => {
  const fullName = studentFullNameInput.value.trim();
  const classId = studentClassSelect.value;
  const phone = studentPhoneInput.value.trim();
  const studentId = editStudentId.value;

  if (!fullName) {
    showToast('O‘quvchi F.I.SH kiritilishi shart!', 'warning');
    studentFullNameInput.focus();
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
      // Tahrirlash (PUT)
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
      // Yangi qo'shish (POST)
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
      studentFormModal.classList.add('hidden');
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
// 9. EXCEL IMPORT (OMMAVIY YUKLASH)
// ==========================================
openExcelImportBtn.onclick = () => {
  triggerHaptic('light');
  state.selectedExcelFile = null;
  excelFileInput.value = '';
  fileNameLabel.textContent = '.xlsx yoki .xls faylni tanlang';
  excelImportModal.classList.remove('hidden');
};

dropZone.onclick = () => {
  excelFileInput.click();
};

excelFileInput.onchange = (e) => {
  const file = e.target.files[0];
  if (file) {
    state.selectedExcelFile = file;
    fileNameLabel.innerHTML = `Tanlandi: <b>${file.name}</b> (${Math.round(file.size / 1024)} KB)`;
    triggerHaptic('light');
  }
};

// Drag & drop
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
    fileNameLabel.innerHTML = `Tanlandi: <b>${file.name}</b> (${Math.round(file.size / 1024)} KB)`;
    triggerHaptic('light');
  }
};

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
      excelImportModal.classList.add('hidden');
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

// ==========================================
// 10. EXCEL EXPORT (OYLIK DAVOMAT JURNALI)
// ==========================================
openExcelExportBtn.onclick = () => {
  triggerHaptic('light');
  populateClassDropdown(exportClassSelect, state.currentClassId);
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  exportMonthInput.value = currentMonthStr;
  excelExportModal.classList.remove('hidden');
};

submitExcelExportBtn.onclick = () => {
  const classId = exportClassSelect.value;
  const month = exportMonthInput.value;

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
  excelExportModal.classList.add('hidden');

  // Yuklab olish URLi
  const downloadUrl = `/api/export/excel?classId=${classId}&month=${month}`;
  
  // Brauzer orqali yuklab olishni boshlash
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `Davomat_${month}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// ==========================================
// 11. MODALLARNI YOPISH
// ==========================================
document.querySelectorAll('.close-modal-btn').forEach((btn) => {
  btn.onclick = () => {
    const modalId = btn.getAttribute('data-modal');
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  };
});

[addClassModal, studentFormModal, excelImportModal, excelExportModal].forEach((modal) => {
  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    };
  }
});

// ==========================================
// 12. FILTER VA SANA QIDIRUVLARI
// ==========================================
datePicker.onchange = () => {
  state.currentDate = datePicker.value;
  triggerHaptic('light');
  fetchStudents();
};

refreshBtn.onclick = () => {
  triggerHaptic('light');
  fetchClasses();
  fetchStudents();
};

searchInput.oninput = (e) => {
  state.searchQuery = e.target.value;
  renderStudentsList();
};

// ==========================================
// 13. TIZIMNI ISHGA TUSHIRISH (INIT)
// ==========================================
async function initAppData() {
  await fetchConfig();
  await fetchClasses();
}

(async function init() {
  checkPinAuth();
  await initAppData();
})();
