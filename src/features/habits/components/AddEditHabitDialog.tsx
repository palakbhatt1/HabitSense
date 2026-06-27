"use client";

import React, { useState, useEffect } from "react";
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

export function AddEditHabitDialog({
  isOpen,
  onClose,
  habitToEdit,
  currentHabitCount,
  onSave,
  onDelete,
}: AddEditHabitDialogProps) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState<HabitColor>("violet");
  const [selectedIcon, setSelectedIcon] = useState("BookOpen");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setSelectedColor(habitToEdit.color);
      setSelectedIcon(habitToEdit.icon);
    } else {
      setName("");
      setSelectedColor("violet");
      setSelectedIcon("BookOpen");
    }
  }, [habitToEdit, isOpen]);

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
        createdAt: habitToEdit?.createdAt || new Date().toISOString().split("T")[0],
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
    if (confirm(`Are you sure you want to delete "${habitToEdit.name}"? This will delete all completion history for this habit.`)) {
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
    
    const isUnarchiving = !!habitToEdit.archivedAt;
    if (isUnarchiving && currentHabitCount >= 10) {
      alert("Cannot unarchive. You have reached the active habit limit of 10. Please archive or delete another habit first.");
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

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={habitToEdit ? "Edit Habit" : "Create New Habit"}
    >
      {isCapReached ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 p-4 border border-orange-200 dark:border-orange-900/30 text-orange-800 dark:text-orange-300">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Habit Limit Reached (10 Max)</h4>
              <p className="text-xs mt-1 leading-relaxed">
                Consistency tools should feel encouraging, not like an overwhelming list of tasks. We enforce a 10-habit cap to help you focus on your core routines.
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
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Habit Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Habit Name</label>
            <input
              type="text"
              required
              maxLength={40}
              placeholder="e.g. Drink Water, Read Books"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border-custom bg-transparent px-3 py-2 text-sm focus:border-border-focus focus:ring-2 focus:ring-ring-custom outline-none transition-all"
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Choose Accent Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => {
                const theme = colorThemes[color];
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: colorThemes[color].checkboxBg }}
                    className={`h-7 w-7 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? "border-text-heading scale-110 shadow-sm"
                        : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                    title={color}
                  />
                );
              })}
            </div>
          </div>

          {/* Icon Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Choose Icon</label>
            <div className="grid grid-cols-7 gap-1.5 max-h-32 overflow-y-auto p-1 border border-border-custom rounded-xl custom-scrollbar bg-surface-muted/50">
              {AVAILABLE_ICONS.map((ico) => {
                const isSelected = selectedIcon === ico.iconName;
                return (
                  <button
                    key={ico.key}
                    type="button"
                    onClick={() => setSelectedIcon(ico.iconName)}
                    className={`flex items-center justify-center p-2 rounded-lg transition-all ${
                      isSelected
                        ? "bg-surface-bg text-text-heading border border-border-custom scale-105 shadow-sm"
                        : "text-text-muted hover:text-text-body hover:bg-surface-bg/50"
                    }`}
                    title={ico.label}
                  >
                    <HabitIcon name={ico.iconName} className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border-custom">
            <div className="flex gap-1.5">
              {habitToEdit && onDelete && (
                <>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={handleArchiveToggle}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium text-text-muted hover:bg-surface-muted hover:text-text-body transition-colors"
                    title={habitToEdit.archivedAt ? "Unarchive habit" : "Archive habit"}
                  >
                    <Archive className="h-4 w-4" />
                    {habitToEdit.archivedAt ? "Unarchive" : "Archive"}
                  </button>
                </>
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
                disabled={isSubmitting || !name.trim()}
                className="rounded-xl px-4 py-2 text-sm bg-text-heading text-surface-bg hover:opacity-90 disabled:opacity-50 transition-opacity font-medium"
              >
                {isSubmitting ? "Saving..." : habitToEdit ? "Save Changes" : "Create Habit"}
              </button>
            </div>
          </div>
        </form>
      )}
    </Dialog>
  );
}
