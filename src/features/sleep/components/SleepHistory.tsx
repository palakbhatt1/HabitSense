"use client";

import React, { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { SleepEntry } from "@/lib/storage/types";
import { Moon, Edit2 } from "lucide-react";

interface SleepHistoryProps {
  sleepEntries: SleepEntry[];
  onEditEntry: (dateStr: string) => void;
}

export function SleepHistory({ sleepEntries, onEditEntry }: SleepHistoryProps) {
  const sortedEntries = useMemo(() => {
    return [...sleepEntries]
      .filter((e) => e.hours > 0)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [sleepEntries]);

  const formatHours = (h: number) => {
    const whole = Math.floor(h);
    const mins = Math.round((h - whole) * 60);
    if (mins === 0) return `${whole}h`;
    return `${whole}h ${mins}m`;
  };

  return (
    <div className="bg-surface-bg border border-border-custom rounded-2xl p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-bold text-text-heading flex items-center gap-1.5">
          <Moon className="h-4 w-4 text-habit-violet" />
          Sleep History
        </h3>
        <p className="text-[11px] text-text-muted">A detailed log of your recorded sleep sessions</p>
      </div>

      {sortedEntries.length === 0 ? (
        <div className="text-center py-8 text-xs text-text-muted">
          No sleep logged for this period yet.
        </div>
      ) : (
        <div className="max-h-[220px] overflow-y-auto custom-scrollbar border border-border-custom rounded-xl divide-y divide-border-custom">
          {sortedEntries.map((entry) => (
            <div
              key={entry.date}
              className="flex items-center justify-between p-3 hover:bg-surface-muted/30 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-habit-violet/10 dark:bg-habit-violet/20 text-habit-violet rounded-lg shrink-0">
                  <Moon className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-text-heading">
                    {format(parseISO(entry.date), "eeee, MMMM d")}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    Logged {format(parseISO(entry.loggedAt), "h:mm a")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-text-heading">
                  {formatHours(entry.hours)}
                </span>
                <button
                  onClick={() => onEditEntry(entry.date)}
                  className="p-1 hover:bg-surface-muted rounded text-text-muted hover:text-text-body transition-colors focus:outline-none opacity-0 group-hover:opacity-100"
                  title="Edit sleep hours"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
