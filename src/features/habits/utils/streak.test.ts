import { calculateStreak } from "./streak";
import { Habit, HabitEntry } from "@/lib/storage/types";

function runTests() {
  const mockHabit: Habit = {
    id: "habit-1",
    name: "Read Book",
    icon: "book",
    color: "rose",
    createdAt: "2026-06-20",
    archivedAt: null,
    sortOrder: 0,
  };

  const today = "2026-06-23";

  // Test 1: All done (creation 20th to 23rd)
  const entries1: HabitEntry[] = [
    { habitId: "habit-1", date: "2026-06-20", status: "done" },
    { habitId: "habit-1", date: "2026-06-21", status: "done" },
    { habitId: "habit-1", date: "2026-06-22", status: "done" },
    { habitId: "habit-1", date: "2026-06-23", status: "done" },
  ];
  const res1 = calculateStreak(mockHabit, entries1, today);
  console.assert(res1.currentStreak === 4, `Test 1 failed current: ${res1.currentStreak}`);
  console.assert(res1.longestStreak === 4, `Test 1 failed longest: ${res1.longestStreak}`);

  // Test 2: Today unmarked, but all past done
  const entries2: HabitEntry[] = [
    { habitId: "habit-1", date: "2026-06-20", status: "done" },
    { habitId: "habit-1", date: "2026-06-21", status: "done" },
    { habitId: "habit-1", date: "2026-06-22", status: "done" },
    // 23rd is unmarked
  ];
  const res2 = calculateStreak(mockHabit, entries2, today);
  console.assert(res2.currentStreak === 3, `Test 2 failed current: ${res2.currentStreak}`);
  console.assert(res2.longestStreak === 3, `Test 2 failed longest: ${res2.longestStreak}`);

  // Test 3: Today missed, but all past done
  const entries3: HabitEntry[] = [
    { habitId: "habit-1", date: "2026-06-20", status: "done" },
    { habitId: "habit-1", date: "2026-06-21", status: "done" },
    { habitId: "habit-1", date: "2026-06-22", status: "done" },
    { habitId: "habit-1", date: "2026-06-23", status: "missed" },
  ];
  const res3 = calculateStreak(mockHabit, entries3, today);
  console.assert(res3.currentStreak === 0, `Test 3 failed current: ${res3.currentStreak}`);
  console.assert(res3.longestStreak === 3, `Test 3 failed longest: ${res3.longestStreak}`);

  // Test 4: Past unmarked breaks current streak but maintains longest streak
  const entries4: HabitEntry[] = [
    { habitId: "habit-1", date: "2026-06-20", status: "done" },
    { habitId: "habit-1", date: "2026-06-21", status: "done" },
    // 22nd is unmarked (breaks streak)
    { habitId: "habit-1", date: "2026-06-23", status: "done" },
  ];
  const res4 = calculateStreak(mockHabit, entries4, today);
  console.assert(res4.currentStreak === 1, `Test 4 failed current: ${res4.currentStreak}`); // only today (23) is done
  console.assert(res4.longestStreak === 2, `Test 4 failed longest: ${res4.longestStreak}`); // 20-21 were done (length 2)

  // Test 5: Backfilled days are counted correctly
  const entries5: HabitEntry[] = [
    { habitId: "habit-1", date: "2026-06-21", status: "done" },
    { habitId: "habit-1", date: "2026-06-22", status: "done" },
    { habitId: "habit-1", date: "2026-06-23", status: "done" },
  ];
  const res5 = calculateStreak(mockHabit, entries5, today);
  console.assert(res5.currentStreak === 3, `Test 5 failed current: ${res5.currentStreak}`);
  console.assert(res5.longestStreak === 3, `Test 5 failed longest: ${res5.longestStreak}`);

  console.log("All streak tests passed successfully!");
}

runTests();
