"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  addMonths,
} from "date-fns";
import { useHabits } from "../hooks/useHabits";
import { useHabitEntries } from "../hooks/useHabitEntries";
import { HabitCheckbox } from "./HabitCheckbox";
import { HabitIcon } from "@/components/shared/HabitIcon";
import { AddEditHabitDialog } from "./AddEditHabitDialog";
import { Habit } from "@/lib/storage/types";
import { ChevronLeft, ChevronRight, Plus, Settings } from "lucide-react";
import { colorThemes } from "../utils/colors";

export function HabitGrid() {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { habits, saveHabit, deleteHabit } = useHabits();

  const startDateStr = format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const endDateStr = format(endOfMonth(currentMonth), "yyyy-MM-dd");

  const { entries, setEntryStatus } = useHabitEntries(startDateStr, endDateStr);

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    });
  }, [currentMonth]);

  // Create lookup map for entries
  const entryMap = useMemo(() => {
    const map = new Map<string, "done" | "missed" | "unmarked">();
    for (const entry of entries) {
      map.set(`${entry.habitId}_${entry.date}`, entry.status);
    }
    return map;
  }, [entries]);

  // Scroll to today logic
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const todayColumnRef = useRef<HTMLTableHeaderCellElement>(null);

  const handleScrollToToday = () => {
    if (todayColumnRef.current && gridContainerRef.current) {
      const container = gridContainerRef.current;
      const target = todayColumnRef.current;
      const scrollOffset =
        target.offsetLeft -
        container.offsetWidth / 2 +
        target.offsetWidth / 2;
      container.scrollTo({ left: scrollOffset, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleScrollToToday();
    }, 100);
    return () => clearTimeout(timer);
  }, [currentMonth]);

  const handleCheckboxClick = (habitId: string, dateStr: string) => {
    const key = `${habitId}_${dateStr}`;
    const currentStatus = entryMap.get(key) || "unmarked";

    // Cycle: unmarked -> done -> missed -> unmarked
    let nextStatus: "done" | "missed" | "unmarked" = "done";
    if (currentStatus === "done") {
      nextStatus = "missed";
    } else if (currentStatus === "missed") {
      nextStatus = "unmarked";
    }

    setEntryStatus({ habitId, date: dateStr, status: nextStatus });
  };

  const activeHabits = useMemo(() => {
    return habits
      .filter((h) => !h.archivedAt)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [habits]);

  // Calculate daily completion score
  const dailyCompletions = useMemo(() => {
    const scores: Record<string, { done: number; total: number }> = {};
    for (const d of days) {
      const dateStr = format(d, "yyyy-MM-dd");
      let done = 0;
      let total = 0;

      for (const h of activeHabits) {
        if (h.createdAt <= dateStr) {
          total++;
          const status = entryMap.get(`${h.id}_${dateStr}`) || "unmarked";
          if (status === "done") {
            done++;
          }
        }
      }
      scores[dateStr] = { done, total };
    }
    return scores;
  }, [days, activeHabits, entryMap]);

  return (
    <div className="space-y-6">
      {/* Month Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-bg border border-border-custom rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentMonth((prev) => addMonths(prev, -1))}
            className="p-2 hover:bg-surface-muted border border-border-custom rounded-xl transition-colors text-text-muted hover:text-text-body focus:outline-none"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-text-heading min-w-[120px] text-center capitalize">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            type="button"
            onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            className="p-2 hover:bg-surface-muted border border-border-custom rounded-xl transition-colors text-text-muted hover:text-text-body focus:outline-none"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {format(currentMonth, "yyyy-MM") === format(new Date(), "yyyy-MM") && (
            <button
              type="button"
              onClick={handleScrollToToday}
              className="flex-1 sm:flex-initial rounded-xl px-4 py-2 border border-border-custom hover:bg-surface-muted text-xs font-semibold text-text-body transition-colors"
            >
              Jump to Today
            </button>
          )}
          {activeHabits.length < 10 && (
            <button
              type="button"
              onClick={() => {
                setEditingHabit(null);
                setIsDialogOpen(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 bg-text-heading text-surface-bg hover:opacity-95 text-xs font-semibold shadow-sm transition-opacity"
            >
              <Plus className="h-4 w-4" />
              Add Habit
            </button>
          )}
        </div>
      </div>

      {activeHabits.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-surface-bg border border-border-custom rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-text-heading">
              Create your first habit
            </h3>
            <p className="text-sm text-text-muted mt-1 max-w-sm">
              Keep track of up to 10 daily routines on your monthly grid.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingHabit(null);
              setIsDialogOpen(true);
            }}
            className="rounded-xl px-4 py-2 bg-text-heading text-surface-bg hover:opacity-95 text-xs font-semibold shadow-sm transition-opacity"
          >
            Create your first habit
          </button>
        </div>
      ) : (
        /* Monthly Habit Grid Table */
        <div className="bg-surface-bg border border-border-custom rounded-2xl shadow-sm overflow-hidden">
          <div
            ref={gridContainerRef}
            className="overflow-x-auto custom-scrollbar scroll-smooth"
          >
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="border-b border-border-custom bg-surface-muted/40">
                  {/* First column: Habit labels */}
                  <th className="sticky left-0 z-10 w-52 min-w-52 text-left px-4 py-3 bg-surface-bg font-semibold text-xs text-text-muted border-r border-border-custom">
                    Habits ({activeHabits.length}/10)
                  </th>
                  {/* Day numbers */}
                  {days.map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const isColToday = isToday(day);
                    return (
                      <th
                        key={dateStr}
                        ref={isColToday ? todayColumnRef : null}
                        className={`w-12 min-w-12 text-center py-2 text-[10px] font-semibold tracking-wide ${
                          isColToday
                            ? "bg-habit-violet/5 text-habit-violet font-bold border-x border-habit-violet/20"
                            : "text-text-muted"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span>{format(day, "E").substring(0, 1)}</span>
                          <span
                            className={`mt-0.5 rounded-full w-5 h-5 flex items-center justify-center ${
                              isColToday
                                ? "bg-habit-violet text-white font-bold"
                                : ""
                            }`}
                          >
                            {format(day, "d")}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {activeHabits.map((habit) => {
                  const colorTheme =
                    colorThemes[habit.color] || colorThemes.violet;
                  return (
                    <tr
                      key={habit.id}
                      className="border-b border-border-custom last:border-0 hover:bg-surface-muted/20 transition-colors"
                    >
                      {/* Habit Name column (Sticky) */}
                      <td className="sticky left-0 z-10 px-4 py-3 bg-surface-bg border-r border-border-custom shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-between group">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingHabit(habit);
                              setIsDialogOpen(true);
                            }}
                            className="flex items-center gap-2.5 text-left focus:outline-none w-full"
                          >
                            <span
                              className={`p-1.5 rounded-lg shrink-0 ${colorTheme.bg} ${colorTheme.text}`}
                            >
                              <HabitIcon
                                name={habit.icon}
                                className="h-4 w-4"
                              />
                            </span>
                            <span className="text-sm font-semibold text-text-heading truncate group-hover:text-border-focus transition-colors">
                              {habit.name}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingHabit(habit);
                              setIsDialogOpen(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-text-body transition-all"
                            title="Edit habit"
                          >
                            <Settings className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Day Checkboxes */}
                      {days.map((day) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const key = `${habit.id}_${dateStr}`;
                        const status = entryMap.get(key) || "unmarked";
                        const isColToday = isToday(day);
                        const habitExists = habit.createdAt <= dateStr;

                        return (
                          <td
                            key={dateStr}
                            className={`py-2 text-center ${
                              isColToday
                                ? "bg-habit-violet/5 border-x border-habit-violet/10"
                                : ""
                            }`}
                          >
                            {habitExists ? (
                              <div className="flex justify-center">
                                <HabitCheckbox
                                  status={status}
                                  color={habit.color}
                                  onClick={() =>
                                    handleCheckboxClick(habit.id, dateStr)
                                  }
                                />
                              </div>
                            ) : (
                              <div className="h-8 w-8 mx-auto flex items-center justify-center text-[10px] text-text-muted opacity-30 select-none">
                                -
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Pinned 'Add Habit' row under the list */}
                {activeHabits.length < 10 && (
                  <tr className="border-b border-border-custom bg-surface-bg hover:bg-surface-muted/30 transition-colors">
                    <td
                      colSpan={days.length + 1}
                      className="sticky left-0 px-4 py-2.5 z-10"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEditingHabit(null);
                          setIsDialogOpen(true);
                        }}
                        className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text-heading transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Habit</span>
                      </button>
                    </td>
                  </tr>
                )}

                {/* Daily Completion Footer Row */}
                <tr className="border-t border-border-custom bg-surface-muted/30">
                  <td className="sticky left-0 z-10 px-4 py-3 bg-surface-bg border-r border-border-custom font-semibold text-xs text-text-muted">
                    Daily Score
                  </td>
                  {days.map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const isColToday = isToday(day);
                    const score = dailyCompletions[dateStr] || {
                      done: 0,
                      total: 0,
                    };

                    return (
                      <td
                        key={dateStr}
                        className={`py-2 text-center text-[10px] font-bold text-text-muted ${
                          isColToday
                            ? "bg-habit-violet/5 border-x border-habit-violet/10 text-habit-violet font-extrabold"
                            : ""
                        }`}
                      >
                        {score.total > 0 ? (
                          <div className="flex flex-col items-center">
                            <span>
                              {score.done}/{score.total}
                            </span>
                            <span className="w-6 h-1 mt-0.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                              <span
                                style={{
                                  width: `${(score.done / score.total) * 100}%`,
                                }}
                                className="h-full block bg-text-heading dark:bg-border-focus"
                              />
                            </span>
                          </div>
                        ) : (
                          <span className="opacity-30">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <AddEditHabitDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        habitToEdit={editingHabit}
        currentHabitCount={activeHabits.length}
        onSave={saveHabit}
        onDelete={deleteHabit}
      />
    </div>
  );
}
