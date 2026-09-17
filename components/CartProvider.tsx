"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  productType: string;
  size: string | null;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  addItem: (item: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, size: string | null, quantity: number) => void;
  removeItem: (productId: string, size: string | null) => void;
  clear: () => void;
};

const STORAGE_KEY = "spooky-threads-cart";

const CartContext = createContext<CartContextValue | null>(null);

function sameLine(line: CartLine, productId: string, size: string | null) {
  return line.productId === productId && line.size === size;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore malformed/blocked storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // storage unavailable; cart still works for this page view
    }
  }, [lines, hydrated]);

  const addItem = useCallback((item: Omit<CartLine, "quantity">, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => sameLine(l, item.productId, item.size));
      if (existing) {
        return prev.map((l) =>
          sameLine(l, item.productId, item.size) ? { ...l, quantity: l.quantity + quantity } : l
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, size: string | null, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) return prev.filter((l) => !sameLine(l, productId, size));
      return prev.map((l) => (sameLine(l, productId, size) ? { ...l, quantity } : l));
    });
  }, []);

  const removeItem = useCallback((productId: string, size: string | null) => {
    setLines((prev) => prev.filter((l) => !sameLine(l, productId, size)));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage unavailable; in-memory cart is still cleared for this page view
    }
  }, []);

  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotalCents = lines.reduce((sum, l) => sum + l.quantity * l.priceCents, 0);

  return (
    <CartContext.Provider value={{ lines, count, subtotalCents, addItem, setQuantity, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
