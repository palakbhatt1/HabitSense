"use client";

import React, { useMemo } from "react";
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { SleepEntry } from "@/lib/storage/types";
import { TrendChart, TrendDataPoint } from "@/components/shared/TrendChart";

interface SleepChartProps {
  currentMonth: Date;
  sleepEntries: SleepEntry[];
  onSelectDate: (dateStr: string) => void;
}

export function SleepChart({ currentMonth, sleepEntries, onSelectDate }: SleepChartProps) {
  // Generate all days in the current month
  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    });
  }, [currentMonth]);

  // Map entries for quick lookup
  const sleepMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of sleepEntries) {
      map.set(entry.date, entry.hours);
    }
    return map;
  }, [sleepEntries]);

  // Prepare chart data for TrendChart
  const chartData: TrendDataPoint[] = useMemo(() => {
    return daysInMonth.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const hours = sleepMap.get(dateStr) ?? null;
      return {
        dateStr,
        label: format(day, "d"),
        value: hours,
        tooltipSubtext: hours !== null ? undefined : "Not logged yet",
      };
    });
  }, [daysInMonth, sleepMap]);

  // Calculate Avg Sleep (ignoring nulls)
  const stats = useMemo(() => {
    const logged = sleepEntries.filter((e) => e.hours > 0);
    if (logged.length === 0) return { avg: 0, totalLogged: 0 };
    const sum = logged.reduce((acc, curr) => acc + curr.hours, 0);
    return {
      avg: Math.round((sum / logged.length) * 10) / 10,
      totalLogged: logged.length,
    };
  }, [sleepEntries]);

  return (
    <TrendChart
      data={chartData}
      title="Sleep Trend"
      subtitle="Click on a date to log or update sleep hours"
      badge={stats.avg > 0 ? `Avg: ${stats.avg}h / night` : undefined}
      yDomain={[0, 16]}
      yUnit="h"
      color="#9B7FD4"
      emptyTitle="Log your first night to start your trend"
      emptySubtext="Keep track of your rest for better habits."
      actionButton={{
        label: "Log Sleep for Today",
        onClick: () => onSelectDate(format(new Date(), "yyyy-MM-dd")),
      }}
      onPointClick={onSelectDate}
      valueFormatter={(val) => `${val} hours slept`}
    />
  );
}
