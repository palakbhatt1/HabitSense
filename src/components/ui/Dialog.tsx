"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    isOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          aria-label="Close dialog"
          onClick={onClose}
          className="fixed inset-0 bg-neutral-900/40 dark:bg-neutral-950/60"
        />
        <section
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-border-custom bg-surface-bg p-6 text-foreground shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-border-custom pb-4">
            <h3 className="text-lg font-semibold text-text-heading">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-md p-1 text-text-muted hover:bg-surface-muted hover:text-text-body"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </section>
      </div>
    ) : null
  );
}
