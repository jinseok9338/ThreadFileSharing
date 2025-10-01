import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toBe("text-red-500 bg-blue-500");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toBe("base-class active-class");
  });

  it("should handle Tailwind conflicts correctly", () => {
    const result = cn("px-4", "px-8");
    expect(result).toBe("px-8");
  });

  it("should handle undefined and null values", () => {
    const result = cn("base", undefined, null, "other");
    expect(result).toBe("base other");
  });

  it("should handle array of classes", () => {
    const result = cn(["text-lg", "font-bold"], "text-blue-500");
    expect(result).toBe("text-lg font-bold text-blue-500");
  });
});
