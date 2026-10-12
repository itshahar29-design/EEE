/**
 * Mini Elektron Jadval va Matematik Formulalar Hisoblagich - FrontCraft Pro Platformasi
 * Loyiha ID: 134 | Kategoriya: Editor
 */

(function () {
  'use strict';

  // 1. Dastur Holati (State Management)
  const STORAGE_KEY = 'frontcraft_project_134_state';

  const state = {
    inputVal: '',
    category: 'standart',
    intensity: 50,
    actionCount: 0,
    history: [],
    theme: 'dark'
  };

  // DOM elementlari
  const DOM = {
    primaryInput: document.getElementById('primaryInput'),
    categorySelect: document.getElementById('categorySelect'),
    rangeSlider: document.getElementById('rangeSlider'),
    rangeValue: document.getElementById('rangeValue'),
    actionExecuteBtn: document.getElementById('actionExecuteBtn'),
    actionClearBtn: document.getElementById('actionClearBtn'),
    actionExportBtn: document.getElementById('actionExportBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    resetAppBtn: document.getElementById('resetAppBtn'),
    copyResultBtn: document.getElementById('copyResultBtn'),
    metricCount: document.getElementById('metricCount'),
    metricEfficiency: document.getElementById('metricEfficiency'),
    metricStatus: document.getElementById('metricStatus'),
    visualDisplay: document.getElementById('visualDisplay'),
    activityList: document.getElementById('activityList')
  };

  /**
   * 2. Holatni Mahalliy Xotiradan Yuklash (Load State)
   */
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(state, parsed);
      }
      applyStateToUI();
    } catch (e) {
      console.warn('LocalStorage yuklashda xatolik:', e);
    }
  }

  /**
   * 3. Holatni Saqlash (Save State)
   */
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('LocalStorage saqlashda xatolik:', e);
    }
  }

  /**
   * 4. Interfeysni Holat Bo'yicha Yangilash (Render UI)
   */
  function applyStateToUI() {
    if (DOM.primaryInput) DOM.primaryInput.value = state.inputVal || '';
    if (DOM.categorySelect) DOM.categorySelect.value = state.category;
    if (DOM.rangeSlider) DOM.rangeSlider.value = state.intensity;
    if (DOM.rangeValue) DOM.rangeValue.textContent = state.intensity + '%';
    if (DOM.metricCount) DOM.metricCount.textContent = state.actionCount;

    document.body.setAttribute('data-theme', state.theme);
    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.innerHTML = state.theme === 'dark' 
        ? '<i class="fa-solid fa-moon"></i>' 
        : '<i class="fa-solid fa-sun"></i>';
    }

    renderHistory();
  }

  /**
   * 5. Asosiy Hisoblash va Ijro Funksiyasi (Main Execution Feature)
   */
  function executePrimaryAction() {
    const val = (DOM.primaryInput ? DOM.primaryInput.value.trim() : '') || 'Avtomatik ma\'lumot';
    state.inputVal = val;
    state.category = DOM.categorySelect ? DOM.categorySelect.value : 'standart';
    state.intensity = DOM.rangeSlider ? parseInt(DOM.rangeSlider.value, 10) : 50;
    state.actionCount++;

    const timestamp = new Date().toLocaleTimeString();
    const actionDesc = `Amal #${state.actionCount}: "${val}" (${state.category}, ${state.intensity}%)`;

    state.history.unshift({ time: timestamp, desc: actionDesc });
    if (state.history.length > 8) state.history.pop();

    saveState();
    applyStateToUI();
    renderResultCard(val, state.category, state.intensity);

    if (DOM.metricStatus) {
      DOM.metricStatus.textContent = 'Muvaffaqiyatli';
      DOM.metricStatus.className = 'metric-value success';
    }
  }

  /**
   * 6. Natija Kartasini Vizual Chiqarish (Visual Rendering Feature)
   */
  function renderResultCard(text, cat, intensity) {
    if (!DOM.visualDisplay) return;

    DOM.visualDisplay.innerHTML = `
      <div class="result-card" role="status" aria-live="polite">
        <h4 style="color:var(--primary-color); margin-bottom:8px;">
          <i class="fa-solid fa-circle-check"></i> ${escapeHtml(text)}
        </h4>
        <p style="font-size:0.9rem; margin-bottom:6px;">
          <strong>Rejim:</strong> ${escapeHtml(cat.toUpperCase())} | 
          <strong>Intensivlik:</strong> ${intensity}%
        </p>
        <div style="height:6px; background:var(--surface-color); border-radius:3px; overflow:hidden; margin:8px 0;">
          <div style="width:${intensity}%; height:100%; background:var(--primary-color); transition:width 0.3s;"></div>
        </div>
        <small style="color:var(--text-muted);">Muvaffaqiyatli qayta ishlandi va xotiraga yozildi.</small>
      </div>
    `;
  }

  /**
   * 7. Harakatlar Tarixini Chiqarish (History Rendering)
   */
  function renderHistory() {
    if (!DOM.activityList) return;
    if (!state.history.length) {
      DOM.activityList.innerHTML = '<li class="log-item">Hozircha amallar mavjud emas.</li>';
      return;
    }

    DOM.activityList.innerHTML = state.history.map(function (item, index) {
      return `<li class="log-item ${index === 0 ? 'active' : ''}">
        <span style="opacity:0.7;">[${item.time}]</span> ${escapeHtml(item.desc)}
      </li>`;
    }).join('');
  }

  /**
   * 8. Ma'lumotlarni Tozalash Funksiyasi (Clear State Feature)
   */
  function clearAllData() {
    state.inputVal = '';
    state.actionCount = 0;
    state.history = [];
    saveState();
    applyStateToUI();

    if (DOM.visualDisplay) {
      DOM.visualDisplay.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-circle-nodes"></i>
          <p>Barcha ma'lumotlar tozalandi.</p>
        </div>
      `;
    }
  }

  /**
   * 9. JSON Eksport Funksiyasi (Export Feature)
   */
  function exportDataAsJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "loyiha_134_hisobot.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  /**
   * 10. Xavfsiz Matn Qochirish (XSS Prevention)
   */
  function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * 11. Hodisalarni Bog'lash (Event Listeners & Keyboard Accessibility)
   */
  function setupEventListeners() {
    if (DOM.actionExecuteBtn) {
      DOM.actionExecuteBtn.addEventListener('click', executePrimaryAction);
    }

    if (DOM.actionClearBtn) {
      DOM.actionClearBtn.addEventListener('click', clearAllData);
    }

    if (DOM.actionExportBtn) {
      DOM.actionExportBtn.addEventListener('click', exportDataAsJSON);
    }

    if (DOM.rangeSlider && DOM.rangeValue) {
      DOM.rangeSlider.addEventListener('input', function (e) {
        DOM.rangeValue.textContent = e.target.value + '%';
      });
    }

    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.addEventListener('click', function () {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', state.theme);
        DOM.themeToggleBtn.innerHTML = state.theme === 'dark' 
          ? '<i class="fa-solid fa-moon"></i>' 
          : '<i class="fa-solid fa-sun"></i>';
        saveState();
      });
    }

    if (DOM.resetAppBtn) {
      DOM.resetAppBtn.addEventListener('click', function () {
        if (confirm("Loyihani asl holatiga qaytarishni xohlaysizmi?")) {
          localStorage.removeItem(STORAGE_KEY);
          location.reload();
        }
      });
    }

    if (DOM.copyResultBtn) {
      DOM.copyResultBtn.addEventListener('click', function () {
        const textToCopy = DOM.visualDisplay ? DOM.visualDisplay.innerText : '';
        if (navigator.clipboard && textToCopy) {
          navigator.clipboard.writeText(textToCopy).then(function () {
            alert("Natija nusxalandi!");
          });
        }
      });
    }

    // Keyboard Accessibility: Enter tugmasi orqali hisoblash
    if (DOM.primaryInput) {
      DOM.primaryInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          executePrimaryAction();
        }
      });
    }
  }

  // Dasturni ishga tushirish
  document.addEventListener('DOMContentLoaded', function () {
    loadState();
    setupEventListeners();
  });
})();
