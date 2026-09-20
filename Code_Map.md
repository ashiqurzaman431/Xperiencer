# Xperiencer — Code Map

**Source reviewed:** latest `index.html` supplied after the startup/tagline loading-screen and Estimated Schedule spanning-layer work.

**Current file size:** 5,848 lines.

This Code Map describes the implementation as it exists in the latest file. It is the working architectural reference for future Claude/code prompts.

---

## 1. Product identity

**App:** Xperiencer

**Tagline:**

> Every moment, noted. Every day, remembered.

**Core idea:** a personal life-log where notes, schedules, routines, and related actions are treated as parts of the user's lived timeline.

**Visual identity:**
- Dark warm background
- Lime primary accent
- Inter typography
- Dark cards and sheets
- Responsive/mobile-first layout
- PWA-oriented single-page architecture

The latest implementation now gives the tagline a dedicated startup role instead of relying only on the login-screen tagline.

---

# 2. Architecture

## Main application structure

Xperiencer remains a single-file web app:

```text
index.html
├── Firebase module script
├── CSS / design system
├── Startup/tagline screen
├── Login screen
├── Main app
├── Views
│   ├── Events
│   ├── ToDos
│   ├── Schedule
│   ├── Routine
│   └── Calendar
├── Note Detail
├── Sheets / overlays / modals
└── Classic JavaScript application logic
```

No build step is required.

The Firebase SDK is loaded through CDN modules.

---

# 3. Firebase architecture

## Firebase services

The current implementation uses:

- Firebase Authentication
- Firebase Realtime Database

Firebase data path:

```text
users/<uid>/data
```

The Firebase module exposes these browser-level functions:

```text
window.firebaseSignIn
window.firebaseSignOut
window.firebaseOnAuthStateChanged
window.firebaseSaveUserData
window.firebaseLoadUserData
```

Firebase readiness is exposed as:

```text
window.firebaseReady
```

Because Firebase is loaded in a deferred module script while the main application uses a classic script block, the app has a `waitForFirebase()` helper that waits until `window.firebaseReady` becomes true.

---

# 4. Authentication states

There are three practical application modes:

```text
Google authenticated
Guest
Unauthenticated
```

The selected mode is persisted through:

```text
localStorage['ll_authMode']
```

## Google

Successful Google authentication stores:

```text
ll_authMode = google
```

and sets:

```text
firebaseUid
```

The app then loads the user's Firebase data.

## Guest

Guest mode stores:

```text
ll_authMode = guest
```

Guest data is local/in-memory behavior and does not require Firebase data loading.

## Signed out

Signing out:

- clears the Firebase UID
- clears in-memory event/schedule/routine/completion data
- removes `ll_authMode`
- hides the app
- returns to the existing login screen

---

# 5. NEW — Startup / Tagline Loading Screen

## Purpose

The latest implementation adds a dedicated full-screen startup screen that solves two problems simultaneously:

1. Gives Xperiencer a visible identity moment.
2. Hides the Firebase data-loading delay behind the tagline animation.

The screen contains:

```text
Every moment, noted.
Every day, remembered.
```

It appears before the normal app becomes visible.

---

## Visual implementation

The startup screen uses the existing Xperiencer visual language:

- warm dark background
- lime accent
- Inter typography
- centered typography
- small lime dot/mark
- no external animation library

The background is implemented as a dark radial treatment rather than copying the reference video's background.

---

## Animation style

The animation is inspired by the supplied motion-reference video's **kinetic typography**, not its visual design.

Implemented behavior includes:

- words entering individually
- vertical movement
- blur-to-sharp transition
- opacity reveal
- first line entering slightly oversized
- scale settling
- temporary lime emphasis on the final word of each line
- final centered lockup

Important distinction:

```text
Reference video:
    animation language

Xperiencer:
    existing colors + typography + visual identity
```

The reference video's colors, background, branding, exact composition, and exact text are not copied.

---

# 6. Startup animation synchronization

This is a critical part of the latest implementation.

The startup screen has **two independent readiness conditions**:

```text
A = tagline animation completed one full cycle
B = Firebase/app initialization completed
```

The app enters only when:

```text
A && B
```

This prevents the animation from being cut short.

---

## Case 1 — Firebase loads faster than the animation

```text
App opens
    ↓
Tagline animation starts
    ↓
Firebase data finishes loading
    ↓
WAIT
    ↓
Animation completes naturally
    ↓
Enter app
```

