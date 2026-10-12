/**
 * FrontCraft Pro Platform - Main Projects Engine
 * YouTube-style catalog, rich project cards, Studio modal, JSZip downloads & PWA
 */

(function () {
  'use strict';

  // 1. i18n Tarjimalar lug'ati (UZ, RU, EN)
  const I18N = {
    uz: {
      siteTitle: "FrontCraft Pro",
      siteSubtitle: "Frontend Dasturchilar Platformasi",
      searchPlaceholder: "Loyiha, texnologiya yoki vazifasi bo'yicha qidiring... (/)",
      heroBadge: "10X FRONTEND PLATFORMA",
      heroTitle: "Dasturchilar Uchun <span>Frontend Loyihalar</span> Markazi",
      heroDesc: "200+ dan ortiq tayyor real portfolio loyihalari, bosqichma-bosqich darslar va kodlar ombori.",
      lessonsCardTitle: "Interaktiv Darslar",
      lessonsCardDesc: "Boshlang'ichdan professionalgacha ketma-ket 278+ dars, tushuntirishlar va amaliy mashqlar.",
      lessonsCardAction: "Darslar Sahifasiga o'tish →",
      projectsCardTitle: "Tayyor Portfolio Loyihalar",
      projectsCardDesc: "YouTube uslubidagi katalog, jonli hover preview, to'liq kod va 1-bosishda ZIP yuklab olish.",
      projectsCardAction: "Loyihalarni ko'rish →",
      statsProjects: "Real Loyihalar",
      statsLessons: "Interaktiv Darslar",
      statsDownloads: "Yuklab Olishlar",
      statsRating: "Jamoa Bahosi",
      continueTitle: "Oxirgi ko'rilgan loyiha",
      continueAction: "Davom ettirish →",
      categoriesHeading: "Kategoriyalar",
      allCategory: "Barcha Loyihalar",
      favoritesCategory: "Sevimli Loyihalar",
      historyCategory: "Ko'rilganlar Tarixi",
      allLevels: "Barcha darajalar",
      levelBasic: "Boshlang'ich",
      levelMid: "O'rta",
      levelAdv: "Murakkab",
      sortNewest: "Yangi loyihalar",
      sortPopular: "Eng mashhur",
      sortDownloads: "Ko'p yuklangan",
      tabPreview: "Jonli Ko'rish",
      tabCode: "Manba Kodi",
      tabLesson: "Dars Rejasi",
      tabReadme: "Hujjatlar (README)",
      copyCode: "Kodni nusxalash",
      downloadZip: "ZIP Yuklab Olish",
      openNewTab: "Yangi oynada",
      markCompleted: "O'zlashtirildi deb belgilash",
      completedBadge: "O'zlashtirildi",
      relatedHeading: "O'xshash loyihalar",
      toastCopied: "Kod clipboardga nusxalandi!",
      toastCompleted: "Loyiha muvaffaqiyatli yakunlandi! 🎉",
      emptyProjects: "Mos keluvchi loyihalar topilmadi",
      quickView: "Jonli Ko'rish",
      quickZip: "ZIP Yuklash",
      loadMore: "Yana 24 ta yuklash",
      showAll: "Barcha loyihalarni birdaniga ko'rsatish (200 ta)",
      allLoaded: "Barcha loyihalar ko'rsatilmoqda"
    },
    ru: {
      siteTitle: "FrontCraft Pro",
      siteSubtitle: "Платформа фронтенд разработки",
      searchPlaceholder: "Поиск проекта, технологии или темы... (/)",
      heroBadge: "10X ФРОНТЕНД ПЛАТФОРМА",
      heroTitle: "Центр <span>Фронтенд Проектов</span> Для Разработчиков",
      heroDesc: "Более 200+ готовых проектов для портфолио, пошаговые уроки и хранилище кода.",
      lessonsCardTitle: "Интерактивные Уроки",
      lessonsCardDesc: "Последовательные уроки от начального до профи, подробные объяснения и упражнения.",
      lessonsCardAction: "Перейти к урокам →",
      projectsCardTitle: "Готовые Проекты Портфолио",
      projectsCardDesc: "Живой предпросмотр, исходный код и скачивание в ZIP в один клик.",
      projectsCardAction: "Смотреть проекты →",
      statsProjects: "Реальных Проектов",
      statsLessons: "Интерактивных Уроков",
      statsDownloads: "Скачиваний",
      statsRating: "Оценка Сообщества",
      continueTitle: "Последний просмотренный проект",
      continueAction: "Продолжить →",
      categoriesHeading: "Категории",
      allCategory: "Все Проекты",
      favoritesCategory: "Избранные Проекты",
      historyCategory: "История Просмотра",
      allLevels: "Все уровни",
      levelBasic: "Начальный",
      levelMid: "Средний",
      levelAdv: "Сложный",
      sortNewest: "Новые проекты",
      sortPopular: "Самые популярные",
      sortDownloads: "Много скачиваний",
      tabPreview: "Живой Просмотр",
      tabCode: "Исходный Код",
      tabLesson: "План Урока",
      tabReadme: "Документация (README)",
      copyCode: "Копировать код",
      downloadZip: "Скачать ZIP",
      openNewTab: "В новой вкладке",
      markCompleted: "Отметить освоенным",
      completedBadge: "Освоено",
      relatedHeading: "Похожие проекты",
      toastCopied: "Код скопирован в буфер обмена!",
      toastCompleted: "Проект успешно завершён! 🎉",
      emptyProjects: "Подходящих проектов не найдено",
      quickView: "Живой Просмотр",
      quickZip: "Скачать ZIP",
      loadMore: "Загрузить ещё 24",
      showAll: "Показать все проекты (200 шт)",
      allLoaded: "Все проекты показаны"
    },
    en: {
      siteTitle: "FrontCraft Pro",
      siteSubtitle: "Frontend Developer Platform",
      searchPlaceholder: "Search projects, technologies or tags... (/)",
      heroBadge: "10X FRONTEND PLATFORM",
      heroTitle: "<span>Frontend Projects</span> Hub for Developers",
      heroDesc: "200+ production-ready portfolio projects, step-by-step masterclass lessons and code vault.",
      lessonsCardTitle: "Interactive Lessons",
      lessonsCardDesc: "Level-based sequential lessons, deep architecture breakdown and hands-on exercises.",
      lessonsCardAction: "Explore lessons →",
      projectsCardTitle: "Portfolio Projects",
      projectsCardDesc: "YouTube-style catalog, live hover preview, complete code and 1-click ZIP downloads.",
      projectsCardAction: "Browse projects →",
      statsProjects: "Real Projects",
      statsLessons: "Interactive Lessons",
      statsDownloads: "Downloads",
      statsRating: "Community Rating",
      continueTitle: "Last viewed project",
      continueAction: "Continue learning →",
      categoriesHeading: "Categories",
      allCategory: "All Projects",
      favoritesCategory: "Favorite Projects",
      historyCategory: "Browsing History",
      allLevels: "All levels",
      levelBasic: "Beginner",
      levelMid: "Intermediate",
      levelAdv: "Advanced",
      sortNewest: "Newest",
      sortPopular: "Most Popular",
      sortDownloads: "Most Downloaded",
      tabPreview: "Live Preview",
      tabCode: "Source Code",
      tabLesson: "Lesson Plan",
      tabReadme: "Docs (README)",
      copyCode: "Copy code",
      downloadZip: "Download ZIP",
      openNewTab: "Open in new tab",
      markCompleted: "Mark as completed",
      completedBadge: "Completed",
      relatedHeading: "Related projects",
      toastCopied: "Code copied to clipboard!",
      toastCompleted: "Project marked as completed! 🎉",
      emptyProjects: "No matching projects found",
      quickView: "Live Preview",
      quickZip: "Download ZIP",
      loadMore: "Load 24 more",
      showAll: "Show all projects (200 items)",
      allLoaded: "All projects displayed"
    }
  };

  // 2. Global State
  const App = {
    lang: localStorage.getItem('frontcraft_lang') || 'uz',
    theme: localStorage.getItem('frontcraft_theme') || 'dark',
    projects: [],
    filteredProjects: [],
    currentCategory: 'all',
    currentLevel: 'all',
    currentTech: 'all',
    searchQuery: '',
    sortBy: 'newest',
    favorites: JSON.parse(localStorage.getItem('frontcraft_favorites') || '[]'),
    history: JSON.parse(localStorage.getItem('frontcraft_history') || '[]'),
    completedLessons: JSON.parse(localStorage.getItem('frontcraft_completed_lessons') || '[]'),
    activeProject: null,
    activeCodeTab: 'html',
    loadedCount: 24,
    activeViewport: 'desktop'
  };

  // DOM Elements cache
  const UI = {};

  function initUI() {
    UI.searchInput = document.getElementById('globalSearchInput');
    UI.searchClearBtn = document.getElementById('searchClearBtn');
    UI.projectsGrid = document.getElementById('projectsGrid');
    UI.categoryList = document.getElementById('categoryList');
    UI.chipsScroll = document.getElementById('chipsScroll');
    UI.sortSelect = document.getElementById('sortSelect');
    UI.themeToggleBtn = document.getElementById('themeToggleBtn');
    UI.langSelect = document.getElementById('langSelect');
    UI.toast = document.getElementById('toastMsg');
    UI.continueBanner = document.getElementById('continueBanner');
    UI.continueProjectName = document.getElementById('continueProjectName');
    UI.continueBtn = document.getElementById('continueBtn');
    UI.statsProjectsCount = document.getElementById('statsProjectsCount');
    UI.statsLessonsCount = document.getElementById('statsLessonsCount');

    UI.loadMoreBtn = document.getElementById('loadMoreProjectsBtn');
    UI.showAllBtn = document.getElementById('showAllProjectsBtn');

    // Mobile Sidebar Drawer
    UI.mobileCategoryToggleBtn = document.getElementById('mobileCategoryToggleBtn');
    UI.closeSidebarDrawerBtn = document.getElementById('closeSidebarDrawerBtn');
    UI.sidebarBackdrop = document.getElementById('sidebarBackdrop');
    UI.sidebarPanel = document.getElementById('sidebarPanel');

    // Studio Modal
    UI.studio = document.getElementById('studioOverlay');
    UI.studioTitle = document.getElementById('studioTitle');
    UI.studioClose = document.getElementById('studioCloseBtn');
    UI.studioPreviewIframe = document.getElementById('studioPreviewIframe');
    UI.studioCodePre = document.getElementById('studioCodePre');
    UI.studioLessonContent = document.getElementById('studioLessonContent');
    UI.studioReadmeContent = document.getElementById('studioReadmeContent');
    UI.relatedProjectsList = document.getElementById('relatedProjectsList');
    UI.copyCodeBtn = document.getElementById('studioCopyCodeBtn');
    UI.downloadZipBtn = document.getElementById('studioDownloadZipBtn');
    UI.openExternalBtn = document.getElementById('studioOpenExternalBtn');
    UI.markCompletedBtn = document.getElementById('studioMarkCompletedBtn');
    UI.favStudioBtn = document.getElementById('studioFavBtn');
  }

  // 3. Data Fetching
  async function loadData() {
    try {
      const res = await fetch('./data/projects.json');
      if (res.ok) {
        App.projects = await res.json();
      }
    } catch (e) {
      console.warn('projects.json yuklashda xatolik:', e);
    }

    renderStats();
    renderCategories();
    applyFilters();
    updateContinueBanner();
  }

  // 4. Fuzzy Search (Levenshtein + Token matching)
  function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  function matchesFuzzy(text, query) {
    if (!text || !query) return false;
    const t = text.toLowerCase();
    const q = query.toLowerCase();
    if (t.includes(q)) return true;

    const tokens = t.split(/[\s,.\-_/]+/);
    for (const tok of tokens) {
      if (tok.startsWith(q)) return true;
      if (tok.length > 3 && q.length > 3 && levenshtein(tok, q) <= 2) {
        return true;
      }
    }
    return false;
  }

  // 5. Filter & Sort
  function applyFilters() {
    let list = [...App.projects];

    // Category filter
    if (App.currentCategory === 'favorites') {
      list = list.filter(p => App.favorites.includes(p.id));
    } else if (App.currentCategory === 'history') {
      const historyIds = App.history;
      list = historyIds.map(id => list.find(p => p.id === id)).filter(Boolean);
    } else if (App.currentCategory !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === App.currentCategory.toLowerCase());
    }

    // Level filter
    if (App.currentLevel !== 'all') {
      list = list.filter(p => p.level.toLowerCase().includes(App.currentLevel.toLowerCase()));
    }

    // Tech filter
    if (App.currentTech !== 'all') {
      list = list.filter(p => p.tech.some(t => t.toLowerCase().includes(App.currentTech.toLowerCase())));
    }

    // Search query
    if (App.searchQuery.trim()) {
      const q = App.searchQuery.trim();
      list = list.filter(p => {
        return matchesFuzzy(p.title, q) ||
               matchesFuzzy(p.category, q) ||
               (p.features && p.features.some(f => matchesFuzzy(f, q))) ||
               (p.tags && p.tags.some(tag => matchesFuzzy(tag, q))) ||
               (p.tech && p.tech.some(tech => matchesFuzzy(tech, q)));
      });
    }

    // Sorting
    if (App.sortBy === 'newest') {
      list.sort((a, b) => b.id - a.id);
    } else if (App.sortBy === 'popular') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (App.sortBy === 'downloads') {
      list.sort((a, b) => b.downloads - a.downloads);
    } else if (App.sortBy === 'alpha') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    App.filteredProjects = list;
    App.loadedCount = Math.min(24, list.length);
    renderGrid();
  }

  // 6. Render Categories in Sidebar
  function renderCategories() {
    if (!UI.categoryList) return;

    const categories = [
      { id: 'all', icon: 'fa-house', name: I18N[App.lang].allCategory },
      { id: 'favorites', icon: 'fa-heart', name: I18N[App.lang].favoritesCategory },
      { id: 'history', icon: 'fa-clock-rotate-left', name: I18N[App.lang].historyCategory },
      { id: 'Landing', icon: 'fa-rocket', name: 'Landing' },
      { id: 'Dashboard', icon: 'fa-chart-pie', name: 'Dashboard' },
      { id: 'E-commerce', icon: 'fa-bag-shopping', name: 'E-commerce' },
      { id: 'Admin panel', icon: 'fa-gear', name: 'Admin panel' },
      { id: 'O\'yinlar', icon: 'fa-gamepad', name: 'O\'yinlar' },
      { id: 'Animatsiya', icon: 'fa-wand-magic-sparkles', name: 'Animatsiya' },
      { id: 'Portfolio', icon: 'fa-briefcase', name: 'Portfolio' },
      { id: 'Calculator', icon: 'fa-calculator', name: 'Calculator' },
      { id: 'CRM/To-do', icon: 'fa-list-check', name: 'CRM / To-do' },
      { id: 'Chat UI', icon: 'fa-comments', name: 'Chat UI' },
      { id: 'Clone UI', icon: 'fa-clone', name: 'Clone UI' },
      { id: 'API loyihalar', icon: 'fa-cloud', name: 'API loyihalar' },
      { id: 'Data visualization', icon: 'fa-chart-line', name: 'Data visualization' },
      { id: 'Kanban', icon: 'fa-table-columns', name: 'Kanban' },
      { id: 'Editor', icon: 'fa-pen-to-square', name: 'Editor' }
    ];

    UI.categoryList.innerHTML = categories.map(cat => {
      let count = 0;
      if (cat.id === 'all') count = App.projects.length;
      else if (cat.id === 'favorites') count = App.favorites.length;
      else if (cat.id === 'history') count = App.history.length;
      else count = App.projects.filter(p => p.category.toLowerCase() === cat.id.toLowerCase()).length;

      const isActive = App.currentCategory.toLowerCase() === cat.id.toLowerCase();
      return `
        <div class="category-item ${isActive ? 'active' : ''}" data-cat="${cat.id}">
          <span class="cat-label">
            <i class="fa-solid ${cat.icon}"></i>
            <span>${cat.name}</span>
          </span>
          <span class="cat-count">${count}</span>
        </div>
      `;
    }).join('');

    UI.categoryList.querySelectorAll('.category-item').forEach(item => {
      item.onclick = () => {
        App.currentCategory = item.dataset.cat;
        renderCategories();
        applyFilters();
        closeMobileSidebar();
      };
    });
  }

  // Mobile Drawer Helpers
  function openMobileSidebar() {
    if (UI.sidebarPanel) UI.sidebarPanel.classList.add('mobile-open');
    if (UI.sidebarBackdrop) UI.sidebarBackdrop.classList.add('active');
  }

  function closeMobileSidebar() {
    if (UI.sidebarPanel) UI.sidebarPanel.classList.remove('mobile-open');
    if (UI.sidebarBackdrop) UI.sidebarBackdrop.classList.remove('active');
  }

  // 7. Render Projects Grid (HAR BIR LOYIHA NIMA EKANLIGI TO'LIQ VA ANIQ KO'RINADI)
  function renderGrid() {
    if (!UI.projectsGrid) return;

    const totalFiltered = App.filteredProjects.length;
    const visibleList = App.filteredProjects.slice(0, App.loadedCount);

    if (visibleList.length === 0) {
      UI.projectsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding: 60px 20px;">
          <div style="font-size: 48px; opacity: 0.5; margin-bottom: 16px;">🔍</div>
          <h3>${I18N[App.lang].emptyProjects}</h3>
          <p style="color:var(--text-muted); margin-top:8px;">Boshqa kalit so'z yoki filtrlar orqali qidirib ko'ring.</p>
        </div>
      `;
      if (UI.loadMoreBtn) UI.loadMoreBtn.style.display = 'none';
      if (UI.showAllBtn) UI.showAllBtn.style.display = 'none';
      return;
    }

    UI.projectsGrid.innerHTML = visibleList.map(p => {
      const isFav = App.favorites.includes(p.id);
      const isCompleted = App.completedLessons.includes(p.id);
      const levelClass = p.level.toLowerCase().includes('bosh') ? 'boshlangich' : (p.level.toLowerCase().includes('o\'rta') ? 'orta' : 'murakkab');

      // Nima ekanligi (Aniq tavsif)
      const desc = p.lesson && p.lesson.objective ? p.lesson.objective : (p.features ? p.features.join('. ') : `${p.title} loyihasi.`);

      // 3 ta real funksiya
      const features = (p.features && p.features.length > 0) ? p.features.slice(0, 3) : [
        "To'liq moslashuvchan responsive interfeys",
        "Interaktiv hodisalar va foydalanuvchi harakatlari",
        "DOM va brauzer ma'lumotlar boshqaruvi"
      ];

      return `
        <article class="project-card" data-id="${p.id}" tabindex="0" role="button" aria-label="${p.title}">
          <div class="card-preview-box">
            <div class="card-thumbnail-mock">
              <i class="fa-solid fa-code"></i>
              <span>${p.category}</span>
            </div>
            <!-- Hover'da avtomatik o'ynovchi iframe sandbox -->
            <iframe class="card-hover-iframe" data-src="${p.demo}" loading="lazy" sandbox="allow-scripts allow-same-origin"></iframe>
            
            <span class="card-level-badge ${levelClass}">${p.level}</span>
            <button class="card-fav-btn ${isFav ? 'active' : ''}" data-fav="${p.id}" aria-label="Sevimlilarga qo'shish">
              <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
            </button>
            <span class="card-duration-badge">${p.duration}</span>
          </div>

          <div class="card-body">
            <!-- Nomi va Raqami -->
            <h3 class="card-title">${p.id}. ${p.title}</h3>

            <!-- NIMA EKANLIGI (TUSHUNARLI TAVSIF) -->
            <p class="card-desc" title="${desc}">${desc}</p>

            <!-- 3 TA REAL FUNKSIYASI -->
            <div class="card-features-box">
              ${features.map(f => `
                <div class="card-feature-item" title="${f}">
                  <i class="fa-solid fa-circle-check"></i>
                  <span>${f}</span>
                </div>
              `).join('')}
            </div>

            <!-- Texnologiyalar -->
            <div class="card-tech-tags">
              ${p.tech.slice(0, 4).map(t => `<span class="tech-tag">${t}</span>`).join('')}
              ${isCompleted ? `<span class="tech-tag" style="background:rgba(16,185,129,0.15); color:#10b981;"><i class="fa-solid fa-check"></i> ${I18N[App.lang].completedBadge}</span>` : ''}
            </div>

            <!-- TEZKOR AMALLAR TUGMALARI -->
            <div class="card-quick-actions">
              <button class="card-action-btn view-btn" data-view-id="${p.id}">
                <i class="fa-solid fa-play"></i> ${I18N[App.lang].quickView}
              </button>
              <button class="card-action-btn download-btn" data-dl-id="${p.id}">
                <i class="fa-solid fa-download"></i> ${I18N[App.lang].quickZip}
              </button>
            </div>

            <!-- Reyting va Yuklashlar -->
            <div class="card-meta-row">
              <span class="card-rating">
                <i class="fa-solid fa-star"></i> ${p.rating}
              </span>
              <span><i class="fa-solid fa-download"></i> ${p.downloads} yuklash</span>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach card event listeners
    UI.projectsGrid.querySelectorAll('.project-card').forEach(card => {
      const id = parseInt(card.dataset.id, 10);
      const iframe = card.querySelector('.card-hover-iframe');
      let hoverTimeout = null;

      // Hover live preview with 250ms debounce
      card.onmouseenter = () => {
        hoverTimeout = setTimeout(() => {
          if (iframe && iframe.dataset.src && !iframe.src) {
            iframe.src = iframe.dataset.src;
            iframe.onload = () => iframe.classList.add('loaded');
          }
        }, 250);
      };

      card.onmouseleave = () => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
      };

      // Card click opens Project Studio
      card.onclick = (e) => {
        if (e.target.closest('.card-fav-btn') || e.target.closest('.card-action-btn')) return;
        openStudio(id);
      };

      // Keyboard Accessibility
      card.onkeydown = (e) => {
        if (e.key === 'Enter') openStudio(id);
      };

      // Action buttons
      const viewBtn = card.querySelector('.view-btn');
      if (viewBtn) {
        viewBtn.onclick = (e) => {
          e.stopPropagation();
          openStudio(id);
        };
      }

      const dlBtn = card.querySelector('.download-btn');
      if (dlBtn) {
        dlBtn.onclick = (e) => {
          e.stopPropagation();
          const target = App.projects.find(x => x.id === id);
          if (target) downloadProjectZip(target);
        };
      }
    });

    // Attach heart button toggles
    UI.projectsGrid.querySelectorAll('.card-fav-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.fav, 10);
        toggleFavorite(id);
      };
    });

    // Update Load More & Show All Buttons
    if (UI.loadMoreBtn && UI.showAllBtn) {
      if (App.loadedCount >= totalFiltered) {
        UI.loadMoreBtn.style.display = 'none';
        UI.showAllBtn.textContent = `✓ ${I18N[App.lang].allLoaded} (${totalFiltered} ta)`;
        UI.showAllBtn.disabled = true;
      } else {
        UI.loadMoreBtn.style.display = 'inline-flex';
        UI.showAllBtn.style.display = 'inline-flex';
        UI.showAllBtn.textContent = `${I18N[App.lang].showAll}`;
        UI.showAllBtn.disabled = false;
      }
    }
  }

  // 8. Infinite Scroll
  window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 600) {
      if (App.loadedCount < App.filteredProjects.length) {
        App.loadedCount += 12;
        renderGrid();
      }
    }
  });

  // 9. Open Project Studio Modal
  async function openStudio(id) {
    const p = App.projects.find(item => item.id === id);
    if (!p) return;

    App.activeProject = p;
    recordHistory(id);

    // Update Studio UI Headers
    if (UI.studioTitle) UI.studioTitle.textContent = `${p.id}. ${p.title}`;
    if (UI.studioPreviewIframe) UI.studioPreviewIframe.src = p.demo;
    
    // Set Active Tab to Preview
    switchStudioTab('preview');

    // Update Favorites button state in Studio
    updateStudioFavBtn();

    // Populate Lesson Tab
    if (UI.studioLessonContent) {
      const isCompleted = App.completedLessons.includes(p.id);
      UI.studioLessonContent.innerHTML = `
        <div class="lesson-section-card">
          <h3><i class="fa-solid fa-bullseye"></i> 1. Loyiha Maqsadi & Arxitekturasi</h3>
          <p>${p.lesson ? p.lesson.objective : p.title + ' loyihasi'}</p>
        </div>

        <div class="lesson-section-card">
          <h3><i class="fa-solid fa-list-ol"></i> 2. Amalga Oshirish Qadamlari</h3>
          <ul class="lesson-steps-list">
            ${p.lesson && p.lesson.steps ? p.lesson.steps.map(step => `<li class="lesson-step-item">${step}</li>`).join('') : ''}
          </ul>
        </div>

        <div class="lesson-section-card">
          <h3><i class="fa-solid fa-code"></i> 3. Chuqur Kod Tahlili (Under The Hood)</h3>
          <p>${p.lesson ? p.lesson.codeExplanation : 'Standart toza kod tuzilmasi.'}</p>
        </div>

        <div class="lesson-section-card">
          <h3><i class="fa-solid fa-dumbbell"></i> 4. Amaliy Mustahkamlash Mashqi</h3>
          <p>${p.lesson ? p.lesson.exercise : 'Loyihaga yangi xususiyat qo\'shing va sinab ko\'ring.'}</p>
        </div>

        <div class="lesson-complete-action">
          <button id="markCompletedActionBtn" class="nav-btn ${isCompleted ? 'active' : ''}" style="font-size:1rem; padding:12px 24px;">
            <i class="fa-solid fa-circle-check"></i> ${isCompleted ? I18N[App.lang].completedBadge : I18N[App.lang].markCompleted}
          </button>
        </div>
      `;

      const compBtn = document.getElementById('markCompletedActionBtn');
      if (compBtn) {
        compBtn.onclick = () => toggleLessonCompleted(p.id);
      }
    }

    // Populate Readme Tab
    if (UI.studioReadmeContent) {
      loadReadme(p);
    }

    // Load Code Content
    loadSourceCode(p, App.activeCodeTab);

    // Render Related Projects
    renderRelatedProjects(p);

    if (UI.studio) UI.studio.classList.add('active');
  }

  function closeStudio() {
    if (UI.studio) UI.studio.classList.remove('active');
    if (UI.studioPreviewIframe) UI.studioPreviewIframe.src = 'about:blank';
    App.activeProject = null;
  }

  // 10. Load Source Code for Studio
  async function loadSourceCode(p, fileType) {
    if (!UI.studioCodePre) return;
    UI.studioCodePre.textContent = 'Kod yuklanmoqda...';

    const dir = p.demo ? p.demo.replace('/index.html', '') : '';
    const fileName = fileType === 'html' ? 'index.html' : (fileType === 'css' ? 'style.css' : 'script.js');
    const filePath = `${dir}/${fileName}`;

    try {
      const res = await fetch(filePath);
      if (res.ok) {
        const text = await res.text();
        UI.studioCodePre.textContent = text;
      } else {
        UI.studioCodePre.textContent = `// ${fileName} fayli topilmadi`;
      }
    } catch (e) {
      UI.studioCodePre.textContent = `// Xatolik yuz berdi: ${e.message}`;
    }
  }

  async function loadReadme(p) {
    if (!UI.studioReadmeContent) return;
    const dir = p.demo ? p.demo.replace('/index.html', '') : '';
    try {
      const res = await fetch(`${dir}/README.md`);
      if (res.ok) {
        const text = await res.text();
        UI.studioReadmeContent.innerHTML = `<div class="readme-box"><pre style="white-space:pre-wrap; font-family:inherit;">${text}</pre></div>`;
      } else {
        UI.studioReadmeContent.innerHTML = `<div class="readme-box"><p>${p.title} loyihasi hujjatlari.</p></div>`;
      }
    } catch (e) {
      UI.studioReadmeContent.innerHTML = `<div class="readme-box"><p>${p.title}</p></div>`;
    }
  }

  // 11. Studio Tabs Switching
  function switchStudioTab(tab) {
    document.querySelectorAll('.studio-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `tabPane-${tab}`);
    });
  }

  // 12. Studio Viewport Switcher
  function setViewport(view) {
    App.activeViewport = view;
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.device === view);
    });

    if (!UI.studioPreviewIframe) return;
    UI.studioPreviewIframe.className = '';
    if (view === 'tablet') UI.studioPreviewIframe.classList.add('tablet-view');
    else if (view === 'mobile') UI.studioPreviewIframe.classList.add('mobile-view');
  }

  // 13. Download Project as ZIP using JSZip
  async function downloadProjectZip(p) {
    if (!p) return;
    showToast(`⏳ ${p.title} ZIP tayyorlanmoqda...`);

    try {
      if (typeof JSZip === 'undefined') {
        alert("JSZip kutubxonasi topilmadi. Sahifani yangilang.");
        return;
      }

      const zip = new JSZip();
      const folderName = `${p.id}-${p.slug || 'loyiha'}`;
      const folder = zip.folder(folderName);
      const dir = p.demo ? p.demo.replace('/index.html', '') : '';

      const files = ['index.html', 'style.css', 'script.js', 'README.md', 'package.json', 'LICENSE'];

      for (const f of files) {
        try {
          const res = await fetch(`${dir}/${f}`);
          if (res.ok) {
            const blob = await res.blob();
            folder.file(f, blob);
          }
        } catch (err) {
          console.warn('Faylni olishda xato:', f, err);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const fileName = `${folderName}.zip`;

      if (typeof saveAs === 'function') {
        saveAs(zipBlob, fileName);
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }

      showToast(`📦 ${p.title} ZIP yuklab olindi!`);
    } catch (err) {
      alert("ZIP yaratishda xatolik: " + err.message);
    }
  }

  // 14. Related Projects Recommendation
  function renderRelatedProjects(currentProject) {
    if (!UI.relatedProjectsList) return;
    const related = App.projects
      .filter(p => p.id !== currentProject.id && (p.category === currentProject.category || p.level === currentProject.level))
      .slice(0, 6);

    UI.relatedProjectsList.innerHTML = related.map(p => `
      <div class="related-card" data-rel="${p.id}">
        <h5>${p.title}</h5>
        <small style="color:var(--text-muted);">${p.category} &bull; ${p.level}</small>
      </div>
    `).join('');

    UI.relatedProjectsList.querySelectorAll('.related-card').forEach(card => {
      card.onclick = () => {
        openStudio(parseInt(card.dataset.rel, 10));
      };
    });
  }

  // 15. Favorites & History
  function toggleFavorite(id) {
    const idx = App.favorites.indexOf(id);
    if (idx > -1) {
      App.favorites.splice(idx, 1);
    } else {
      App.favorites.push(id);
    }
    localStorage.setItem('frontcraft_favorites', JSON.stringify(App.favorites));
    renderCategories();
    renderGrid();
    updateStudioFavBtn();
  }

  function updateStudioFavBtn() {
    if (!UI.favStudioBtn || !App.activeProject) return;
    const isFav = App.favorites.includes(App.activeProject.id);
    UI.favStudioBtn.innerHTML = `<i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>`;
    UI.favStudioBtn.style.color = isFav ? 'var(--danger)' : '';
  }

  function recordHistory(id) {
    App.history = App.history.filter(hId => hId !== id);
    App.history.unshift(id);
    if (App.history.length > 30) App.history.pop();
    localStorage.setItem('frontcraft_history', JSON.stringify(App.history));
    updateContinueBanner();
  }

  function toggleLessonCompleted(id) {
    const idx = App.completedLessons.indexOf(id);
    if (idx > -1) {
      App.completedLessons.splice(idx, 1);
    } else {
      App.completedLessons.push(id);
      showToast(I18N[App.lang].toastCompleted);
    }
    localStorage.setItem('frontcraft_completed_lessons', JSON.stringify(App.completedLessons));
    renderGrid();
    if (App.activeProject) openStudio(App.activeProject.id);
  }

  // 16. Continue Learning Banner
  function updateContinueBanner() {
    if (!UI.continueBanner) return;
    if (App.history.length > 0) {
      const lastId = App.history[0];
      const p = App.projects.find(item => item.id === lastId);
      if (p) {
        if (UI.continueProjectName) UI.continueProjectName.textContent = p.title;
        UI.continueBanner.style.display = 'flex';
        if (UI.continueBtn) {
          UI.continueBtn.onclick = () => openStudio(p.id);
        }
        return;
      }
    }
    UI.continueBanner.style.display = 'none';
  }

  // 17. Stats Rendering
  function renderStats() {
    if (UI.statsProjectsCount) UI.statsProjectsCount.textContent = App.projects.length + '+';
    if (UI.statsLessonsCount) UI.statsLessonsCount.textContent = '278+';
  }

  // 18. Toast Message Notification
  function showToast(msg) {
    if (!UI.toast) return;
    UI.toast.textContent = msg;
    UI.toast.classList.add('show');
    setTimeout(() => UI.toast.classList.remove('show'), 2800);
  }

  // 19. Event Listeners Setup
  function setupEvents() {
    // Search input
    if (UI.searchInput) {
      UI.searchInput.oninput = () => {
        App.searchQuery = UI.searchInput.value;
        if (UI.searchClearBtn) {
          UI.searchClearBtn.classList.toggle('visible', !!App.searchQuery);
        }
        applyFilters();
      };
    }

    if (UI.searchClearBtn) {
      UI.searchClearBtn.onclick = () => {
        UI.searchInput.value = '';
        App.searchQuery = '';
        UI.searchClearBtn.classList.remove('visible');
        applyFilters();
      };
    }

    // Mobile Drawer Controls
    if (UI.mobileCategoryToggleBtn) UI.mobileCategoryToggleBtn.onclick = openMobileSidebar;
    if (UI.closeSidebarDrawerBtn) UI.closeSidebarDrawerBtn.onclick = closeMobileSidebar;
    if (UI.sidebarBackdrop) UI.sidebarBackdrop.onclick = closeMobileSidebar;

    // Sort select
    if (UI.sortSelect) {
      UI.sortSelect.onchange = (e) => {
        App.sortBy = e.target.value;
        applyFilters();
      };
    }

    // Chip filters
    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.onclick = () => {
        const type = btn.dataset.filterType;
        const val = btn.dataset.filterVal;

        btn.parentElement.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (type === 'level') App.currentLevel = val;
        if (type === 'tech') App.currentTech = val;

        applyFilters();
      };
    });

    // Load More & Show All Buttons
    if (UI.loadMoreBtn) {
      UI.loadMoreBtn.onclick = () => {
        App.loadedCount += 24;
        renderGrid();
      };
    }

    if (UI.showAllBtn) {
      UI.showAllBtn.onclick = () => {
        App.loadedCount = App.filteredProjects.length;
        renderGrid();
      };
    }

    // Theme Toggle
    if (UI.themeToggleBtn) {
      UI.themeToggleBtn.onclick = () => {
        App.theme = App.theme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', App.theme);
        localStorage.setItem('frontcraft_theme', App.theme);
        UI.themeToggleBtn.innerHTML = App.theme === 'dark' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
      };
    }

    // Language Switcher
    if (UI.langSelect) {
      UI.langSelect.value = App.lang;
      UI.langSelect.onchange = (e) => {
        App.lang = e.target.value;
        localStorage.setItem('frontcraft_lang', App.lang);
        updateLanguageUI();
        renderCategories();
        applyFilters();
      };
    }

    // Studio Tabs
    document.querySelectorAll('.studio-tab-btn').forEach(btn => {
      btn.onclick = () => {
        switchStudioTab(btn.dataset.tab);
      };
    });

    // Code subtabs in Studio
    document.querySelectorAll('.code-file-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.code-file-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        App.activeCodeTab = btn.dataset.file;
        if (App.activeProject) loadSourceCode(App.activeProject, App.activeCodeTab);
      };
    });

    // Viewport switchers
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.onclick = () => setViewport(btn.dataset.device);
    });

    // Copy Code button in Studio
    if (UI.copyCodeBtn) {
      UI.copyCodeBtn.onclick = () => {
        if (UI.studioCodePre && navigator.clipboard) {
          navigator.clipboard.writeText(UI.studioCodePre.textContent).then(() => {
            showToast(I18N[App.lang].toastCopied);
          });
        }
      };
    }

    // Download ZIP button in Studio
    if (UI.downloadZipBtn) {
      UI.downloadZipBtn.onclick = () => {
        if (App.activeProject) downloadProjectZip(App.activeProject);
      };
    }

    // Open in New Tab
    if (UI.openExternalBtn) {
      UI.openExternalBtn.onclick = () => {
        if (App.activeProject) window.open(App.activeProject.demo, '_blank');
      };
    }

    // Favorite button in studio
    if (UI.favStudioBtn) {
      UI.favStudioBtn.onclick = () => {
        if (App.activeProject) toggleFavorite(App.activeProject.id);
      };
    }

    // Studio close
    if (UI.studioClose) UI.studioClose.onclick = closeStudio;

    // Keyboard Shortcuts: "/" focuses search, "Escape" closes studio
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== UI.searchInput) {
        e.preventDefault();
        const catalogEl = document.getElementById('catalog');
        if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
        if (UI.searchInput) {
          UI.searchInput.focus();
          UI.searchInput.select();
        }
      } else if (e.key === 'Escape') {
        closeStudio();
      }
    });
  }

  // 20. Update Language Strings in DOM
  function updateLanguageUI() {
    const dict = I18N[App.lang];
    if (UI.searchInput) UI.searchInput.placeholder = dict.searchPlaceholder;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (dict[key]) el.textContent = dict[key];
    });
  }

  // 21. Service Worker Registration for PWA Offline Capability
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.log('SW ro\'yxatdan o\'tmadi:', err);
      });
    }
  }

  // Initialize App on DOM Load
  document.addEventListener('DOMContentLoaded', () => {
    initUI();
    document.body.setAttribute('data-theme', App.theme);
    if (UI.themeToggleBtn) {
      UI.themeToggleBtn.innerHTML = App.theme === 'dark' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    }
    setupEvents();
    updateLanguageUI();
    loadData();
    registerServiceWorker();
  });

})();
