/**
 * FrontCraft Pro - Project #298: Flowchart Diagrammalar va Blok-Sxemalar Muharriri
 * Production-ready Reactive State Engine with SVG Data Visualization
 */

(function () {
  'use strict';

  // 1. REAKTIV STATE STORE (Observer Pattern)
  const Store = {
    state: {
      items: [
        { id: 1, name: "Boshlang'ich operatsiya", category: "Asosiy", amount: 260, priority: 2, date: "2026-10-02" },
        { id: 2, name: "Optimizatsiya jarayoni", category: "Texnik", amount: 195, priority: 3, date: "2026-10-05" },
        { id: 3, name: "Marketing tahlili", category: "Marketing", amount: 340, priority: 1, date: "2026-10-08" },
        { id: 4, name: "Foydalanuvchilar auditi", category: "Servis", amount: 160, priority: 2, date: "2026-10-11" }
      ],
      filter: '',
      theme: localStorage.getItem('theme_298') || 'dark'
    },
    listeners: [],

    subscribe(fn) {
      this.listeners.push(fn);
    },

    notify() {
      this.listeners.forEach(fn => fn(this.state));
    },

    addItem(item) {
      this.state.items.unshift(item);
      this.saveToStorage();
      this.notify();
    },

    deleteItem(id) {
      this.state.items = this.state.items.filter(i => i.id !== id);
      this.saveToStorage();
      this.notify();
    },

    clearAll() {
      this.state.items = [];
      this.saveToStorage();
      this.notify();
    },

    setFilter(query) {
      this.state.filter = query.toLowerCase();
      this.notify();
    },

    saveToStorage() {
      try {
        localStorage.setItem('data_298', JSON.stringify(this.state.items));
        localStorage.setItem('theme_298', this.state.theme);
      } catch (_) {}
    },

    loadFromStorage() {
      try {
        const raw = localStorage.getItem('data_298');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.state.items = parsed;
          }
        }
      } catch (_) {}
    }
  };

  // 2. DOM ELEMENTLARI CACHE
  const DOM = {};

  function initDOM() {
    DOM.primaryForm = document.getElementById('primaryForm');
    DOM.itemNameInput = document.getElementById('itemNameInput');
    DOM.itemNameError = document.getElementById('itemNameError');
    DOM.categoryInput = document.getElementById('categoryInput');
    DOM.amountInput = document.getElementById('amountInput');
    DOM.amountError = document.getElementById('amountError');
    DOM.priorityRange = document.getElementById('priorityRange');
    DOM.priorityValue = document.getElementById('priorityValue');
    DOM.refreshApiBtn = document.getElementById('refreshApiBtn');
    DOM.clearAllBtn = document.getElementById('clearAllBtn');
    DOM.exportCsvBtn = document.getElementById('exportCsvBtn');
    DOM.totalRecordsCount = document.getElementById('totalRecordsCount');
    DOM.averageMetricValue = document.getElementById('averageMetricValue');
    DOM.maxMetricValue = document.getElementById('maxMetricValue');
    DOM.svgChartContainer = document.getElementById('svgChartContainer');
    DOM.tableFilterInput = document.getElementById('tableFilterInput');
    DOM.tableResultsCount = document.getElementById('tableResultsCount');
    DOM.dataTableBody = document.getElementById('dataTableBody');
    DOM.themeToggleBtn = document.getElementById('themeToggleBtn');
  }

  // 3. FORM VALIDATSIYASI (Real-time Validation)
  function validateForm() {
    let isValid = true;
    const nameVal = DOM.itemNameInput.value.trim();
    const amountVal = parseFloat(DOM.amountInput.value);

    if (nameVal.length < 3) {
      DOM.itemNameError.textContent = "Nomi kamida 3 ta belgidan iborat bo'lishi kerak.";
      isValid = false;
    } else {
      DOM.itemNameError.textContent = '';
    }

    if (isNaN(amountVal) || amountVal <= 0) {
      DOM.amountError.textContent = "Iltimos, musbat son kiriting.";
      isValid = false;
    } else {
      DOM.amountError.textContent = '';
    }

    return isValid;
  }

  // 4. DINAMIK SVG GRAFIK CHIZISH (Data Visualization)
  function renderSvgChart(items) {
    if (!DOM.svgChartContainer) return;
    if (items.length === 0) {
      DOM.svgChartContainer.innerHTML = '<div style="text-align:center; padding-top:60px; color:var(--text-muted); font-size:0.85rem;">Ma\'lumot mavjud emas</div>';
      return;
    }

    const maxVal = Math.max(...items.map(i => i.amount), 1);
    const width = DOM.svgChartContainer.clientWidth || 600;
    const height = 180;
    const padding = 24;
    const barWidth = Math.max(14, Math.min(45, (width - padding * 2) / items.length - 8));

    let barsSvg = '';
    items.slice(0, 12).forEach((item, idx) => {
      const barHeight = Math.max(10, ((item.amount / maxVal) * (height - 60)));
      const x = padding + idx * (barWidth + 10);
      const y = height - padding - barHeight;

      barsSvg += `
        <g class="chart-bar-group" tabindex="0" role="graphics-symbol" aria-label="${item.name}: ${item.amount}">
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="url(#barGradient)" />
          <text x="${x + barWidth / 2}" y="${y - 6}" font-size="10" fill="var(--text-muted)" text-anchor="middle">${item.amount}</text>
          <text x="${x + barWidth / 2}" y="${height - 8}" font-size="9" fill="var(--text-muted)" text-anchor="middle">${item.name.slice(0, 5)}..</text>
        </g>
      `;
    });

    DOM.svgChartContainer.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0ea5e9" />
            <stop offset="100%" stop-color="#8b5cf6" />
          </linearGradient>
        </defs>
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="var(--border)" stroke-width="1" />
        ${barsSvg}
      </svg>
    `;
  }

  // 5. JADVALNI RENDER QILISH (Dynamic Table with Actions)
  function renderTable(items, query) {
    if (!DOM.dataTableBody) return;

    let filtered = items;
    if (query) {
      filtered = items.filter(i => 
        i.name.toLowerCase().includes(query) || 
        i.category.toLowerCase().includes(query)
      );
    }

    if (DOM.tableResultsCount) {
      DOM.tableResultsCount.textContent = filtered.length + " ta natija";
    }

    if (filtered.length === 0) {
      DOM.dataTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted);">Mos keluvchi yozuvlar topilmadi.</td></tr>';
      return;
    }

    DOM.dataTableBody.innerHTML = filtered.map(item => `
      <tr>
        <td><strong>#${item.id}</strong></td>
        <td>${escapeHtml(item.name)}</td>
        <td><span class="badge tech-badge">${escapeHtml(item.category)}</span></td>
        <td><strong style="color:var(--primary);">$${item.amount}</strong></td>
        <td><span style="color:var(--text-muted); font-size:0.8rem;">${item.date}</span></td>
        <td>
          <button class="btn btn-small btn-danger delete-btn" data-id="${item.id}" aria-label="O'chirish">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `).join('');

    DOM.dataTableBody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.dataset.id, 10);
        Store.deleteItem(id);
      };
    });
  }

  // 6. ASINXRON MOCK API CHAQIRUV (Async API simulation)
  async function fetchMockApiData() {
    if (DOM.refreshApiBtn) {
      DOM.refreshApiBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Yuklanmoqda...';
      DOM.refreshApiBtn.disabled = true;
    }

    await new Promise(r => setTimeout(r, 600));

    const mockTitles = ["Telemetriya oqimi", "Kriptografik shifrlash", "Baza optimizatsiyasi", "Yangi marshrut tahlili"];
    const randomTitle = mockTitles[Math.floor(Math.random() * mockTitles.length)];
    const randomAmount = Math.floor(Math.random() * 320) + 110;
    const cats = ["Asosiy", "Texnik", "Marketing", "Servis"];

    Store.addItem({
      id: Date.now(),
      name: randomTitle,
      category: cats[Math.floor(Math.random() * cats.length)],
      amount: randomAmount,
      priority: Math.floor(Math.random() * 3) + 1,
      date: new Date().toISOString().split('T')[0]
    });

    if (DOM.refreshApiBtn) {
      DOM.refreshApiBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Yangilash';
      DOM.refreshApiBtn.disabled = false;
    }
  }

  // 7. CSV EKSPORT FUNKSIYASI (Data Export)
  function exportToCsv() {
    if (!Store.state.items.length) {
      alert("Eksport qilish uchun ma'lumot mavjud emas.");
      return;
    }

    let csv = "ID,Nomi,Kategoriya,Miqdor,Sana\n";
    Store.state.items.forEach(i => {
      csv += `${i.id},"${i.name}",${i.category},${i.amount},${i.date}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "loyiha_298_hisobot.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // 8. METRIKALARNI YANGILASH (KPI Calculation)
  function updateMetrics(items) {
    if (DOM.totalRecordsCount) DOM.totalRecordsCount.textContent = items.length;
    if (DOM.averageMetricValue) {
      const avg = items.length ? Math.round(items.reduce((s, i) => s + i.amount, 0) / items.length) : 0;
      DOM.averageMetricValue.textContent = '$' + avg;
    }
    if (DOM.maxMetricValue) {
      const max = items.length ? Math.max(...items.map(i => i.amount)) : 0;
      DOM.maxMetricValue.textContent = '$' + max;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // 9. REAKTIV OBUNA BO'YICHA INTERFEYSNI YANGILASH
  Store.subscribe(state => {
    updateMetrics(state.items);
    renderSvgChart(state.items);
    renderTable(state.items, state.filter);
  });

  // 10. HODISALARNI SOZLASH (Event Listeners)
  function initEvents() {
    if (DOM.primaryForm) {
      DOM.primaryForm.onsubmit = e => {
        e.preventDefault();
        if (!validateForm()) return;

        const newItem = {
          id: Date.now(),
          name: DOM.itemNameInput.value.trim(),
          category: DOM.categoryInput.value,
          amount: parseFloat(DOM.amountInput.value),
          priority: parseInt(DOM.priorityRange.value, 10),
          date: new Date().toISOString().split('T')[0]
        };

        Store.addItem(newItem);
        DOM.primaryForm.reset();
        if (DOM.priorityValue) DOM.priorityValue.textContent = "O'rta";
      };
    }

    if (DOM.priorityRange && DOM.priorityValue) {
      DOM.priorityRange.oninput = e => {
        const val = parseInt(e.target.value, 10);
        const labels = { 1: "Past", 2: "O'rta", 3: "Yuqori" };
        DOM.priorityValue.textContent = labels[val] || "O'rta";
      };
    }

    if (DOM.refreshApiBtn) DOM.refreshApiBtn.onclick = fetchMockApiData;
    if (DOM.clearAllBtn) {
      DOM.clearAllBtn.onclick = () => {
        if (confirm("Barcha ma'lumotlarni tozalashni xohlaysizmi?")) Store.clearAll();
      };
    }

    if (DOM.exportCsvBtn) DOM.exportCsvBtn.onclick = exportToCsv;

    if (DOM.tableFilterInput) {
      DOM.tableFilterInput.oninput = e => {
        Store.setFilter(e.target.value.trim());
      };
    }

    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.onclick = () => {
        Store.state.theme = Store.state.theme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', Store.state.theme);
        DOM.themeToggleBtn.innerHTML = Store.state.theme === 'dark' 
          ? '<i class="fa-solid fa-moon"></i>' 
          : '<i class="fa-solid fa-sun"></i>';
        Store.saveToStorage();
      };
    }

    // SPA Tab Navigation
    document.querySelectorAll('.spa-nav-link').forEach(link => {
      link.onclick = (e) => {
        document.querySelectorAll('.spa-nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      };
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (DOM.primaryForm) DOM.primaryForm.reset();
      }
    });
  }

  // ILovani ishga tushirish
  document.addEventListener('DOMContentLoaded', () => {
    initDOM();
    Store.loadFromStorage();
    document.body.setAttribute('data-theme', Store.state.theme);
    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.innerHTML = Store.state.theme === 'dark' 
        ? '<i class="fa-solid fa-moon"></i>' 
        : '<i class="fa-solid fa-sun"></i>';
    }
    initEvents();
    Store.notify();
  });

})();
