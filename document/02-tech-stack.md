# HabitSense — Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Standard, free-tier deployable, good PWA support |
| Styling | Tailwind CSS + shadcn/ui | Fast to build with, easy to keep clean/minimal |
| Charts | Recharts | Line chart for sleep, simple bars for analytics |
| Data layer | TanStack Query | Caching/invalidation between hooks and storage adapter |
| Storage | Browser `localStorage`, behind a `StorageAdapter` interface | No backend needed; swappable later if ever required |
| Icons | lucide-react | Pairs with shadcn/ui, simple line-icon style |
| Dates | date-fns | Avoids hand-rolled calendar/streak bugs |
| Deployment | Vercel (free tier) | Zero-cost hosting, native Next.js support |

## Explicitly not using
- Framer Motion — skip unless a specific animation is actually needed; don't add it by default.
- Any illustration/animation library for mascots — the cutesy visual layer is cut (see `01-problem-idea.md`).
- Any backend framework, database, or auth provider — see `04-backend.md`.
- Tauri / Electron — no desktop app.

## Package list (core)
```
next, react, react-dom, typescript
tailwindcss, @shadcn/ui deps
recharts
@tanstack/react-query
lucide-react
date-fns
```
