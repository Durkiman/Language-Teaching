# Weekly student digest

Two-step pipeline, deliberately not one script:

1. **`node scripts/collect-due.js`** — deterministic. Computes which curriculum
   cards are due for review per student (same `dueForReview()` rule as
   `index.html`'s hub) and writes `scripts/output/due.json` with each due
   card's `goal`, `evidence`, and `skin_examples` (interest-based re-skin
   hints already authored into `curriculum/*.json`), plus the student's most
   recent lesson title.

2. **Write the message** — not templated. Turning `due.json` into student
   copy is a writing task, not string substitution: raw card `goal`/`evidence`
   text reads like an assessment report ("Can describe habits, routines and
   daily life in connected sentences") and gets ignored. Confirmed voice:

   - **One flagship challenge per student**, not a checklist of every due
     card — pick whichever due card's `skin_examples` best fits that
     student's known interests (see their lesson filenames/themes for cues).
   - Casual, second person, short — write it like a text, not a memo.
   - Invite a reply (voice note) — gives a free homework-completion signal
     that doesn't exist anywhere else in this system today.
   - Light emoji in the subject and sign-off is fine — matches the existing
     lesson pages' visual voice (tags, hero banners, emoji throughout).
   - Skip students `collect-due.js` marks `skipped` (nothing due, or no
     `progress.json` yet — currently Angelique and Emma).

   Then create one Gmail draft per student (never auto-send without explicit
   sign-off) via the Gmail MCP tools, addressed from the student contact
   list (not stored in this repo — it's public on GitHub Pages).

`scripts/output/` is gitignored — it's regenerated each run and goes stale
immediately once review dates change.
