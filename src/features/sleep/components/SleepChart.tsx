"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { SleepEntry } from "@/lib/storage/types";
import { Moon, Sparkles } from "lucide-react";

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

  // Prepare chart data
  const chartData = useMemo(() => {
    return daysInMonth.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const hours = sleepMap.get(dateStr) ?? null; // Use null so Recharts doesn't plot unlogged days as 0
      return {
        dateStr,
        dayStr: format(day, "d"),
        hoursStr: hours !== null ? `${hours}h` : "Not logged",
        hours: hours,
      };
    });
  }, [daysInMonth, sleepMap]);

  // Calculate Avg Sleep (ignoring nulls)
  const stats = useMemo(() => {
    const logged = sleepEntries.filter((e) => e.hours > 0);
    if (logged.length === 0) return { avg: 0, totalLogged: 0 };
    const sum = logged.reduce((acc, curr) => acc + curr.hours, 0);
    return {
      avg: Math.round((sum / logged.length) * 100) / 100,
      totalLogged: logged.length,
    };
  }, [sleepEntries]);

  // Handle clicking on chart points
  const handleChartClick = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const dateStr = state.activePayload[0].payload.dateStr;
      onSelectDate(dateStr);
    }
  };

  const hasNoData = stats.totalLogged === 0;

  return (
    <div className="bg-surface-bg border border-border-custom rounded-2xl p-5 shadow-sm space-y-4 flex flex-col h-[350px]">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-text-heading flex items-center gap-1.5">
            <Moon className="h-4 w-4 text-habit-violet" />
            Sleep Trend
          </h3>
          <p className="text-[11px] text-text-muted">Click on a date to log or update sleep hours</p>
        </div>
        {stats.avg > 0 && (
          <div className="bg-habit-violet/10 dark:bg-habit-violet/20 text-habit-violet rounded-xl px-3 py-1 text-xs font-bold">
            Avg: {stats.avg}h / night
          </div>
        )}
      </div>

      <div className="flex-1 relative flex items-center justify-center min-h-0">
        {hasNoData ? (
          <div className="text-center p-6 space-y-3">
            <div className="mx-auto w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-text-muted opacity-60">
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-heading">Log your first night to start your trend</p>
              <p className="text-[10px] text-text-muted mt-0.5">Keep track of your rest for better habits.</p>
            </div>
            <button
              onClick={() => onSelectDate(format(new Date(), "yyyy-MM-dd"))}
              className="rounded-xl px-3 py-1.5 bg-surface-muted hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 border border-border-custom text-[11px] font-bold text-text-body transition-colors"
            >
              Log Sleep for Today
            </button>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              onClick={handleChartClick}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9B7FD4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#9B7FD4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis
                dataKey="dayStr"
                tickLine={false}
                axisLine={false}
                stroke="var(--text-muted)"
                fontSize={10}
                fontWeight="semibold"
              />
              <YAxis
                domain={[0, 16]}
                tickCount={5}
                tickLine={false}
                axisLine={false}
                stroke="var(--text-muted)"
                fontSize={10}
                fontWeight="semibold"
              />
              <Tooltip
                cursor={{ stroke: "var(--border-focus)", strokeWidth: 1, strokeDasharray: "2 2" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-surface-bg border border-border-custom rounded-xl p-2.5 shadow-lg text-[10px] text-foreground font-medium">
                        <p className="text-text-heading font-semibold">
                          {format(parseISO(data.dateStr), "MMM d, yyyy")}
                        </p>
                        <p className="text-habit-violet font-bold mt-1 flex items-center gap-1">
                          <Moon className="h-3 w-3" />
                          {data.hours !== null ? `${data.hours} hours slept` : "Not logged yet"}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#9B7FD4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#sleepGradient)"
                connectNulls
                activeDot={{ r: 5, strokeWidth: 0, fill: "#9B7FD4" }}
                dot={{ r: 2.5, strokeWidth: 0, fill: "#9B7FD4", fillOpacity: 0.7 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
