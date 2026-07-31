"use client";

import React, { useState } from "react";
import { Habit, HabitColor } from "@/lib/storage/types";
import { Dialog } from "@/components/ui/Dialog";
import { AVAILABLE_ICONS, HabitIcon } from "@/components/shared/HabitIcon";
import { colorThemes } from "../utils/colors";
import { Trash2, AlertCircle, Archive } from "lucide-react";

interface AddEditHabitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  habitToEdit: Habit | null;
  currentHabitCount: number;
  onSave: (habit: Habit) => Promise<void>;
  onDelete?: (habitId: string) => Promise<void>;
}

const COLORS: HabitColor[] = [
  "rose",
  "orange",
  "sky",
  "violet",
  "green",
  "teal",
  "amber",
  "pink",
  "indigo",
  "lime",
];

function HabitForm({
  habitToEdit,
  currentHabitCount,
  onSave,
  onDelete,
  onClose,
}: {
  habitToEdit: Habit | null;
  currentHabitCount: number;
  onSave: (habit: Habit) => Promise<void>;
  onDelete?: (habitId: string) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(() => habitToEdit?.name || "");
  const [selectedColor, setSelectedColor] = useState<HabitColor>(
    () => habitToEdit?.color || "violet"
  );
  const [selectedIcon, setSelectedIcon] = useState(
    () => habitToEdit?.icon || "BookOpen"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCapReached = currentHabitCount >= 10 && !habitToEdit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isCapReached) return;

    setIsSubmitting(true);
    try {
      const habitData: Habit = {
        id: habitToEdit?.id || crypto.randomUUID(),
        name: name.trim(),
        color: selectedColor,
        icon: selectedIcon,
        createdAt:
          habitToEdit?.createdAt || new Date().toISOString().split("T")[0],
        archivedAt: habitToEdit?.archivedAt || null,
        sortOrder: habitToEdit?.sortOrder ?? currentHabitCount,
      };
      await onSave(habitData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!habitToEdit || !onDelete) return;
    if (
      confirm(
        `Are you sure you want to delete "${habitToEdit.name}"? This will delete all completion history for this habit.`
      )
    ) {
      setIsSubmitting(true);
      try {
        await onDelete(habitToEdit.id);
        onClose();
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleArchiveToggle = async () => {
    if (!habitToEdit) return;

    const isUnarchiving = Boolean(habitToEdit.archivedAt);
    if (isUnarchiving && currentHabitCount >= 10) {
      alert(
        "Cannot unarchive. You have reached the active habit limit of 10. Please archive or delete another habit first."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const habitData: Habit = {
        id: habitToEdit.id,
        name: name.trim(),
        color: selectedColor,
        icon: selectedIcon,
        createdAt: habitToEdit.createdAt,
        archivedAt: isUnarchiving ? null : new Date().toISOString(),
        sortOrder: habitToEdit.sortOrder,
      };
      await onSave(habitData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCapReached) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 p-4 border border-orange-200 dark:border-orange-900/30 text-orange-800 dark:text-orange-300">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Habit Limit Reached (10 Max)</h4>
            <p className="text-xs mt-1 leading-relaxed">
              We enforce a 10-habit cap to help you focus on your core routines.
            </p>
          </div>
        </div>
        <div className="text-xs text-text-muted">
          To add a new habit, please delete or archive one of your active habits first.
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm bg-surface-muted text-text-body hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Habit Name input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-muted">
          Habit Name
        </label>
        <input
          type="text"
          required
          maxLength={30}
          placeholder="e.g. Read 20 mins, Workout, Meditate"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-border-custom bg-transparent px-3 py-2 text-sm focus:border-border-focus focus:ring-2 focus:ring-ring-custom outline-none transition-all font-semibold"
        />
      </div>

      {/* Habit Accent Color */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-muted">
          Accent Color
        </label>
        <div className="flex flex-wrap gap-2 pt-1">
          {COLORS.map((color) => {
            const theme = colorThemes[color];
            const isSelected = selectedColor === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  theme.checkboxBg
                } ${
                  isSelected
                    ? "scale-125 ring-2 ring-offset-2 ring-border-focus"
                    : "hover:scale-110 opacity-70 hover:opacity-100"
                }`}
                aria-label={`Select ${color} color`}
              />
            );
          })}
        </div>
      </div>

      {/* Habit Icon selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-muted">
          Icon Symbol
        </label>
        <div className="grid grid-cols-7 gap-2 max-h-36 overflow-y-auto p-1 custom-scrollbar">
          {AVAILABLE_ICONS.map((icon) => {
            const isSelected = selectedIcon === icon.key;
            return (
              <button
                key={icon.key}
                type="button"
                onClick={() => setSelectedIcon(icon.key)}
                className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
                  isSelected
                    ? "bg-surface-muted border-border-focus text-text-heading scale-105"
                    : "border-border-custom hover:bg-surface-muted/50 text-text-muted"
                }`}
                title={icon.label}
              >
                <HabitIcon name={icon.key} className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-border-custom">
        <div className="flex items-center gap-2">
          {habitToEdit && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
              title="Delete habit permanently"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}

          {habitToEdit && (
            <button
              type="button"
              onClick={handleArchiveToggle}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-muted hover:text-text-body hover:bg-surface-muted rounded-xl transition-colors border border-border-custom"
            >
              <Archive className="h-3.5 w-3.5" />
              <span>{habitToEdit.archivedAt ? "Unarchive" : "Archive"}</span>
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm bg-surface-muted text-text-body hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="rounded-xl px-4 py-2 text-sm bg-text-heading text-surface-bg hover:opacity-90 disabled:opacity-50 transition-opacity font-semibold"
          >
            {isSubmitting
              ? "Saving..."
              : habitToEdit
              ? "Save Changes"
              : "Create Habit"}
          </button>
        </div>
      </div>
    </form>
  );
}

export function AddEditHabitDialog({
  isOpen,
  onClose,
  habitToEdit,
  currentHabitCount,
  onSave,
  onDelete,
}: AddEditHabitDialogProps) {
  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={habitToEdit ? "Edit Habit" : "Create New Habit"}
    >
      <HabitForm
        key={habitToEdit ? habitToEdit.id : "new"}
        habitToEdit={habitToEdit}
        currentHabitCount={currentHabitCount}
        onSave={onSave}
        onDelete={onDelete}
        onClose={onClose}
      />
    </Dialog>
  );
}
