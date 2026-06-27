"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHabits } from "@/features/habits/hooks/useHabits";
import { useHabitEntries } from "@/features/habits/hooks/useHabitEntries";
import { useStorage } from "@/lib/storage/storage-provider";
import { calculateStreak, getLocalTodayStr } from "@/features/habits/utils/streak";
import {
  Home,
  CheckSquare,
  Moon,
  BarChart2,
  Settings,
  Sun,
  Moon as MoonIcon,
  Flame,
} from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
import { StreakFlame } from "./StreakFlame";


const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/habits", label: "Habits", icon: CheckSquare },
  { href: "/sleep", label: "Sleep Tracker", icon: Moon },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const storage = useStorage();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { habits } = useHabits();

  // Load entries for the current week to show the M-S bar chart
  const todayStr = getLocalTodayStr();
  const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));
  }, [startOfCurrentWeek]);

  const weekStartStr = format(weekDays[0], "yyyy-MM-dd");
  const weekEndStr = format(weekDays[6], "yyyy-MM-dd");

  const { entries } = useHabitEntries(weekStartStr, weekEndStr);

  // Sync theme with LocalStorage AppMeta on mount
  useEffect(() => {
    storage.getMeta().then((meta) => {
      if (meta && meta.themeMode) {
        setTheme(meta.themeMode);
        document.documentElement.className = meta.themeMode;
      }
    });
  }, [storage]);

  const toggleTheme = async () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.className = nextTheme;
    await storage.updateMeta({ themeMode: nextTheme });
  };

  // Compute longest streak across all habits
  const streakInfo = useMemo(() => {
    if (habits.length === 0) return { current: 0, longest: 0 };
    
    let maxCurrent = 0;
    let maxLongest = 0;

    for (const h of habits) {
      const { currentStreak, longestStreak } = calculateStreak(h, entries, todayStr);
      if (currentStreak > maxCurrent) maxCurrent = currentStreak;
      if (longestStreak > maxLongest) maxLongest = longestStreak;
    }

    return {
      current: maxCurrent,
      longest: maxLongest,
    };
  }, [habits, entries, todayStr]);

  // Calculate daily completion percentage for each day of this week
  const weeklyCompletionData = useMemo(() => {
    const active = habits.filter((h) => !h.archivedAt);
    if (active.length === 0) return Array(7).fill(0);

    const entryMap = new Map<string, boolean>();
    for (const entry of entries) {
      if (entry.status === "done") {
        entryMap.set(`${entry.habitId}_${entry.date}`, true);
      }
    }

    return weekDays.map((day) => {
      const dStr = format(day, "yyyy-MM-dd");
      let completedCount = 0;
      let totalEligible = 0;

      for (const h of active) {
        if (h.createdAt <= dStr) {
          totalEligible++;
          if (entryMap.has(`${h.id}_${dStr}`)) {
            completedCount++;
          }
        }
      }
      return totalEligible > 0 ? (completedCount / totalEligible) * 100 : 0;
    });
  }, [weekDays, habits, entries]);

  return (
    <aside className="w-64 shrink-0 bg-surface-bg border-r border-border-custom flex flex-col justify-between p-5 h-full">
      {/* Top section: Logo + Tagline */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-habit-violet flex items-center justify-center text-white shadow-md shadow-habit-violet/20">
              <Flame className="h-4.5 w-4.5 fill-current" />
            </div>
            <h1 className="text-md font-extrabold tracking-tight text-text-heading">
              HabitSense
            </h1>
          </div>
          <p className="text-[10px] text-text-muted mt-1 ml-9">
            Every habit shapes you.
          </p>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-habit-violet/10 text-habit-violet"
                    : "text-text-muted hover:text-text-body hover:bg-surface-muted/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Center/Bottom section: Illustration & Streaks */}
      <div className="space-y-4 pt-4 border-t border-border-custom">
        {/* Cozy Plant Illustration Card */}
        <div className="bg-surface-muted p-4 rounded-2xl text-center border border-border-custom space-y-2.5 relative overflow-hidden select-none group">
          {/* Custom cozy SVG plant */}
          <svg
            viewBox="0 0 100 80"
            className="w-16 h-16 mx-auto drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
          >
            {/* Pot */}
            <path d="M35 65 L40 78 L60 78 L65 65 Z" fill="#E29A86" />
            <ellipse cx="50" cy="65" rx="15" ry="3" fill="#D3826C" />
            {/* Soil */}
            <ellipse cx="50" cy="64" rx="13" ry="2" fill="#5C4033" />
            {/* Stem */}
            <path d="M50 64 Q50 35 44 25" stroke="#7CB342" strokeWidth="2.5" fill="none" />
            {/* Stem 2 */}
            <path d="M50 64 Q53 45 62 38" stroke="#7CB342" strokeWidth="2" fill="none" />
            {/* Leaf 1 (Top Left) */}
            <path d="M44 25 Q35 15 44 15 Q48 20 44 25 Z" fill="#81C784" />
            {/* Leaf 2 (Right branch) */}
            <path d="M62 38 Q72 32 65 28 Q60 32 62 38 Z" fill="#66BB6A" />
            {/* Leaf 3 (Bottom Left branch) */}
            <path d="M48 48 Q38 45 42 40 Q47 43 48 48 Z" fill="#A5D6A7" />
          </svg>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-text-heading leading-tight">
              Growth looks beautiful
            </p>
            <p className="text-[9px] text-text-muted">
              on consistent days.
            </p>
          </div>
        </div>

        {/* Weekly Streaks visualizer mini-card */}
        <div className="bg-surface-bg border border-border-custom rounded-2xl p-3 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-text-muted">Current Streak</span>
            <div className="flex items-center gap-1 text-xs font-bold text-habit-orange">
              <StreakFlame animate={streakInfo.current > 0} className="h-3.5 w-3.5" />
              <span>{streakInfo.current}d</span>
            </div>
          </div>

          {/* Mini week bar chart (M-S) */}
          <div className="flex justify-between items-end h-8 px-1">
            {weekDays.map((day, idx) => {
              const height = weeklyCompletionData[idx]; // 0 to 100
              const isTodayDay = format(day, "yyyy-MM-dd") === todayStr;
              return (
                <div key={day.toISOString()} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-2 h-6 bg-surface-muted rounded-full relative overflow-hidden flex items-end">
                    <div
                      style={{ height: `${height}%` }}
                      className={`w-full rounded-full ${
                        height === 100
                          ? "bg-habit-green"
                          : height > 0
                          ? "bg-habit-violet"
                          : "bg-transparent"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[8px] font-bold ${
                      isTodayDay ? "text-habit-violet font-extrabold" : "text-text-muted opacity-80"
                    }`}
                  >
                    {format(day, "eeeee")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Theme toggle & Settings footer */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-xl border border-border-custom hover:bg-surface-muted text-text-muted hover:text-text-body transition-colors focus:outline-none"
            aria-label="Toggle Light/Dark Theme"
          >
            {theme === "light" ? (
              <MoonIcon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>
          
          <span className="text-[9px] text-text-muted font-semibold opacity-65">
            v1.0.0
          </span>
        </div>
      </div>
    </aside>
  );
}
