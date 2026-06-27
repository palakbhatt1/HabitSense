import { Habit, HabitEntry, SleepEntry, AppMeta, ExportBundle } from "./types";

export interface StorageAdapter {
  // Habits
  getHabits(): Promise<Habit[]>;
  saveHabit(habit: Habit): Promise<void>;
  deleteHabit(habitId: string): Promise<void>;

  // Entries
  getEntries(range: { from: string; to: string }): Promise<HabitEntry[]>;
  setEntryStatus(
    habitId: string,
    date: string,
    status: HabitEntry["status"]
  ): Promise<void>;

  // Sleep
  getSleepEntries(range: { from: string; to: string }): Promise<SleepEntry[]>;
  setSleepEntry(date: string, hours: number): Promise<void>;

  // Meta
  getMeta(): Promise<AppMeta>;
  updateMeta(patch: Partial<AppMeta>): Promise<void>;

  // Lifecycle
  exportAll(): Promise<ExportBundle>;
  importAll(bundle: ExportBundle): Promise<void>;
}
