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
   - **Structured, not a stream of consciousness** — three distinct parts:
     (1) a one-line context/hook tying to the last lesson, (2) the task
     itself stated plainly, (3) how to respond (voice note or think it
     through). Second person, warm, but not slangy — this is a tutor
     writing to a student, not a text to a friend. Keep it short regardless.
   - Invite a reply (voice note) — gives a free homework-completion signal
     that doesn't exist anywhere else in this system today.
   - Light emoji in the subject is fine — matches the existing lesson
     pages' visual voice — but keep the body itself restrained.
   - Skip students `collect-due.js` marks `skipped` (nothing due, or no
     `progress.json` yet — currently Angelique and Emma).
   - **Don't write a sign-off** — `email-template.js` always closes with
     "See you soon, Durim" itself; adding one in the copy would duplicate it.

3. **Wrap it — `scripts/email-template.js`**. `renderDigestEmail()` takes
   `{ studentId, studentName, folder, hookLine, challengeText }` and returns
   branded HTML: the same per-student `--accent` color and emoji already
   used in `dashboard.html` / `{Student}/index.html` (`STUDENT_BRAND` map —
   add an entry here for any new student), a "challenge" card, and a CTA
   button linking to `https://durkiman.github.io/Language-Teaching/{folder}/`.
   Plain-text copy in step 2 doubles as the `body` fallback alongside the
   rendered `htmlBody` — mirror the same three-part structure and end it
   with "See you soon, Durim" by hand, since the plain-text fallback
   doesn't run through the template. Structure lives in `email-template.js`
   and stays templated; only the copy from step 2 is written per run.

   Then create one Gmail draft per student (never auto-send without explicit
   sign-off) via the Gmail MCP tools (`htmlBody` + plain-text `body`),
   addressed from the student contact list (not stored in this repo — it's
   public on GitHub Pages).

`scripts/output/` is gitignored — it's regenerated each run and goes stale
immediately once review dates change.
