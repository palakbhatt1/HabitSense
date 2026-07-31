# HabitSense — Backend

## There isn't one (by design)
v1 has no server, no database, no auth. All data lives in the browser via `localStorage`. This keeps the build simple and free to run — there's nothing to host, scale, or secure beyond the static frontend.

## What replaces a backend: the StorageAdapter
All data access goes through one interface, so the app doesn't care where data actually lives:

```ts
interface StorageAdapter {
  getHabits(): Promise<Habit[]>;
  saveHabit(habit: Habit): Promise<void>;
  deleteHabit(habitId: string): Promise<void>;

  getEntries(range: { from: string; to: string }): Promise<HabitEntry[]>;
  setEntryStatus(habitId: string, date: string, status: HabitEntry["status"]): Promise<void>;

  getSleepEntries(range: { from: string; to: string }): Promise<SleepEntry[]>;
  setSleepEntry(date: string, hours: number): Promise<void>;

  getMeta(): Promise<AppMeta>;
  updateMeta(patch: Partial<AppMeta>): Promise<void>;

  exportAll(): Promise<ExportBundle>;
  importAll(bundle: ExportBundle): Promise<void>;
}
```

- v1 implementation: `LocalStorageAdapter` — reads/writes one namespaced JSON blob at `habitsense:v1`.
- Rule: no component, hook, or page touches `localStorage` directly. Everything goes through `useStorage()`.

## Data shape (stored in localStorage)
```json
{
  "schemaVersion": 1,
  "meta": { "themeMode": "light", "onboardingCompletedAt": null },
  "habits": [{ "id": "h1", "name": "Read Book", "color": "rose", "createdAt": "2026-06-01", "archivedAt": null, "sortOrder": 0 }],
  "entries": [{ "habitId": "h1", "date": "2026-06-03", "status": "done" }],
  "sleep": [{ "date": "2026-06-03", "hours": 7.25, "loggedAt": "2026-06-04T07:10:00Z" }]
}
```

## Backup / restore
Settings page provides export (download JSON) and import (upload JSON) — this is the only backup mechanism in v1, since there's no cloud storage.

## If a backend is ever added later
Not planned for v1, but the adapter pattern means a future backend (e.g. Supabase) only requires a new class implementing the same interface — no UI rewrite. It would still need real work: auth, per-user data, conflict handling, and a localStorage → cloud migration path. Don't start this until there's an actual reason (e.g. cross-device use).
