// scripts/indexer-lessons.js - Build data/lessons.json from core 01-05 modules + projects
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'data', 'lessons.json');
const PROJECTS_FILE = path.join(ROOT_DIR, 'data', 'projects.json');

const MODULE_CONFIG = {
  '01. HTML': { icon: 'fa-html5', color: '#e34c26', name: 'HTML5 Asoslari' },
  '02. CSS': { icon: 'fa-css3-alt', color: '#264de4', name: 'CSS3 & Stillar' },
  '03. JS': { icon: 'fa-js', color: '#f7df1e', name: 'JavaScript Asoslari' },
  '04. Advanced JavaScript': { icon: 'fa-bolt', color: '#eab308', name: 'Advanced JavaScript' },
  '05. React': { icon: 'fa-react', color: '#61dafb', name: 'React Zamonaviy Kutubxonasi' }
};

function indexLessons() {
  const modules = ['01. HTML', '02. CSS', '03. JS', '04. Advanced JavaScript', '05. React'];
  const lessons = [];
  let lessonId = 1;

  // 1. Core Masterclass Modules (01-05)
  modules.forEach(modDir => {
    const fullModDir = path.join(ROOT_DIR, modDir);
    if (!fs.existsSync(fullModDir)) return;

    const subDirs = fs.readdirSync(fullModDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    subDirs.sort((a, b) => {
      const numA = parseInt(a.replace(/^\D*(\d+).*/, '$1'), 10) || 0;
      const numB = parseInt(b.replace(/^\D*(\d+).*/, '$1'), 10) || 0;
      return numA - numB;
    });

    const cfg = MODULE_CONFIG[modDir] || { icon: 'fa-code', color: '#38bdf8', name: modDir };

    subDirs.forEach(sub => {
      const lessonPath = path.join(fullModDir, sub);
      const files = fs.readdirSync(lessonPath).filter(f => !fs.statSync(path.join(lessonPath, f)).isDirectory());
      const cleanTitle = sub.replace(/^0?\d+[\.\s\-]*/, '').replace(/-\d+$/, '').trim() || sub;

      lessons.push({
        id: lessonId++,
        module: modDir,
        moduleName: cfg.name,
        moduleIcon: cfg.icon,
        moduleColor: cfg.color,
        rawTitle: sub,
        title: cleanTitle,
        folderPath: `./${modDir}/${sub}`,
        demo: fs.existsSync(path.join(lessonPath, 'index.html')) ? `./${modDir}/${sub}/index.html` : null,
        files: files.map(f => ({
          name: f,
          relPath: `./${modDir}/${sub}/${f}`
        })),
        objective: `${cfg.name} moduli doirasida ${cleanTitle} mavzusini nazariy va amaliy jihatdan o'rganish.`,
        steps: [
          '1. Mavzu asoslari va sintaksis qoidalarini ko\'rib chiqish',
          '2. Jonli namunani (Preview) ko\'rib chiqish va o\'rganish',
          '3. Kod fayllarini (HTML, CSS, JS) tahlil qilish',
          '4. Amaliy mashqni mustaqil bajarib sinovdan o\'tkazish'
        ],
        codeExplanation: `Ushbu darsda ${cfg.name} ga xos ilg'or amaliyotlar (Best Practices) va toza kod yozish standartlari qo'llanilgan.`,
        exercise: `Dars kodiga o'zgartirish kiritib, o'zingizning mustaqil mini variantingizni yarating.`
      });
    });
  });

  // 2. Portfolio Projects Lessons from projects.json
  if (fs.existsSync(PROJECTS_FILE)) {
    try {
      const projects = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8'));
      projects.forEach(p => {
        let modKey = '06. Boshlang\'ich Portfolio Darslari';
        let modName = 'Boshlang\'ich Portfolio Darslari';
        let modIcon = 'fa-seedling';
        let modColor = '#10b981';

        if (p.level.toLowerCase().includes('o\'rta')) {
          modKey = '07. O\'rta Portfolio Darslari';
          modName = 'O\'rta Daraja Portfolio Darslari';
          modIcon = 'fa-cubes';
          modColor = '#38bdf8';
        } else if (p.level.toLowerCase().includes('murakkab')) {
          modKey = '08. Murakkab Portfolio Darslari';
          modName = 'Murakkab Portfolio Darslari';
          modIcon = 'fa-rocket';
          modColor = '#ec4899';
        }

        const projectDir = p.demo ? p.demo.replace('/index.html', '') : '';
        const files = ['index.html', 'style.css', 'script.js', 'README.md'];

        lessons.push({
          id: lessonId++,
          projectId: p.id,
          module: modKey,
          moduleName: modName,
          moduleIcon: modIcon,
          moduleColor: modColor,
          rawTitle: p.title,
          title: p.title,
          folderPath: `./${projectDir}`,
          demo: p.demo,
          files: files.map(f => ({
            name: f,
            relPath: `./${projectDir}/${f}`
          })),
          objective: p.lesson ? p.lesson.objective : `${p.title} loyihasini noldan professional darajada yaratish.`,
          steps: p.lesson && p.lesson.steps ? p.lesson.steps : [
            '1. HTML semantik skeletini tuzish',
            '2. CSS bilan zamonaviy dizayn va responsivlik berish',
            '3. JavaScript mantiqini va funksiyalarini ulash',
            '4. Brauzerda testdan o\'tkazish va optimizatsiya qilish'
          ],
          codeExplanation: p.lesson ? p.lesson.codeExplanation : `Ushbu loyihada ${p.tech.join(', ')} texnologiyalari yordamida toza arxitektura qurilgan.`,
          exercise: p.lesson ? p.lesson.exercise : `Loyihaga qo'shimcha yangi funksiya qo'shing va o'zgartiring.`
        });
      });
    } catch (e) {
      console.warn('Error reading projects.json:', e);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(lessons, null, 2), 'utf8');
  console.log(`Indexed ${lessons.length} total lessons (Foundation + Projects) into ${OUTPUT_FILE}`);
}

indexLessons();
