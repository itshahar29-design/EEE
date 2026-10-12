/**
 * FrontCraft Pro - Standalone Masterclass Lessons Engine
 * Curriculum tree, interactive live workspace, code viewer, JSZip & progress persistence
 */

(function () {
  'use strict';

  const I18N = {
    uz: {
      siteTitle: "FrontCraft Pro",
      siteSubtitle: "Interaktiv Darslar Markazi",
      markCompleted: "Darsni yakunlash",
      completedBadge: "O'zlashtirildi",
      toastCopied: "Kod clipboardga nusxalandi!",
      toastCompleted: "Tabriklaymiz! Dars muvaffaqiyatli yakunlandi. 🎉",
      downloading: "Tayyorlanmoqda..."
    },
    ru: {
      siteTitle: "FrontCraft Pro",
      siteSubtitle: "Центр Интерактивных Уроков",
      markCompleted: "Завершить урок",
      completedBadge: "Освоено",
      toastCopied: "Код скопирован в буфер обмена!",
      toastCompleted: "Поздравляем! Урок успешно завершён. 🎉",
      downloading: "Подготовка..."
    },
    en: {
      siteTitle: "FrontCraft Pro",
      siteSubtitle: "Interactive Lessons Hub",
      markCompleted: "Mark as completed",
      completedBadge: "Completed",
      toastCopied: "Code copied to clipboard!",
      toastCompleted: "Congratulations! Lesson marked as completed. 🎉",
      downloading: "Preparing..."
    }
  };

  const App = {
    lang: localStorage.getItem('frontcraft_lang') || 'uz',
    theme: localStorage.getItem('frontcraft_theme') || 'dark',
    lessons: [],
    filteredLessons: [],
    completedLessons: JSON.parse(localStorage.getItem('frontcraft_completed_lessons') || '[]'),
    activeLesson: null,
    activeTab: 'preview',
    searchQuery: ''
  };

  const UI = {};

  function initUI() {
    UI.themeToggleBtn = document.getElementById('themeToggleBtn');
    UI.langSelect = document.getElementById('langSelect');
    UI.searchInput = document.getElementById('lessonSearchInput');
    UI.lessonsTreeContainer = document.getElementById('lessonsTreeContainer');
    UI.lessonsTotalBadge = document.getElementById('lessonsTotalBadge');
    UI.lessonsProgressPercent = document.getElementById('lessonsProgressPercent');
    UI.lessonsProgressBar = document.getElementById('lessonsProgressBar');
    UI.lessonCurrentTitle = document.getElementById('lessonCurrentTitle');
    UI.lessonCurrentModule = document.getElementById('lessonCurrentModule');
    UI.lessonCompleteBtn = document.getElementById('lessonCompleteBtn');
    UI.lessonCompleteText = document.getElementById('lessonCompleteText');
    UI.lessonDownloadBtn = document.getElementById('lessonDownloadBtn');
    UI.lessonPreviewFrame = document.getElementById('lessonPreviewFrame');
    UI.lessonCodeFileTabs = document.getElementById('lessonCodeFileTabs');
    UI.lessonCodeViewer = document.getElementById('lessonCodeViewer');
    UI.lessonCopyCodeBtn = document.getElementById('lessonCopyCodeBtn');
    UI.lessonTheoryCard = document.getElementById('lessonTheoryCard');
    UI.lessonExerciseCard = document.getElementById('lessonExerciseCard');
    UI.toast = document.getElementById('toastMsg');
  }

  async function loadLessons() {
    try {
      const res = await fetch('./data/lessons.json');
      if (res.ok) {
        App.lessons = await res.json();
      }
    } catch (e) {
      console.warn('lessons.json yuklanmadi:', e);
    }

    if (UI.lessonsTotalBadge) {
      UI.lessonsTotalBadge.textContent = `${App.lessons.length} dars`;
    }

    renderLessonsTree();

    // Check URL query parameter (e.g. ?id=5)
    const params = new URLSearchParams(window.location.search);
    const lessonId = parseInt(params.get('id'), 10);
    const target = App.lessons.find(l => l.id === lessonId);
    if (target) {
      selectLesson(target);
    } else if (App.lessons.length > 0) {
      selectLesson(App.lessons[0]);
    }
  }

  function renderLessonsTree() {
    if (!UI.lessonsTreeContainer) return;

    // Progress calculation
    const total = App.lessons.length;
    const completedCount = App.completedLessons.length;
    const percent = total > 0 ? Math.min(100, Math.round((completedCount / total) * 100)) : 0;

    if (UI.lessonsProgressPercent) UI.lessonsProgressPercent.textContent = `${percent}%`;
    if (UI.lessonsProgressBar) UI.lessonsProgressBar.style.width = `${percent}%`;

    // Filter by search query
    let list = App.lessons;
    if (App.searchQuery.trim()) {
      const q = App.searchQuery.trim().toLowerCase();
      list = list.filter(l => (l.title && l.title.toLowerCase().includes(q)) || (l.module && l.module.toLowerCase().includes(q)));
    }

    // Group by module
    const groups = {};
    list.forEach(lesson => {
      const mod = lesson.module || 'Boshqa';
      if (!groups[mod]) {
        groups[mod] = {
          title: lesson.moduleName || mod,
          icon: lesson.moduleIcon || 'fa-folder',
          color: lesson.moduleColor || '#38bdf8',
          items: []
        };
      }
      groups[mod].items.push(lesson);
    });

    const moduleKeys = Object.keys(groups);

    if (moduleKeys.length === 0) {
      UI.lessonsTreeContainer.innerHTML = `
        <div style="text-align:center; padding:30px 10px; color:var(--text-muted);">
          <p>Mos darslar topilmadi.</p>
        </div>
      `;
      return;
    }

    UI.lessonsTreeContainer.innerHTML = moduleKeys.map((modKey) => {
      const g = groups[modKey];

      return `
        <div class="module-group" data-module="${modKey}">
          <div class="module-header" role="button" tabindex="0">
            <div class="module-header-left">
              <i class="fa-solid ${g.icon}" style="color: ${g.color};"></i>
              <span>${g.title}</span>
            </div>
            <span class="module-count">${g.items.length} dars</span>
          </div>
          <ul class="module-lessons-list">
            ${g.items.map(les => {
              const isComp = App.completedLessons.includes(les.id);
              const isActive = App.activeLesson && App.activeLesson.id === les.id;
              return `
                <li class="lesson-nav-item ${isActive ? 'active' : ''} ${isComp ? 'completed' : ''}" data-lesson-id="${les.id}">
                  <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:210px;">
                    ${les.rawTitle || les.title}
                  </span>
                  ${isComp ? '<i class="fa-solid fa-circle-check" style="color:var(--success);"></i>' : '<i class="fa-regular fa-circle" style="opacity:0.4; font-size:0.8rem;"></i>'}
                </li>
              `;
            }).join('')}
          </ul>
        </div>
      `;
    }).join('');

    // Attach click events
    UI.lessonsTreeContainer.querySelectorAll('.module-header').forEach(hdr => {
      hdr.onclick = () => {
        const listEl = hdr.nextElementSibling;
        if (listEl) listEl.classList.toggle('hidden');
      };
    });

    UI.lessonsTreeContainer.querySelectorAll('.lesson-nav-item').forEach(item => {
      item.onclick = () => {
        const id = parseInt(item.dataset.lessonId, 10);
        const les = App.lessons.find(l => l.id === id);
        if (les) selectLesson(les);
      };
    });
  }

  function selectLesson(lesson) {
    if (!lesson) return;
    App.activeLesson = lesson;

    // Highlight active in tree
    if (UI.lessonsTreeContainer) {
      UI.lessonsTreeContainer.querySelectorAll('.lesson-nav-item').forEach(el => {
        el.classList.toggle('active', parseInt(el.dataset.lessonId, 10) === lesson.id);
      });
    }

    // Update Top bar
    if (UI.lessonCurrentTitle) UI.lessonCurrentTitle.textContent = lesson.title;
    if (UI.lessonCurrentModule) UI.lessonCurrentModule.textContent = lesson.moduleName || lesson.module;

    // Update Completion Button
    const isCompleted = App.completedLessons.includes(lesson.id);
    if (UI.lessonCompleteBtn) {
      UI.lessonCompleteBtn.classList.toggle('active', isCompleted);
      if (UI.lessonCompleteText) {
        UI.lessonCompleteText.textContent = isCompleted ? I18N[App.lang].completedBadge : I18N[App.lang].markCompleted;
      }
      UI.lessonCompleteBtn.onclick = () => toggleLessonCompleted(lesson.id);
    }

    // Live preview frame
    if (UI.lessonPreviewFrame) {
      UI.lessonPreviewFrame.src = lesson.demo || 'about:blank';
    }

    // Theory Tab
    if (UI.lessonTheoryCard) {
      UI.lessonTheoryCard.innerHTML = `
        <h3><i class="fa-solid fa-bullseye"></i> 1. Dars Maqsadi</h3>
        <p>${lesson.objective || 'Mavzuni to\'liq o\'rganish va amaliyotda qo\'llash.'}</p>
        
        <h3 style="margin-top:24px;"><i class="fa-solid fa-list-ol"></i> 2. Amalga Oshirish Qadamlari</h3>
        <ul class="lesson-steps-list">
          ${lesson.steps ? lesson.steps.map(s => `<li class="lesson-step-item">${s}</li>`).join('') : ''}
        </ul>

        <h3 style="margin-top:24px;"><i class="fa-solid fa-code"></i> 3. Chuqur Kod Tahlili (Under The Hood)</h3>
        <p>${lesson.codeExplanation || 'Kod arxitekturasi va standartlari.'}</p>
      `;
    }

    // Exercise Tab
    if (UI.lessonExerciseCard) {
      UI.lessonExerciseCard.innerHTML = `
        <h3><i class="fa-solid fa-dumbbell"></i> 4. Amaliy Mustahkamlash Mashqi</h3>
        <p>${lesson.exercise || 'Dars kodiga o\'zgartirish kiriting va mustaqil ravishda sinab ko\'ring.'}</p>
        <div style="margin-top:20px; padding:16px; background:var(--bg-card); border-radius:8px; border-left:3px solid var(--accent);">
          <strong>💡 Maslahat:</strong>
          <p style="margin-top:6px; font-size:0.9rem; color:var(--text-muted);">
            Kod tabiga o'ting, kodni nusxalang va o'zgartirishlar kiritib yangi funksiyalar qo'shing.
          </p>
        </div>
      `;
    }

    // Code Tab Setup
    setupCodeTab(lesson);

    // ZIP Download Button
    if (UI.lessonDownloadBtn) {
      UI.lessonDownloadBtn.onclick = () => downloadLessonZip(lesson);
    }
  }

  function setupCodeTab(lesson) {
    if (!UI.lessonCodeFileTabs || !UI.lessonCodeViewer) return;

    const files = lesson.files && lesson.files.length > 0 ? lesson.files : [
      { name: 'index.html', relPath: `${lesson.folderPath}/index.html` }
    ];

    UI.lessonCodeFileTabs.innerHTML = files.map((f, idx) => `
      <button class="code-file-btn ${idx === 0 ? 'active' : ''}" data-path="${f.relPath}">
        ${f.name}
      </button>
    `).join('');

    UI.lessonCodeFileTabs.querySelectorAll('.code-file-btn').forEach(btn => {
      btn.onclick = () => {
        UI.lessonCodeFileTabs.querySelectorAll('.code-file-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        fetchCode(btn.dataset.path);
      };
    });

    if (files.length > 0) {
      fetchCode(files[0].relPath);
    }

    if (UI.lessonCopyCodeBtn) {
      UI.lessonCopyCodeBtn.onclick = () => {
        if (UI.lessonCodeViewer && navigator.clipboard) {
          navigator.clipboard.writeText(UI.lessonCodeViewer.textContent).then(() => {
            showToast(I18N[App.lang].toastCopied);
          });
        }
      };
    }
  }

  async function fetchCode(path) {
    if (!UI.lessonCodeViewer) return;
    UI.lessonCodeViewer.textContent = 'Kod yuklanmoqda...';

    try {
      const res = await fetch(path);
      if (res.ok) {
        const text = await res.text();
        UI.lessonCodeViewer.textContent = text;
      } else {
        UI.lessonCodeViewer.textContent = `// Fayl mavjud emas yoki yuklanmadi: ${path}`;
      }
    } catch (e) {
      UI.lessonCodeViewer.textContent = `// Xatolik: ${e.message}`;
    }
  }

  async function downloadLessonZip(lesson) {
    if (!lesson) return;
    const btn = UI.lessonDownloadBtn;
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${I18N[App.lang].downloading}`;
      btn.disabled = true;
    }

    try {
      if (typeof JSZip === 'undefined') {
        alert("JSZip kutubxonasi topilmadi.");
        return;
      }

      const zip = new JSZip();
      const folderName = `dars-${lesson.id}-${(lesson.title || 'lesson').replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      const folder = zip.folder(folderName);

      const files = lesson.files && lesson.files.length > 0 ? lesson.files : [
        { name: 'index.html', relPath: `${lesson.folderPath}/index.html` }
      ];

      for (const f of files) {
        try {
          const res = await fetch(f.relPath);
          if (res.ok) {
            const blob = await res.blob();
            folder.file(f.name, blob);
          }
        } catch (e) {
          console.warn('Faylni yuklashda xato:', f.name, e);
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

      showToast(`📦 ${lesson.title} ZIP yuklab olindi!`);
    } catch (e) {
      alert("ZIP yaratishda xato: " + e.message);
    } finally {
      if (btn) {
        btn.innerHTML = origHtml;
        btn.disabled = false;
      }
    }
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
    renderLessonsTree();
    if (App.activeLesson && App.activeLesson.id === id) {
      selectLesson(App.activeLesson);
    }
  }

  function switchTab(tab) {
    App.activeTab = tab;
    document.querySelectorAll('.lesson-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lessonTab === tab);
    });

    document.querySelectorAll('.lesson-view-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `lessonTab-${tab}`);
    });
  }

  function showToast(msg) {
    if (!UI.toast) return;
    UI.toast.textContent = msg;
    UI.toast.classList.add('show');
    setTimeout(() => UI.toast.classList.remove('show'), 2800);
  }

  function setupEvents() {
    // Search input
    if (UI.searchInput) {
      UI.searchInput.oninput = () => {
        App.searchQuery = UI.searchInput.value;
        renderLessonsTree();
      };
    }

    // Tabs
    document.querySelectorAll('.lesson-tab-btn').forEach(btn => {
      btn.onclick = () => switchTab(btn.dataset.lessonTab);
    });

    // Theme Toggle
    if (UI.themeToggleBtn) {
      UI.themeToggleBtn.onclick = () => {
        App.theme = App.theme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', App.theme);
        localStorage.setItem('frontcraft_theme', App.theme);
        UI.themeToggleBtn.innerHTML = App.theme === 'dark' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
      };
    }

    // Lang select
    if (UI.langSelect) {
      UI.langSelect.value = App.lang;
      UI.langSelect.onchange = (e) => {
        App.lang = e.target.value;
        localStorage.setItem('frontcraft_lang', App.lang);
        if (App.activeLesson) selectLesson(App.activeLesson);
      };
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initUI();
    document.body.setAttribute('data-theme', App.theme);
    if (UI.themeToggleBtn) {
      UI.themeToggleBtn.innerHTML = App.theme === 'dark' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    }
    setupEvents();
    loadLessons();
  });

})();
