import { HabitColor } from "@/lib/storage/types";

export interface ColorTheme {
  bg: string;
  bgHover: string;
  text: string;
  border: string;
  checkboxBg: string;
  checkboxBorder: string;
  glow: string;
  ring: string;
}

export const colorThemes: Record<HabitColor, ColorTheme> = {
  rose: {
    bg: "bg-habit-rose/10 dark:bg-habit-rose/20",
    bgHover: "hover:bg-habit-rose/20 dark:hover:bg-habit-rose/30",
    text: "text-habit-rose",
    border: "border-habit-rose/30 dark:border-habit-rose/40",
    checkboxBg: "bg-habit-rose",
    checkboxBorder: "border-habit-rose",
    glow: "shadow-habit-rose/20",
    ring: "focus:ring-habit-rose/30",
  },
  orange: {
    bg: "bg-habit-orange/10 dark:bg-habit-orange/20",
    bgHover: "hover:bg-habit-orange/20 dark:hover:bg-habit-orange/30",
    text: "text-habit-orange",
    border: "border-habit-orange/30 dark:border-habit-orange/40",
    checkboxBg: "bg-habit-orange",
    checkboxBorder: "border-habit-orange",
    glow: "shadow-habit-orange/20",
    ring: "focus:ring-habit-orange/30",
  },
  sky: {
    bg: "bg-habit-sky/10 dark:bg-habit-sky/20",
    bgHover: "hover:bg-habit-sky/20 dark:hover:bg-habit-sky/30",
    text: "text-habit-sky",
    border: "border-habit-sky/30 dark:border-habit-sky/40",
    checkboxBg: "bg-habit-sky",
    checkboxBorder: "border-habit-sky",
    glow: "shadow-habit-sky/20",
    ring: "focus:ring-habit-sky/30",
  },
  violet: {
    bg: "bg-habit-violet/10 dark:bg-habit-violet/20",
    bgHover: "hover:bg-habit-violet/20 dark:hover:bg-habit-violet/30",
    text: "text-habit-violet",
    border: "border-habit-violet/30 dark:border-habit-violet/40",
    checkboxBg: "bg-habit-violet",
    checkboxBorder: "border-habit-violet",
    glow: "shadow-habit-violet/20",
    ring: "focus:ring-habit-violet/30",
  },
  green: {
    bg: "bg-habit-green/10 dark:bg-habit-green/20",
    bgHover: "hover:bg-habit-green/20 dark:hover:bg-habit-green/30",
    text: "text-habit-green",
    border: "border-habit-green/30 dark:border-habit-green/40",
    checkboxBg: "bg-habit-green",
    checkboxBorder: "border-habit-green",
    glow: "shadow-habit-green/20",
    ring: "focus:ring-habit-green/30",
  },
  teal: {
    bg: "bg-habit-teal/10 dark:bg-habit-teal/20",
    bgHover: "hover:bg-habit-teal/20 dark:hover:bg-habit-teal/30",
    text: "text-habit-teal",
    border: "border-habit-teal/30 dark:border-habit-teal/40",
    checkboxBg: "bg-habit-teal",
    checkboxBorder: "border-habit-teal",
    glow: "shadow-habit-teal/20",
    ring: "focus:ring-habit-teal/30",
  },
  amber: {
    bg: "bg-habit-amber/10 dark:bg-habit-amber/20",
    bgHover: "hover:bg-habit-amber/20 dark:hover:bg-habit-amber/30",
    text: "text-habit-amber",
    border: "border-habit-amber/30 dark:border-habit-amber/40",
    checkboxBg: "bg-habit-amber",
    checkboxBorder: "border-habit-amber",
    glow: "shadow-habit-amber/20",
    ring: "focus:ring-habit-amber/30",
  },
  pink: {
    bg: "bg-habit-pink/10 dark:bg-habit-pink/20",
    bgHover: "hover:bg-habit-pink/20 dark:hover:bg-habit-pink/30",
    text: "text-habit-pink",
    border: "border-habit-pink/30 dark:border-habit-pink/40",
    checkboxBg: "bg-habit-pink",
    checkboxBorder: "border-habit-pink",
    glow: "shadow-habit-pink/20",
    ring: "focus:ring-habit-pink/30",
  },
  indigo: {
    bg: "bg-habit-indigo/10 dark:bg-habit-indigo/20",
    bgHover: "hover:bg-habit-indigo/20 dark:hover:bg-habit-indigo/30",
    text: "text-habit-indigo",
    border: "border-habit-indigo/30 dark:border-habit-indigo/40",
    checkboxBg: "bg-habit-indigo",
    checkboxBorder: "border-habit-indigo",
    glow: "shadow-habit-indigo/20",
    ring: "focus:ring-habit-indigo/30",
  },
  lime: {
    bg: "bg-habit-lime/10 dark:bg-habit-lime/20",
    bgHover: "hover:bg-habit-lime/20 dark:hover:bg-habit-lime/30",
    text: "text-habit-lime",
    border: "border-habit-lime/30 dark:border-habit-lime/40",
    checkboxBg: "bg-habit-lime",
    checkboxBorder: "border-habit-lime",
    glow: "shadow-habit-lime/20",
    ring: "focus:ring-habit-lime/30",
  },
};
