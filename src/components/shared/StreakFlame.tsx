"use client";

import React from "react";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";

interface StreakFlameProps {
  className?: string;
  animate?: boolean;
}

export function StreakFlame({ className = "h-4 w-4", animate = true }: StreakFlameProps) {
  if (!animate) {
    return <Flame className={`${className} fill-current text-habit-orange`} />;
  }

  return (
    <span className="relative inline-flex items-center justify-center">
      {/* Pulsing glow background */}
      <motion.span
        className="absolute text-habit-orange opacity-40"
        initial={{ scale: 1, opacity: 0.4 }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.4, 0, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Flame className={`${className} fill-current`} />
      </motion.span>

      {/* Front sharp icon */}
      <Flame className={`${className} fill-current text-habit-orange relative z-10`} />
    </span>
  );
}
