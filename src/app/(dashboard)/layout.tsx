"use client";

import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopBar } from "@/components/shared/TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSidebarOpen]);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <div className="hidden h-full md:block">
        <Sidebar />
      </div>

      {isSidebarOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-black/40 md:hidden"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className="fixed inset-y-0 left-0 z-50 h-dvh md:hidden"
          >
            <div className="relative h-full">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="absolute right-3 top-3 z-10 rounded-md p-2 text-text-muted hover:bg-surface-muted"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
              <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
            </div>
          </div>
        </>
      )}

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center border-b border-border-custom bg-surface-bg md:block">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation"
            aria-expanded={isSidebarOpen}
            className="ml-3 rounded-md p-2 text-text-muted hover:bg-surface-muted md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <TopBar />
          </div>
        </div>

        <main className="custom-scrollbar flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
