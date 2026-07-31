"use client";

import React, { useState, useMemo } from "react";
import { format, parseISO, subDays } from "date-fns";
import { useHabits } from "@/features/habits/hooks/useHabits";
import { useHabitEntries } from "@/features/habits/hooks/useHabitEntries";
import { calculateStreak, getLocalTodayStr, getDateRangeArray } from "@/features/habits/utils/streak";
import { colorThemes } from "@/features/habits/utils/colors";
import { HabitIcon } from "@/components/shared/HabitIcon";
import { BarChart2, ArrowUpDown, Award, CheckCircle2, AlertTriangle } from "lucide-react";
import { StreakFlame } from "@/components/shared/StreakFlame";
import { TrendChart, TrendDataPoint } from "@/components/shared/TrendChart";
import { Habit } from "@/lib/storage/types";

type SortKey = "name" | "completionPercent" | "currentStreak" | "longestStreak" | "totalDaysLogged";
type SortOrder = "asc" | "desc";

interface HabitStatRow {
  habit: Habit;
  completionPercent: number;
  currentStreak: number;
  longestStreak: number;
  totalDaysLogged: number;
  doneCount: number;
  missedCount: number;
}

export default function AnalyticsPage() {
  const todayStr = getLocalTodayStr();

  // 30-day lookback window for trend and summary analytics
  const startDateStr = format(subDays(new Date(), 29), "yyyy-MM-dd");
  const endDateStr = todayStr;

  const { habits, isLoading: habitsLoading } = useHabits();
  const { entries, isLoading: entriesLoading } = useHabitEntries(startDateStr, endDateStr);

  const [sortKey, setSortKey] = useState<SortKey>("completionPercent");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const activeHabits = useMemo(() => {
    return habits.filter((h) => !h.archivedAt);
  }, [habits]);

  // Lookup map for fast status check: `${habitId}_${date}` -> status
  const entryMap = useMemo(() => {
    const map = new Map<string, "done" | "missed" | "unmarked">();
    for (const entry of entries) {
      map.set(`${entry.habitId}_${entry.date}`, entry.status);
    }
    return map;
  }, [entries]);

  // Aggregate statistics per habit
  const habitStats: HabitStatRow[] = useMemo(() => {
    const dates = getDateRangeArray(startDateStr, endDateStr);

    return activeHabits.map((habit) => {
      const { currentStreak, longestStreak } = calculateStreak(habit, entries, todayStr);

      const eligibleDates = dates.filter((d) => habit.createdAt <= d);
      let doneCount = 0;
      let missedCount = 0;

      for (const d of eligibleDates) {
        const st = entryMap.get(`${habit.id}_${d}`);
        if (st === "done") doneCount++;
        else if (st === "missed") missedCount++;
      }

      const totalDaysLogged = doneCount + missedCount;
      const totalEligible = eligibleDates.length;
      const completionPercent =
        totalEligible > 0 ? Math.round((doneCount / totalEligible) * 100) : 0;

      return {
        habit,
        completionPercent,
        currentStreak,
        longestStreak,
        totalDaysLogged,
        doneCount,
        missedCount,
      };
    });
  }, [activeHabits, entries, todayStr, startDateStr, endDateStr, entryMap]);

  // Sort logic for the table
  const sortedHabitStats = useMemo(() => {
    const sorted = [...habitStats];
    sorted.sort((a, b) => {
      if (sortKey === "name") {
        const cmp = a.habit.name.localeCompare(b.habit.name);
        return sortOrder === "asc" ? cmp : -cmp;
      }

      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [habitStats, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  // Daily completion trend data for shared TrendChart
  const trendData: TrendDataPoint[] = useMemo(() => {
    const dates = getDateRangeArray(startDateStr, endDateStr);

    return dates.map((d) => {
      const eligibleHabits = activeHabits.filter((h) => h.createdAt <= d);
      if (eligibleHabits.length === 0) {
        return {
          dateStr: d,
          label: format(parseISO(d), "d"),
          value: null,
          tooltipSubtext: "No active habits",
        };
      }

      let doneCount = 0;
      for (const h of eligibleHabits) {
        if (entryMap.get(`${h.id}_${d}`) === "done") {
          doneCount++;
        }
      }

      const percent = Math.round((doneCount / eligibleHabits.length) * 100);

      return {
        dateStr: d,
        label: format(parseISO(d), "d"),
        value: percent,
        tooltipSubtext: `${doneCount}/${eligibleHabits.length} habits completed`,
      };
    });
  }, [startDateStr, endDateStr, activeHabits, entryMap]);

  // Monthly summary metrics: best day, most consistent habit, most-missed habit
  const monthlySummary = useMemo(() => {
    const dates = getDateRangeArray(startDateStr, endDateStr);

    // 1. Best Day
    let bestDayStr = "N/A";
    let maxDone = 0;
    for (const d of dates) {
      let count = 0;
      for (const h of activeHabits) {
        if (entryMap.get(`${h.id}_${d}`) === "done") {
          count++;
        }
      }
      if (count > maxDone) {
        maxDone = count;
        bestDayStr = d;
      }
    }

    // 2. Most consistent habit
    let mostConsistent: { name: string; percent: number } | null = null;
    let highestPercent = -1;
    for (const s of habitStats) {
      if (s.totalDaysLogged > 0 && s.completionPercent > highestPercent) {
        highestPercent = s.completionPercent;
        mostConsistent = { name: s.habit.name, percent: s.completionPercent };
      }
    }

    // 3. Most-missed habit
    let mostMissed: { name: string; missed: number } | null = null;
    let highestMissed = 0;
    for (const s of habitStats) {
      if (s.missedCount > highestMissed) {
        highestMissed = s.missedCount;
        mostMissed = { name: s.habit.name, missed: s.missedCount };
      }
    }

    return {
      bestDay: bestDayStr !== "N/A" ? format(parseISO(bestDayStr), "MMMM d") : "N/A",
      bestDayCompletions: maxDone,
      mostConsistent,
      mostMissed,
    };
  }, [startDateStr, endDateStr, activeHabits, entryMap, habitStats]);

  const isLoading = habitsLoading || entriesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-72 animate-shimmer rounded-3xl border border-border-custom bg-surface-bg" />
        <div className="h-64 animate-shimmer rounded-3xl border border-border-custom bg-surface-bg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Intro info header */}
      <div>
        <h2 className="text-lg font-bold text-text-heading flex items-center gap-1.5 capitalize">
          <BarChart2 className="h-5 w-5 text-habit-violet" />
          Analytics
        </h2>
        <p className="text-xs text-text-muted mt-1 leading-normal">
          Review 30-day completion consistency and detailed per-habit performance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shared TrendChart for Habit Completion Rate */}
        <div className="lg:col-span-2">
          <TrendChart
            data={trendData}
            title="Daily Completion Trend"
            subtitle="Overall habit completion rate (%) over the last 30 days"
            yDomain={[0, 100]}
            yUnit="%"
            color="#5FB87B"
            emptyTitle="No habit logs recorded yet"
            emptySubtext="Mark days as done on the Habits page to see your completion trend."
            valueFormatter={(val) => `${val}% completed`}
          />
        </div>

        {/* Monthly Summary Card */}
        <div className="bg-surface-bg border border-border-custom rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full min-h-[320px] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-text-heading">Monthly Summary</h3>
            <p className="text-[11px] text-text-muted mt-0.5">30-day key highlights</p>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {/* Best Day */}
            <div className="p-3.5 rounded-xl bg-surface-muted/50 border border-border-custom space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-muted flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-habit-rose" />
                  Best Day
                </span>
                <span className="font-bold text-text-heading">
                  {monthlySummary.bestDay}
                </span>
              </div>
              <p className="text-[11px] text-text-muted pl-5.5">
                {monthlySummary.bestDayCompletions > 0
                  ? `${monthlySummary.bestDayCompletions} habit${
                      monthlySummary.bestDayCompletions !== 1 ? "s" : ""
                    } completed`
                  : "No completed habits yet"}
              </p>
            </div>

            {/* Most Consistent Habit */}
            <div className="p-3.5 rounded-xl bg-surface-muted/50 border border-border-custom space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-muted flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-habit-green" />
                  Most Consistent
                </span>
                <span className="font-bold text-text-heading truncate max-w-[120px]">
                  {monthlySummary.mostConsistent?.name || "N/A"}
                </span>
              </div>
              <p className="text-[11px] text-text-muted pl-5.5">
                {monthlySummary.mostConsistent
                  ? `${monthlySummary.mostConsistent.percent}% completion rate`
                  : "Log habits to determine consistency"}
              </p>
            </div>

            {/* Most-Missed Habit */}
            <div className="p-3.5 rounded-xl bg-surface-muted/50 border border-border-custom space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-muted flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-habit-orange" />
                  Most Missed
                </span>
                <span className="font-bold text-text-heading truncate max-w-[120px]">
                  {monthlySummary.mostMissed?.name || "None"}
                </span>
              </div>
              <p className="text-[11px] text-text-muted pl-5.5">
                {monthlySummary.mostMissed
                  ? `${monthlySummary.mostMissed.missed} days missed`
                  : "No missed entries recorded"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Per-habit stats table */}
      <div className="bg-surface-bg border border-border-custom rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border-custom">
          <h3 className="text-sm font-bold text-text-heading">Per-Habit Statistics</h3>
          <p className="text-[11px] text-text-muted mt-0.5">
            Completion rate, streaks, and total days logged across all active habits
          </p>
        </div>

        {activeHabits.length === 0 ? (
          <div className="p-8 text-center text-xs text-text-muted">
            No active habits found. Create a habit to start tracking analytics.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted/50 border-b border-border-custom text-xs font-semibold text-text-muted">
                  <th
                    onClick={() => handleSort("name")}
                    className="px-6 py-4 cursor-pointer hover:text-text-body transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Habit
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("completionPercent")}
                    className="px-6 py-4 cursor-pointer hover:text-text-body transition-colors text-center"
                  >
                    <div className="flex items-center gap-1 justify-center">
                      Completion %
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("currentStreak")}
                    className="px-6 py-4 cursor-pointer hover:text-text-body transition-colors text-center"
                  >
                    <div className="flex items-center gap-1 justify-center">
                      Current Streak
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("longestStreak")}
                    className="px-6 py-4 cursor-pointer hover:text-text-body transition-colors text-center"
                  >
                    <div className="flex items-center gap-1 justify-center">
                      Longest Streak
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("totalDaysLogged")}
                    className="px-6 py-4 cursor-pointer hover:text-text-body transition-colors text-center"
                  >
                    <div className="flex items-center gap-1 justify-center">
                      Total Days Logged
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom text-xs">
                {sortedHabitStats.map(
                  ({ habit, completionPercent, currentStreak, longestStreak, totalDaysLogged }) => {
                    const theme = colorThemes[habit.color] || colorThemes.violet;
                    return (
                      <tr key={habit.id} className="hover:bg-surface-muted/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-text-heading">
                          <div className="flex items-center gap-2">
                            <span className={`p-1.5 rounded-lg ${theme.bg} ${theme.text}`}>
                              <HabitIcon name={habit.icon} className="h-3.5 w-3.5" />
                            </span>
                            <span>{habit.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-habit-green">
                          {completionPercent}%
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-habit-orange">
                          <div className="flex items-center gap-1 justify-center">
                            <StreakFlame animate={currentStreak > 0} className="h-3.5 w-3.5" />
                            <span>{currentStreak}d</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-extrabold text-habit-violet">
                          {longestStreak}d
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-text-muted">
                          {totalDaysLogged}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
