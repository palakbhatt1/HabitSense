import { ExportBundle } from "./types";

export const CURRENT_SCHEMA_VERSION = 1;

type MigrationFunction = (data: any) => any;

const migrations: Record<number, MigrationFunction> = {
  // E.g., 1: (data) => { ... return migratedData; }
};

export function migrateData(data: any): ExportBundle {
  if (!data) {
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

  let version = data.schemaVersion || 0;

  // Run all migrations in sequence
  while (version < CURRENT_SCHEMA_VERSION) {
    const nextVersion = version + 1;
    const migration = migrations[nextVersion];
    if (migration) {
      data = migration(data);
    }
    data.schemaVersion = nextVersion;
    version = nextVersion;
  }

  // Ensure default structures are present
  if (!data.meta) {
    data.meta = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      userDisplayName: null,
      themeMode: "light",
      onboardingCompletedAt: null,
      dailyIntentions: {},
    };
  } else {
    data.meta.schemaVersion = CURRENT_SCHEMA_VERSION;
  }
  if (!data.meta.dailyIntentions) {
    data.meta.dailyIntentions = {};
  }
  if (!data.habits) data.habits = [];
  if (!data.entries) data.entries = [];
  if (!data.sleep) data.sleep = [];

  return data as ExportBundle;
}
