// scripts/generate-lessons.js
//
// Scans each student folder for .html lesson files and rebuilds that
// student's lessons.json to match exactly what's on disk.
//
// Title extraction: pulls the <title>...</title> tag from each HTML file.
// If a file has no <title>, falls back to a title-cased version of the
// filename. index.html files at the root are skipped automatically.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Folders to treat as "student folders". Skips anything starting with a dot,
// node_modules, scripts, .github, etc.
const SKIP = new Set(['.git', '.github', 'node_modules', 'scripts']);

function isStudentFolder(name) {
  if (SKIP.has(name)) return false;
  if (name.startsWith('.')) return false;
  const full = path.join(ROOT, name);
  return fs.statSync(full).isDirectory();
}

function titleFromFile(filePath, fileName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/<title>(.*?)<\/title>/is);
    if (match && match[1].trim()) {
      return match[1].trim();
    }
  } catch (err) {
    // fall through to filename fallback
  }
  return fileName
    .replace(/\.html$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function generateForStudent(folder) {
  const dir = path.join(ROOT, folder);
  const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.html'));

  // Sort alphabetically so output is stable across runs (avoids noisy diffs).
  files.sort((a, b) => a.localeCompare(b));

  const lessons = files.map(file => ({
    file,
    title: titleFromFile(path.join(dir, file), file),
  }));

  const outPath = path.join(dir, 'lessons.json');
  const newContent = JSON.stringify(lessons, null, 2) + '\n';

  const existing = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : null;
  if (existing === newContent) {
    console.log(`[skip] ${folder}/lessons.json already up to date (${lessons.length} lessons)`);
    return false;
  }

  fs.writeFileSync(outPath, newContent);
  console.log(`[write] ${folder}/lessons.json (${lessons.length} lessons)`);
  return true;
}

function main() {
  const entries = fs.readdirSync(ROOT).filter(isStudentFolder);
  let changed = false;
  for (const folder of entries) {
    const didChange = generateForStudent(folder);
    changed = changed || didChange;
  }
  // Exit code 0 always; the workflow checks git status separately to decide
  // whether to commit.
  console.log(changed ? 'Done — changes written.' : 'Done — nothing changed.');
}

main();
