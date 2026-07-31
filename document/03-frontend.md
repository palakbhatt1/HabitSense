# HabitSense — Frontend

## Layout
- Left sidebar: Dashboard, Habits, Sleep, Analytics, Settings. No decorative cards, no illustration panel.
- Top bar: plain greeting ("Good morning") + current date. No rotating motivational copy.
- Light/dark toggle in sidebar footer.

## Habit Tracker Grid (core screen)
- Desktop/tablet (≥768px): table — habit name/icon in a sticky first column, day columns 1–31, circular checkbox per cell, color-coded per habit. Footer row shows daily completion fraction.
- Mobile (<768px): single-day view — vertical list of that day's habits with one large checkbox each, plus a swipeable 7-day date strip above it. Do not try to shrink the 31-column grid onto mobile.
- Click cycles: unmarked → done → missed → unmarked (or unmarked ↔ done for a simpler v1).
- "Add Habit" row pinned under the list.

## Sleep Tracker
- Line chart (Recharts): day-of-month on x-axis, hours on y-axis, hover tooltip, "Avg. Sleep" shown near the chart.
- Logging: click a date on the chart, or a "+ Log sleep" button, opens a numeric stepper (15-min increments).
- Separate paginated history list, reverse-chronological.

## Analytics
- Per-habit stats table: completion %, current streak, longest streak, total days logged.
- One shared `<TrendChart>` component reused for sleep + analytics — don't build four separate chart components.
- Monthly summary: best day, most consistent habit, most-missed habit.

## Color system
Each habit gets a fixed accent color from a small palette (rose, orange, sky, violet, green, teal). Used consistently for that habit's row, checkbox, and any chart segment referencing it. No gradients, no hero banners.

## Empty / loading states
- Zero habits: centered "Create your first habit" button. No empty table.
- Zero sleep entries: prompt text in the chart area instead of a blank chart.
- Loading: skeleton shimmer blocks shaped like the real components, not spinners.

## Explicitly cut from the original design
- Mascot illustrations (cat, dinosaur, tree, growth character)
- Sticky-note style motivational messages
- Gradient hero banners
- Rotating "focus for today" copy — keep it functional, not chatty
