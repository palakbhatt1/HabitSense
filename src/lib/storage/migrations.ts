import { ExportBundle } from "./types";

export const CURRENT_SCHEMA_VERSION = 1;

type MigrationFunction = (data: Record<string, unknown>) => Record<string, unknown>;

const migrations: Record<number, MigrationFunction> = {
  // E.g., 1: (data) => { ... return migratedData; }
};

export function migrateData(data: unknown): ExportBundle {
  if (!data || typeof data !== "object") {
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      meta: {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        userDisplayName: null,
        themeMode: "light",
        onboardingCompletedAt: null,
        dailyIntentions: {},
      },
      habits: [],
      entries: [],
      sleep: [],
    };
  }

  let record = data as Record<string, unknown>;
  let version = typeof record.schemaVersion === "number" ? record.schemaVersion : 0;

  // Run all migrations in sequence
  while (version < CURRENT_SCHEMA_VERSION) {
    const nextVersion = version + 1;
    const migration = migrations[nextVersion];
    if (migration) {
      record = migration(record);
    }
    record.schemaVersion = nextVersion;
    version = nextVersion;
  }

  // Ensure default structures are present
  const meta = (record.meta && typeof record.meta === "object" ? record.meta : {}) as Record<
    string,
    unknown
  >;
  meta.schemaVersion = CURRENT_SCHEMA_VERSION;
  if (!meta.themeMode) meta.themeMode = "light";
  if (!meta.dailyIntentions) meta.dailyIntentions = {};
  record.meta = meta;

  if (!Array.isArray(record.habits)) record.habits = [];
  if (!Array.isArray(record.entries)) record.entries = [];
  if (!Array.isArray(record.sleep)) record.sleep = [];

  return record as unknown as ExportBundle;
}