The app does **not** cut the tagline animation in the middle.

---

## Case 2 — Animation finishes faster than Firebase

```text
App opens
    ↓
Tagline animation starts
    ↓
Animation completes
    ↓
HOLD FINAL FRAME
    ↓
Firebase finishes loading
    ↓
Enter app
```

The screen therefore never looks frozen halfway through an animation.

It holds the completed tagline lockup until the app is ready.

---

## Case 3 — Both finish around the same time

The startup controller waits until both signals have completed and then fades the startup screen away.

---

## Animation completion signal

The startup markup listens for `animationend`.

The longest-running animation is the stage animation.

When its completion is detected:

```text
window.__splashAnimDone = true
```

and the startup controller checks whether Firebase/app initialization has also completed.

---

## Safety cap

There is also a defensive animation completion cap:

```text
SPLASH_ANIM_CAP_MS = 5000
```

This exists as a safety net if:

- the browser throttles animation
- the page is backgrounded
- an animation event fails to fire

It is not the normal animation duration.

The intended animation itself is approximately:

```text
2.75 seconds
```

---

# 7. Startup screen lifecycle

Important functions:

```text
splashShow()
splashDataDone()
splashMaybeEnter()
splashDismiss()
splashDismissNow()
splashShowFallback()
splashHideFallback()
splashRunInit()
```

### `splashShow()`

Starts/restarts the startup animation.

It:

- resets animation state
- removes hidden/fading state
- forces reflow
- adds the `playing` class
- arms the safety/slow-load timers

### `splashDataDone()`

Marks application initialization as complete.

It does not immediately dismiss the screen.

It calls:

```text
splashMaybeEnter()
```

### `splashMaybeEnter()`

Only dismisses when:

```text
splashDataReady === true
AND
window.__splashAnimDone === true
```

### `splashDismiss()`

Fades the startup screen out after both conditions are satisfied.

The real app is already rendered underneath before this happens.

### `splashDismissNow()`

Used when there is nothing to wait for, especially when Firebase determines there is no authenticated session.

---

# 8. Startup flow — already authenticated user

On page reload when:

```text
ll_authMode === 'google'
```

the app initially keeps the startup screen visible.

Flow:

```text
Page loads
    ↓
Startup screen already present before normal app exposure
    ↓
Firebase module becomes ready
    ↓
onAuthStateChanged()
    ↓
Authenticated user found
    ↓
firebaseUid assigned
    ↓
enterApp()
    ↓
Firebase data loaded
    ↓
Legacy-data migration checked
    ↓
Initial app rendering
    ↓
splashDataDone()
    ↓
Wait for animation if necessary
    ↓
splashDismiss()
    ↓
User sees normal app
```

This prevents a flash of the empty app while data is being fetched.

---

# 9. Startup flow — unauthenticated user

If the stored Google mode exists but Firebase reports no authenticated user:

```text
Startup screen
    ↓
Firebase auth state resolves
    ↓
No user
    ↓
splashDismissNow()
    ↓
Main app hidden
    ↓
Login screen shown
```

The app does not wait for Firebase data that cannot exist for an unauthenticated user.

---

# 10. Startup flow — Google login

After successful Google login:

```text
Google popup
    ↓
Authentication succeeds
    ↓
firebaseUid assigned
    ↓
ll_authMode = google
    ↓
splashShow()
    ↓
enterApp()
    ↓
Firebase data load
    ↓
Initial rendering
    ↓
splashDataDone()
    ↓
Wait for animation completion
    ↓
Enter app
```

This specifically prevents:

```text
Login success
    ↓
empty app flashes
    ↓
Firebase data appears
```

---

# 11. Startup flow — Guest

Guest mode does not need Firebase data.

Flow:

```text
Guest selected
    ↓
splashShow()
    ↓
enterApp()
    ↓
No Firebase load
    ↓
Initial app rendering
    ↓
splashDataDone()
    ↓
Wait for tagline animation
    ↓
Enter guest app
```

So the tagline still acts as a brief identity/transition screen, but Guest mode does not wait on remote data.

---

# 12. Startup failure handling

The latest implementation intentionally avoids an indefinite splash.

There are two protections.

## Slow-load fallback

After:

```text
SPLASH_SLOW_MS = 18000
```

the startup screen can show:

```text
Still loading your data. The connection may be slow.
```

