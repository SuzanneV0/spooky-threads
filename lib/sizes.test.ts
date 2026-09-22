import { describe, expect, it } from "vitest";
import { requiresSize } from "@/lib/sizes";

describe("requiresSize", () => {
  it("returns true for apparel that comes in sizes", () => {
    expect(requiresSize("shirt")).toBe(true);
    expect(requiresSize("sweater")).toBe(true);
  });

  it("returns false for products that don't need a size", () => {
    expect(requiresSize("mug")).toBe(false);
    expect(requiresSize("hat")).toBe(false);
  });
});
