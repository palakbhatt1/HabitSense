"use client";

import React, { useId } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";

export interface TrendDataPoint {
  dateStr: string;
  label: string;
  value: number | null;
  tooltipSubtext?: string;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  title?: string;
  subtitle?: string;
  badge?: string;
  yUnit?: string;
  yDomain?: [number, number];
  color?: string;
  emptyTitle?: string;
  emptySubtext?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  onPointClick?: (dateStr: string) => void;
  height?: number;
  valueFormatter?: (val: number) => string;
}

export function TrendChart({
  data,
  title,
  subtitle,
  badge,
  yUnit = "",
  yDomain,
  color = "#9B7FD4",
  emptyTitle = "No data recorded for this period",
  emptySubtext = "Data will appear here as you log entries.",
  actionButton,
  onPointClick,
  height = 320,
  valueFormatter,
}: TrendChartProps) {
  const gradientId = useId();

  // Check if there are any valid (non-null and > 0) points
  const hasData = data.some((d) => d.value !== null && d.value > 0);

  const handleChartClick: React.ComponentProps<typeof AreaChart>["onClick"] = (
    nextState
  ) => {
    if (
      nextState &&
      "activePayload" in nextState &&
      Array.isArray(nextState.activePayload) &&
      nextState.activePayload.length > 0
    ) {
      const payloadObj = nextState.activePayload[0]?.payload as
        | TrendDataPoint
        | undefined;
      if (onPointClick && payloadObj?.dateStr) {
        onPointClick(payloadObj.dateStr);
      }
    }
  };

  return (
    <div
      style={{ minHeight: height }}
      className="bg-surface-bg border border-border-custom rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
    >
      {(title || badge) && (
        <div className="flex justify-between items-center">
          <div>
            {title && (
              <h3 className="text-sm font-bold text-text-heading">{title}</h3>
            )}
            {subtitle && (
              <p className="text-[11px] text-text-muted mt-0.5">{subtitle}</p>
            )}
          </div>
          {badge && (
            <div className="bg-habit-violet/10 dark:bg-habit-violet/20 text-habit-violet rounded-xl px-3 py-1 text-xs font-bold">
              {badge}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 relative flex items-center justify-center min-h-0">
        {!hasData ? (
          <div className="text-center p-6 space-y-3">
            <div>
              <p className="text-xs font-semibold text-text-heading">
                {emptyTitle}
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">
                {emptySubtext}
              </p>
            </div>
            {actionButton && (
              <button
                type="button"
                onClick={actionButton.onClick}
                className="rounded-xl px-3 py-1.5 bg-surface-muted hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 border border-border-custom text-[11px] font-bold text-text-body transition-colors"
              >
                {actionButton.label}
              </button>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              onClick={handleChartClick}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border-color)"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                stroke="var(--text-muted)"
                fontSize={10}
                fontWeight="semibold"
              />
              <YAxis
                domain={yDomain || [0, "auto"]}
                tickCount={5}
                tickLine={false}
                axisLine={false}
                stroke="var(--text-muted)"
                fontSize={10}
                fontWeight="semibold"
                unit={yUnit}
              />
              <Tooltip
                cursor={{
                  stroke: "var(--border-focus)",
                  strokeWidth: 1,
                  strokeDasharray: "2 2",
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const point = payload[0].payload as TrendDataPoint;
                    const formattedDate = point.dateStr
                      ? format(parseISO(point.dateStr), "MMM d, yyyy")
                      : "";
                    const displayValue =
                      point.value !== null
                        ? valueFormatter
                          ? valueFormatter(point.value)
                          : `${point.value}${yUnit}`
                        : "Not logged";

                    return (
                      <div className="bg-surface-bg border border-border-custom rounded-xl p-2.5 shadow-lg text-[10px] text-foreground font-medium">
                        <p className="text-text-heading font-semibold">
                          {formattedDate}
                        </p>
                        <p
                          style={{ color }}
                          className="font-bold mt-1"
                        >
                          {displayValue}
                        </p>
                        {point.tooltipSubtext && (
                          <p className="text-text-muted mt-0.5">
                            {point.tooltipSubtext}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                connectNulls
                activeDot={{ r: 5, strokeWidth: 0, fill: color }}
                dot={{ r: 2.5, strokeWidth: 0, fill: color, fillOpacity: 0.7 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