with:

- Try again
- Sign out

## Initialization error

`enterApp()` is wrapped by:

```text
splashRunInit()
```

If Firebase/data initialization throws, the startup screen shows the failure message rather than silently hanging forever.

Retry currently reloads the page.

Sign out clears the stored auth mode and signs out through Firebase before reloading.

---

# 13. Reduced-motion behavior

The startup screen respects:

```text
prefers-reduced-motion: reduce
```

In reduced-motion mode:

- individual kinetic animations are removed
- words appear in their final readable positions
- the startup stage uses a short fade
- the user still gets the tagline
- the synchronization mechanism remains intact

This preserves the startup-state logic without forcing motion on users who prefer less animation.

---

# 14. Main data model

The core in-memory collections remain:

```text
events = []
schedules = []
routines = []
todos = []
completions = {}
deletionLog = []
doneSchedules = {}
adjustedDeadlines = {}
readyRoutines = []
tagCovers = {}
calendarArchive = []
```

Additional state includes:

```text
timerCardCover
focusedActionId
lastResetDate
allListVisible
allListItems
schSelDate
calSelDate
calMode
conflictSuggest
```

---

# 15. Event model

Everything is conceptually an Event.

The implementation distinguishes:

```text
event / note
schedule
routine
```

Notes/events can contain:

- title
- body
- state
- date
- time
- tags
- covers
- timestamps
- quote status

Schedules contain real time ranges.

Routines contain recurring time definitions.

---

# 16. Events tab

The Events tab remains the main life-log surface.

Major sections include:

```text
Header
Quote Display
Action List
Events List
Quotes Picks
All List
Deleted Log
```

The All List:

- searches title/tag/description
- displays 24 items initially
- Load More adds 24
- preserves the existing ordering rules

Adding a new event increases the visible count accordingly.

---

# 17. Quote Display system

The Quote Display remains:

- a random quote per real app open
- no repeat until the current pool is exhausted
- pool reset every Sunday at local midnight
- quote pick stored in memory for the current app open
- no `sessionStorage` persistence for the current displayed quote

The latest implementation resets:

```text
quoteDisplayPickId = null
```

when entering the app so a new app open gets a fresh pick.

---

# 18. Note Detail architecture

Note Detail is shared by:

```text
event
schedule
routine
```

The source is tracked with:

```text
ndItemSource
```

Possible values:

```text
event
schedule
routine
```

The active item ID is:

```text
ndEventId
```

---

# 19. Note Detail source-aware CRUD

The latest implementation preserves source-specific behavior.

## Edit

`ndEdit()` remembers the source before closing Note Detail and then routes to:

```text
event     → openEventSheet()
schedule  → openScheduleSheet()
routine   → openRoutineSheet()
```

## Delete

Schedules/routines are deleted through their own existing deletion functions.

They do not incorrectly enter the event deletion log.

Events continue to use the event deletion flow and maintain the last-50 deletion log.

## Duplicate

Schedules/routines remain in their own collections.

Events remain in `events`.

The duplicated item gets a new ID and a `(copy)` title suffix.

---

# 20. Known Note Detail edge case

There is still one architectural edge case worth remembering:

If a user has just typed into Note Detail and the debounced autosave has not yet completed, duplicating immediately can clone the current in-memory object before the pending remote save cycle finishes.

Therefore:

```text
recent edit
    ↓
immediate duplicate
```

can potentially produce a duplicate before the last remote persistence cycle has completed.

The existing in-memory object is updated immediately, so this is primarily a save-timing/ordering concern.

A future surgical improvement would be to explicitly flush pending Note Detail saves before duplication.

---

# 21. Note Detail autosave

The current Note Detail system tracks:

```text
ndDirty
ndRenderTimer
ndDriveSaveTimer
```

Typing:

1. updates the in-memory object
2. marks the note dirty
3. debounces expensive rendering
4. debounces remote persistence

When closing Note Detail, pending debounced updates are flushed first.

The app also warns before leaving the page if a save is currently in flight.

---

# 22. Schedule system

Schedules support:

- exact time
- estimated time
- duration
- date
- notes
- tags
- covers
- completion state
- missed state
- rescheduling
- late-start behavior

Estimated schedules are excluded from conflict detection.

Schedules appear in the Schedule view and can hold notes through Note Detail.

---

# 23. Routine system

Routines support recurring definitions by:

