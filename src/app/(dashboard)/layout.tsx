"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopBar } from "@/components/shared/TopBar";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { OnboardingModal } from "@/components/shared/OnboardingModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Desktop Sidebar (visible on md screens and up) */}
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Overlay Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 z-40 bg-black md:hidden"
            />
            {/* Sidebar container */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-surface-bg md:hidden"
            >
              <div className="relative h-full">
                {/* Close Button Inside Mobile Drawer */}
                <button
                  onClick={toggleSidebar}
                  className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-surface-muted text-text-muted transition-colors"
                  aria-label="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
                <Sidebar />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Right side workspace container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header bar with mobile menu trigger */}
        <div className="flex items-center bg-surface-bg md:pl-0 pl-4 border-b border-border-custom shrink-0">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-xl border border-border-custom hover:bg-surface-muted text-text-muted hover:text-text-body transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <TopBar />
          </div>
        </div>

        {/* Dynamic page content scroll space */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8">
          {children}
        </main>
      </div>

      {/* Onboarding trigger wrapper (runs once per user profile) */}
      <OnboardingModal />
    </div>
  );
}
