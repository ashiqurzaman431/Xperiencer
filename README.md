# Xperiencer

**Xperiencer** is a personal productivity web app for managing **Events, Schedules, and Routines** in one place — built as a single self-contained `index.html` file, installable as a PWA, and backed by Google Drive for cross-device sync.

No backend server, no database, no build step. It's one HTML file that runs entirely in the browser and syncs your data to your own Google Drive.

---

## ✨ Features

### 📌 Events
- Freeform items you can leave "open" indefinitely or attach to a specific date/time
- Rich note-style detail view for each event with a slash-menu editor (headings, to-do lists, quotes, dividers)
- Cover images — upload, crop, and drag-to-reposition per card
- Full **version history** with per-event snapshots, so past edits are never lost
- Tag support for organizing and filtering
- Duplicate / edit / delete from an in-card menu
- Special **Quote**-type events with a dedicated rotating "Quote Display" widget (shows one quote per session, cycling through all of them without repeats) and a "Quotes Picks" strip of the 20 most recently added/edited quotes

### 📅 Schedule
- Time-based items for a specific date, shown on a horizontal date strip you can page through by week
- Automatic conflict detection when a new schedule overlaps an existing one, with a resolution prompt
- "Find next free slot" logic that scans the day's existing items to suggest an open time
- Live **ongoing / done / missed** state, computed in real time from the current time vs. the scheduled window
- One-tap **reschedule** flow for anything marked missed
- Filterable list view

### 🔁 Routines
- Recurring items that repeat on chosen days of the week
- Daily check-off tracking, with automatic daily reset logic
- **Ready Routines**: save your current set of routines as a named template and re-apply it later in one tap (with duplicate detection)

### 🗓️ Calendar
- Month and week views
- Aggregates Events, Schedules, and Routines together, with per-type counts shown on each day
- Day-detail popup and a per-day **archive** of completed/past items

### 🔔 Real-time Alerts
- A background checker runs on a 20-second interval
- Shows a persistent alert banner starting 5 minutes before an item is due
- Tracks occurrence state per item: upcoming → ongoing → done / missed, with one-tap reschedule for anything missed

### 🔍 Search
- Global search box across all item types

### ☁️ Google Drive Sync
- Sign in with Google (or continue as a local-only guest)
- All app data is stored as a JSON file in your own Google Drive (using the narrow `drive.file` scope — the app can only see files it creates, not your whole Drive)
- Automatic snapshotting with retention of the last 100 save files, so you can recover from a bad sync
- Cover images are uploaded to Drive as separate files and loaded on demand

### 📱 Installable PWA
- `manifest.json` + app icons let you "Add to Home Screen" on mobile for a native-app-like experience
- Safe-area aware layout for notches / gesture bars
- Dark, glassmorphism-inspired UI with a lime/amber accent palette, built around the Inter typeface

---

## 🗂️ Tech Overview

| | |
|---|---|
| **Structure** | Single `index.html` file — HTML, CSS, and vanilla JavaScript, no frameworks or build tools |
| **Storage** | Google Drive (JSON payload) via Google Identity Services + Drive API, with a local-guest fallback |
| **Auth** | Google OAuth (`drive.file` + `userinfo.email` scopes) |
| **Hosting** | Static hosting — this repo is deployed via **GitHub Pages** |
| **Design** | Dark theme, custom CSS variables, Inter font, mobile-first responsive layout |

### Project structure
```
index.html      → the entire application (markup, styles, logic)
manifest.json   → PWA manifest (app name, icons, theme color)
icon-192.png    → app icon (referenced by the manifest)
```

---

## 🚀 Getting Started

1. Clone or download this repository
2. Serve `index.html` (GitHub Pages, or any static host / local server — Google Sign-In requires an actual `http(s)://` origin, not `file://`)
3. On first load, choose to **Sign in with Google** (to sync via Drive) or **Continue as Guest** (local-only)
4. Start adding Events, Schedules, and Routines

### Using your own Google credentials
This project uses its own Google Cloud OAuth Client ID and API Key, configured near the top of `index.html`. If you fork this project and want your own Drive storage, replace those with credentials from your own Google Cloud Console project (with the Drive API enabled and your hosting domain added as an authorized origin).

---

## 👤 About Me

I'm **Ershad** (Ershad5) — I build functional, real-world web apps without writing code from scratch by hand; instead, I work closely with AI assistants to design, debug, and iteratively ship them, mostly as single-file HTML apps hosted on GitHub Pages.

My projects tend to fall into a few buckets:
- **Personal productivity tools** — like Xperiencer, this app
- **Task & account management systems** — including a full PWA for tracking multiple JumpTask micro-task accounts, with Google Drive as the backend
- **Exam / study platforms** — a Bengali-language MCQ exam app for practicing test sets

I work in a structured, deliberate way: plan first, review before applying, keep a clear history of what changed and why. I'm based in Bangladesh and often work across Bengali and English.

Feel free to explore my other repositories for more single-file HTML apps built the same way.

---

## 📄 License

This project is shared as-is for personal use and reference. Feel free to fork it and adapt it for your own workflow.
