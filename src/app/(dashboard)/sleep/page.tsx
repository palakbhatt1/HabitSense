"use client";

import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { useSleepEntries } from "@/features/sleep/hooks/useSleepEntries";
import { SleepChart } from "@/features/sleep/components/SleepChart";
import { SleepHistory } from "@/features/sleep/components/SleepHistory";
import { SleepLogger } from "@/features/sleep/components/SleepLogger";
import { ChevronLeft, ChevronRight, Moon, Plus } from "lucide-react";

export default function SleepPage() {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);

  const startMonthStr = format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const endMonthStr = format(endOfMonth(currentMonth), "yyyy-MM-dd");

  const { sleepEntries, setSleepEntry, isLoading } = useSleepEntries(startMonthStr, endMonthStr);

  const handleSelectDateForLogging = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsLoggerOpen(true);
  };

  const handleSaveSleep = async (date: string, hours: number) => {
    await setSleepEntry({ date, hours });
  };

  // Find currently logged hours for the selected date
  const currentHours = selectedDate
    ? sleepEntries.find((e) => e.date === selectedDate)?.hours || 0
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Intro info header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-extrabold text-text-heading flex items-center gap-1.5 capitalize">
            <Moon className="h-5 w-5 text-habit-violet" />
            Sleep Tracker
          </h2>
          <p className="text-xs text-text-muted mt-1 leading-normal">
            Track sleep duration, maintain healthy sleep routines, and explore rest trends.
          </p>
        </div>
        <button
          onClick={() => handleSelectDateForLogging(format(new Date(), "yyyy-MM-dd"))}
          className="flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 bg-text-heading text-surface-bg hover:opacity-95 text-xs font-semibold shadow-sm transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Log Sleep
        </button>
      </div>

      {/* Month Header controls */}
      <div className="flex justify-between items-center bg-surface-bg border border-border-custom rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth((prev) => addMonths(prev, -1))}
            className="p-2 hover:bg-surface-muted border border-border-custom rounded-xl transition-colors text-text-muted hover:text-text-body focus:outline-none"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-bold text-text-heading min-w-[120px] text-center capitalize">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            className="p-2 hover:bg-surface-muted border border-border-custom rounded-xl transition-colors text-text-muted hover:text-text-body focus:outline-none"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-[350px] animate-shimmer rounded-3xl border border-border-custom bg-surface-bg" />
          <div className="h-[220px] animate-shimmer rounded-3xl border border-border-custom bg-surface-bg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trend Chart */}
          <div className="md:col-span-2">
            <SleepChart
              currentMonth={currentMonth}
              sleepEntries={sleepEntries}
              onSelectDate={handleSelectDateForLogging}
            />
          </div>

          {/* List History */}
          <div className="md:col-span-1">
            <SleepHistory
              sleepEntries={sleepEntries}
              onEditEntry={handleSelectDateForLogging}
            />
          </div>
        </div>
      )}

      {/* Sleep Logger Modal */}
      {selectedDate && (
        <SleepLogger
          isOpen={isLoggerOpen}
          onClose={() => {
            setIsLoggerOpen(false);
            setSelectedDate(null);
          }}
          dateStr={selectedDate}
          currentHours={currentHours}
          onSave={handleSaveSleep}
        />
      )}
    </div>
  );
}
