"use client";

import React, { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { SleepEntry } from "@/lib/storage/types";
import { Moon, Edit2, ChevronLeft, ChevronRight } from "lucide-react";

interface SleepHistoryProps {
  sleepEntries: SleepEntry[];
  onEditEntry: (dateStr: string) => void;
}

const ITEMS_PER_PAGE = 5;

export function SleepHistory({ sleepEntries, onEditEntry }: SleepHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const sortedEntries = useMemo(() => {
    return [...sleepEntries]
      .filter((e) => e.hours > 0)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [sleepEntries]);

  const totalPages = Math.max(1, Math.ceil(sortedEntries.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedEntries = sortedEntries.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const formatHours = (h: number) => {
    const whole = Math.floor(h);
    const mins = Math.round((h - whole) * 60);
    if (mins === 0) return `${whole}h`;
    return `${whole}h ${mins}m`;
  };

  return (
    <div className="bg-surface-bg border border-border-custom rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between h-full min-h-[320px]">
      <div>
        <h3 className="text-sm font-bold text-text-heading flex items-center gap-1.5">
          <Moon className="h-4 w-4 text-habit-violet" />
          Sleep History
        </h3>
        <p className="text-[11px] text-text-muted">
          A detailed log of your recorded sleep sessions
        </p>
      </div>

      {sortedEntries.length === 0 ? (
        <div className="text-center py-8 text-xs text-text-muted flex-1 flex items-center justify-center">
          No sleep logged for this period yet.
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div className="border border-border-custom rounded-xl divide-y divide-border-custom">
            {pagedEntries.map((entry) => (
              <div
                key={entry.date}
                className="flex items-center justify-between p-2.5 hover:bg-surface-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-habit-violet/10 dark:bg-habit-violet/20 text-habit-violet rounded-lg shrink-0">
                    <Moon className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-text-heading">
                      {format(parseISO(entry.date), "EEE, MMM d")}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      Logged {format(parseISO(entry.loggedAt), "h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-text-heading">
                    {formatHours(entry.hours)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEditEntry(entry.date)}
                    className="p-1 hover:bg-surface-muted rounded text-text-muted hover:text-text-body transition-colors focus:outline-none"
                    title="Edit sleep hours"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1 text-xs text-text-muted">
              <span>
                Page {safePage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded-lg border border-border-custom hover:bg-surface-muted disabled:opacity-40 transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded-lg border border-border-custom hover:bg-surface-muted disabled:opacity-40 transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
