import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("treats named font sizes as sizes, so the later one wins", () => {
    expect(cn("text-display font-semibold", "text-title")).toBe("font-semibold text-title");
    expect(cn("text-small", "text-h4")).toBe("text-h4");
  });

  it("keeps a text colour next to a named size", () => {
    expect(cn("text-h2 text-muted")).toBe("text-h2 text-muted");
  });
});
