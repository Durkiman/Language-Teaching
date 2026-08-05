---
description: Audit every student's lesson HTML tools against universal standards and fix drift
---

You are auditing the lesson tool library for Durim's language teaching business against his established standards. Be thorough but conservative — flag anything ambiguous rather than guessing.

## Step 1 — Build the file list

Find every lesson HTML file across all student folders (root-level student folders, each containing `.html` lesson files plus `lessons.json`/`progress.json`). Skip `index.html` files that are hub/navigation pages rather than lesson tools, and skip any standalone vocab-hub files (e.g. `micha-vocab.html`) — audit those against their own separate conventions only if asked, not by default.

## Step 2 — Check each file against universal standards

For every lesson HTML file, check for:

1. **Title**: topic-only — no student name, no session number, no pillar/session labels anywhere in the visible title or `<title>` tag
2. **No dedicated Cool-down tab** — cool-down should be live/verbal only, never a tab or section in the tool
3. **Teacher notes toggle**: must be hidden behind a toggle button, never visible by default on load
4. **No time labels**: no "5 min", "10 minutes", etc. visible anywhere in the student-facing UI
5. **No filler subtitle**: no generic/vague subtitle under the header that doesn't convey concrete necessary information
6. **Recap tab**: should exist and include a toggle revealing the can-do card (code, function, grammar focus, evidence task)
7. **Timer bubble**: floating, bottom-left, 50-minute default, tapping opens a whiteboard panel (timer controls, stamps, correction display, notes, copy/clear)
7b. **Writing bubble** (mandatory on every lesson/tool): a right-edge tab opening a writing panel with a Save button and an Export (file download) button. Implemented via the shared `assets/write-bubble.css` + `assets/write-bubble.js` — check the file includes both via `<link>`/`<script>` tags at the correct relative path for its folder depth. Missing this is auto-fixable: just add the two include tags, no other markup needed (the widget injects its own DOM).
8. **Notes drawer / whiteboard panel**: accessible from any tab, not just one
9. **No browser storage misuse**: confirm any persistence uses in-memory/React state or the artifact storage pattern, never raw `localStorage`/`sessionStorage` calls that would break outside this environment (note: files hosted on GitHub Pages CAN use real `localStorage` since they're plain static HTML, not Claude artifacts — don't flag this as an issue for GitHub Pages-hosted tools, only check that it isn't silently broken/erroring)
10. **Single-file, self-contained**: no external file dependencies beyond CDN-hosted libraries and hotlinked media

Also check the student-specific design system where applicable (fonts, CSS variables, tab structure) against what's established for that student — e.g. Micha should use Nunito + `--teal:#2A8A8A`, Angelique should have the Calm/Write floating bubbles, Thomas should have Space Mono + EQ bars, etc. Flag mismatches; don't assume which is "correct" if a student has no established pattern yet (fewer than 2 existing tools) — skip that check for them.

## Step 3 — Categorize findings

For each file, sort issues into:
- **Auto-fixable**: unambiguous mechanical fixes (e.g. a stray time label, a title that includes the student's name, a subtitle that's clearly filler) — fix these directly
- **Needs judgment**: anything where the "correct" fix isn't obvious (e.g. missing timer bubble entirely — is it meant to be added, or was this an intentionally different format?) — do NOT auto-fix, just flag with specifics

## Step 4 — Apply auto-fixes

Make the auto-fixable edits directly to each file. Keep the diff minimal — don't restyle or refactor anything beyond the specific standard being enforced.

## Step 5 — Commit and push

Stage all changed files. Commit with a message like:
```
Audit: fix standards drift across N lesson tools
```
Push to the current branch.

## Step 6 — Report

Give Durim a clear summary:
- **Fixed automatically**: file, what was fixed
- **Flagged for review**: file, issue, why it needs a judgment call
- **Clean**: files with no issues (just a count, not a list)

Keep this tight — a table or short list, not prose paragraphs per file.
