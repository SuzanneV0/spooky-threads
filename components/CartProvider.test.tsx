import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { CartProvider, useCart } from "@/components/CartProvider";

// Mirrors the private key in CartProvider.tsx — there's no other way to
// black-box test what actually lands in localStorage.
const STORAGE_KEY = "spooky-threads-cart";

const tee = { productId: "p1", slug: "spooky-tee", name: "Spooky Tee", priceCents: 2500, productType: "shirt" };
const mug = { productId: "p2", slug: "pumpkin-mug", name: "Pumpkin Mug", priceCents: 1600, productType: "mug" };

function renderCart() {
  return renderHook(() => useCart(), { wrapper: CartProvider });
}

describe("CartProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty", () => {
    const { result } = renderCart();
    expect(result.current.lines).toEqual([]);
    expect(result.current.count).toBe(0);
    expect(result.current.subtotalCents).toBe(0);
  });

  it("adds a new item with quantity 1 by default", () => {
    const { result } = renderCart();
    act(() => result.current.addItem({ ...tee, size: "M" }));

    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0]).toMatchObject({ ...tee, size: "M", quantity: 1 });
    expect(result.current.count).toBe(1);
  });

  it("increments quantity instead of duplicating when the same product+size is added again", () => {
    const { result } = renderCart();
    act(() => result.current.addItem({ ...tee, size: "M" }));
    act(() => result.current.addItem({ ...tee, size: "M" }, 2));

    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0].quantity).toBe(3);
  });

  it("treats the same product in a different size as a separate line", () => {
    const { result } = renderCart();
    act(() => result.current.addItem({ ...tee, size: "M" }));
    act(() => result.current.addItem({ ...tee, size: "L" }));

    expect(result.current.lines).toHaveLength(2);
    expect(result.current.count).toBe(2);
  });

  it("updates quantity, and removes the line when set to zero", () => {
    const { result } = renderCart();
    act(() => result.current.addItem({ ...mug, size: null }));
    act(() => result.current.setQuantity("p2", null, 5));
    expect(result.current.lines[0].quantity).toBe(5);

    act(() => result.current.setQuantity("p2", null, 0));
    expect(result.current.lines).toHaveLength(0);
  });

  it("removes a specific line", () => {
    const { result } = renderCart();
    act(() => result.current.addItem({ ...tee, size: "M" }));
    act(() => result.current.addItem({ ...mug, size: null }));
    act(() => result.current.removeItem("p1", "M"));

    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0].productId).toBe("p2");
  });

  it("computes count and subtotal across multiple lines", () => {
    const { result } = renderCart();
    act(() => result.current.addItem({ ...tee, size: "M" }, 2)); // 2 x $25.00
    act(() => result.current.addItem({ ...mug, size: null }, 3)); // 3 x $16.00

    expect(result.current.count).toBe(5);
    expect(result.current.subtotalCents).toBe(2 * 2500 + 3 * 1600);
  });

  it("clears the cart, leaving nothing to reload on the next visit", () => {
    const { result } = renderCart();
    act(() => result.current.addItem({ ...tee, size: "M" }));
    act(() => result.current.clear());

    expect(result.current.lines).toEqual([]);
    // clear() explicitly removes the key, but the persist effect then
    // re-runs (state changed to []) and writes it back as "[]" — either
    // way, a fresh mount reads back an empty cart, which is what matters.
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")).toEqual([]);
  });

  it("persists added items to localStorage", () => {
    const { result } = renderCart();
    act(() => result.current.addItem({ ...tee, size: "M" }));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ productId: "p1", quantity: 1 });
  });

  it("loads an existing cart from localStorage on mount", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ ...tee, size: "M", quantity: 4 }]));

    const { result } = renderCart();
    expect(result.current.lines).toHaveLength(1);
    expect(result.current.count).toBe(4);
  });
});
