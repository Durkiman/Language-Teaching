---
description: Build an interactive homework tool for a student, register it in their hub, and (if emailed) draft a link to it
---

You are building homework for a student in Durim's language teaching business, right after a lesson. This replaces the old plain-text homework note — homework now lives as a real page in the student's hub.

## Step 1 — Identify the student and lesson

If Durim named a student in his message, use that. Otherwise, use whichever student was most recently debriefed (check git log / most recent `progress.json` update timestamp — ask if genuinely ambiguous between two recently-touched students, don't guess).

Read:
1. `{student}/progress.json` — the card(s) just worked on, its `status` and `notes`
2. `{student}/teacher-notes.md`, if it exists — latest dated entry
3. Most recent entry in `{student}/lessons.json` — topic/skin used, so homework stays consistent with it
4. That student's existing lesson HTML files, to match their established design system (fonts, colors, tab conventions)

## Step 2 — Design the homework content

Keep it short — 3-5 tasks. Match:

- **Level and L1 support**: comprehensible at the student's level; French glosses/instructions for students whose profile calls for bilingual support (heavy for Micha and Angelique, light or none for Thomas/Fayçal/Alejandro etc.)
- **Topic continuity**: extend the actual lesson's topic/skin, don't introduce something unrelated
- **Format by student type**: preteens get something game-like and visual; adults get realistic tasks tied to their real context (Mehdi: business scenario; Angelique: sound healing; Greg: bar/surfing; etc.)
- **One task targets the specific struggle/card** flagged in the debrief or `teacher-notes.md`
- Mix task types so the export (Step 4) has something concrete to capture: 2-3 short-answer or fill-in text boxes, and 1 open-ended writing/reflection box. Avoid pure multiple-choice-only sets — Durim needs to see actual language production, not just clicks.

## Step 3 — Build the self-contained HTML tool

Single file, mobile-friendly, matching the student's existing design system (same fonts/CSS vars/tab conventions as their lesson tools — check an existing file from `{student}/` for reference). Requirements:

- Topic-only title (no student name, no date, no "Homework #3" labels)
- Each task as its own card with a text input or textarea for the student's answer
- No teacher-notes toggle needed here (this is student-only content, no teacher-notes section)
- **Export mechanism** (this is the key new piece): a single "Send my answers" button at the bottom that:
  1. Collects all filled-in answers into a clean, readable plain-text block (task label + student's answer, in order)
  2. Opens a `mailto:` link addressed to the `TEACHER_EMAIL` constant (read from `assets/config.js` — reference it via relative path `../assets/config.js` or however the student's folder depth requires; if `config.js` doesn't exist yet, stop and tell Durim to run the hub migration first rather than hardcoding an address into this file)
  3. Pre-fills the subject as `Homework — {student name} — {topic}` and the body with the collected answers block
  4. Also show a secondary "Copy my answers" button (clipboard copy of the same text block) as a fallback, since `mailto:` links don't always open cleanly on mobile browsers without a configured mail app — label it something like "or copy to send another way"
- Keep visual style consistent with the student's other tools; this should feel like a natural extension of their hub, not a bolted-on generic form
- **Writing bubble** (mandatory on every tool, including homework): include `<link rel="stylesheet" href="../../assets/write-bubble.css">` in `<head>` and `<script src="../../assets/write-bubble.js"></script>` before `</body>` (adjust the relative path — homework files live one folder deeper, in `{student}/homework/`). This is a separate, shared self-injecting widget — a tab on the right edge of the screen with its own Save/Export for free-writing notes — distinct from the task-answer "Send my answers"/"Copy my answers" export above. No other markup or wiring needed.

## Step 4 — Save and register

Save the file to `{student}/homework/{descriptive-kebab-case-title}.html` (create `homework/` if it doesn't exist).

Add an entry to `{student}/homework.json` (create as `[]` first if it doesn't exist yet):

```json
{
  "title": "...",
  "file": "....html",
  "date": "{today, ISO}"
}
```

## Step 5 — Commit and push

This content is meant to live in the public hub (unlike the old markdown drafts), so commit and push it:

```
Add homework: {topic} for {student}
```

## Step 6 — Check if this student is emailed, and draft a link if so

Search Gmail for a prior thread with this student (by first name, and last name/initial if known). Use judgment — an actual back-and-forth thread, not an incidental name mention.

- **If a matching thread exists**: create a Gmail **draft** (reply in-thread if possible, otherwise new email) with a short, warm note and a **link to the student's hub page** (`https://durkiman.github.io/Language-Teaching/{student}/`) rather than embedding the homework text — the whole point is drawing them back into the hub. Something like: "Here's your homework from today's lesson — you'll find it in your homework list: [link]." Never send automatically, draft only.
- **If no matching thread exists**: skip — this student isn't emailed (Preply-messaged or WhatsApp like Greg). Don't guess an address.

## Step 7 — Present to Durim

Report: the homework tool built and its file path, the hub link the student would use, and whether a Gmail draft was created (and whether it was a reply or new email) so Durim knows to check Gmail before anything reaches the student any other way.
