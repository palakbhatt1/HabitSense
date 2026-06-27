import { Habit, HabitEntry } from "@/lib/storage/types";
import { parseISO, differenceInCalendarDays, addDays, format } from "date-fns";

/**
 * Returns the current date in YYYY-MM-DD format in local timezone.
 */
export function getLocalTodayStr(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/**
 * Generates an array of date strings from start date to end date (inclusive) in YYYY-MM-DD format.
 */
export function getDateRangeArray(startStr: string, endStr: string): string[] {
  const start = parseISO(startStr);
  const end = parseISO(endStr);
  const daysDiff = differenceInCalendarDays(end, start);
  if (daysDiff < 0) return [];

  const dates: string[] = [];
  for (let i = 0; i <= daysDiff; i++) {
    const d = addDays(start, i);
    dates.push(format(d, "yyyy-MM-dd"));
  }
  return dates;
}

interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

export function calculateStreak(
  habit: Habit,
  entries: HabitEntry[],
  todayStr: string = getLocalTodayStr()
): StreakResult {
  // Create a map of status by date
  const statusMap = new Map<string, "done" | "missed" | "unmarked">();
  for (const entry of entries) {
    if (entry.habitId === habit.id) {
      statusMap.set(entry.date, entry.status);
    }
  }

  const creationDate = habit.createdAt;
  if (creationDate > todayStr) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // --- Current Streak Calculation ---
  let currentStreak = 0;
  const startD = parseISO(todayStr);
  const creationD = parseISO(creationDate);
  const totalDays = differenceInCalendarDays(startD, creationD);

  for (let i = 0; i <= totalDays; i++) {
    const checkD = addDays(startD, -i);
    const dateStr = format(checkD, "yyyy-MM-dd");
    const status = statusMap.get(dateStr) || "unmarked";

    if (dateStr === todayStr) {
      if (status === "done") {
        currentStreak++;
      } else if (status === "missed") {
        break; // Streak breaks if today is explicitly missed
      } else {
        // Today is unmarked: neutral. We don't increment, but we don't break yet either.
        continue;
      }
    } else {
      // Past day
      if (status === "done") {
        currentStreak++;
      } else {
        // Any past day that is missed or unmarked breaks the active streak
        break;
      }
    }
  }

  // --- Longest Streak Calculation ---
  let longestStreak = 0;
  let runningStreak = 0;
  const allDates = getDateRangeArray(creationDate, todayStr);

  for (const dateStr of allDates) {
    const status = statusMap.get(dateStr) || "unmarked";

    if (status === "done") {
      runningStreak++;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else if (dateStr === todayStr && status === "unmarked") {
      // Unmarked today does not break the longest streak, it just doesn't increase it.
      // E.g., if you had 3 days done up to yesterday, and today is unmarked,
      // your running streak is still 3.
    } else {
      // Past unmarked/missed day, or today missed: breaks the running streak
      runningStreak = 0;
    }
  }

  return {
    currentStreak,
    longestStreak,
  };
}
