# Xperiencer

> *Every moment, noted. Every day, remembered.*

Xperiencer is a personal life-log app, built mobile-first, where **notes, daily routine and schedule come together** in one place. It is a custom-made web app: the owner is the architect and AI is the coder.

**Contents:** [How to Use the App](#how-to-use-the-app) · [Part 1: App Details and Purpose](#part-1-app-details-and-purpose) · [Part 2: Features and Design Choices](#part-2-features-and-design-choices) · [Part 3: Body of the App](#part-3-body-of-the-app)

---

## How to Use the App

Xperiencer is not open to everyone yet. Without a dedicated server and with limited resources to manage one, access is currently restricted.

If you would like to use the app, contact **Ashiqur Zaman Arshad** on LinkedIn and he will give you access.

---

## Part 1: App Details and Purpose

### Core idea: everything is an Event

A schedule, a routine and a note all count as **events**. A note is the written record of something you are currently living through, such as a project you are working on. Because you often cannot know when such an event will end, notes use **Open / Closed** status instead of a start and end time. Schedules and routines have real start and end times.

### Technical basics

- A single `index.html` with no build step, hosted on GitHub Pages.
- Installable as a PWA (`manifest.json`, `sw.js`, install banner). Dark theme with a lime accent.
- Login with **Google (Firebase Auth)** or as a **Guest**. Guest mode saves nothing.
- Signed-in data is saved to the user's own **Firebase Realtime Database** record. Images are uploaded to **Cloudinary**.
- Note for contributors and AI assistants: the function `driveSaveData()` is a leftover name from the Google Drive days. It now saves to Firebase.

### The five tabs

| Tab | What it is for |
|---|---|
| **Events** | The home screen: quotes, upcoming schedule and routine items, open notes, and the full list of everything |
| **ToDos** | A simple numbered to-do list |
| **Schedule** | A week strip and a day timeline of schedules and routines |
| **Routine** | Today's routines, routine templates, and the routine editor |
| **Calendar** | A 7-day hour grid and a month view, with an archive of past days |

A green **+** button in the bottom nav adds something new for the current tab.

---

## Part 2: Features and Design Choices

### Item types

- **Note:** Open by default and closeable. A date, time and duration are optional.
- **Quote:** the title is the quote.
- **Schedule (exact):** has a date, start time, duration and end.
- **Schedule (estimated):** has only a date range (for example Aug 12 to 16) and no time. It is for things you know will happen sometime in a window.
- **Routine:** repeats on chosen **weekdays** or on chosen **dates of the month**.

### Notes and the All list

- Schedules and routines live in the Action List and are **not** kept in the All list unless they have a note. Once they have one, they count as events and are kept.
- **Notes as a log:** the editor can insert date and timestamp separators, so you can log the steps of a multi-day project inside one note.
- **Tags** are `#words` separated by spaces. They can be searched, and each tag can have a default cover image.

### Quotes

- Quotes appear in the All list, in Quotes Picks (the latest 20 by last edit) and in the Quote Display.
- The Quote Display picks randomly and changes each time you open the app. It does not repeat until every quote has been shown.
- That pool **resets every Sunday at 0:00 AM** (local time), so a large quote collection never takes forever to cycle.

### In-progress states for schedules and routines

- **Starting soon:** from 5 minutes before the start until the end time.
- **Opening:** tapping a card in that window marks it **open / in progress**. Tapping outside the window only opens the note.
- **Opened items stay open.** After the end time they leave the Action List but are **never auto-missed**. You close them manually with **✓ Close** in the Schedule or Routine tab, or with the Close button on their card in the All list.
- **Unopened items** become **Missed** after their end time (shown in red, with a Close button). A missed schedule can be rescheduled with **↻ Reschedule**.
- **Late-start popup:** if you open something late and it would run into the next item, a popup lets you shorten it or reschedule.
- **Two kinds of "open":** a note's Open/Closed status is separate from a schedule or routine's in-progress state.
- **Daily rollover at 5:00 AM:** on the first app open after 5 AM, unfinished items from the previous day are marked missed. Opened items stay open.
- **Alerts are in-app only.** Cards glow when starting soon, in progress or missed. There are no push notifications.

### Conflict system

- **What it checks:** two items conflict if their time ranges overlap. The **end time counts**, not just the start. The date or day is checked too, so the same time on a different day is fine.
- **Coverage:** routine vs routine, schedule vs schedule, and routine vs schedule. It runs when you save a schedule, a routine, or a note that has a date.
- **Across midnight:** items that run past midnight and multi-day schedules are handled correctly.
- **Routines** are checked against the next 12 months of days they repeat on. Editing only a routine's title or tag skips the check.
- **Estimated schedules are excluded.** Otherwise the feature would be useless on multi-day ranges.
- **Suggestions:**
  - **Before** is the latest same-day time that fits, falling back to an earlier day.
  - **After** is the first free time.
  - For a routine, the suggested time is free on every day it repeats.
  - Example: a 3-hour item at 5 AM against a 7-9 AM item suggests 4:00 AM or 9:00 AM.
- **Ready Routines "Apply"** does not check for conflicts. This is intentional.

### All list rules

- It shows **24 events at a time**, with a **Load more events** button that adds 24 more.
- Search covers all events by title, tag or description.
- Adding a new event makes the list show 25.
- Order: notes and quotes (latest edit first), then schedules with notes, then routines with notes.

### Covers, images and gallery

- Notes, schedules and routines can have a cover image, uploaded to Cloudinary. There is a crop tool for the note cover and for the card cover.
- The gallery shows every cover you have already used. Long-press an image there to make it a tag's default cover.
- The timer card can have its own cover.

### Good to know

- Deleting from the note screen adds an entry to the Deleted log (the last 50). Deleting from the edit sheet does not.
- Guest mode does not save data.

---

## Part 3: Body of the App

### Events tab (top to bottom)

1. **Header:** "Xperiencer", Sign out, the title "Events", and the **All / Open / Closed** filter tabs.
2. **Quote Display:** the random quote.
3. **Action List:** upcoming and ongoing schedules, routines and estimated schedules, with ongoing first and then upcoming. It scrolls horizontally and is capped at 24 (shown as `x/24`). Card height grows with the note text up to a line limit.
   - The **timer card** comes first. It shows a live clock, the date and a countdown ("until X" / "X is now"). It can have a cover image, and long-pressing it lets you choose which item it counts down to.
4. **Events List:** open notes, latest edit first, scrolling horizontally.
5. **Quotes Picks:** the latest 20 quotes, scrolling horizontally.
6. **All List:** the search box, then a grid of cards, then **Load more events**.
7. **Deleted log** at the very bottom.

Cards show badges (schedule, routine, estimated, Open/Closed/Quote, Past/Present/Future), tags, a body preview and a cover.

### Note screen

- **Opens from** any note, schedule or routine card.
- **Menu:** Add cover, From gallery, Remove cover, Crop cover, Crop card cover, Edit event, Duplicate, Delete.
- **Editor:** a rich-text editor with a `/` menu. It offers bold, italic, underline and strikethrough, headings 1-6, to-do checkboxes, bullet and numbered lists, dividers and timestamped separators. It also has a mobile formatting toolbar and shortcuts (Ctrl+B, I and U, Tab to indent, Shift+Enter for a line break).
- **Autosave:** saves automatically shortly after you stop typing.
- **Bottom bar:** tags, plus a meta row with the time-state badge, a tappable Open/Closed toggle, the date and the time.
- **Info bar (notes only):** Created, Last edited and Status.
- **Schedules and routines** open here to hold notes. Their title is read-only.

### New event sheet

Title, Description, Date, Time & Duration, Ends, Tag, a Status choice (Open / Closed / Quote), and a conflict box.

### ToDos tab

- **Add** a task with the input box. A **Show Completed / Show Active** toggle switches the list.
- **Order:** oldest first. Each task has a permanent number (#1, #2, ...) and a created or completed stamp.
- **Single tap** toggles done. **Double tap** turns the to-do into a note. **✕** deletes it.

### Schedule tab

- **Header:** **+ Add** and an **All / Schedule only** filter.
- **Week strip:** Sunday to Saturday with ‹ › arrows. A dot marks days with something on them, including dated notes.
- **Day timeline:** each row shows start, duration and end. Gaps between items show as "**X free**". It starts at 5:00 AM, auto-scrolls to the current time, and pauses auto-scroll for 30 seconds after you scroll by hand.
- **Cards:** tapping a schedule opens its edit sheet, and tapping a routine checks it off. States are done (✓), in progress (✓ Close) and missed (↻ Reschedule).
- **Schedule sheet:** title, an Estimated toggle, date, time, duration and Ends (linked, so changing the end recalculates the duration), notes, tags, a conflict box, and Delete.

### Routine tab

- **Header:** **Templates** and **+ New**, plus a "done today" counter (for example 3/5).
- **Today's routines** use the same timeline style with free-time gaps. Tap to check off or undo, use the pencil to edit, and use ✓ Close for an opened one.
- **Routine sheet:** title, time, duration, Ends, tags, a repeat type (weekdays Su-Sa, or dates of the month), and a conflict box.
- **Templates (Ready Routines):** save your current routines under a name. Applying one adds the routines you do not already have, matched by title and duration. Templates can be deleted.

### Calendar tab

- **Header:** ‹ › arrows and a **7 Days / Month** toggle.
- **7 Days:** an hour grid from 6 AM to 10 PM. Items sit at their start hour, coloured by state, and tapping one opens it. Estimated schedules are not shown here.
- **Month:** a grid with count badges (notes in lime, schedules in grey, routines in green).
  - Tapping today or a future date opens that day's list of cards.
  - Tapping a **past** date opens the archive of what was done or missed that day. The archive keeps 90 days.
- **Where notes appear:** notes show on their own date, or on the day they were created if they have no date.

### What gets saved

Events, schedules, routines, todos, completion states, adjusted deadlines, the deletion log, tag covers, templates, and the timer card's cover and chosen item.

---

## About the Creator

**Ashiqur Zaman Arshad** is a writer in Bengali and English and the architect of Xperiencer. He is currently doing his major in Botany, so he is used to things that grow slowly and need the right conditions. He writes because it is how he makes sense of his days, and he built this app so that habit could live in the same place as his schedule, his routines and everything else a day is made of.

He decides what the app should do and why; AI writes the code. He writes the reasoning, the AI writes the semicolons, and he would rather say so plainly than pretend otherwise.

For him, a note is never just text; it is an event that is still happening, and Xperiencer is built around that idea. It is also built to be honest about time: things run past midnight, plans get missed, and the app keeps track of that instead of pretending the day went as planned. In the end, it is a notebook that understands what a day actually looks like.