```text
day-of-week
date-of-month
```

They have:

- title
- time
- duration
- repeat definition
- notes
- tags
- covers
- occurrence completion state

Routine occurrence states include:

```text
future
starting soon / alerting
ongoing
done
missed
```

---

# 24. Routine conflict horizon

The routine conflict horizon is now explicitly:

```text
12 calendar months
```

Implemented with:

```text
ROUTINE_CONFLICT_HORIZON_MONTHS = 12
```

The implementation uses calendar-month arithmetic rather than a fixed 366-day approximation.

Month-end dates are clamped correctly.

Example:

```text
Feb 29 + 12 calendar months
→ Feb 28 of the following year when appropriate
```

Routine conflicts therefore examine occurrences through the next 12 calendar months.

---

# 25. Conflict detection

Conflict detection considers:

```text
schedule ↔ schedule
schedule ↔ routine
routine ↔ routine
```

Estimated schedules are excluded.

The implementation accounts for:

- date
- time
- duration
- midnight crossing
- multi-day ranges
- routine recurrence
- the entire duration of an item

---

# 26. Conflict endpoint semantics

The latest conflict implementation uses half-open ranges:

```text
[start, end)
```

Therefore:

```text
5:00–7:00
7:00–9:00
```

does **not** conflict.

They touch but do not overlap.

But:

```text
5:00–7:01
7:00–9:00
```

does conflict.

For zero-duration/instant items, the implementation treats the instant as conflicting when it falls inside another active block, including the other block's start but not its exact end.

---

# 27. Conflict suggestions

When a conflict exists, the app can suggest:

```text
Before
After
```

For routines, a suggested time must be free across every relevant repeat date.

For normal schedule conflict resolution, the search can look around the requested time/date and find a usable free slot.

---

# 28. Daily state / rollover

The app performs daily reset/rollover behavior around its existing 5 AM day boundary.

Relevant state includes:

```text
lastResetDate
completions
doneSchedules
adjustedDeadlines
```

Unfinished occurrences can become missed according to the established rules.

Opened/ongoing items retain their open state rather than being automatically converted to missed.

---

# 29. Action List

The Action List focuses on actionable schedule/routine items.

It tracks:

```text
actionListIds
nextActionTimestamp
nextActionTitle
focusedActionId
lastActionItems
```

States are reflected visually through:

- amber
- lime
- red
- muted past state

The Events tab uses glow/pulse states for relevant occurrences.

---

# 30. Schedule / Routine alert behavior

Alerts are currently in-app visual states rather than push notifications.

Relevant visual states include:

```text
occ-alerting
occ-ongoing
occ-missed
```

The alert check runs periodically.

Current interval:

```text
20 seconds
```

---

# 31. Calendar

Calendar supports:

```text
week view
month view
```

The calendar can show:

- schedules
- routines
- event states
- day counts
- day detail
- historical archive

Past-day selection can open archived information.

---

# 32. ToDos

ToDos remain a separate system.

The Note Detail integration allows a Todo to be opened as a draft event.

Important behavior:

```text
open Todo
    ↓
draft Note Detail
    ↓
nothing is created yet
    ↓
user types body content
    ↓
real event is materialized
```

This prevents simply opening a Todo from creating an unwanted event.

---

# 33. Covers / images

Images are stored through Cloudinary.

The app supports:

- event/note covers
- schedule covers
- routine covers
- card crops
- cover positioning
- gallery
- tag default covers
- timer card cover

Cloudinary URLs are stored in the event/schedule/routine data.

Client-side deletion of Cloudinary files is intentionally not attempted because signed deletion would require a secret.

---

# 34. Crop system

The crop system is implemented in the browser.

It supports:

- crop frame
- zoom
- pan
- aspect ratio
- note cover crop
- card cover crop

The resulting crop is uploaded to Cloudinary.

Card crops are stored separately from the main note cover.

---

# 35. Gallery

The gallery surfaces used cover images.

Gallery thumbnails are explicitly built as square cells using the padding-percentage technique rather than relying only on CSS `aspect-ratio`, because the latter previously caused squishing on some WebViews.

Long-press / tag-cover behavior remains part of the gallery system.

---

# 36. Data persistence

The old function names remain:

```text
driveSaveData()
driveLoadLatestData()
```

but the actual persistence backend is Firebase Realtime Database.

This was intentionally kept to avoid changing the many existing call sites.

