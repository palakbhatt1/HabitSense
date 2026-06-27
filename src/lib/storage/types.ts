export type HabitColor =
  | "rose"
  | "orange"
  | "sky"
  | "violet"
  | "green"
  | "teal"
  | "amber"
  | "pink"
  | "indigo"
  | "lime";

export interface Habit {
  id: string;            // uuid or unique id
  name: string;          // e.g. "Read Book"
  icon: string;          // lucide icon key, e.g. "book-open"
  color: HabitColor;     // drives row + chip color
  createdAt: string;     // ISO date YYYY-MM-DD
  archivedAt: string | null;
  sortOrder: number;
}

export interface HabitEntry {
  habitId: string;
  date: string;           // "YYYY-MM-DD" local calendar day
  status: "done" | "missed" | "unmarked";
}

export interface SleepEntry {
  date: string;           // "YYYY-MM-DD"
  hours: number;          // 0-24, 0.25 step (15 min granularity)
  loggedAt: string;       // ISO timestamp
}

export interface AppMeta {
  schemaVersion: number;  // start at 1
  userDisplayName: string | null;
  themeMode: "light" | "dark";
  onboardingCompletedAt: string | null;
  dailyIntentions?: Record<string, string>; // YYYY-MM-DD -> intention text
}

export interface ExportBundle {
  schemaVersion: number;
  meta: AppMeta;
  habits: Habit[];
  entries: HabitEntry[];
  sleep: SleepEntry[];
}
