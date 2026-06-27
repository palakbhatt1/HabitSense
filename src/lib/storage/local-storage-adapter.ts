import { StorageAdapter } from "./storage-adapter";
import { Habit, HabitEntry, SleepEntry, AppMeta, ExportBundle } from "./types";
import { migrateData, CURRENT_SCHEMA_VERSION } from "./migrations";

export class LocalStorageAdapter implements StorageAdapter {
  private STORAGE_KEY = "habitsense:v1";

  private getData(): ExportBundle {
    if (typeof window === "undefined") {
      // Server-side rendering fallback
      return {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        meta: {
          schemaVersion: CURRENT_SCHEMA_VERSION,
          userDisplayName: null,
          themeMode: "light",
          onboardingCompletedAt: null,
        },
        habits: [],
        entries: [],
        sleep: [],
      };
    }
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) {
      const initial = migrateData(null);
      this.saveData(initial);
      return initial;
    }
    try {
      const parsed = JSON.parse(raw);
      const migrated = migrateData(parsed);
      // If version updated after migration, write it back immediately
      if (!parsed.schemaVersion || parsed.schemaVersion < CURRENT_SCHEMA_VERSION) {
        this.saveData(migrated);
      }
      return migrated;
    } catch (e) {
      console.error("Error parsing localStorage data", e);
      return migrateData(null);
    }
  }

  private saveData(data: ExportBundle): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  async getHabits(): Promise<Habit[]> {
    const data = this.getData();
    return data.habits;
  }

  async saveHabit(habit: Habit): Promise<void> {
    const data = this.getData();
    const index = data.habits.findIndex((h) => h.id === habit.id);
    if (index >= 0) {
      data.habits[index] = habit;
    } else {
      data.habits.push(habit);
    }
    this.saveData(data);
  }

  async deleteHabit(habitId: string): Promise<void> {
    const data = this.getData();
    data.habits = data.habits.filter((h) => h.id !== habitId);
    data.entries = data.entries.filter((e) => e.habitId !== habitId);
    this.saveData(data);
  }

  async getEntries(range: { from: string; to: string }): Promise<HabitEntry[]> {
    const data = this.getData();
    return data.entries.filter((e) => e.date >= range.from && e.date <= range.to);
  }

  async setEntryStatus(
    habitId: string,
    date: string,
    status: HabitEntry["status"]
  ): Promise<void> {
    const data = this.getData();
    // Filter out any existing entry for this specific day/habit
    data.entries = data.entries.filter(
      (e) => !(e.habitId === habitId && e.date === date)
    );
    // Only save "done" or "missed" (sparse storage strategy)
    if (status === "done" || status === "missed") {
      data.entries.push({ habitId, date, status });
    }
    this.saveData(data);
  }

  async getSleepEntries(range: { from: string; to: string }): Promise<SleepEntry[]> {
    const data = this.getData();
    return data.sleep.filter((s) => s.date >= range.from && s.date <= range.to);
  }

  async setSleepEntry(date: string, hours: number): Promise<void> {
    const data = this.getData();
    data.sleep = data.sleep.filter((s) => s.date !== date);
    if (hours > 0) {
      data.sleep.push({
        date,
        hours,
        loggedAt: new Date().toISOString(),
      });
    }
    this.saveData(data);
  }

  async getMeta(): Promise<AppMeta> {
    return this.getData().meta;
  }

  async updateMeta(patch: Partial<AppMeta>): Promise<void> {
    const data = this.getData();
    data.meta = { ...data.meta, ...patch };
    this.saveData(data);
  }

  async exportAll(): Promise<ExportBundle> {
    return this.getData();
  }

  async importAll(bundle: ExportBundle): Promise<void> {
    this.saveData(bundle);
  }
}
