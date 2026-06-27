"use client";

import React, { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, parseISO, subMonths } from "date-fns";
import { useHabits } from "@/features/habits/hooks/useHabits";
import { useHabitEntries } from "@/features/habits/hooks/useHabitEntries";
import { useSleepEntries } from "@/features/sleep/hooks/useSleepEntries";
import { calculateStreak, getLocalTodayStr, getDateRangeArray } from "@/features/habits/utils/streak";
import { colorThemes } from "@/features/habits/utils/colors";
import { HabitIcon } from "@/components/shared/HabitIcon";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";
import { BarChart2, ArrowUpDown, Brain, Sparkles, Moon, Flame } from "lucide-react";
import { StreakFlame } from "@/components/shared/StreakFlame";


type SortKey = "name" | "createdAt" | "done" | "missed" | "currentStreak" | "longestStreak";
type SortOrder = "asc" | "desc";

export default function AnalyticsPage() {
  const todayStr = getLocalTodayStr();
  
  // Look back 60 days to give a richer analytical correlation dataset
  const startDateStr = format(subMonths(new Date(), 2), "yyyy-MM-dd");
  const endDateStr = todayStr;

  const { habits, isLoading: habitsLoading } = useHabits();
  const { entries, isLoading: entriesLoading } = useHabitEntries(startDateStr, endDateStr);
  const { sleepEntries, isLoading: sleepLoading } = useSleepEntries(startDateStr, endDateStr);

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const activeHabits = useMemo(() => {
    return habits.filter((h) => !h.archivedAt);
  }, [habits]);

  // Lookup Maps
  const entryMap = useMemo(() => {
    const map = new Map<string, "done" | "missed" | "unmarked">();
    for (const entry of entries) {
      map.set(`${entry.habitId}_${entry.date}`, entry.status);
    }
    return map;
  }, [entries]);

  const sleepMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of sleepEntries) {
      map.set(entry.date, entry.hours);
    }
    return map;
  }, [sleepEntries]);

  // Aggregate statistics per habit
  const habitStats = useMemo(() => {
    return activeHabits.map((habit) => {
      const { currentStreak, longestStreak } = calculateStreak(habit, entries, todayStr);
      
      const doneCount = entries.filter((e) => e.habitId === habit.id && e.status === "done").length;
      const missedCount = entries.filter((e) => e.habitId === habit.id && e.status === "missed").length;

      return {
        habit,
        createdAt: habit.createdAt,
        done: doneCount,
        missed: missedCount,
        currentStreak,
        longestStreak,
      };
    });
  }, [activeHabits, entries, todayStr]);

  // Sort logic for the table
  const sortedHabitStats = useMemo(() => {
    const sorted = [...habitStats];
    sorted.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortKey === "name") {
        aVal = a.habit.name.toLowerCase();
        bVal = b.habit.name.toLowerCase();
      } else {
        // Exclude "name" key since it's nested under habit
        const key = sortKey as Exclude<SortKey, "name">;
        aVal = a[key];
        bVal = b[key];
      }

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
      setSortOrder("desc"); // default desc for counts/streaks
    }
  };

  // Sleep vs. Completion correlation scatter plot data
  const correlationData = useMemo(() => {
    const dates = getDateRangeArray(startDateStr, endDateStr);
    const dataPoints: { dateStr: string; sleepHours: number; completionRate: number }[] = [];

    for (const d of dates) {
      const sleepHours = sleepMap.get(d);
      
      // Calculate eligible habits on that date
      const eligibleHabits = activeHabits.filter((h) => h.createdAt <= d);
      
      if (sleepHours && sleepHours > 0 && eligibleHabits.length > 0) {
        const doneCount = eligibleHabits.filter(
          (h) => entryMap.get(`${h.id}_${d}`) === "done"
        ).length;

        const completionRate = Math.round((doneCount / eligibleHabits.length) * 100);

        dataPoints.push({
          dateStr: d,
          sleepHours,
          completionRate,
        });
      }
    }
    return dataPoints;
  }, [startDateStr, endDateStr, sleepMap, activeHabits, entryMap]);

  const isLoading = habitsLoading || entriesLoading || sleepLoading;

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
        <h2 className="text-lg font-extrabold text-text-heading flex items-center gap-1.5 capitalize">
          <BarChart2 className="h-5 w-5 text-habit-violet" />
          Analytics
        </h2>
        <p className="text-xs text-text-muted mt-1 leading-normal">
          Explore correlation metrics and track your detailed habit statistics over time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sleep vs Completion Scatter Plot Correlation */}
        <div className="lg:col-span-2 bg-surface-bg border border-border-custom rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[360px]">
          <div>
            <h3 className="text-sm font-bold text-text-heading flex items-center gap-1.5">
              <Brain className="h-4.5 w-4.5 text-habit-violet" />
              Sleep & Intent Correlation
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">
              Daily habit completion rate (%) plotted against recorded sleep hours.
            </p>
          </div>

          <div className="flex-1 relative flex items-center justify-center min-h-0 mt-4">
            {correlationData.length === 0 ? (
              <div className="text-center p-6 space-y-2">
                <Moon className="h-8 w-8 text-text-muted opacity-40 mx-auto" />
                <p className="text-xs font-semibold text-text-heading">Not enough correlation data</p>
                <p className="text-[10px] text-text-muted">
                  Log both sleep and habits over multiple days to see details.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis
                    type="number"
                    dataKey="sleepHours"
                    name="Sleep Hours"
                    unit="h"
                    domain={[4, 12]}
                    tickCount={5}
                    stroke="var(--text-muted)"
                    fontSize={10}
                    fontWeight="semibold"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="number"
                    dataKey="completionRate"
                    name="Completion"
                    unit="%"
                    domain={[0, 100]}
                    tickCount={5}
                    stroke="var(--text-muted)"
                    fontSize={10}
                    fontWeight="semibold"
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-surface-bg border border-border-custom rounded-xl p-2.5 shadow-lg text-[10px] text-foreground font-medium">
                            <p className="text-text-heading font-semibold">
                              {format(parseISO(data.dateStr), "MMM d, yyyy")}
                            </p>
                            <p className="text-habit-violet font-bold mt-1">
                              Sleep duration: {data.sleepHours} hrs
                            </p>
                            <p className="text-habit-green font-bold">
                              Habit completion: {data.completionRate}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter
                    name="Daily log"
                    data={correlationData}
                    fill="#9B7FD4"
                    fillOpacity={0.65}
                    line={false}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Dynamic Insight block */}
        <div className="bg-surface-bg border border-border-custom rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[360px]">
          <div>
            <h3 className="text-sm font-bold text-text-heading flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-habit-violet animate-pulse" />
              Cozy Insights
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">Calculated analytics patterns</p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar text-xs leading-relaxed space-y-4 pt-4 pr-1">
            <div className="p-3.5 rounded-2xl bg-habit-violet/10 dark:bg-habit-violet/20 border border-habit-violet/20">
              <h4 className="font-bold text-text-heading">Sleep Influence</h4>
              <p className="text-[10px] text-text-muted mt-1 leading-normal">
                Logging sleep helps recognize patterns. Often, sleeping between 7 to 8.5 hours acts as a foundation for daily habit completions.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-habit-green/10 dark:bg-habit-green/20 border border-habit-green/20">
              <h4 className="font-bold text-text-heading">Habit Stacking</h4>
              <p className="text-[10px] text-text-muted mt-1 leading-normal">
                Your highest streaks are built on consistency. Start with 1-2 small habits before stacking up to the 10 max cap.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sortable Habit stats table */}
      <div className="bg-surface-bg border border-border-custom rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border-custom">
          <h3 className="text-sm font-bold text-text-heading">Habit Statistics</h3>
          <p className="text-[11px] text-text-muted mt-0.5">Detailed records across active habits</p>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted/50 border-b border-border-custom text-xs font-semibold text-text-muted">
                <th
                  onClick={() => handleSort("name")}
                  className="px-6 py-4 cursor-pointer hover:text-text-body transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Habit name
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="px-6 py-4 cursor-pointer hover:text-text-body transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Created Date
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("done")}
                  className="px-6 py-4 cursor-pointer hover:text-text-body transition-colors text-center"
                >
                  <div className="flex items-center gap-1 justify-center">
                    Done Days
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("missed")}
                  className="px-6 py-4 cursor-pointer hover:text-text-body transition-colors text-center"
                >
                  <div className="flex items-center gap-1 justify-center">
                    Missed Days
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
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom text-xs">
              {sortedHabitStats.map(({ habit, createdAt, done, missed, currentStreak, longestStreak }) => {
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
                    <td className="px-6 py-4 text-text-muted font-medium">
                      {format(parseISO(createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-habit-green">{done}</td>
                    <td className="px-6 py-4 text-center font-bold text-red-500">{missed}</td>
                    <td className="px-6 py-4 text-center font-bold text-habit-orange">
                      <div className="flex items-center gap-1 justify-center">
                        <StreakFlame animate={currentStreak > 0} className="h-3.5 w-3.5" />
                        <span>{currentStreak}d</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-extrabold text-habit-violet">{longestStreak}d</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
