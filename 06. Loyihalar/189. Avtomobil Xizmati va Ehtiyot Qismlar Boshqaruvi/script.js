/**
 * Avtomobil Xizmati va Ehtiyot Qismlar Boshqaruvi - FrontCraft Pro Platformasi
 * Loyiha ID: 189 | Daraja: O'rta (Intermediate)
 * Xususiyatlar: SPA Routing, Asinxron API, Reaktiv State, SVG Grafik, Validatsiya
 */

(function () {
  'use strict';

  // 1. REAKTIV STATE STORE (Centralized State Management)
  const STORAGE_KEY = 'frontcraft_project_189_store';

  const Store = {
    state: {
      items: [
        { id: 1, name: "Boshlang'ich operatsiya", category: "asosiy", amount: 120, priority: 2, date: "2026-10-01" },
        { id: 2, name: "SEO va Marketing xarajati", category: "marketing", amount: 240, priority: 3, date: "2026-10-05" },
        { id: 3, name: "Server infratuzilmasi", category: "texnik", amount: 180, priority: 2, date: "2026-10-09" }
      ],
      filter: "",
      theme: "dark",
      activeRoute: "dashboard"
    },
    listeners: [],
    subscribe: function (fn) {
      this.listeners.push(fn);
    },
    notify: function () {
      this.listeners.forEach(fn => fn(this.state));
      this.saveToStorage();
    },
    addItem: function (item) {
      this.state.items.unshift(item);
      this.notify();
    },
    removeItem: function (id) {
      this.state.items = this.state.items.filter(i => i.id !== id);
      this.notify();
    },
    clearAll: function () {
      this.state.items = [];
      this.notify();
    },
    setFilter: function (q) {
      this.state.filter = q;
      this.notify();
    },
    saveToStorage: function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.warn('Storage save error:', e);
      }
    },
    loadFromStorage: function () {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          Object.assign(this.state, parsed);
        }
      } catch (e) {
        console.warn('Storage load error:', e);
      }
    }
  };

  // 2. DOM ELEMENTLARI CACHE
  const DOM = {
    primaryForm: document.getElementById('primaryForm'),
    itemNameInput: document.getElementById('itemNameInput'),
    categoryInput: document.getElementById('categoryInput'),
    amountInput: document.getElementById('amountInput'),
    priorityRange: document.getElementById('priorityRange'),
    priorityValue: document.getElementById('priorityValue'),
    itemNameError: document.getElementById('itemNameError'),
    amountError: document.getElementById('amountError'),
    refreshApiBtn: document.getElementById('refreshApiBtn'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    totalRecordsCount: document.getElementById('totalRecordsCount'),
    averageMetricValue: document.getElementById('averageMetricValue'),
    dynamicSvgChart: document.getElementById('dynamicSvgChart'),
    dataTableList: document.getElementById('dataTableList'),
    tableFilterInput: document.getElementById('tableFilterInput'),
    spaNavLinks: document.querySelectorAll('.spa-nav-link')
  };

  // 3. SPA HASH ROUTING (Hash Navigation)
  function initRouter() {
    function handleRoute() {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      Store.state.activeRoute = hash;
      DOM.spaNavLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.view === hash);
      });
    }
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  // 4. ASINXRON MOCK API INTEGRATSIYASI (Fetch Simulator)
  async function fetchMockApiData() {
    if (DOM.refreshApiBtn) {
      DOM.refreshApiBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Yuklanmoqda...';
      DOM.refreshApiBtn.disabled = true;
    }

    try {
      // Simulyatsiya qilingan tarmoq kechikishi
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const sampleNames = ["Foydalanuvchi obunasi", "Logistika yetkazish", "Bulutli xotira litsenziyasi", "Xizmat auditi"];
      const sampleCategories = ["asosiy", "marketing", "texnik", "xizmat"];
      const randomItem = {
        id: Date.now(),
        name: sampleNames[Math.floor(Math.random() * sampleNames.length)],
        category: sampleCategories[Math.floor(Math.random() * sampleCategories.length)],
        amount: Math.floor(Math.random() * 400) + 50,
        priority: Math.floor(Math.random() * 3) + 1,
        date: new Date().toISOString().split('T')[0]
      };

      Store.addItem(randomItem);
    } catch (e) {
      alert("API ma'lumotlarini yuklashda xatolik: " + e.message);
    } finally {
      if (DOM.refreshApiBtn) {
        DOM.refreshApiBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Yangilash';
        DOM.refreshApiBtn.disabled = false;
      }
    }
  }

  // 5. FORM REAL-TIME VALIDATSIYASI (Validation Engine)
  function validateForm() {
    let isValid = true;
    const name = DOM.itemNameInput.value.trim();
    const amount = parseFloat(DOM.amountInput.value);

    // Nom tekshiruvi (kamida 3 belgi)
    if (!name || name.length < 3) {
      DOM.itemNameError.textContent = "Nom kamida 3 ta belgidan iborat bo'lishi kerak.";
      isValid = false;
    } else {
      DOM.itemNameError.textContent = "";
    }

    // Miqdor tekshiruvi (musbat son)
    if (isNaN(amount) || amount <= 0) {
      DOM.amountError.textContent = "Miqdor musbat raqam bo'lishi shart.";
      isValid = false;
    } else {
      DOM.amountError.textContent = "";
    }

    return isValid;
  }

  // 6. DINAMIK SVG GRAFIK CHIZISH (SVG Data Visualization)
  function renderSvgChart(items) {
    if (!DOM.dynamicSvgChart) return;
    const svg = DOM.dynamicSvgChart;
    svg.innerHTML = '';

    if (!items.length) {
      svg.innerHTML = '<text x="250" y="80" text-anchor="middle" fill="#64748b" font-size="14">Grafik uchun ma\'lumotlar mavjud emas</text>';
      return;
    }

    const maxVal = Math.max(...items.map(i => i.amount), 1);
    const chartHeight = 130;
    const barWidth = Math.min(400 / items.length, 36);
    const startX = 30;

    items.slice(0, 10).forEach((item, idx) => {
      const height = (item.amount / maxVal) * chartHeight;
      const x = startX + idx * (barWidth + 12);
      const y = 150 - height;

      // Ustun to'rtburchagi
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', barWidth);
      rect.setAttribute('height', height);
      rect.setAttribute('rx', '4');
      rect.setAttribute('fill', idx % 2 === 0 ? '#38bdf8' : '#6366f1');
      rect.setAttribute('opacity', '0.85');
      
      // Ustun tepasidagi qiymat yozuvi
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x + barWidth / 2);
      text.setAttribute('y', y - 4);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#94a3b8');
      text.setAttribute('font-size', '10');
      text.textContent = item.amount;

      svg.appendChild(rect);
      svg.appendChild(text);
    });
  }

  // 7. RO'YXATNI RENDER QILISH (Data Table Rendering)
  function renderTable(items, filter) {
    if (!DOM.dataTableList) return;

    let filtered = items;
    if (filter) {
      const q = filter.toLowerCase();
      filtered = items.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }

    if (!filtered.length) {
      DOM.dataTableList.innerHTML = '<li class="empty-list-item">Mos keluvchi yozuvlar topilmadi.</li>';
      return;
    }

    DOM.dataTableList.innerHTML = filtered.map(item => `
      <li class="data-item-card" data-id="${item.id}">
        <div class="item-left">
          <span class="item-badge">${item.category.toUpperCase()}</span>
          <span><strong>${escapeHtml(item.name)}</strong></span>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <span class="item-val">$${item.amount}</span>
          <button class="btn btn-small btn-danger delete-item-btn" data-del="${item.id}" aria-label="O'chirish">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </li>
    `).join('');

    DOM.dataTableList.querySelectorAll('.delete-item-btn').forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.dataset.del, 10);
        Store.removeItem(id);
      };
    });
  }

  // 8. CSV EKSPORT FUNKSIYASI (Export Feature)
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
    a.download = "loyiha_189_hisobot.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // 9. METRIKALARNI YANGILASH (KPI Calculation)
  function updateMetrics(items) {
    if (DOM.totalRecordsCount) DOM.totalRecordsCount.textContent = items.length;
    if (DOM.averageMetricValue) {
      const avg = items.length ? Math.round(items.reduce((s, i) => s + i.amount, 0) / items.length) : 0;
      DOM.averageMetricValue.textContent = '$' + avg;
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

  // 10. REAKTIV OBUNA BO'YICHA INTERFEYSNI YANGILASH
  Store.subscribe(state => {
    updateMetrics(state.items);
    renderSvgChart(state.items);
    renderTable(state.items, state.filter);
  });

  // 11. HODISALARNI SOZLASH (Event Listeners Setup)
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
  }

  // Dasturni ishga tushirish
  document.addEventListener('DOMContentLoaded', () => {
    Store.loadFromStorage();
    document.body.setAttribute('data-theme', Store.state.theme);
    initRouter();
    initEvents();
    Store.notify(); // Dastlabki render
  });
})();
