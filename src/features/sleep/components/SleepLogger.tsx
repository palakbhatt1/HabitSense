"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { format, parseISO } from "date-fns";
import { Minus, Plus, Moon, Trash2 } from "lucide-react";

interface SleepLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  currentHours: number;
  onSave: (date: string, hours: number) => Promise<void>;
}

const QUICK_HOURS = [6, 7, 7.5, 8, 8.5, 9];

function SleepLoggerForm({
  dateStr,
  currentHours,
  onSave,
  onClose,
}: {
  dateStr: string;
  currentHours: number;
  onSave: (date: string, hours: number) => Promise<void>;
  onClose: () => void;
}) {
  const [hours, setHours] = useState(() => (currentHours > 0 ? currentHours : 7));
  const [isSaving, setIsSaving] = useState(false);

  const handleIncrement = () => {
    setHours((prev) => Math.min(24, Math.round((prev + 0.25) * 100) / 100));
  };

  const handleDecrement = () => {
    setHours((prev) => Math.max(0, Math.round((prev - 0.25) * 100) / 100));
  };

  const formatHoursDisplay = (h: number) => {
    const whole = Math.floor(h);
    const mins = Math.round((h - whole) * 60);

    if (h === 0) return "No sleep logged";
    if (whole === 0) return `${mins} minutes`;
    if (mins === 0) return `${whole} hour${whole > 1 ? "s" : ""}`;
    return `${whole} hr${whole > 1 ? "s" : ""} ${mins} mins`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(dateStr, hours);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    setIsSaving(true);
    try {
      await onSave(dateStr, 0); // 0 hours removes the entry
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = dateStr
    ? format(parseISO(dateStr), "MMMM d, yyyy")
    : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-1">
        <p className="text-xs text-text-muted">Night of</p>
        <p className="text-sm font-bold text-text-heading">{formattedDate}</p>
      </div>

      {/* Stepper Display */}
      <div className="flex flex-col items-center justify-center space-y-2 py-4 bg-surface-muted/50 rounded-2xl border border-border-custom">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={handleDecrement}
            className="p-3 bg-surface-bg border border-border-custom hover:bg-surface-muted rounded-full transition-all text-text-heading shadow-sm disabled:opacity-50"
            disabled={hours <= 0}
            aria-label="Decrease sleep time by 15 minutes"
          >
            <Minus className="h-5 w-5 stroke-[2.5px]" />
          </button>

          <div className="text-center min-w-[120px]">
            <span className="text-4xl font-extrabold tracking-tight text-text-heading">
              {hours.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-text-muted block mt-1">
              hours
            </span>
          </div>

          <button
            type="button"
            onClick={handleIncrement}
            className="p-3 bg-surface-bg border border-border-custom hover:bg-surface-muted rounded-full transition-all text-text-heading shadow-sm disabled:opacity-50"
            disabled={hours >= 24}
            aria-label="Increase sleep time by 15 minutes"
          >
            <Plus className="h-5 w-5 stroke-[2.5px]" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-habit-violet font-semibold pt-2">
          <Moon className="h-3.5 w-3.5" />
          <span>{formatHoursDisplay(hours)}</span>
        </div>
      </div>

      {/* Quick Select Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-muted block">
          Quick Select
        </label>
        <div className="grid grid-cols-6 gap-2">
          {QUICK_HOURS.map((qh) => (
            <button
              key={qh}
              type="button"
              onClick={() => setHours(qh)}
              className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                hours === qh
                  ? "bg-habit-violet text-white border-habit-violet shadow-sm"
                  : "bg-surface-bg border-border-custom text-text-body hover:bg-surface-muted"
              }`}
            >
              {qh}h
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border-custom">
        <div>
          {currentHours > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Clear Entry
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm bg-surface-muted text-text-body hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl px-4 py-2 text-sm bg-text-heading text-surface-bg hover:opacity-90 transition-opacity font-medium"
          >
            {isSaving ? "Saving..." : "Save Log"}
          </button>
        </div>
      </div>
    </form>
  );
}

export function SleepLogger({
  isOpen,
  onClose,
  dateStr,
  currentHours,
  onSave,
}: SleepLoggerProps) {
  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Log Sleep Duration">
      <SleepLoggerForm
        key={dateStr}
        dateStr={dateStr}
        currentHours={currentHours}
        onSave={onSave}
        onClose={onClose}
      />
    </Dialog>
  );
}
