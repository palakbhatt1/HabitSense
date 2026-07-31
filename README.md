# HabitSense

A clean, minimal habit and sleep tracker designed for personal consistency. 100% private, client-side, and installable as a Progressive Web App (PWA).

All data lives securely in your browser's `localStorage`—no accounts, no cloud databases, and no tracking.

---

## Features

- **Habit Tracking**
  - **Desktop Monthly Grid**: 31-day calendar matrix with color-coded habit rows, sticky habit names, and daily completion scores.
  - **Mobile Day View**: Clean daily checklist with an interactive 7-day strip and date picker.
  - **Three-State Checkboxes**: Quick cycling between unmarked, done, and missed.
  - **10-Habit Limit**: Enforces focus on core daily routines. Supports archiving without losing history.

- **Sleep Tracking**
  - **Duration Logger**: Numeric stepper in 15-minute increments with quick-select presets.
  - **Trend Chart**: Interactive area chart showing nightly hours and monthly average.
  - **Paginated History**: Reverse-chronological sleep log with quick edit and deletion.

- **Analytics & Trends**
  - **30-Day Completion Trend**: Shared visual chart tracking overall routine consistency.
  - **Monthly Highlights**: Quick glance at your best day, most consistent habit, and most-missed habit.
  - **Sortable Stats Table**: View completion %, current streak, longest streak, and total days logged per habit.

- **Privacy & Data Portability**
  - **Local-First**: Zero external servers or tracking.
  - **Backup & Restore**: Export and import your data anytime as a JSON file.

- **Offline & PWA Ready**
  - Installable on desktop and mobile browsers.
  - Works offline with cached application shell and service worker fallback.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State & Data**: TanStack Query + LocalStorageAdapter
- **Icons & Dates**: Lucide React, date-fns

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/palakbhatt1/HabitSense.git
cd HabitSense

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

---

## License

MIT
