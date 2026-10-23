/**
 * EduMemory — 65-maktab Davomat Tizimi
 * Telegram Mini App Frontend Logic
 */

// 1. Telegram WebApp obyektini initsializatsiya qilish
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();

  // Telegram qorong'i mavzusini tekshirish
  if (tg.colorScheme === 'dark') {
    document.body.classList.add('telegram-dark');
  }

  // Telegram yuqori sarlavha rangini o'rnatish
  try {
    tg.setHeaderColor?.('#ffffff');
    tg.setBackgroundColor?.('#f8fafc');
  } catch (e) {
    console.warn('Telegram setHeaderColor qo‘llab-quvvatlanmadi:', e);
  }
}

// Haptic feedback chaqiruvchisi
function triggerHaptic(type = 'light') {
  try {
    if (tg?.HapticFeedback) {
      if (type === 'success' || type === 'error' || type === 'warning') {
        tg.HapticFeedback.notificationOccurred(type);
      } else {
        tg.HapticFeedback.impactOccurred(type);
      }
    }
  } catch (e) {
    // Brauzerda xatolik bermasligi uchun
  }
}

// 2. Ilova holati (State)
const state = {
  classes: [],
  currentClassId: null,
  currentClassName: '',
  currentDate: new Date().toISOString().split('T')[0],
  students: [],
  attendanceMap: {}, // student_id -> { status: 'keldi'|'kelmadi'|'kechikdi'|'sababli', reason: '' }
  botUsername: '',
  schoolName: "65-umumiy o'rta ta'lim maktabi",
  searchQuery: ''
};

// 3. DOM elementlarini tanlab olish
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
const markedCountEl = document.getElementById('markedCount');
const totalCountEl = document.getElementById('totalCount');

// Tugmalar
const markAllPresentBtn = document.getElementById('markAllPresentBtn');
const sendNotifyClassBtn = document.getElementById('sendNotifyClassBtn');
const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');

// Modal elementlari
const linkModal = document.getElementById('linkModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalStudentName = document.getElementById('modalStudentName');
const modalDeepLinkInput = document.getElementById('modalDeepLinkInput');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const shareLinkBtn = document.getElementById('shareLinkBtn');

// Toast
const toastEl = document.getElementById('toast');
const toastMessageEl = document.getElementById('toastMessage');
const toastIconEl = document.getElementById('toastIcon');

// 4. Toast bildirishnomasi
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

// 5. Tizim konfiguratsiyasini yuklash
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
    console.error('Config fetch xatosi:', err);
    datePicker.value = state.currentDate;
  }
}

// 6. Sinflar ro'yxatini yuklash
async function fetchClasses() {
  try {
    classesList.innerHTML = `
      <div class="flex gap-2">
        <div class="h-9 w-16 bg-slate-200 animate-pulse rounded-xl"></div>
        <div class="h-9 w-16 bg-slate-200 animate-pulse rounded-xl"></div>
        <div class="h-9 w-16 bg-slate-200 animate-pulse rounded-xl"></div>
      </div>
    `;

    const res = await fetch('/api/classes');
    const result = await res.json();

    if (!result.success || !result.data || result.data.length === 0) {
      classesList.innerHTML = '<span class="text-xs text-slate-400">Sinflar mavjud emas</span>';
      return;
    }

    state.classes = result.data;
    renderClassesTabs();

    // Dastlabki sinfni tanlash
    if (!state.currentClassId && state.classes.length > 0) {
      selectClass(state.classes[0].id, state.classes[0].name);
    }
  } catch (err) {
    console.error('Classes fetch error:', err);
    showToast('Sinflarni yuklab bo‘lmadi', 'error');
  }
}

// Sinflar tablarini chizish
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

// Sinfni tanlash
function selectClass(classId, className) {
  state.currentClassId = classId;
  state.currentClassName = className;
  currentClassNameEl.textContent = className;
  renderClassesTabs();
  fetchStudents();
}

