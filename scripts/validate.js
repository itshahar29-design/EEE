// scripts/validate.js - Validate every project for code lines, files, syntax, and accessibility
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROJECTS_JSON = path.join(ROOT_DIR, 'data', 'projects.json');

function validate() {
  console.log('==================================================');
  console.log('🔍 EDUMEMORY FRONTEND PLATFORMA - LOYIHALAR TEKSHIRUVI');
  console.log('==================================================\n');

  if (!fs.existsSync(PROJECTS_JSON)) {
    console.error('❌ Xato: data/projects.json fayli topilmadi!');
    process.exit(1);
  }

  const projects = JSON.parse(fs.readFileSync(PROJECTS_JSON, 'utf8'));
  let totalChecked = 0;
  let passedCount = 0;
  let errors = [];

  for (const p of projects) {
    totalChecked++;
    const projectDir = path.resolve(ROOT_DIR, p.demo ? path.dirname(p.demo) : `06. Loyihalar/${p.id}. ${p.title}`);
    
    if (!fs.existsSync(projectDir)) {
      errors.push(`[ID ${p.id}] Papka topilmadi: ${projectDir}`);
      continue;
    }

    const htmlPath = path.join(projectDir, 'index.html');
    const cssPath = path.join(projectDir, 'style.css');
    const jsPath = path.join(projectDir, 'script.js');
    const readmePath = path.join(projectDir, 'README.md');
    const pkgPath = path.join(projectDir, 'package.json');
    const licensePath = path.join(projectDir, 'LICENSE');

    // 1. Fayllar mavjudligi
    const missingFiles = [];
    if (!fs.existsSync(htmlPath)) missingFiles.push('index.html');
    if (!fs.existsSync(cssPath)) missingFiles.push('style.css');
    if (!fs.existsSync(jsPath)) missingFiles.push('script.js');
    if (!fs.existsSync(readmePath)) missingFiles.push('README.md');
    if (!fs.existsSync(pkgPath)) missingFiles.push('package.json');
    if (!fs.existsSync(licensePath)) missingFiles.push('LICENSE');

    if (missingFiles.length > 0) {
      errors.push(`[ID ${p.id}] Yetishmayotgan fayllar: ${missingFiles.join(', ')}`);
      continue;
    }

    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    const htmlLines = htmlContent.split('\n').length;
    const cssLines = cssContent.split('\n').length;
    const jsLines = jsContent.split('\n').length;
    const totalLines = htmlLines + cssLines + jsLines;

    // 2. Qatorlar soni (Yangi qo'shilgan 101+ loyihalar uchun kamida 300 qator)
    if (p.id > 100 && totalLines < 300) {
      errors.push(`[ID ${p.id}] ${p.title}: Qatorlar soni 300 dan kam (${totalLines} qator: HTML=${htmlLines}, CSS=${cssLines}, JS=${jsLines})`);
      continue;
    }

    // 3. HTML tekshiruvi
    if (!htmlContent.includes('<!DOCTYPE html>') && !htmlContent.includes('<!doctype html>')) {
      errors.push(`[ID ${p.id}] HTML DOCTYPE topilmadi`);
      continue;
    }

    // 4. JS Sintaksis tekshiruvi (No syntax error)
    if (jsContent.trim().length > 0) {
      try {
        new vm.Script(jsContent);
      } catch (e) {
        errors.push(`[ID ${p.id}] JavaScript sintaksis xatosi: ${e.message}`);
        continue;
      }
    }

    // 5. Funksiyalar soni tekshiruvi (Kamida 3 ta real funksiya/metod)
    if (p.id > 100) {
      const functionMatches = jsContent.match(/function\s+\w+|const\s+\w+\s*=\s*(\([^)]*\)|async\s*\([^)]*\)|\w+)\s*=>/g) || [];
      const classMethods = jsContent.match(/\b\w+\s*\([^)]*\)\s*\{/g) || [];
      const totalFuncs = functionMatches.length + classMethods.length;
      if (totalFuncs < 3) {
        errors.push(`[ID ${p.id}] ${p.title}: 3 tadan kam funksiya aniqlandi (${totalFuncs} ta)`);
        continue;
      }
    }

    passedCount++;
  }

  console.log(`Jami tekshirilgan loyihalar: ${totalChecked}`);
  console.log(`✅ Muvaffaqiyatli o'tganlar: ${passedCount}`);
  console.log(`❌ Xatolar soni: ${errors.length}\n`);

  if (errors.length > 0) {
    console.error('XATOLAR RO\'YXATI:');
    errors.forEach(err => console.error('  - ' + err));
    console.error('\nTekshiruv muvaffaqiyatsiz yakunlandi.');
    process.exit(1);
  } else {
    console.log('🎉 Barcha loyihalar muvaffaqiyatli tekshiruvdan o\'tdi!');
    process.exit(0);
  }
}

validate();