Conceptually:

```text
driveSaveData()
    ↓
firebaseSaveUserData()
    ↓
Firebase RTDB

driveLoadLatestData()
    ↓
firebaseLoadUserData()
    ↓
Firebase RTDB
```

---

# 37. Data loading on startup

Authenticated startup:

```text
enterApp()
    ↓
driveLoadLatestData()
    ↓
Firebase RTDB read
    ↓
restore collections/state
    ↓
migrateLegacyBloat()
    ↓
render all major views
    ↓
splashDataDone()
```

Restored data includes:

```text
events
schedules
routines
todos
todoSeqCounter
completions
deletionLog
doneSchedules
adjustedDeadlines
lastResetDate
calendarArchive
readyRoutines
timerCardCover
focusedActionId
tagCovers
```

---

# 38. Legacy-data migration

Startup includes a one-time cleanup/migration path for older stored data.

It can clean up legacy:

- note-version history
- duplicated raw cover photos
- embedded card-crop images

The migration is designed to be a no-op after the data has already been cleaned.

---

# 39. PWA

The app remains installable as a PWA.

Existing PWA components include:

```text
manifest.json
sw.js
install banner
```

The HTML also declares:

- mobile web app capability
- status bar behavior
- theme color
- Apple touch icon
- app title

---

# 40. Current startup state machine

The current startup system can be represented as:

```text
                         ┌─────────────────────┐
                         │      App opens      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Tagline splash      │
                         │ starts immediately  │
                         └──────────┬──────────┘
                                    │
                      ┌─────────────┴─────────────┐
                      │                           │
                      ▼                           ▼
             Animation running             Auth resolving
                      │                           │
                      ▼                           ▼
             Animation completes         Authenticated?
                      │                    /          \
                      │                  yes           no
                      │                   │             │
                      │                   ▼             ▼
                      │             Firebase load    Login screen
                      │                   │
                      │                   ▼
                      │             Initial render
                      │                   │
                      └──────────┬────────┘
                                 │
                                 ▼
                       Both conditions ready
                                 │
                                 ▼
                         Splash fades away
                                 │
                                 ▼
                            Normal app
```

---

# NEW — Estimated Schedule Spanning Layer

## Purpose

Estimated schedules remain part of the Action List, but their visual presentation is separated from the normal Schedule/Routine cards so multiple large estimated ranges do not consume the same vertical card space.

This is a **presentation layer**. It does not replace, remove, or duplicate the underlying estimated schedule data.

## Rendering model

```text
Action List
├── normal Schedule/Routine cards
└── estimated-schedule overlay layer
     ├── estimated range A
     ├── estimated range B
     └── ...
```

Normal cards keep their existing size, order, content, interaction and state behavior.

## Horizontal span

For each active estimated schedule:

1. Determine the normal Action List cards whose dates fall within the estimated schedule's covered date range.
2. Find the left edge of the first relevant normal card.
3. Find the right edge of the last relevant normal card.
4. Use those geometry points as the overlay's horizontal boundaries.

The span follows the actual Action List layout; it is not a hard-coded desktop width.

## Multiple estimated schedules

Multiple active estimated schedules can be rendered simultaneously. Each gets its own calculated span.

## Vertical stacking rule

Stacking is based on the **actual upcoming end datetime**:

```text
earliest end  → bottom
latest end    → top
```

Original duration is not used for stacking.

Tie-breaking:

1. earlier `endDateTime` → lower
2. if equal, earlier `startDateTime` → lower
3. if still equal, stable deterministic existing ID/order

## Interaction / layering

The estimated layer is visual unless the estimated schedule itself is intentionally interactive. It must not unintentionally block normal card interaction.

## Recalculation

Recalculate geometry when the Action List changes, including schedule/routine or estimated-schedule add/edit/delete, state/date changes, and viewport resize/orientation changes. Use the existing render lifecycle and appropriate layout observation rather than polling.

## Important separation

```text
existing estimated-schedule state
        ↓
Action List eligibility/state
        ↓
normal Action List layout
        ↓
estimated overlay geometry
```

Existing estimated-schedule timer semantics remain unchanged, including the rule that an estimated schedule begins at midnight of its first day.


# 41. Core architectural principles

The current implementation should preserve these principles:

### Principle 1 — Everything is an event/lived record

Notes are not merely static documents. They represent something being lived through.

### Principle 2 — Time must be honest

