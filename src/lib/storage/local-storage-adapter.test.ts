// Mock window and localStorage globally before imports
const mockStorage: Record<string, string> = {};
const fakeLocalStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = String(value);
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const key in mockStorage) {
      delete mockStorage[key];
    }
  },
  length: 0,
  key: () => null,
};

const globalScope = globalThis as unknown as {
  window: unknown;
  localStorage: unknown;
};
globalScope.window = {};
globalScope.localStorage = fakeLocalStorage;

import { LocalStorageAdapter } from "./local-storage-adapter";
import { Habit, ExportBundle } from "./types";
import { CURRENT_SCHEMA_VERSION } from "./migrations";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`);
    process.exit(1);
  }
}

async function runTests() {
  console.log("Starting LocalStorageAdapter tests...");

  const adapter = new LocalStorageAdapter();

  // Test 1: Get initial data when storage is empty
  fakeLocalStorage.clear();
  const initialMeta = await adapter.getMeta();
  assert(initialMeta.schemaVersion === CURRENT_SCHEMA_VERSION, "Initial schema version must be current");
  assert(initialMeta.themeMode === "light", "Default theme must be light");
  assert(initialMeta.userDisplayName === null, "Default user display name must be null");

  const initialHabits = await adapter.getHabits();
  assert(initialHabits.length === 0, "Initial habits must be empty");

  // Test 2: Save and retrieve habit
  const newHabit: Habit = {
    id: "habit-1",
    name: "Drink Water",
    icon: "droplet",
    color: "sky",
    createdAt: "2026-06-27",
    archivedAt: null,
    sortOrder: 0,
  };
  await adapter.saveHabit(newHabit);
  const habits = await adapter.getHabits();
  assert(habits.length === 1, "Habits length must be 1 after save");
  assert(habits[0].name === "Drink Water", "Saved habit name must match");

  // Test 3: Modify habit
  const updatedHabit = { ...newHabit, name: "Hydrate" };
  await adapter.saveHabit(updatedHabit);
  const updatedHabits = await adapter.getHabits();
  assert(updatedHabits[0].name === "Hydrate", "Updated habit name must match");

  // Test 4: Habit entries
  await adapter.setEntryStatus("habit-1", "2026-06-27", "done");
  let entries = await adapter.getEntries({ from: "2026-06-26", to: "2026-06-28" });
  assert(entries.length === 1, "Entries length must be 1");
  assert(entries[0].status === "done", "Entry status must be done");

  // Verify sparse storage: status unmarked should remove/not store
  await adapter.setEntryStatus("habit-1", "2026-06-27", "unmarked");
  entries = await adapter.getEntries({ from: "2026-06-26", to: "2026-06-28" });
  assert(entries.length === 0, "Unmarked entries must not be stored");

  // Test 5: Sleep entries
  await adapter.setSleepEntry("2026-06-27", 7.5);
  const sleep = await adapter.getSleepEntries({ from: "2026-06-26", to: "2026-06-28" });
  assert(sleep.length === 1, "Sleep entries length must be 1");
  assert(sleep[0].hours === 7.5, "Sleep hours must match");

  // Test 6: App Meta update
  await adapter.updateMeta({ userDisplayName: "Alex", dailyIntentions: { "2026-06-27": "Read 10 pages" } });
  const meta = await adapter.getMeta();
  assert(meta.userDisplayName === "Alex", "Meta display name must update");
  assert(meta.dailyIntentions?.["2026-06-27"] === "Read 10 pages", "Intention must save");

  // Test 7: Export / Import
  const exported = await adapter.exportAll();
  assert(exported.habits.length === 1, "Export bundle should contain 1 habit");
  assert(exported.sleep.length === 1, "Export bundle should contain 1 sleep entry");

  // Reset and Import empty
  fakeLocalStorage.clear();
  const emptyBundle: ExportBundle = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    meta: {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      userDisplayName: "New Guy",
      themeMode: "dark",
      onboardingCompletedAt: null,
      dailyIntentions: {},
    },
    habits: [],
    entries: [],
    sleep: [],
  };
  await adapter.importAll(emptyBundle);
  const importedMeta = await adapter.getMeta();
  assert(importedMeta.userDisplayName === "New Guy", "Imported user name should match");
  const importedHabits = await adapter.getHabits();
  assert(importedHabits.length === 0, "Imported habits list should be empty");

  // Restore exported data
  await adapter.importAll(exported);
  const finalHabits = await adapter.getHabits();
  assert(finalHabits.length === 1 && finalHabits[0].name === "Hydrate", "Restored habits should match");

  // Test 8: Schema migration test for legacy bundle
  fakeLocalStorage.clear();
  const legacyData = {
    // Missing schemaVersion (implies 0/legacy)
    meta: {
      userDisplayName: "Old User",
      themeMode: "light",
      onboardingCompletedAt: "2026-01-01",
      // Missing dailyIntentions
    },
    habits: [{ id: "h-old", name: "Old Habit", color: "pink", icon: "book", createdAt: "2026-01-01", archivedAt: null, sortOrder: 0 }],
  };
  fakeLocalStorage.setItem("habitsense:v1", JSON.stringify(legacyData));

  // Reading should trigger auto-migration
  const migratedMeta = await adapter.getMeta();
  assert(migratedMeta.schemaVersion === CURRENT_SCHEMA_VERSION, "Migrated schemaVersion should be updated");
  assert(migratedMeta.dailyIntentions !== undefined, "dailyIntentions should be initialized");

  const migratedHabits = await adapter.getHabits();
  assert(migratedHabits.length === 1 && migratedHabits[0].id === "h-old", "Legacy habits should survive migration");

  console.log("✅ All LocalStorageAdapter tests passed successfully!");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
