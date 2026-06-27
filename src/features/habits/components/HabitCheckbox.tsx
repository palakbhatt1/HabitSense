"use client";

import React from "react";
import { HabitColor } from "@/lib/storage/types";
import { colorThemes } from "../utils/colors";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

interface HabitCheckboxProps {
  status: "done" | "missed" | "unmarked";
  color: HabitColor;
  onClick: () => void;
  size?: "sm" | "md" | "lg";
}

export function HabitCheckbox({
  status,
  color,
  onClick,
  size = "md",
}: HabitCheckboxProps) {
  const theme = colorThemes[color] || colorThemes.violet;

  const sizeClasses = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-10 w-10 text-sm",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4.5 w-4.5",
    lg: "h-5 w-5",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        sizeClasses[size]
      } ${theme.ring}`}
      aria-label={`Mark habit as ${
        status === "unmarked"
          ? "done"
          : status === "done"
          ? "missed"
          : "unmarked"
      }`}
    >
      {/* Active Done State */}
      {status === "done" && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          style={{ backgroundColor: theme.checkboxBg }}
          className="absolute inset-0 flex items-center justify-center rounded-full text-white shadow-sm"
        >
          <Check className={`${iconSizes[size]} stroke-[3px]`} />
        </motion.div>
      )}

      {/* Active Missed State */}
      {status === "missed" && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900/30"
        >
          <X className={`${iconSizes[size]} stroke-[3.5px]`} />
        </motion.div>
      )}

      {/* Unmarked Default State */}
      {status === "unmarked" && (
        <div
          className={`absolute inset-0 rounded-full border border-dashed bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800/40 transition-colors border-neutral-300 dark:border-neutral-700`}
        />
      )}
    </button>
  );
}
