/**
 * EduMemory — 65-maktab Davomat Tizimi
 * Telegram Mini App Frontend (Telefon raqam va profil integratsiyasi)
 */

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

// Telefon raqamni chiroyli ko'rsatish
function formatPhoneDisplay(raw) {
  if (!raw) return 'Raqam kiritilmagan';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length >= 9) {
    const n = digits.slice(-9);
    return `+998 (${n.slice(0, 2)}) ${n.slice(2, 5)}-${n.slice(5, 7)}-${n.slice(7, 9)}`;
  }
  return raw;
}

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
  editingStudentId: null
};

// DOM elementlari
const datePicker = document.getElementById('datePicker');
const classesList = document.getElementById('classesList');
const refreshBtn = document.getElementById('refreshBtn');
const studentsContainer = document.getElementById('studentsContainer');
const currentClassNameEl = document.getElementById('currentClassName');
const totalStudentsBadge = document.getElementById('totalStudentsBadge');
const schoolSubtitleEl = document.getElementById('schoolSubtitle');
const searchInput = document.getElementById('searchInput');

// Stat elementlari
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
const sendNotifyClassBtn = document.getElementById('sendNotifyClassBtn');
const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');

// Modal: Telefon raqamini tahrirlash
const phoneModal = document.getElementById('phoneModal');
const closePhoneModalBtn = document.getElementById('closePhoneModalBtn');
const phoneModalStudentName = document.getElementById('phoneModalStudentName');
const modalPhoneInput = document.getElementById('modalPhoneInput');
const savePhoneBtn = document.getElementById('savePhoneBtn');

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
  } else {
    toastIconEl.className = 'fa-solid fa-circle-info text-blue-400';
  }

  toastEl.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-[-20px]');
  toastEl.classList.add('opacity-100', 'translate-y-0');

  toastTimeout = setTimeout(() => {
    toastEl.classList.remove('opacity-100', 'translate-y-0');
    toastEl.classList.add('opacity-0', 'pointer-events-none', 'translate-y-[-20px]');
  }, 2500);
}

// Config yuklash
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

