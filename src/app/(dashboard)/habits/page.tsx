"use client";

import React, { useState } from "react";
import { HabitGrid } from "@/features/habits/components/HabitGrid";
import { HabitDayList } from "@/features/habits/components/HabitDayList";
import { AddEditHabitDialog } from "@/features/habits/components/AddEditHabitDialog";
import { useHabits } from "@/features/habits/hooks/useHabits";
import { Habit } from "@/lib/storage/types";
import { colorThemes } from "@/features/habits/utils/colors";
import { HabitIcon } from "@/components/shared/HabitIcon";
import { Sparkles, Archive, ChevronDown, ChevronUp, Edit2 } from "lucide-react";

export default function HabitsPage() {
  const { habits, saveHabit, deleteHabit } = useHabits();
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const activeHabitCount = habits.filter((h) => !h.archivedAt).length;
  const archivedHabits = habits.filter((h) => h.archivedAt);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Intro info header */}
      <div>
        <h2 className="text-lg font-extrabold text-text-heading flex items-center gap-1.5 capitalize">
          <Sparkles className="h-5 w-5 text-habit-violet animate-pulse" />
          My Habits
        </h2>
        <p className="text-xs text-text-muted mt-1 leading-normal">
          Consistency builds the routine. Cycle checks: unmarked → done → missed.
        </p>
      </div>

      {/* Desktop/Tablet monthly view grid */}
      <div className="hidden md:block">
        <HabitGrid />
      </div>

      {/* Mobile single day list view */}
      <div className="block md:hidden">
        <HabitDayList />
      </div>

      {/* Collapsible Archived Habits Section */}
      {archivedHabits.length > 0 && (
        <div className="bg-surface-bg border border-border-custom rounded-3xl p-5 shadow-sm space-y-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-left focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <Archive className="h-4.5 w-4.5 text-text-muted" />
              <span className="text-xs font-extrabold text-text-heading uppercase tracking-wider">
                Archived Habits ({archivedHabits.length})
              </span>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4.5 w-4.5 text-text-muted" />
            ) : (
              <ChevronDown className="h-4.5 w-4.5 text-text-muted" />
            )}
          </button>

          {isExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {archivedHabits.map((habit) => {
                const theme = colorThemes[habit.color] || colorThemes.violet;
                return (
                  <div
                    key={habit.id}
                    onClick={() => {
                      setEditingHabit(habit);
                      setIsDialogOpen(true);
                    }}
                    className="flex items-center justify-between p-3.5 bg-surface-muted/50 border border-border-custom hover:border-border-focus rounded-2xl cursor-pointer hover:bg-surface-muted transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`p-1.5 rounded-lg ${theme.bg} ${theme.text}`}>
                        <HabitIcon name={habit.icon} className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-text-heading group-hover:text-habit-violet transition-colors">
                          {habit.name}
                        </p>
                        <p className="text-[9px] text-text-muted mt-0.5 capitalize">
                          Color: {habit.color}
                        </p>
                      </div>
                    </div>
                    <Edit2 className="h-3.5 w-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Edit Archived Habit Dialog */}
      {isDialogOpen && (
        <AddEditHabitDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingHabit(null);
          }}
          habitToEdit={editingHabit}
          currentHabitCount={activeHabitCount}
          onSave={saveHabit}
          onDelete={deleteHabit}
        />
      )}
    </div>
  );
}
