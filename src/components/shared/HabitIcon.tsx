import React from "react";
import * as Icons from "lucide-react";

export const AVAILABLE_ICONS = [
  { key: "BookOpen", label: "Reading", iconName: "BookOpen" },
  { key: "Dumbbell", label: "Workout", iconName: "Dumbbell" },
  { key: "Coffee", label: "Coffee/Routine", iconName: "Coffee" },
  { key: "Code", label: "Coding", iconName: "Code" },
  { key: "Heart", label: "Self Care", iconName: "Heart" },
  { key: "Moon", label: "Sleep/Rest", iconName: "Moon" },
  { key: "Sprout", label: "Growth/Habit", iconName: "Sprout" },
  { key: "Smile", label: "Mindfulness", iconName: "Smile" },
  { key: "Droplet", label: "Hydration", iconName: "Droplet" },
  { key: "Apple", label: "Nutrition", iconName: "Apple" },
  { key: "Brain", label: "Mental/Study", iconName: "Brain" },
  { key: "Briefcase", label: "Work/Productivity", iconName: "Briefcase" },
  { key: "Compass", label: "Adventure", iconName: "Compass" },
  { key: "Sparkles", label: "Routine", iconName: "Sparkles" },
];

interface HabitIconProps {
  name: string;
  className?: string;
}

export function HabitIcon({ name, className }: HabitIconProps) {
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent className={className} />;
}
