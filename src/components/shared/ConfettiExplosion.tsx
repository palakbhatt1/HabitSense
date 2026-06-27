"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
}

interface ConfettiExplosionProps {
  onComplete: () => void;
}

export function ConfettiExplosion({ onComplete }: ConfettiExplosionProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = [
      "#F4778E", // rose
      "#F2994A", // orange
      "#4FA8E0", // sky
      "#9B7FD4", // violet
      "#5FB87B", // green
      "#3FB8A6", // teal
      "#EC4899", // pink
    ];
    
    const newParticles: Particle[] = [];
    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 60 + Math.random() * 240;
      newParticles.push({
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 80, // slightly offset upwards
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
        delay: Math.random() * 0.15,
      });
    }
    
    setParticles(newParticles);

    // Auto cleanup after animation ends
    const timer = setTimeout(onComplete, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y + 250, // gravity fall down
            scale: [1, 1, 0.5, 0],
            opacity: [1, 1, 0.8, 0],
            rotate: Math.random() * 720 - 360,
          }}
          transition={{
            duration: 1.8,
            ease: "easeOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