// Sinflar ro'yxatini yuklash
async function fetchClasses() {
  try {
    const res = await fetch('/api/classes');
    const result = await res.json();

    if (!result.success || !result.data || result.data.length === 0) {
      classesList.innerHTML = '<span class="text-xs text-slate-400">Sinflar mavjud emas</span>';
      return;
    }

    state.classes = result.data;
    renderClassesTabs();

    if (!state.currentClassId && state.classes.length > 0) {
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

// Tanlangan sinf o'quvchilari va davomatini yuklash
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

// O'quvchilar ro'yxatini DOM ga chiqarish
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
          ${query ? 'Qidiruv bo‘yicha o‘quvchi topilmadi' : 'Bu sinfda o‘quvchilar mavjud emas'}
        </p>
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

    // Profil holati nishoni (Badge)
    let statusBadgeHtml = '';
    if (student.parent_status === 'linked') {
      statusBadgeHtml = `
        <span class="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 shrink-0">
          <i class="fa-solid fa-circle text-[6px] text-emerald-500"></i> Telegram profili ulangan
        </span>
      `;
    } else if (student.parent_status === 'pending') {
      statusBadgeHtml = `
        <span class="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 shrink-0">
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
      <!-- O'quvchi ma'lumotlari va Telefon holati -->
      <div class="flex items-start justify-between gap-2 mb-2">
        <div class="flex items-start gap-2">
          <span class="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
            ${index + 1}
          </span>
          <div>
            <h3 class="text-xs font-bold text-slate-800 leading-tight">${student.full_name}</h3>
            
            <!-- Telefon raqam va tahrirlash tugmasi -->
            <div class="flex items-center gap-1.5 mt-1">
              <span class="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <i class="fa-solid fa-phone text-[9px] text-slate-400"></i>
                <span>${formatPhoneDisplay(student.parent_phone)}</span>
              </span>
              <button 
                type="button" 
                class="edit-phone-btn text-blue-600 hover:text-blue-700 p-0.5 text-[11px] transition"
                data-id="${student.id}" 
                data-name="${student.full_name}" 
                data-phone="${student.parent_phone || ''}"
                title="Raqamni tahrirlash"
              >
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
            </div>
          </div>
        </div>

        ${statusBadgeHtml}
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

      <!-- Izoh kiritish maydoni -->
      <div 
        id="reason-box-${student.id}" 
        class="mt-2.5 pt-2 border-t border-slate-100 ${showReason ? 'block' : 'hidden'}"
      >
        <input 
          type="text" 
          placeholder="Izoh / kechikish sababi (ixtiyoriy)..." 
          value="${currentAtt.reason || ''}"
          class="reason-input w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white transition"
          data-student-id="${student.id}"
        />
      </div>
    `;

    studentsContainer.appendChild(card);
  });

  attachStudentEventListeners();
}

function attachStudentEventListeners() {
  // Davomat tugmalari bosilganda
  const statusButtons = studentsContainer.querySelectorAll('.status-btn');
  statusButtons.forEach((btn) => {
    btn.onclick = () => {
      const studentId = parseInt(btn.getAttribute('data-student-id'), 10);
      const newStatus = btn.getAttribute('data-status');
      setStatus(studentId, newStatus);
    };
  });

  // Izoh o'zgarganda
  const reasonInputs = studentsContainer.querySelectorAll('.reason-input');
  reasonInputs.forEach((input) => {
    input.oninput = () => {
      const studentId = parseInt(input.getAttribute('data-student-id'), 10);
      if (state.attendanceMap[studentId]) {
        state.attendanceMap[studentId].reason = input.value;
      }
    };
  });

  // Telefon raqamini tahrirlash modalini ochish
  const editPhoneBtns = studentsContainer.querySelectorAll('.edit-phone-btn');
  editPhoneBtns.forEach((btn) => {
    btn.onclick = () => {
      const studentId = parseInt(btn.getAttribute('data-id'), 10);
      const studentName = btn.getAttribute('data-name');
      const currentPhone = btn.getAttribute('data-phone');
      openPhoneModal(studentId, studentName, currentPhone);
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

// Telefon raqamini tahrirlash modali
function openPhoneModal(studentId, studentName, currentPhone) {
  state.editingStudentId = studentId;
  phoneModalStudentName.innerHTML = `O‘quvchi: <b>${studentName}</b>`;
  modalPhoneInput.value = currentPhone || '';
  phoneModal.classList.remove('hidden');
  modalPhoneInput.focus();
  triggerHaptic('light');
}

closePhoneModalBtn.onclick = () => {
  phoneModal.classList.add('hidden');
  state.editingStudentId = null;
};

phoneModal.onclick = (e) => {
  if (e.target === phoneModal) {
    phoneModal.classList.add('hidden');
    state.editingStudentId = null;
  }
};

// Yangi telefon raqamini saqlash
savePhoneBtn.onclick = async () => {
  if (!state.editingStudentId) return;

  const newPhone = modalPhoneInput.value.trim();
  savePhoneBtn.disabled = true;
  savePhoneBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saqlanmoqda...`;

  try {
    const res = await fetch(`/api/students/${state.editingStudentId}/phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: newPhone })
    });
    const result = await res.json();

    if (result.success) {
      triggerHaptic('success');
      showToast('Telefon raqami muvaffaqiyatli saqlandi!');
      phoneModal.classList.add('hidden');
      state.editingStudentId = null;
      fetchStudents();
    } else {
      throw new Error(result.error || 'Xatolik');
    }
  } catch (err) {
    console.error('Phone save error:', err);
    showToast('Telefon raqamini saqlashda xatolik', 'error');
  } finally {
    savePhoneBtn.disabled = false;
    savePhoneBtn.innerHTML = `<i class="fa-solid fa-check"></i> Saqlash`;
  }
};

datePicker.onchange = () => {
  state.currentDate = datePicker.value;
  triggerHaptic('light');
  fetchStudents();
};

refreshBtn.onclick = () => {
  triggerHaptic('light');
  fetchStudents();
};

searchInput.oninput = (e) => {
  state.searchQuery = e.target.value;
  renderStudentsList();
};

(async function init() {
  await fetchConfig();
  await fetchClasses();
})();
