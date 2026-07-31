"use client";

import React, { useState, useEffect } from "react";
import { useStorage } from "@/lib/storage/storage-provider";
import { Habit, HabitColor } from "@/lib/storage/types";
import { useQueryClient } from "@tanstack/react-query";
import { HabitIcon } from "./HabitIcon";
import { colorThemes } from "@/features/habits/utils/colors";
import { ArrowRight, Check, CheckCircle2 } from "lucide-react";

interface StarterHabitOption {
  name: string;
  color: HabitColor;
  icon: string;
}

const STARTER_HABITS: StarterHabitOption[] = [
  { name: "Read Book", color: "rose", icon: "BookOpen" },
  { name: "Drink Water", color: "sky", icon: "Droplet" },
  { name: "Workout", color: "orange", icon: "Dumbbell" },
  { name: "Meditate", color: "violet", icon: "Smile" },
  { name: "Code", color: "green", icon: "Code" },
  { name: "Sleep 8 Hours", color: "indigo", icon: "Moon" },
];

export function OnboardingModal() {
  const storage = useStorage();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [selectedStarters, setSelectedStarters] = useState<StarterHabitOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    storage.getMeta().then((meta) => {
      if (active && (!meta || !meta.onboardingCompletedAt)) {
        setIsOpen(true);
      }
    });
    return () => {
      active = false;
    };
  }, [storage]);

  const toggleStarter = (option: StarterHabitOption) => {
    setSelectedStarters((prev) => {
      const exists = prev.find((o) => o.name === option.name);
      if (exists) {
        return prev.filter((o) => o.name !== option.name);
      }
      return [...prev, option];
    });
  };

  const handleNextStep = () => {
    if (step === 1 && !name.trim()) return;
    setStep((prev) => prev + 1);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // 1. Save selected starter habits
      const todayStr = new Date().toISOString().split("T")[0];
      const habitsToSave: Habit[] = selectedStarters.map((opt, index) => ({
        id: crypto.randomUUID(),
        name: opt.name,
        color: opt.color,
        icon: opt.icon,
        createdAt: todayStr,
        archivedAt: null,
        sortOrder: index,
      }));

      for (const h of habitsToSave) {
        await storage.saveHabit(h);
      }

      // 2. Update meta
      await storage.updateMeta({
        userDisplayName: name.trim(),
        onboardingCompletedAt: new Date().toISOString(),
      });

      // 3. Invalidate queries and close modal
      queryClient.invalidateQueries({ queryKey: ["meta"] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-surface-bg p-8 shadow-2xl border border-border-custom text-foreground">
        {/* Step dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === s ? "w-6 bg-habit-violet" : "w-1.5 bg-neutral-200 dark:bg-neutral-800"
              }`}
            />
          ))}
        </div>

        {/* Step 1: User name */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-text-heading">Welcome to HabitSense</h3>
              <p className="text-xs text-text-muted max-w-xs mx-auto">
                A simple, private habit and sleep tracker stored locally in your browser. What should we call you?
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Your Name</label>
              <input
                type="text"
                required
                maxLength={20}
                placeholder="e.g. Alex"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-border-custom bg-transparent px-4 py-3 text-sm focus:border-border-focus focus:ring-2 focus:ring-ring-custom outline-none transition-all font-semibold"
              />
            </div>

            <button
              type="button"
              disabled={!name.trim()}
              onClick={handleNextStep}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 bg-text-heading text-surface-bg hover:opacity-90 disabled:opacity-50 transition-all font-semibold text-sm shadow-md"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: Starter Habits */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-text-heading">Select Starter Habits</h3>
              <p className="text-xs text-text-muted max-w-xs mx-auto">
                Choose any habits you want to begin tracking. You can add or edit more later.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 custom-scrollbar">
              {STARTER_HABITS.map((option) => {
                const isSelected = selectedStarters.some((o) => o.name === option.name);
                const theme = colorThemes[option.color];
                return (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => toggleStarter(option)}
                    className={`flex flex-col items-start p-3 rounded-2xl border transition-all text-left ${
                      isSelected
                        ? `${theme.bg} ${theme.border} scale-[1.02] shadow-sm`
                        : "bg-surface-bg border-border-custom hover:bg-surface-muted"
                    }`}
                  >
                    <span className={`p-1.5 rounded-lg mb-2 shrink-0 ${theme.bg} ${theme.text}`}>
                      <HabitIcon name={option.icon} className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-bold text-text-heading truncate w-full">
                      {option.name}
                    </span>
                    <div className="flex items-center justify-between w-full mt-1">
                      <span className="text-[9px] text-text-muted capitalize">{option.color}</span>
                      {isSelected && <Check className="h-3 w-3 text-habit-violet" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-2xl py-3.5 bg-surface-muted text-text-body hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 font-semibold text-sm transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 rounded-2xl py-3.5 bg-text-heading text-surface-bg hover:opacity-90 font-semibold text-sm transition-opacity shadow-md"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="space-y-3">
              <div className="mx-auto w-14 h-14 rounded-full bg-habit-green/10 border border-habit-green/30 flex items-center justify-center text-habit-green">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-text-heading">All Set, {name}!</h3>
              <p className="text-xs text-text-muted leading-relaxed max-w-xs mx-auto">
                Your tracker is ready. All your habits, streaks, and sleep logs are stored privately in your browser.
              </p>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleComplete}
              className="w-full rounded-2xl py-3.5 bg-text-heading text-surface-bg hover:opacity-90 disabled:opacity-50 transition-opacity font-semibold text-sm shadow-md"
            >
              {isSubmitting ? "Finalizing..." : "Go to Dashboard"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
