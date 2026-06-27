"use client";

import React, { useEffect, useState } from "react";
import { useStorage } from "@/lib/storage/storage-provider";
import { getLocalTodayStr } from "@/features/habits/utils/streak";
import { Sparkles } from "lucide-react";

const GREETING_PHRASES = [
  "Make today count. Your future self is cheering for you.",
  "Growth is a quiet process. Keep doing your best.",
  "One step at a time, you are shaping your habits.",
  "Consistency is about persistence, not perfection.",
  "Be gentle with yourself. Progress looks different every day.",
  "Growth looks beautiful on consistent days.",
];

export function TopBar() {
  const storage = useStorage();
  const [userName, setUserName] = useState("Friend");
  const [greeting, setGreeting] = useState("Hello");
  const [subtext, setSubtext] = useState("");
  const [focus, setFocus] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const todayStr = getLocalTodayStr();

  // Load user name, calculate time of day greeting, and choose a subtext phrase
  useEffect(() => {
    // Load meta data
    storage.getMeta().then((meta) => {
      if (meta && meta.userDisplayName) {
        setUserName(meta.userDisplayName);
      }
      if (meta && meta.dailyIntentions && meta.dailyIntentions[todayStr]) {
        setFocus(meta.dailyIntentions[todayStr]);
      }
      setIsLoaded(true);
    });

    // Time-of-day aware greeting
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting("Good morning");
    } else if (hours < 17) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }

    // Stable random subtext per day
    const dayIndex = new Date().getDate() % GREETING_PHRASES.length;
    setSubtext(GREETING_PHRASES[dayIndex]);
  }, [storage, todayStr]);

  // Debounced write of the focus/intention to the storage adapter
  useEffect(() => {
    if (!isLoaded) return;

    const delayDebounceFn = setTimeout(async () => {
      const meta = await storage.getMeta();
      const dailyIntentions = { ...meta.dailyIntentions, [todayStr]: focus };
      await storage.updateMeta({ dailyIntentions });
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [focus, todayStr, storage, isLoaded]);

  const handleFocusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFocus(e.target.value);
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-bg border-b border-border-custom px-6 py-4">
      {/* Greeting and subtext */}
      <div>
        <h2 className="text-md font-extrabold text-text-heading flex items-center gap-1.5 capitalize">
          {greeting}, {userName}! 👋
        </h2>
        <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
          {subtext}
        </p>
      </div>

      {/* Focus input */}
      <div className="w-full md:w-80 shrink-0">
        <div className="relative flex items-center bg-surface-muted border border-border-custom rounded-2xl px-3 py-1.5 focus-within:border-border-focus focus-within:ring-2 focus-within:ring-ring-custom transition-all">
          <Sparkles className="h-4 w-4 text-habit-violet mr-2.5 shrink-0" />
          <div className="flex-1">
            <span className="text-[8px] font-bold uppercase tracking-wider text-text-muted block leading-none">
              Today's Intention
            </span>
            <input
              type="text"
              placeholder="What is your focus today?"
              value={focus}
              onChange={handleFocusChange}
              maxLength={60}
              className="w-full bg-transparent border-none outline-none text-xs font-bold text-text-body mt-0.5 placeholder-text-muted/60 p-0 leading-none h-4"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
