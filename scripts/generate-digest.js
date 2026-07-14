#!/usr/bin/env node
// Weekly retrieval-practice digest generator.
// Reuses the same dueForReview() rule as index.html's hub, but reads local
// files instead of fetching over REPO_RAW, so it can run outside a browser.
//
// Usage: node scripts/generate-digest.js
// Writes one text file per student to scripts/output/<student>.txt

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const STUDENTS = [
  { id: 'micha', folder: 'Micha', name: 'Micha' },
  { id: 'greg', folder: 'Greg', name: 'Greg' },
  { id: 'thomas', folder: 'Thomas', name: 'Thomas' },
  { id: 'angelique', folder: 'Angelique', name: 'Angelique' },
  { id: 'mel', folder: 'Mel', name: 'Mel' },
  { id: 'emma', folder: 'Emma', name: 'Emma' },
  // Mehdi excluded: no progress.json (business track isn't card-tracked — see curriculum/SCHEMA.md)
];

function loadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

// Identical rule to index.html's dueForReview() — keep these two in sync.
function dueForReview(card, today = new Date()) {
  if (!card || card.status === 'solid') return false;
  const reviews = card.reviews || [];
  const lastRaw = reviews.length > 0 ? reviews[reviews.length - 1] : (card.introduced ?? null);
  if (lastRaw === null || lastRaw === undefined) return true; // backfilled, date unknown
  const days = (today - new Date(lastRaw)) / 86400000;
  return reviews.length === 0 ? days >= 14 : days >= 7;
}

function findCardDef(cardId, levels, curriculumCache) {
  for (const level of levels) {
    const key = level.toLowerCase();
    if (!(key in curriculumCache)) {
      curriculumCache[key] = loadJSON(path.join(ROOT, 'curriculum', `${key}.json`));
    }
    const def = curriculumCache[key];
    const card = def && def.cards.find((c) => c.id === cardId);
    if (card) return card;
  }
  return null;
}

function cleanTitle(title) {
  return (title || '').replace(/^#?\d+(\.\d+)?\s*/, '').replace(/^-|-$/g, '').trim();
}

function buildDigest(student) {
  const progress = loadJSON(path.join(ROOT, student.folder, 'progress.json'));
  if (!progress) return { student, skipped: 'no progress.json' };

  const trackedIds = Object.keys(progress.cards || {});
  if (trackedIds.length === 0) return { student, skipped: 'no cards tracked yet' };

  const dueIds = trackedIds.filter((id) => dueForReview(progress.cards[id]));
  if (dueIds.length === 0) return { student, skipped: 'nothing due' };

  const curriculumCache = {};
  const dueCards = dueIds
    .map((id) => findCardDef(id, progress.levels || [], curriculumCache))
    .filter(Boolean)
    .slice(0, 4); // cap so the message stays skimmable

  if (dueCards.length === 0) return { student, skipped: 'due cards not found in curriculum files' };

  const lessons = loadJSON(path.join(ROOT, student.folder, 'lessons.json')) || [];
  const lastLesson = lessons[0];
  const context = lastLesson ? ` (following on from "${cleanTitle(lastLesson.title)}")` : '';

  const lines = [];
  lines.push(`Subject: A few things to keep fresh before our next lesson`);
  lines.push('');
  lines.push(`Hey ${student.name},`);
  lines.push('');
  lines.push(`Quick refresh${context} — no prep, just think these through or send me a voice note:`);
  lines.push('');
  dueCards.forEach((card, i) => {
    lines.push(`${i + 1}. ${card.goal}`);
    lines.push(`   ${card.evidence}`);
    lines.push('');
  });
  lines.push('See you soon!');

  return { student, text: lines.join('\n'), cardIds: dueCards.map((c) => c.id) };
}

function main() {
  const outDir = path.join(ROOT, 'scripts', 'output');
  fs.mkdirSync(outDir, { recursive: true });

  for (const student of STUDENTS) {
    const result = buildDigest(student);
    if (result.skipped) {
      console.log(`[${result.student.name}] skipped: ${result.skipped}`);
      continue;
    }
    const outPath = path.join(outDir, `${result.student.id}.txt`);
    fs.writeFileSync(outPath, result.text, 'utf8');
    console.log(`[${result.student.name}] due: ${result.cardIds.join(', ')} -> ${path.relative(ROOT, outPath)}`);
  }
}

main();
