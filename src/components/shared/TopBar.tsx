"use client";

import React, { useSyncExternalStore } from "react";
import { format } from "date-fns";

const emptySubscribe = () => () => {};

const SERVER_SNAPSHOT = "Good morning|";
const getServerSnapshot = () => SERVER_SNAPSHOT;

let cachedSnapshot = "";
let lastCheckMinute = -1;

function getClientSnapshot(): string {
  const now = new Date();
  const currentMinute = now.getMinutes();
  if (currentMinute !== lastCheckMinute || !cachedSnapshot) {
    lastCheckMinute = currentMinute;
    const hour = now.getHours();
    const greeting =
      hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const today = format(now, "EEEE, MMMM d");
    cachedSnapshot = `${greeting}|${today}`;
  }
  return cachedSnapshot;
}

export function TopBar() {
  const snapshot = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const [greeting, today] = snapshot.split("|");

  return (
    <header className="flex min-h-[4.5rem] flex-col justify-center gap-0.5 bg-surface-bg px-5 py-3 md:px-6">
      <h2 className="text-base font-semibold text-text-heading">{greeting}</h2>
      {today && (
        <p className="text-xs text-text-muted" aria-live="polite">
          {today}
        </p>
      )}
    </header>
  );
}
