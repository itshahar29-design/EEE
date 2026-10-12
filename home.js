/**
 * FrontCraft Pro - Home Page Engine
 * Handles theme toggle, language switching, stats, continue banner & PWA
 */

(function () {
  'use strict';

  const I18N = {
    uz: {
      siteTitle: "FrontCraft Pro",
      siteSubtitle: "Frontend Dasturchilar Platformasi",
      heroBadge: "10X FRONTEND PLATFORMA",
      heroTitle: "Dasturchilar Uchun <span>Frontend Loyihalar va Darslar</span> Markazi",
      heroDesc: "200+ dan ortiq tayyor real portfolio loyihalari, 278+ interaktiv masterclass darslar va kodlar ombori. Nazariyadan to'liq amaliyotgacha.",
      lessonsCardTitle: "Interaktiv Masterclass Darslar",
      lessonsCardDesc: "Boshlang'ichdan professionalgacha ketma-ket 7 ta yirik modul, 278+ dars, jonli sinov muhiti va amaliy mashqlar.",
      lessonsCardAction: "Darslar Xonasiga Kirish (278+) →",
      projectsCardTitle: "Tayyor Portfolio Loyihalari",
      projectsCardDesc: "YouTube uslubidagi to'liq katalog, har bir loyiha nima ekanligi, 3 ta real funksiyasi, jonli hover namoyishi va 1-bosishda ZIP yuklash.",
      projectsCardAction: "Loyihalar Katalogiga Kirish (200+) →",
      statsProjects: "Real Loyihalar",
      statsLessons: "Interaktiv Darslar",
      statsDownloads: "Yuklab Olishlar",
      statsRating: "Jamoa Bahosi",
      continueTitle: "Oxirgi ko'rilgan loyiha",
      continueAction: "Davom ettirish →"
    },
    ru: {
      siteTitle: "FrontCraft Pro",
      siteSubtitle: "Платформа фронтенд разработки",
      heroBadge: "10X ФРОНТЕНД ПЛАТФОРМА",
      heroTitle: "Центр <span>Фронтенд Проектов и Уроков</span> Для Разработчиков",
      heroDesc: "Более 200+ готовых проектов для портфолио, 278+ интерактивных мастер-классов и хранилище исходного кода.",
      lessonsCardTitle: "Интерактивные Мастер-классы",
      lessonsCardDesc: "7 структурированных модулей от начального до профи, 278+ уроков, интерактивная среда и упражнения.",
      lessonsCardAction: "Перейти к урокам (278+) →",
      projectsCardTitle: "Готовые Проекты Портфолио",
      projectsCardDesc: "Каталог в стиле YouTube, описание проектов, 3 реальные функции, живой просмотр и скачивание в ZIP.",
      projectsCardAction: "Открыть каталог проектов (200+) →",
      statsProjects: "Реальных Проектов",
      statsLessons: "Интерактивных Уроков",
      statsDownloads: "Скачиваний",
      statsRating: "Оценка Сообщества",
      continueTitle: "Последний просмотренный проект",
      continueAction: "Продолжить →"
    },
    en: {
      siteTitle: "FrontCraft Pro",
      siteSubtitle: "Frontend Developers Platform",
      heroBadge: "10X FRONTEND PLATFORM",
      heroTitle: "The Ultimate Hub for <span>Frontend Projects & Lessons</span>",
      heroDesc: "Over 200+ production-grade portfolio projects, 278+ interactive masterclass lessons and complete source code repository.",
      lessonsCardTitle: "Interactive Masterclasses",
      lessonsCardDesc: "7 structured learning tracks from fundamentals to expert level, 278+ lessons, live preview & hands-on exercises.",
      lessonsCardAction: "Enter Lessons Studio (278+) →",
      projectsCardTitle: "Production Portfolio Projects",
      projectsCardDesc: "YouTube-style catalog, rich project descriptions, 3 core features each, hover previews and 1-click ZIP export.",
      projectsCardAction: "Explore Projects Catalog (200+) →",
      statsProjects: "Production Projects",
      statsLessons: "Interactive Lessons",
      statsDownloads: "Total Downloads",
      statsRating: "Community Rating",
      continueTitle: "Recently Viewed Project",
      continueAction: "Resume Project →"
    }
  };

  const App = {
    lang: localStorage.getItem('frontcraft_lang') || 'uz',
    theme: localStorage.getItem('frontcraft_theme') || 'dark',
    history: JSON.parse(localStorage.getItem('frontcraft_history') || '[]'),
    projects: []
  };

  const UI = {};

  function initUI() {
    UI.themeToggleBtn = document.getElementById('themeToggleBtn');
    UI.langSelect = document.getElementById('langSelect');
    UI.continueBanner = document.getElementById('continueBanner');
    UI.continueProjectName = document.getElementById('continueProjectName');
    UI.continueBtn = document.getElementById('continueBtn');
    UI.statsProjectsCount = document.getElementById('statsProjectsCount');
    UI.statsLessonsCount = document.getElementById('statsLessonsCount');
  }

  function applyTheme(theme) {
    App.theme = theme;
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('frontcraft_theme', theme);
    if (UI.themeToggleBtn) {
      UI.themeToggleBtn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    }
  }

  function updateLanguageUI() {
    const dict = I18N[App.lang] || I18N.uz;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (dict[key]) el.innerHTML = dict[key];
    });
  }

  async function checkHistoryAndStats() {
    try {
      const res = await fetch('./data/projects.json');
      if (res.ok) {
        App.projects = await res.json();
      }
    } catch (_) {}

    if (UI.statsProjectsCount) {
      UI.statsProjectsCount.textContent = (App.projects.length || 200) + '+';
    }
    if (UI.statsLessonsCount) {
      UI.statsLessonsCount.textContent = '278+';
    }

    if (App.history.length > 0 && UI.continueBanner) {
      const lastId = App.history[0];
      const p = App.projects.find(item => item.id === lastId);
      if (p) {
        if (UI.continueProjectName) UI.continueProjectName.textContent = p.title;
        UI.continueBanner.style.display = 'flex';
        if (UI.continueBtn) {
          UI.continueBtn.onclick = () => {
            window.location.href = `./projects.html?id=${p.id}`;
          };
        }
        return;
      }
    }
    if (UI.continueBanner) {
      UI.continueBanner.style.display = 'none';
    }
  }

  function setupEvents() {
    if (UI.themeToggleBtn) {
      UI.themeToggleBtn.onclick = () => {
        const newTheme = App.theme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
      };
    }

    if (UI.langSelect) {
      UI.langSelect.value = App.lang;
      UI.langSelect.onchange = (e) => {
        App.lang = e.target.value;
        localStorage.setItem('frontcraft_lang', App.lang);
        updateLanguageUI();
      };
    }
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initUI();
    applyTheme(App.theme);
    setupEvents();
    updateLanguageUI();
    checkHistoryAndStats();
    registerServiceWorker();
  });

})();
