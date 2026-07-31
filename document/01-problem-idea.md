# HabitSense — Problem & Idea

## What it is
HabitSense is a personal habit and sleep tracker, built as a website that can also be installed as a PWA. No desktop app, no login, no cloud account — data lives in the browser.

## Why build it
Not chasing a market gap or a unique feature. This is a self-directed build: rather than using an existing tracker (Habitica, Streaks, Loop), build one from scratch to practice product thinking, frontend architecture, and shipping something real end-to-end.

## Core idea
- Track up to 10 habits on a monthly grid (day 1–31), mark each day done/missed.
- Track nightly sleep hours on a simple trend chart.
- Surface basic analytics: completion %, streaks, weekly/monthly summaries.
- Everything stored locally in the browser (`localStorage`) — no backend, no accounts.

## Design direction (decided)
Keep it simple and functional. Earlier reference designs leaned too cute (mascot illustrations, sticky-note copy, gradient banners) — cut all of that. Keep only what's functionally useful:
- Color-coded habit rows (each habit gets an accent color)
- Circular checkboxes, soft-filled state
- Clean charts (line for sleep, simple bars/lists for stats)
- Plain, neutral background — no illustrated characters, no motivational copy overload

## Explicitly out of scope (for now)
- User accounts / auth
- Cloud sync across devices
- Desktop app (Tauri or otherwise)
- Mood tracking, journaling, or other extra trackers

## Definition of done (v1)
- Can create/edit/archive habits, mark days done/missed, see streaks.
- Can log sleep hours and see a trend line + average.
- Can see basic analytics (completion %, streaks) per habit.
- Works offline after first load, installable as a PWA.
- Deployed live on a free-tier host.