// 7. Tanlangan sinf o'quvchilari va davomatini yuklash
async function fetchStudents() {
  if (!state.currentClassId) return;

  studentsContainer.innerHTML = `
    <div class="text-center py-12 text-slate-400 text-sm">
      <i class="fa-solid fa-spinner fa-spin text-2xl mb-2 text-blue-500"></i>
      <p>${state.currentClassName} sinfi o‘quvchilari yuklanmoqda...</p>
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

    // Mavjud davomat ma'lumotlarini statega yuklash
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

// 8. O'quvchilar ro'yxatini DOMga render qilish
function renderStudentsList() {
  const query = state.searchQuery.toLowerCase().trim();
  const filteredStudents = state.students.filter((s) =>
    s.full_name.toLowerCase().includes(query)
  );

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
    const isParentLinked = student.is_parent_linked === 1;

    const card = document.createElement('div');
    card.className =
      'student-card bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs transition-all';
    card.id = `student-card-${student.id}`;

    // Ota-ona biriktirilganligi holati
    const parentBadgeHtml = isParentLinked
      ? `<span class="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
           <i class="fa-solid fa-circle text-[6px] text-emerald-500"></i> Ota-ona ulangan
         </span>`
      : `<button 
           class="open-link-modal-btn inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200/60 transition active:scale-95"
           data-id="${student.id}" 
           data-name="${student.full_name}"
         >
           <i class="fa-solid fa-link text-[9px]"></i> Ota-onani ulash
         </button>`;

    // Sabab/Izoh kiritish maydoni (faqat kechikdi yoki sababli bo'lganda ko'rinadi)
    const showReason = currentAtt.status === 'kechikdi' || currentAtt.status === 'sababli';

    card.innerHTML = `
      <!-- O'quvchi ma'lumotlari -->
      <div class="flex items-start justify-between gap-2 mb-2.5">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
            ${index + 1}
          </span>
          <div>
            <h3 class="text-xs font-bold text-slate-800 leading-tight">${student.full_name}</h3>
            ${student.parent_phone ? `<p class="text-[10px] text-slate-400">${student.parent_phone}</p>` : ''}
          </div>
        </div>
        ${parentBadgeHtml}
      </div>

      <!-- Davomat tugmalari: [Keldi], [Kelmadi], [Kechikdi], [Sababli] -->
      <div class="grid grid-cols-4 gap-1.5">
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
          <div class="text-[11px]">⏰ Kechikdi</div>
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

      <!-- Izoh / Sabab kiritish maydoni -->
      <div 
        id="reason-box-${student.id}" 
        class="mt-2.5 pt-2 border-t border-slate-100 ${showReason ? 'block' : 'hidden'}"
      >
        <div class="relative">
          <input 
            type="text" 
            placeholder="Izoh / kechikish sababi (ixtiyoriy)..." 
            value="${currentAtt.reason || ''}"
            class="reason-input w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white transition"
            data-student-id="${student.id}"
          />
        </div>
      </div>
    `;

    studentsContainer.appendChild(card);
  });

  attachStudentEventListeners();
}

// 9. O'quvchi kartochkalari hodisalari
function attachStudentEventListeners() {
  // Davomat tugmalari bosilganda
  const statusButtons = studentsContainer.querySelectorAll('.status-btn');
  statusButtons.forEach((btn) => {
    btn.onclick = (e) => {
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

  // Ota-onani ulash modalini ochish
  const linkModalBtns = studentsContainer.querySelectorAll('.open-link-modal-btn');
  linkModalBtns.forEach((btn) => {
    btn.onclick = () => {
      const studentId = btn.getAttribute('data-id');
      const studentName = btn.getAttribute('data-name');
      openLinkModal(studentId, studentName);
    };
  });
}

// 10. Davomat holatini yangilash
function setStatus(studentId, status) {
  triggerHaptic('light');

  if (!state.attendanceMap[studentId]) {
    state.attendanceMap[studentId] = { status: null, reason: '' };
  }

  // Agar xuddi shu status qayta bosilsa, holatni bekor qilish imkoniyati
  if (state.attendanceMap[studentId].status === status) {
    state.attendanceMap[studentId].status = null;
  } else {
    state.attendanceMap[studentId].status = status;
  }

  // UI dagi tugmalar holatini yangilash
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

    // Izoh inputini ko'rsatish yoki yashirish
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

// 11. Statistikani qayta hisoblash
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

  // Telegram MainButton ni sinxronlashtirish
  if (tg?.MainButton) {
    if (marked > 0) {
      tg.MainButton.setText(`💾 DAVOMATNI SAQLASH (${marked}/${state.students.length})`);
      tg.MainButton.show();
    } else {
      tg.MainButton.hide();
    }
  }
}

// 12. Barchasini "Keldi" deb belgilash
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

// 13. Davomatni saqlash (Backend API ga yuborish)
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
      headers: {
        'Content-Type': 'application/json'
      },
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
      // Qayta yuklash
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

// 14. Ota-onalarga ushbu sinf uchun zudlik bilan xabar yuborish
sendNotifyClassBtn.onclick = async () => {
  if (!state.currentClassId) return;

  const confirmMsg = `${state.currentClassName} sinfida ota-onalari biriktirilgan barcha o‘quvchilar uchun Telegram orqali bildirishnoma yuborilsinmi?`;
  
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

// 15. Ota-onani ulash Deep Link Modali
function openLinkModal(studentId, studentName) {
  modalStudentName.innerHTML = `O‘quvchi: <b>${studentName}</b>`;
  const botUser = state.botUsername || 'EduMemoryBot';
  const deepLink = `https://t.me/${botUser}?start=student_${studentId}`;

  modalDeepLinkInput.value = deepLink;
  linkModal.classList.remove('hidden');
  triggerHaptic('light');
}

