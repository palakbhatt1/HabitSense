"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  format,
  addDays,
  isSameDay,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import { useHabits } from "../hooks/useHabits";
import { useHabitEntries } from "../hooks/useHabitEntries";
import { HabitCheckbox } from "./HabitCheckbox";
import { HabitIcon } from "@/components/shared/HabitIcon";
import { calculateStreak } from "../utils/streak";
import { colorThemes } from "../utils/colors";
import { Calendar as CalendarIcon, Flame, ChevronLeft, ChevronRight, Plus, Sparkles } from "lucide-react";
import { AddEditHabitDialog } from "./AddEditHabitDialog";
import { Habit } from "@/lib/storage/types";
import { StreakFlame } from "@/components/shared/StreakFlame";
import { ConfettiExplosion } from "@/components/shared/ConfettiExplosion";


export function HabitDayList() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [triggerConfetti, setTriggerConfetti] = useState(false);


  const { habits, saveHabit, deleteHabit } = useHabits();

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  // Query entries for a 15-day range centered on selectedDate to optimize API requests
  const fromDateStr = format(subDays(selectedDate, 7), "yyyy-MM-dd");
  const toDateStr = format(addDays(selectedDate, 7), "yyyy-MM-dd");

  const { entries, setEntryStatus } = useHabitEntries(fromDateStr, toDateStr);

  const activeHabits = useMemo(() => {
    return habits.filter((h) => !h.archivedAt).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [habits]);

  // Create lookup map for entries
  const entryMap = useMemo(() => {
    const map = new Map<string, "done" | "missed" | "unmarked">();
    for (const entry of entries) {
      map.set(`${entry.habitId}_${entry.date}`, entry.status);
    }
    return map;
  }, [entries]);

  // Calculate 7-day strip centered on selectedDate
  const dateStrip = useMemo(() => {
    const dates: Date[] = [];
    for (let i = -3; i <= 3; i++) {
      dates.push(addDays(selectedDate, i));
    }
    return dates;
  }, [selectedDate]);

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

    // Trigger confetti if this marks the last habit as done
    const score = dailySummary;
    if (nextStatus === "done" && score.completed + 1 === score.total && score.total > 0) {
      setTriggerConfetti(true);
    }
  };

  // Filter habits active on selected day (created on or before)
  const habitsForSelectedDay = useMemo(() => {
    return activeHabits.filter((h) => h.createdAt <= selectedDateStr);
  }, [activeHabits, selectedDateStr]);

  // Calculate completion percentage for today
  const dailySummary = useMemo(() => {
    const total = habitsForSelectedDay.length;
    if (total === 0) return { completed: 0, total: 0, percent: 0 };
    
    const completed = habitsForSelectedDay.filter(
      (h) => entryMap.get(`${h.id}_${selectedDateStr}`) === "done"
    ).length;

    return {
      completed,
      total,
      percent: Math.round((completed / total) * 100),
    };
  }, [habitsForSelectedDay, entryMap, selectedDateStr]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDate(startOfDay(parseISO(e.target.value)));
    }
  };

  return (
    <div className="space-y-4">
      {triggerConfetti && (
        <ConfettiExplosion onComplete={() => setTriggerConfetti(false)} />
      )}
      {/* Date Strip Navigation */}
      <div className="bg-surface-bg border border-border-custom rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-text-heading font-bold text-sm">
            <span>{format(selectedDate, "eeee, MMM d")}</span>
            {isSameDay(selectedDate, new Date()) && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-habit-violet/10 text-habit-violet font-semibold">
                Today
              </span>
            )}
          </div>

          {/* Styled Calendar Input */}
          <div className="relative cursor-pointer text-text-muted hover:text-text-body transition-colors">
            <CalendarIcon className="h-5 w-5" />
            <input
              type="date"
              value={selectedDateStr}
              onChange={handleDateChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
          </div>
        </div>

        {/* Date Horizontal Strip */}
        <div className="flex items-center justify-between gap-1 select-none">
          <button
            onClick={() => setSelectedDate((prev) => addDays(prev, -1))}
            className="p-1 text-text-muted hover:text-text-body"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-1 justify-around gap-1 overflow-hidden">
            {dateStrip.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isDayToday = isColToday(day);
              
              function isColToday(d: Date) {
                return isSameDay(d, new Date());
              }

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(startOfDay(day))}
                  className={`flex flex-col items-center justify-center w-10 py-1.5 rounded-xl transition-all ${
                    isSelected
                      ? "bg-text-heading text-surface-bg scale-105 font-bold shadow-sm"
                      : "hover:bg-surface-muted text-text-muted"
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-wider font-semibold opacity-75">
                    {format(day, "E").substring(0, 1)}
                  </span>
                  <span className={`text-xs mt-0.5 ${
                    isDayToday && !isSelected
                      ? "text-habit-violet font-bold border-b border-habit-violet"
                      : ""
                  }`}>
                    {format(day, "d")}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setSelectedDate((prev) => addDays(prev, 1))}
            className="p-1 text-text-muted hover:text-text-body"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Daily Progress summary pill */}
      {dailySummary.total > 0 && (
        <div className="bg-surface-bg border border-border-custom rounded-2xl p-3 shadow-sm flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-heading">Daily Progress</span>
            <span className="text-text-muted">
              {dailySummary.completed}/{dailySummary.total} completed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${dailySummary.percent}%` }}
                className="h-full bg-habit-violet transition-all duration-300"
              />
            </div>
            <span className="font-bold text-text-heading">{dailySummary.percent}%</span>
          </div>
        </div>
      )}

      {/* Habit Vertical Checklist */}
      <div className="space-y-2.5">
        {habitsForSelectedDay.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-surface-bg border border-border-custom rounded-2xl shadow-sm space-y-3">
            <Sparkles className="h-8 w-8 text-text-muted opacity-40" />
            <div>
              <h4 className="font-bold text-sm text-text-heading">No habits active for this date</h4>
              <p className="text-xs text-text-muted mt-1 max-w-[240px]">
                {activeHabits.length === 0
                  ? "Start by adding a habit to your routine."
                  : "This date is before your current habits were created."}
              </p>
            </div>
            {activeHabits.length === 0 && (
              <button
                onClick={() => setIsDialogOpen(true)}
                className="rounded-xl px-3 py-1.5 bg-text-heading text-surface-bg hover:opacity-95 text-xs font-semibold shadow-sm transition-opacity"
              >
                Create Habit
              </button>
            )}
          </div>
        ) : (
          habitsForSelectedDay.map((habit) => {
            const colorTheme = colorThemes[habit.color] || colorThemes.violet;
            const status = entryMap.get(`${habit.id}_${selectedDateStr}`) || "unmarked";
            
            // Calculate streak dynamically
            const streak = calculateStreak(habit, entries, selectedDateStr);

            return (
              <div
                key={habit.id}
                className="bg-surface-bg border border-border-custom rounded-2xl p-4 shadow-sm flex items-center justify-between hover:bg-surface-muted/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setEditingHabit(habit);
                      setIsDialogOpen(true);
                    }}
                    className={`p-2 rounded-xl shrink-0 ${colorTheme.bg} ${colorTheme.text}`}
                  >
                    <HabitIcon name={habit.icon} className="h-5 w-5" />
                  </button>

                  <div className="space-y-0.5">
                    <button
                      onClick={() => {
                        setEditingHabit(habit);
                        setIsDialogOpen(true);
                      }}
                      className="text-sm font-bold text-text-heading hover:text-border-focus text-left block"
                    >
                      {habit.name}
                    </button>
                    <div className="flex items-center gap-2 text-[10px] text-text-muted">
                      {streak.currentStreak > 0 && (
                        <div className="flex items-center gap-1 text-habit-orange font-bold">
                          <StreakFlame animate={streak.currentStreak > 0} className="h-3 w-3" />
                          <span>{streak.currentStreak} day streak</span>
                        </div>
                      )}
                      <span>Created {format(parseISO(habit.createdAt), "MMM d")}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <HabitCheckbox
                    status={status}
                    color={habit.color}
                    onClick={() => handleCheckboxClick(habit.id, selectedDateStr)}
                    size="lg"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Add Habit Button for Mobile */}
      <button
        onClick={() => {
          setEditingHabit(null);
          setIsDialogOpen(true);
        }}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-border-focus text-text-muted hover:text-text-body font-semibold text-xs transition-colors bg-surface-bg/35"
      >
        <Plus className="h-4 w-4" />
        Add Habit
      </button>

      {/* Dialog overlay */}
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
