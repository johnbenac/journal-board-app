# Journal Foundation — Board Card Builder (MVP)

Single‑user, desktop‑only app for exploring board candidates as "trading cards," assigning them to board slots, and visualizing strengths with radar charts.
Static front‑end only (no server, no telemetry), designed to deploy on GitHub Pages and store everything in the browser.

> **Fail‑fast by design:** If the schema changes, old data will be rejected loudly so you can start fresh. No migrations, no backwards compatibility.

---

## ✨ Features

* **Deck**: Create, read, update, delete candidate cards.
* **Schema‑driven**: UI and validation come from a JSON meta‑schema (enforced globally).
* **Board**: Customizable slots (e.g., Director, Secretary, Treasurer); assign cards and rank choices per slot.
* **Radar charts**: Per‑card radar and a board‑level radar with axis aggregation.
* **Image guardrails**: Accept **PNG 750×1050**, no alpha. All others are rejected.
* **Notes (mini‑CRM)**: Timestamped notes per card.
* **Desktop‑only**: Blocks mobile; asks user to use a desktop site.
* **Local‑only storage**: Session lives in the browser; **no server**.
* **Import/Export**: Export a single JSON "pack" and import it later. (Zip pack planned.)

---

## 📦 What's in this repo

```
journal-board-app/
  index.html          # static entry; references style.css and app.js
  style.css           # styles (no CSS-in-HTML)
  app.js              # app logic (vanilla ES2015+, no build step)
  schema.json         # authoritative meta-schema file (also used by tests)
  default-cards.json  # seed cards (names/stats; no images)
  validation.js       # pure validation helpers (unit-tested)
  tests/
    validateCardData.test.js
    sessionExportImport.test.js
  run-tests.js        # tiny Node test runner (no frameworks)
docs/
  organization.md     # organization strategy and rationale
  testing-philosophy.md
```

---

## 🧠 Core concepts

### Meta‑schema (schema.json)

* Defines all fields (types, ranges, enum options), which ones appear on the radar, and how the board aggregates axes (`sum | mean | max`).
* **Fail‑fast mechanism**: App computes a SHA‑256 of the meta‑schema at runtime. If a saved session's hash differs, the app blocks and offers to reset.

### Card

* Data object keyed by field IDs from the meta‑schema.
* Image stored as **base64 data URL** (PNG 750×1050, no alpha).
* Per‑card notes (plain text, sanitized on render).

### Board

* Exactly one board per session.
* User‑editable **slots**; multiple cards per slot; a card can appear in many slots; ranked preferences.

---

## 🚀 Quick start (local)

**Option 1: file:// (no server)**
Just open `journal-board-app/index.html` in a desktop browser.

**Option 2: any static server**
From the repo root:

```bash
# Python
python3 -m http.server 8000 -d journal-board-app

# or Node http-server if you have it
npx http-server journal-board-app -p 8000
```

Then visit `http://localhost:8000/`.

> **Note:** The app is intentionally offline‑first; after initial load it makes no network requests.

---

## 🧪 Tests

This project includes a tiny, zero‑dependency test runner for logic (validation and pack structure).

```bash
cd journal-board-app
node run-tests.js
```

What's covered:

* Schema validation rules (`validation.js`).
* Session export/import round‑trip (JSON pack, not zip yet).

---

## 🛠 Editing the schema

1. Open `journal-board-app/schema.json` and change fields/radar axes as needed.
2. **Also update** the embedded `EMBEDDED_SCHEMA` constant near the top of `journal-board-app/app.js` (keeps file‑protocol usage simple).
3. Reload the app. If existing data doesn't match the new schema hash, the app will block and prompt you to:

   * Reset and start fresh, or
   * Import a pack that matches the new schema.

> No migrations. No backwards compatibility. This is intentional.

---

## 💾 Storage, import & export

* **Storage**: Browser `localStorage`. Images are **base64 data URLs** inside each card.
* **Export**: Click **Export Session** → downloads `journal_session.jfpack` (**JSON file**; zip format planned).
* **Import**: Click **Import Session** and select a prior JSON pack with the **same** schema hash.

> Roadmap: `.jfpack` as a **zip** with `/cards/*.json`, `/images/*.png`, plus manifest files; single‑card `.jfcard` packs.

---

## 🎯 Image requirements (strict)

* PNG only
* Exactly **750 × 1050** pixels
* No transparency (alpha must be 255 everywhere)

Invalid images are rejected with a clear message.

---

## 🔒 Privacy & security

* No telemetry, no cookies beyond local storage.
* No network calls beyond loading static assets.
* Notes are plain text; we escape output to avoid XSS.
* You are responsible for any third‑party images you add.

---

## ♿ Accessibility (MVP)

* Labels on inputs; desktop focus outlines.
* Board reordering uses buttons today; keyboard support will expand with DnD.

---

## 🧭 Roadmap (next)

* **ZIP packs** for session/card (`.jfpack`, `.jfcard`).
* **Overlay compare view** across multiple cards.
* **Drag‑and‑drop** assignments and rank ordering.
* **Board radar toggle** for "rank ≤ N".
* Saved filters and keyboard improvements.

> These can all be implemented within this static architecture.

---

## 🌐 Deploy to GitHub Pages

Because this is a pure static app, you can deploy straight from the repo:

1. Create a new GitHub repo and push the project.
2. In **Settings → Pages**, choose:

   * **Source**: `Deploy from a branch`
   * **Branch**: `main` (or your default) / root (`/`) or `/journal-board-app` if you keep another root.
3. Wait for Pages to publish, then open the site URL.

> If you prefer CI, add a simple GitHub Actions workflow to publish the `journal-board-app` directory to `gh-pages`.

---

## 🙋‍♀️ Troubleshooting

* **Schema mismatch screen appears**
  You changed the schema. Choose **Reset & Start Fresh** or **Import** a compatible pack.
* **Images won't load**
  Make sure PNG is 750×1050 with no alpha channel.
* **Mobile view blocked**
  This is by design. Use a desktop browser or request the desktop site.

---

## 🧭 Project philosophy (must‑reads)

* `docs/organization.md` — how/why the repo is structured this way.
* `docs/testing-philosophy.md` — what we test and why.

---

## 📄 License

Add your preferred license here.

---

## 💬 Credits & seed data

The app ships with **names only** for six public figures as placeholders: Michelle Obama, Alfred Nobel, J. Robert Oppenheimer, Malala Yousafzai, Edward Snowden, Amal Clooney.
Please ensure you have rights to any images you add locally.

---

## 🤝 Contributing

* Keep features **schema‑driven**.
* Prefer **pure functions** for validation and export/import (easy to test).
* Honor the **fail‑fast** rule—no migrations.
* Keep scripts and styles in their own files; no inline `<script>` or `<style>` in HTML.

---
