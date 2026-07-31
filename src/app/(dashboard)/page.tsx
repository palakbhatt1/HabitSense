"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useHabits } from "@/features/habits/hooks/useHabits";
import { useHabitEntries } from "@/features/habits/hooks/useHabitEntries";
import { useSleepEntries } from "@/features/sleep/hooks/useSleepEntries";
import { calculateStreak, getLocalTodayStr, getDateRangeArray } from "@/features/habits/utils/streak";
import { colorThemes } from "@/features/habits/utils/colors";
import { HabitIcon } from "@/components/shared/HabitIcon";
import {
  format,
  startOfMonth,
  endOfMonth,
  parseISO,
} from "date-fns";
import { Moon, Award, CheckCircle2, TrendingUp } from "lucide-react";
import { StreakFlame } from "@/components/shared/StreakFlame";
import Link from "next/link";

export default function DashboardPage() {
  const todayStr = getLocalTodayStr();
  const startMonthDate = startOfMonth(new Date());
  const endMonthDate = endOfMonth(new Date());

  const startMonthStr = format(startMonthDate, "yyyy-MM-dd");
  const endMonthStr = format(endMonthDate, "yyyy-MM-dd");

  const { habits, isLoading: habitsLoading } = useHabits();
  const { entries, isLoading: entriesLoading } = useHabitEntries(startMonthStr, endMonthStr);
  const { sleepEntries, isLoading: sleepLoading } = useSleepEntries(startMonthStr, endMonthStr);

  const activeHabits = useMemo(() => {
    return habits.filter((h) => !h.archivedAt).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [habits]);

  // Map entries for quick lookup
  const entryMap = useMemo(() => {
    const map = new Map<string, "done" | "missed" | "unmarked">();
    for (const entry of entries) {
      map.set(`${entry.habitId}_${entry.date}`, entry.status);
    }
    return map;
  }, [entries]);

  // Today's summary completion
  const todayStats = useMemo(() => {
    const total = activeHabits.filter((h) => h.createdAt <= todayStr).length;
    if (total === 0) return { completed: 0, total: 0, percent: 0 };

    const completed = activeHabits.filter((h) => {
      const status = entryMap.get(`${h.id}_${todayStr}`);
      return status === "done";
    }).length;

    return {
      completed,
      total,
      percent: Math.round((completed / total) * 100),
    };
  }, [activeHabits, entryMap, todayStr]);

  // Donut chart data
  const donutData = useMemo(() => {
    const completed = todayStats.completed;
    const remaining = todayStats.total - completed;

    if (todayStats.total === 0) {
      return [{ name: "Empty", value: 1, color: "var(--border-color)" }];
    }

    return [
      { name: "Completed", value: completed, color: "#9B7FD4" },
      { name: "Remaining", value: remaining, color: "var(--border-color)" },
    ];
  }, [todayStats]);

  // Habit completion rates for the selected month
  const habitCompletionProgress = useMemo(() => {
    return activeHabits.map((habit) => {
      const creationDate = habit.createdAt;
      const startRangeStr = creationDate > startMonthStr ? creationDate : startMonthStr;
      const endRangeStr = todayStr < endMonthStr ? todayStr : endMonthStr;

      const dateArray = getDateRangeArray(startRangeStr, endRangeStr);
      const totalDays = dateArray.length;

      if (totalDays === 0) return { habit, completedCount: 0, totalDays: 0, percent: 0 };

      let completedCount = 0;
      for (const d of dateArray) {
        if (entryMap.get(`${habit.id}_${d}`) === "done") {
          completedCount++;
        }
      }

      return {
        habit,
        completedCount,
        totalDays,
        percent: Math.round((completedCount / totalDays) * 100),
      };
    });
  }, [activeHabits, entryMap, startMonthStr, endMonthStr, todayStr]);

  // Overview Metrics
  const overviewMetrics = useMemo(() => {
    // 1. Avg Sleep
    const loggedSleep = sleepEntries.filter((e) => e.hours > 0);
    const avgSleep =
      loggedSleep.length > 0
        ? Math.round(
            (loggedSleep.reduce((acc, curr) => acc + curr.hours, 0) / loggedSleep.length) * 10
          ) / 10
        : 0;

    // 2. Avg Habit Completion
    const completions = habitCompletionProgress.filter((p) => p.totalDays > 0);
    const avgCompletion =
      completions.length > 0
        ? Math.round(completions.reduce((acc, curr) => acc + curr.percent, 0) / completions.length)
        : 0;

    // 3. Current Max Streak
    let maxStreak = 0;
    for (const h of activeHabits) {
      const { currentStreak } = calculateStreak(h, entries, todayStr);
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    }

    // 4. Best Day (Day with highest completions this month)
    const completionsByDay: Record<string, number> = {};
    for (const entry of entries) {
      if (entry.status === "done") {
        completionsByDay[entry.date] = (completionsByDay[entry.date] || 0) + 1;
      }
    }

    let bestDayStr = "N/A";
    let maxCompletions = 0;
    Object.entries(completionsByDay).forEach(([date, count]) => {
      if (count > maxCompletions) {
        maxCompletions = count;
        bestDayStr = date;
      }
    });

    const bestDayFormatted =
      bestDayStr !== "N/A" ? format(parseISO(bestDayStr), "MMM d") : "N/A";

    return {
      avgSleep,
      avgCompletion,
      maxStreak,
      bestDay: bestDayFormatted,
    };
  }, [sleepEntries, habitCompletionProgress, activeHabits, entries, todayStr]);

  const isLoading = habitsLoading || entriesLoading || sleepLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 animate-shimmer rounded-3xl border border-border-custom bg-surface-bg" />
          <div className="lg:col-span-2 h-64 animate-shimmer rounded-3xl border border-border-custom bg-surface-bg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-shimmer rounded-3xl border border-border-custom bg-surface-bg"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Section: Today summary donut chart + Habit Progress bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's completion radial card */}
        <div className="bg-surface-bg border border-border-custom rounded-3xl p-6 shadow-sm flex flex-col justify-between h-72">
          <div>
            <h3 className="text-sm font-bold text-text-heading flex items-center gap-1.5">
              <CheckCircle2 className="h-4.5 w-4.5 text-habit-violet" />
              Today&apos;s Summary
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">Your daily routine completion score</p>
          </div>

          <div className="flex-1 relative flex items-center justify-center min-h-0">
            {todayStats.total > 0 && (
              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-text-heading">
                  {todayStats.completed}/{todayStats.total}
                </span>
                <span className="text-[10px] font-bold text-text-muted block mt-0.5">
                  completed
                </span>
              </div>
            )}

            <div className="w-full h-full max-h-[140px] flex items-center justify-center">
              {todayStats.total === 0 ? (
                <div className="text-center p-4">
                  <p className="text-xs font-semibold text-text-heading">No habits active today</p>
                  <p className="text-[9px] text-text-muted mt-1 leading-normal">
                    Create habits to start tracking!
                  </p>
                  <Link
                    href="/habits"
                    className="inline-block mt-2 text-xs font-semibold text-habit-violet hover:underline"
                  >
                    Go to Habits
                  </Link>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={55}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="text-center text-xs font-semibold text-text-muted">
            {todayStats.total > 0
              ? `${todayStats.percent}% completed today.`
              : "Track your habits to see daily progress."}
          </div>
        </div>

        {/* Habit monthly progress bars */}
        <div className="lg:col-span-2 bg-surface-bg border border-border-custom rounded-3xl p-6 shadow-sm flex flex-col justify-between h-72">
          <div>
            <h3 className="text-sm font-bold text-text-heading flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-habit-violet" />
              Monthly Progress
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">Consistency percentage for current habits</p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3.5 pr-2 py-4">
            {habitCompletionProgress.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-xs text-text-muted space-y-2">
                <span>No active habits yet.</span>
                <Link
                  href="/habits"
                  className="rounded-xl px-3 py-1.5 bg-text-heading text-surface-bg text-xs font-semibold"
                >
                  Create Habit
                </Link>
              </div>
            ) : (
              habitCompletionProgress.map(({ habit, percent }) => {
                const theme = colorThemes[habit.color] || colorThemes.violet;
                return (
                  <div key={habit.id} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`p-1 rounded-lg ${theme.bg} ${theme.text}`}>
                          <HabitIcon name={habit.icon} className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-bold text-text-heading">{habit.name}</span>
                      </div>
                      <span className="font-extrabold text-text-heading">{percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-surface-muted rounded-full overflow-hidden border border-border-custom/50">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        title={`${percent}% completed`}
                        style={{
                          backgroundColor: colorThemes[habit.color].checkboxBg,
                          width: `${percent}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Weekly Overview Stats Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-muted pl-1">
          Overview
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Avg Sleep */}
          <div className="bg-surface-bg border border-border-custom rounded-3xl p-4.5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-text-muted">Avg. Sleep</span>
              <span className="p-1.5 bg-habit-violet/10 text-habit-violet rounded-lg shrink-0">
                <Moon className="h-4 w-4" />
              </span>
            </div>
            <div>
              <p className="text-xl font-extrabold text-text-heading">
                {overviewMetrics.avgSleep > 0 ? `${overviewMetrics.avgSleep}h` : "N/A"}
              </p>
              <p className="text-[9px] text-text-muted mt-1">Average sleep duration logged</p>
            </div>
          </div>

          {/* Card 2: Avg Completion */}
          <div className="bg-surface-bg border border-border-custom rounded-3xl p-4.5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-text-muted">Avg. Completion</span>
              <span className="p-1.5 bg-habit-green/10 text-habit-green rounded-lg shrink-0">
                <TrendingUp className="h-4 w-4" />
              </span>
            </div>
            <div>
              <p className="text-xl font-extrabold text-text-heading">
                {overviewMetrics.avgCompletion}%
              </p>
              <p className="text-[9px] text-text-muted mt-1">Overall monthly consistency</p>
            </div>
          </div>

          {/* Card 3: Best Day */}
          <div className="bg-surface-bg border border-border-custom rounded-3xl p-4.5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-text-muted">Best Day</span>
              <span className="p-1.5 bg-habit-rose/10 text-habit-rose rounded-lg shrink-0">
                <Award className="h-4 w-4" />
              </span>
            </div>
            <div>
              <p className="text-xl font-extrabold text-text-heading">
                {overviewMetrics.bestDay}
              </p>
              <p className="text-[9px] text-text-muted mt-1">Most completions this month</p>
            </div>
          </div>

          {/* Card 4: Current Streak */}
          <div className="bg-surface-bg border border-border-custom rounded-3xl p-4.5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-text-muted">Top Streak</span>
              <span className="p-1.5 bg-habit-orange/10 text-habit-orange rounded-lg shrink-0">
                <StreakFlame animate={overviewMetrics.maxStreak > 0} className="h-4 w-4" />
              </span>
            </div>
            <div>
              <p className="text-xl font-extrabold text-text-heading">
                {overviewMetrics.maxStreak} day{overviewMetrics.maxStreak !== 1 ? "s" : ""}
              </p>
              <p className="text-[9px] text-text-muted mt-1">Highest active habit streak</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
