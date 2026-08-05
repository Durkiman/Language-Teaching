---
description: Build full lesson HTML tools from approved draft plans, register them, and push to GitHub
---

You are building lesson tools from approved draft plans for Durim's language teaching business.

## Step 1 — Find approved drafts

Search every `{student}/drafts/` folder for `*-plan.md` files. Each file you find here is considered **approved** — Durim reviews drafts by either editing/leaving them (approve) or deleting them (reject), so by the time this command runs, anything still present should be built. If a draft's `Status:` line has been manually changed to something like `REJECTED` or `SKIP`, skip it and leave it in place rather than building it.

If no draft files exist anywhere, say so and stop — there's nothing to build.

## Step 2 — Build the lesson tool

For each remaining draft:

1. Read the draft plan in full.
2. Check `{student}/` for that student's specific design system (fonts, CSS vars, tab conventions) — look at their most recent existing lesson HTML file as a reference, and check the memory/conventions below.
3. Build a single-file, self-contained, mobile-friendly HTML lesson tool following the universal standards:
   - Topic-only title on the page itself (`<title>` and `<h1>`) — no student name, no session number, no pillar/session labels. (Session numbering belongs in `lessons.json`'s `title` field, not on the page — see Step 3.)
   - No dedicated Cool-down tab
   - Teacher notes hidden behind a toggle button (not visible by default)
   - No time labels anywhere in the tool
   - No filler subtitle under the header
   - Recap tab with a toggle revealing the can-do card (code, function, grammar focus, evidence task) from the draft
   - Floating 50-minute timer bubble (bottom-left) opening a whiteboard panel (timer controls, stamps, correction display, notes, copy/clear)
   - Writing bubble (mandatory on every lesson tool): include `<link rel="stylesheet" href="../assets/write-bubble.css">` in `<head>` and `<script src="../assets/write-bubble.js"></script>` before `</body>` (adjust relative path to the file's folder depth). This is a shared, self-injecting widget — a tab on the right edge of the screen that opens a writing panel with a Save button (keeps entries in localStorage) and an Export button (downloads entries as a `.txt` file). No other markup or wiring needed; don't duplicate its HTML/CSS/JS inline.
   - Apply the student's specific design system (colors, fonts, tab set) — match their existing tools' look exactly
4. Save the file into `{student}/` using a descriptive filename derived from the topic (kebab-case, no dates or student names in the filename).

## Step 3 — Register the lesson

Update `{student}/lessons.json`: add a new entry at the TOP of the array (newest-first) with `title`, `file`, and a `goals` field:

```json
{
  "title": "#{N} ...",
  "file": "....html",
  "goals": { "primary": ["{card id}"], "incidental": ["{card id(s)}"] }
}
```

**Number the title** — every existing entry in every student's `lessons.json` is prefixed `#N Title` (session count for that student, sequential). Check the existing entries for that student, find the highest `#N` in use, and prefix the new title with the next number. This numbering is a `lessons.json`-only convention — it does not appear on the built HTML page itself (see Step 2's page-title rule).

## Step 4 — Update progress

Update `{student}/progress.json` per the rules in `curriculum/SCHEMA.md`:
- Primary card not yet in `cards`: add with `status: "introduced"`, `introduced: {today's date, ISO}`, `reviews: []`
- Primary or incidental card already present: append today's date to `reviews`, set `status: "reviewed"` (unless already `"solid"`)
- Do NOT mark anything `"solid"` automatically — that only happens after Durim confirms the evidence task was passed live in the session. Leave a note in the card's `notes` field like "evidence task pending confirmation after session."

## Step 5 — Delete the draft

Remove the `{student}/drafts/{...}-plan.md` file now that it's been built.

## Step 6 — Commit and push

Stage all changes (new HTML file, updated `lessons.json`, updated `progress.json`, deleted draft) and commit with a message like:

```
Add lesson: {topic} for {student} ({card id})
```

One commit per student/lesson built, or a single combined commit if several were built in the same run — use your judgment based on how many drafts there were. Push to the current branch.

## Step 7 — Summarize

List what was built, committed, and pushed, with links/paths, so Durim can see exactly what landed on GitHub.