Schedules and routines have actual time ranges.

Notes have Open/Closed semantics because their ending may be unknown.

### Principle 3 — Do not auto-fake completion

Opened items do not silently become missed just because their scheduled time ended.

### Principle 4 — Firebase is the persistence source

Authenticated user data comes from Firebase RTDB.

### Principle 5 — The startup animation is presentation, not readiness

The app should never use the animation as a fake representation of data readiness.

Instead:

```text
animation complete AND data ready
```

controls entry.

### Principle 6 — Existing architecture should be changed surgically

Future fixes should avoid broad rewrites unless a real architectural problem requires one.

---

# 42. Previous audit fixes now represented in the current file

The following previously identified issues are now reflected in the implementation:

| Area | Current state |
|---|---|
| Quote Display persistence | Fixed — fresh quote per real app open |
| Note Detail CRUD routing | Fixed — source-aware event/schedule/routine routing |
| Routine conflict horizon | Fixed — next 12 calendar months |
| Conflict endpoint semantics | Fixed — half-open ranges |
| Startup Firebase delay | Fixed with dedicated tagline loading screen |
| Estimated Schedule Action List presentation | Fixed with a separate spanning overlay layer |
| Animation cut-off | Fixed with animation/data dual gating |
| Unauthenticated splash trap | Handled |
| Google-login empty-app flash | Handled |
| Guest Firebase wait | Avoided |

---

# 43. Remaining known edge cases / future candidates

## A. Duplicate immediately after a Note Detail edit

As described above, an immediate duplicate can occur before a pending debounced remote save has completed.

**Possible future fix:** add an explicit `flushPendingNoteSave()` step before `ndDuplicate()`.

---

## B. Firebase failure UX

The current implementation has a fallback and retry path, but this is intentionally simple.

If the app grows more complex, a dedicated startup error state could distinguish:

```text
offline
timeout
permission/auth failure
database failure
```

instead of showing the raw Firebase error string.

---

## C. Startup animation fallback cap

The 5-second animation cap is defensive rather than part of the normal animation.

If browser animation behavior becomes more predictable across all target WebViews, this could potentially be simplified.

---

# 44. Safe future-change map

When asking Claude to modify Xperiencer, first identify which layer the change belongs to:

```text
Visual only
    → CSS / markup

Startup/auth
    → splash controller
    → auth boot
    → enterApp
    → loginWithGoogle
    → waitForFirebase

Persistence
    → driveSaveData
    → driveLoadLatestData
    → Firebase wrappers

Events
    → events array
    → renderEvents
    → event sheet
    → Note Detail

Schedules
    → schedules array
    → Schedule view
    → schedule sheet
    → occurrence state

Routines
    → routines array
    → Routine view
    → routine sheet
    → conflict horizon

Conflict system
    → getBusyBlocks
    → hasConflict
    → slot suggestions
    → routineUpcomingDates

Quotes
    → quoteDisplayPickId
    → quote pool
    → weekly reset

Images
    → Cloudinary upload
    → crop engine
    → gallery
    → cover cache

PWA
    → manifest
    → service worker
    → install prompt
```

---

# 45. Current implementation summary

The current Xperiencer architecture is now:

```text
                         XPERIENCER
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
     Identity              Auth                 Data
        │                     │                     │
   Tagline splash      Google / Guest          Firebase RTDB
        │                     │                     │
        └──────────────┬──────┴──────┬──────────────┘
                       │             │
                       ▼             ▼
                  Initialization   Persistence
                       │
                       ▼
                  Main App
                       │
       ┌───────────────┼────────────────┐
       │               │                │
    Events           Actions          Calendar
       │               │                │
       ├── Notes       ├── Schedule     ├── Week
       ├── Quotes      └── Routine      └── Month
       └── All
                       │
                       ▼
                  Note Detail
                       │
             ┌─────────┼─────────┐
             │         │         │
           Event    Schedule   Routine
             │         │         │
             └─────────┼─────────┘
                       │
                       ▼
                 Cloudinary
                 covers/images
```

The most important new architectural rule is:

> **The startup tagline is not a timer. It is a synchronized presentation layer that waits for both the completion of its own animation and the completion of app initialization.**

---

## Current update — Code Map rename

This document is now named **Code Map** rather than Implementation Map. It is the practical reference for the current codebase: architecture, data flow, UI structure, important behavior, and safe locations for future changes.
