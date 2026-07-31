"use client";

import React from "react";
import { Flame } from "lucide-react";

interface StreakFlameProps {
  className?: string;
  animate?: boolean;
}

export function StreakFlame({ className = "h-4 w-4", animate = true }: StreakFlameProps) {
  void animate;
  return <Flame className={`${className} fill-current text-habit-orange`} aria-hidden="true" />;
}
