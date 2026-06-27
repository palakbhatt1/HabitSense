"use client";

import React, { createContext, useContext, useState } from "react";
import { StorageAdapter } from "./storage-adapter";
import { LocalStorageAdapter } from "./local-storage-adapter";

const StorageContext = createContext<StorageAdapter | null>(null);

export function StorageProvider({ children }: { children: React.ReactNode }) {
  // Instantiate LocalStorageAdapter as the active persistence engine for Phase 1
  const [adapter] = useState<StorageAdapter>(() => new LocalStorageAdapter());

  return (
    <StorageContext.Provider value={adapter}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage(): StorageAdapter {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
}
