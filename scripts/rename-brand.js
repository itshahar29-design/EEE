// scripts/rename-brand.js - Cleanly replace all EduMemory references with FrontCraft Pro
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', path.relative(ROOT_DIR, filePath));
  }
}

const rootFiles = [
  'index.html',
  'portal.js',
  'style.css',
  'manifest.json',
  'package.json',
  'README.md',
  'render.yaml',
  'server.js',
  'sw.js',
  path.join('scripts', 'validate.js'),
  path.join('scripts', 'indexer.js'),
  path.join('scripts', 'generate-projects.js'),
  path.join('scripts', 'generate-stage2.js'),
  path.join('data', 'projects.json')
];

const brandReplacements = [
  ['EduMemory Pro - Frontend Platformasi', 'FrontCraft Pro - Frontend Platformasi'],
  ['EduMemory Pro Platformasi', 'FrontCraft Pro Platformasi'],
  ['EduMemory Pro Platforma', 'FrontCraft Pro Platforma'],
  ['EduMemory Pro', 'FrontCraft Pro'],
  ['EduMemory Frontend Platformasi', 'FrontCraft Frontend Platformasi'],
  ['EduMemory Frontend Platforma', 'FrontCraft Frontend Platforma'],
  ['EduMemory', 'FrontCraft'],
  ['edumemory-pro', 'frontcraft-pro'],
  ['edumemory', 'frontcraft']
];

rootFiles.forEach(f => {
  replaceInFile(path.join(ROOT_DIR, f), brandReplacements);
});

// Also replace in 06. Loyihalar
const projectsDir = path.join(ROOT_DIR, '06. Loyihalar');
if (fs.existsSync(projectsDir)) {
  const folders = fs.readdirSync(projectsDir);
  folders.forEach(folder => {
    const fPath = path.join(projectsDir, folder);
    if (fs.statSync(fPath).isDirectory()) {
      ['index.html', 'script.js', 'README.md', 'package.json', 'LICENSE'].forEach(subFile => {
        replaceInFile(path.join(fPath, subFile), brandReplacements);
      });
    }
  });
}

console.log('Brand renaming completed to FrontCraft Pro!');
