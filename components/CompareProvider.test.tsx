import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { CompareProvider, useCompare, COMPARE_MAX_ITEMS } from "@/components/CompareProvider";

const STORAGE_KEY = "spooky-threads-compare";

const items = [
  { id: "1", slug: "spooky-tee", name: "Spooky Tee" },
  { id: "2", slug: "pumpkin-mug", name: "Pumpkin Mug" },
  { id: "3", slug: "bat-beanie", name: "Bat Beanie" },
  { id: "4", slug: "ghost-tumbler", name: "Ghost Tumbler" },
];

function renderCompare() {
  return renderHook(() => useCompare(), { wrapper: CompareProvider });
}

describe("CompareProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with nothing selected", () => {
    const { result } = renderCompare();
    expect(result.current.items).toEqual([]);
    expect(result.current.isSelected("1")).toBe(false);
  });

  it("adds an item on toggle", () => {
    const { result } = renderCompare();
    act(() => result.current.toggle(items[0]));

    expect(result.current.items).toEqual([items[0]]);
    expect(result.current.isSelected("1")).toBe(true);
  });

  it("removes an item when toggled a second time", () => {
    const { result } = renderCompare();
    act(() => result.current.toggle(items[0]));
    act(() => result.current.toggle(items[0]));

    expect(result.current.items).toEqual([]);
    expect(result.current.isSelected("1")).toBe(false);
  });

  it(`refuses to add more than ${COMPARE_MAX_ITEMS} items`, () => {
    const { result } = renderCompare();
    items.forEach((item) => act(() => result.current.toggle(item)));

    // Only the first COMPARE_MAX_ITEMS should have made it in; the 4th is dropped.
    expect(result.current.items).toHaveLength(COMPARE_MAX_ITEMS);
    expect(result.current.isSelected("4")).toBe(false);
  });

  it("removes an item by id", () => {
    const { result } = renderCompare();
    act(() => result.current.toggle(items[0]));
    act(() => result.current.toggle(items[1]));
    act(() => result.current.remove("1"));

    expect(result.current.items).toEqual([items[1]]);
  });

  it("clears the whole list, leaving nothing to reload on the next visit", () => {
    const { result } = renderCompare();
    act(() => result.current.toggle(items[0]));
    act(() => result.current.clear());

    expect(result.current.items).toEqual([]);
    // clear() explicitly removes the key, but the persist effect then
    // re-runs (state changed to []) and writes it back as "[]" — either
    // way, a fresh mount reads back an empty list, which is what matters.
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")).toEqual([]);
  });

  it("persists selections to localStorage", () => {
    const { result } = renderCompare();
    act(() => result.current.toggle(items[0]));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(stored).toEqual([items[0]]);
  });

  it("loads an existing selection from localStorage on mount", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([items[0], items[1]]));

    const { result } = renderCompare();
    expect(result.current.items).toHaveLength(2);
    expect(result.current.isSelected("2")).toBe(true);
  });
});
