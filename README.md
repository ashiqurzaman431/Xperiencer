# Xperiencer

A single-file life management app — events, schedules, recurring routines, and a calendar view, all in one lightweight PWA. No backend, no build step, no dependencies beyond a Google Font.

## Features

- **Events** — Free-form notes/memories tagged as past, ongoing, or upcoming. Each one opens into a full detail view with editable title/body, tags, and an optional cover image.
- **Schedule** — Day-by-day view of one-off appointments and applicable recurring routines, merged into a single timeline.
- **Routine** — Recurring tasks by weekday or day-of-month, with daily completion tracking.
- **Calendar** — Week (hourly grid) or month view of everything on your plate.
- **Conflict detection** — Saving an event or schedule that overlaps an existing one suggests the nearest free slot, before or after, within a 14-day window.
- **Installable** — Works as a Progressive Web App (PWA): add to home screen, runs offline after first load.

## Tech

- Plain HTML/CSS/JS — all app logic lives inline in `index.html`.
- Data persists to the browser's `localStorage` (events, schedules, routines, completions, cover images). Nothing leaves the device.
- No frameworks, no build tools, no npm install.

## Hosting on GitHub Pages

1. Push this folder to a repo, keeping the structure below intact:

   ```
   /
   ├── index.html
   ├── manifest.json
   ├── sw.js
   └── icons/
       ├── icon-192.png
       └── icon-512.png
   ```

2. In the repo settings, enable **Pages** → deploy from the `main` branch (root folder).
3. Visit the published URL. On mobile, use "Add to Home Screen" to install it as an app.

### Updating after changes

The service worker (`sw.js`) caches the app shell for offline use. Browsers won't pick up your latest `index.html` changes until the cache is busted — bump the version string in `sw.js` on every deploy:

```js
const CACHE_NAME = 'xperiencer-cache-v1'; // bump to v2, v3, ... on each update
```

## Data & privacy

All data lives in your browser's `localStorage`. There's no server, no account, no sync — clearing your browser data or switching devices/browsers will lose your data. There is currently no export/import or cloud backup.

## Known limitations

- Routines have no edit/delete UI yet — only events and schedules can be modified after creation.
- Cover images stored against deleted events aren't cleaned up automatically (minor storage leak over time).
- Event state (past/ongoing/upcoming) is set manually when creating an event rather than derived from its date/time.
