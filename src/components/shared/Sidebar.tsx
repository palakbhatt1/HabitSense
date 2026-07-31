"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, CheckSquare, Home, Moon, Settings, Sun } from "lucide-react";
import { useStorage } from "@/lib/storage/storage-provider";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/habits", label: "Habits", icon: CheckSquare },
  { href: "/sleep", label: "Sleep", icon: Moon },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const storage = useStorage();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    let active = true;
    storage.getMeta().then((meta) => {
      if (!active || !meta?.themeMode) return;
      setTheme(meta.themeMode);
      document.documentElement.classList.toggle("dark", meta.themeMode === "dark");
    });
    return () => {
      active = false;
    };
  }, [storage]);

  const toggleTheme = async () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    await storage.updateMeta({ themeMode: nextTheme });
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border-custom bg-surface-bg p-4">
      <div className="mb-8 px-2 py-1">
        <h1 className="text-lg font-semibold tracking-tight text-text-heading">HabitSense</h1>
      </div>

      <nav aria-label="Main navigation" className="space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                isActive
                  ? "bg-surface-muted text-text-heading"
                  : "text-text-muted hover:bg-surface-muted hover:text-text-body"
              }`}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border-custom pt-4">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted hover:bg-surface-muted hover:text-text-body"
        >
          {theme === "light" ? <Moon aria-hidden="true" className="h-4 w-4" /> : <Sun aria-hidden="true" className="h-4 w-4" />}
          <span>{theme === "light" ? "Dark theme" : "Light theme"}</span>
        </button>
      </div>
    </aside>
  );
}
