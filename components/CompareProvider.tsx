"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type CompareItem = {
  id: string;
  slug: string;
  name: string;
};

type CompareContextValue = {
  items: CompareItem[];
  isSelected: (id: string) => boolean;
  toggle: (item: CompareItem) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const COMPARE_MAX_ITEMS = 3;
const STORAGE_KEY = "spooky-threads-compare";

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore malformed/blocked storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable; compare list still works for this page view
    }
  }, [items, hydrated]);

  const isSelected = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const toggle = useCallback((item: CompareItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev.filter((i) => i.id !== item.id);
      if (prev.length >= COMPARE_MAX_ITEMS) return prev;
      return [...prev, item];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage unavailable; in-memory list is still cleared for this page view
    }
  }, []);

  return (
    <CompareContext.Provider value={{ items, isSelected, toggle, remove, clear }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
