# Curriculum schema

## Repo layout

```
Language-Teaching/
├── curriculum/
│   ├── a2.json          ← card definitions, shared, student-agnostic
│   └── b1.json
├── micha/
│   ├── index.html
│   ├── lessons.json
│   └── progress.json    ← per-student card statuses
├── thomas/
│   └── … same pattern
└── index.html           ← hub
```

Card definitions live once at repo root under `curriculum/`; progress lives in each student folder. The hub fetches both via the existing `REPO_RAW` constant.

## Card definition (`curriculum/{level}.json`)

Top level: `level`, `source`, `strands` (id + title), `cards`.

Each card:

| Field | Type | Notes |
|---|---|---|
| `id` | string | `"A2-07"` — stable, never renumber; append new cards at the end of a strand |
| `strand` | string | strand id |
| `title` | string | short label for UI |
| `goal` | string | the tracked can-do statement |
| `functions` / `grammar` / `discourse` / `lexis` | string[] | Core Inventory content; empty array when not applicable |
| `exponents` | string[] | optional — model phrases, for cards where the exponents ARE the content |
| `evidence` | string | the pass/fail free-production task; passing it is the only route to "solid" |
| `skin_examples` | string[] | reminders of how the card re-skins; not exhaustive |
| `note` | string | optional cross-references (e.g. "full contrast is B1-04") |

## Student progress (`{student}/progress.json`)

```json
{
  "student": "micha",
  "levels": ["A2", "B1"],
  "cards": {
    "A2-06": {
      "status": "reviewed",
      "introduced": "2026-03-14",
      "reviews": ["2026-04-02"],
      "notes": "linkers still shaky"
    }
  }
}
```

- `levels` — which curriculum files the hub loads for this student. A student can span two (Greg: A2 + B1).
- `cards` — keyed by card id. **Absence = not seen.** Only touched cards appear.
- `status` — `introduced` → `reviewed` → `solid`. Rules:
  - `introduced`: the card was a lesson's primary focus.
  - `reviewed`: it reappeared as a primary or retrieval focus at least once after introduction.
  - `solid`: the student passed the card's evidence task in free production. Controlled-practice success never counts.
- `introduced` / `reviews` — ISO dates. `null` is allowed for backfilled history (date unknown); treat null as "due now."
- `notes` — teacher-facing only; never rendered in student view.

## Lesson tagging (`{student}/lessons.json`)

Add one optional field to each existing lesson entry:

```json
{
  "title": "Present Simple vs Continuous",
  "file": "present-continuous-wildlife.html",
  "goals": { "primary": ["A2-01"], "incidental": ["A2-06", "A2-20"] }
}
```

- `primary` — the card(s) the lesson was built to teach: max 2. Drives status changes.
- `incidental` — cards the lesson touched in passing. Never changes status; feeds warm-up/retrieval suggestions.
- Old lesson entries without `goals` remain valid — the field is optional everywhere.

## Hub logic (computed, not stored)

For each student, after loading curriculum + progress:

```js
function dueForReview(card, today) {
  if (!card || card.status === "solid") return false;
  const last = card.reviews.at(-1) ?? card.introduced;
  if (last === null) return true;                       // backfilled, date unknown
  const days = (today - new Date(last)) / 86400000;
  return card.reviews.length === 0 ? days >= 14         // first review ~2–3 sessions
                                   : days >= 7;         // then 1 week
}
```

Three derived views per student:

1. **Gaps** — cards in the student's levels absent from `progress.json`, grouped by strand. This is the "what to build next" list.
2. **Due** — cards where `dueForReview()` is true. Feed these into the next lesson's warm-up or make one the primary focus.
3. **Progress** — solid / total per strand. This is the student- and parent-visible number.

Day-count thresholds (14/7) approximate the 2–3-sessions-then-1-week rule for weekly students; adjust per student if session frequency differs.

## Workflow

1. Build a lesson → tag `goals` in `lessons.json` when adding the manifest entry.
2. After the session → update `progress.json`: new primary cards → `introduced`; re-taught cards → append to `reviews`, status → `reviewed`.
3. Evidence task passed live → status `solid`. (The evidence task IS the lesson's free-production phase, so this usually costs zero extra time.)
4. Planning the next lesson → open the hub, read Gaps + Due for that student.

## Scope notes

- Mehdi's business track keeps its five-pillar structure; if you want him tracked, borrow individual B1 cards (B1-08, B1-09, B1-11, B1-19, B1-20 map cleanly onto coaching/business English) rather than assigning him the whole level.
- Mel (Albanian) and Emma (Spanish) need their own card sets — the schema is language-agnostic, only `curriculum/*.json` contents are English-specific.
- A1 set (Angelique) not yet drafted; same process from the Core Inventory A1 section when needed.
