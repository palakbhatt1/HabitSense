"use client";

import React, { useState, useEffect } from "react";
import { useStorage } from "@/lib/storage/storage-provider";
import { useQueryClient } from "@tanstack/react-query";
import { Settings as SettingsIcon, Download, Upload, Trash2, User, Save, RefreshCw } from "lucide-react";
import { CURRENT_SCHEMA_VERSION } from "@/lib/storage/migrations";

export default function SettingsPage() {
  const storage = useStorage();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    storage.getMeta().then((meta) => {
      if (meta && meta.userDisplayName) {
        setName(meta.userDisplayName);
      }
    });
  }, [storage]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSavingName(true);
    try {
      await storage.updateMeta({ userDisplayName: name.trim() });
      queryClient.invalidateQueries({ queryKey: ["meta"] });
      alert("Name updated successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleExportData = async () => {
    try {
      const bundle = await storage.exportAll();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(bundle, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `habitsense_backup_${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error(err);
      alert("Failed to export data.");
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus("Importing...");
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(reader.result as string);
        if (json.schemaVersion && Array.isArray(json.habits) && Array.isArray(json.entries)) {
          await storage.importAll(json);
          setImportStatus("Data imported successfully!");
          queryClient.invalidateQueries();
          alert("Backup data restored successfully! Re-syncing...");
        } else {
          setImportStatus("Invalid backup file structure.");
        }
      } catch (err) {
        console.error(err);
        setImportStatus("Failed to parse file.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = async () => {
    if (
      confirm(
        "Warning: This will permanently delete all habits, daily checkboxes, sleep entries, and user preferences. This action cannot be undone.\n\nAre you sure you want to proceed?"
      )
    ) {
      setIsResetting(true);
      try {
        const emptyBundle = {
          schemaVersion: CURRENT_SCHEMA_VERSION,
          meta: {
            schemaVersion: CURRENT_SCHEMA_VERSION,
            userDisplayName: null,
            themeMode: "light" as const,
            onboardingCompletedAt: null,
            dailyIntentions: {},
          },
          habits: [],
          entries: [],
          sleep: [],
        };
        await storage.importAll(emptyBundle);
        queryClient.clear(); // Clears TanStack Query cache
        alert("All data wiped successfully. Refreshing application...");
        window.location.href = "/"; // Send back to root to trigger onboarding
      } catch (err) {
        console.error(err);
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Intro info header */}
      <div>
        <h2 className="text-lg font-extrabold text-text-heading flex items-center gap-1.5 capitalize">
          <SettingsIcon className="h-5 w-5 text-habit-violet" />
          Settings
        </h2>
        <p className="text-xs text-text-muted mt-1 leading-normal">
          Manage your display settings, backup data options, and core database.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile/Display Name card */}
        <div className="bg-surface-bg border border-border-custom rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-text-heading flex items-center gap-2">
            <User className="h-4 w-4 text-habit-violet" />
            Profile Preferences
          </h3>
          <form onSubmit={handleSaveName} className="flex gap-3 items-end max-w-md">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Display Name</label>
              <input
                type="text"
                required
                maxLength={20}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border-custom bg-transparent px-3 py-2 text-xs focus:border-border-focus focus:ring-2 focus:ring-ring-custom outline-none transition-all font-semibold"
              />
            </div>
            <button
              type="submit"
              disabled={isSavingName || !name.trim()}
              className="rounded-xl px-4 py-2 text-xs bg-text-heading text-surface-bg hover:opacity-90 disabled:opacity-50 transition-opacity font-bold flex items-center gap-1.5 h-[34px]"
            >
              <Save className="h-3.5 w-3.5" />
              Save Name
            </button>
          </form>
        </div>

        {/* Database Export/Import backups card */}
        <div className="bg-surface-bg border border-border-custom rounded-3xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-sm font-bold text-text-heading flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-habit-violet" />
              Data Import & Export
            </h3>
            <p className="text-[10px] text-text-muted mt-0.5">
              Back up your history locally as a JSON file or migrate data from another device.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={handleExportData}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 border border-border-custom hover:bg-surface-muted text-xs font-semibold text-text-body transition-colors"
            >
              <Download className="h-4 w-4" />
              Export Backup File
            </button>

            <label className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 border border-border-custom hover:bg-surface-muted text-xs font-semibold text-text-body transition-colors cursor-pointer">
              <Upload className="h-4 w-4" />
              <span>Import Backup File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
          {importStatus && (
            <p className="text-[10px] text-center font-bold text-habit-violet">
              {importStatus}
            </p>
          )}
        </div>

        {/* Danger zone card */}
        <div className="bg-surface-bg border border-border-custom rounded-3xl p-6 shadow-sm space-y-4 border-red-200 dark:border-red-950/40">
          <div>
            <h3 className="text-sm font-bold text-red-500 flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Danger Zone
            </h3>
            <p className="text-[10px] text-text-muted mt-0.5">
              Permanently wipe all logs and statistics. This cannot be undone.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetData}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Reset All Application Data
          </button>
        </div>
      </div>
    </div>
  );
}
