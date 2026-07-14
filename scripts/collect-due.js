#!/usr/bin/env node
// Weekly retrieval-practice data collector.
//
// This script deliberately does NOT write the student-facing message.
// Templating produced correct-but-lifeless copy (CEFR can-do statements
// read like an assessment report, not something a student on their phone
// wants to act on). Instead this collects, per student, exactly the
// context a writer needs to make it engaging: due cards with their
// skin_examples (interest-based re-skin hints already authored into the
// curriculum), plus the student's most recent lesson for continuity.
// The message copy gets written per run from this data — see scripts/README.md.
//
// Reuses the same dueForReview() rule as index.html's hub, reading local
// files instead of fetching over REPO_RAW so it can run outside a browser.
//
// Usage: node scripts/collect-due.js
// Writes scripts/output/due.json

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

function collectForStudent(student) {
  const progress = loadJSON(path.join(ROOT, student.folder, 'progress.json'));
  if (!progress) return { student: student.name, id: student.id, skipped: 'no progress.json' };

  const trackedIds = Object.keys(progress.cards || {});
  if (trackedIds.length === 0) return { student: student.name, id: student.id, skipped: 'no cards tracked yet' };

  const dueIds = trackedIds.filter((id) => dueForReview(progress.cards[id]));
  if (dueIds.length === 0) return { student: student.name, id: student.id, skipped: 'nothing due' };

  const curriculumCache = {};
  const dueCards = dueIds
    .map((id) => findCardDef(id, progress.levels || [], curriculumCache))
    .filter(Boolean)
    .map((c) => ({
      id: c.id,
      title: c.title,
      goal: c.goal,
      evidence: c.evidence,
      skin_examples: c.skin_examples || [],
    }));

  if (dueCards.length === 0) return { student: student.name, id: student.id, skipped: 'due cards not found in curriculum files' };

  const lessons = loadJSON(path.join(ROOT, student.folder, 'lessons.json')) || [];
  const lastLesson = lessons[0] ? cleanTitle(lessons[0].title) : null;

  return {
    student: student.name,
    id: student.id,
    lastLesson,
    dueCards,
  };
}

function main() {
  const outDir = path.join(ROOT, 'scripts', 'output');
  fs.mkdirSync(outDir, { recursive: true });

  const results = STUDENTS.map(collectForStudent);
  const outPath = path.join(outDir, 'due.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');

  for (const r of results) {
    if (r.skipped) {
      console.log(`[${r.student}] skipped: ${r.skipped}`);
    } else {
      console.log(`[${r.student}] due: ${r.dueCards.map((c) => c.id).join(', ')}`);
    }
  }
  console.log(`\nWrote ${path.relative(ROOT, outPath)}`);
}

main();