closeModalBtn.onclick = () => {
  linkModal.classList.add('hidden');
};

linkModal.onclick = (e) => {
  if (e.target === linkModal) linkModal.classList.add('hidden');
};

// Havolani nusxalash
copyLinkBtn.onclick = async () => {
  try {
    await navigator.clipboard.writeText(modalDeepLinkInput.value);
    triggerHaptic('success');
    showToast('Havola buferga nusxalandi!', 'success');
  } catch (err) {
    modalDeepLinkInput.select();
    document.execCommand('copy');
    showToast('Havola nusxalandi!', 'success');
  }
};

// Havolani ulashish (Share)
shareLinkBtn.onclick = () => {
  const deepLink = modalDeepLinkInput.value;
  const shareText = `Hurmatli ota-ona! 65-maktab "EduMemory" davomat tizimida farzandingiz profiliga ulanish uchun quyidagi havola ustiga bosing:\n${deepLink}`;

  if (tg?.openTelegramLink) {
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(deepLink)}&text=${encodeURIComponent(shareText)}`);
  } else if (navigator.share) {
    navigator.share({
      title: 'EduMemory - 65-maktab',
      text: shareText,
      url: deepLink
    }).catch(() => {});
  } else {
    copyLinkBtn.click();
  }
};

// 16. Sana o'zgarganda qayta yuklash
datePicker.onchange = () => {
  state.currentDate = datePicker.value;
  triggerHaptic('light');
  fetchStudents();
};

// Yangilash tugmasi
refreshBtn.onclick = () => {
  triggerHaptic('light');
  fetchStudents();
};

// Qidiruv maydoni
searchInput.oninput = (e) => {
  state.searchQuery = e.target.value;
  renderStudentsList();
};

// 17. Ilovani dastlabki ishga tushirish
(async function init() {
  await fetchConfig();
  await fetchClasses();
})();
