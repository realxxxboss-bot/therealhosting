import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** Marketing pages use the named sizes in globals.css (text-title, text-h2, text-small…), never text-[1.75rem]. */
const roots = ["src/app/(marketing)", "src/components/marketing", "src/components/motion"];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? files(full) : full.endsWith(".tsx") ? [full] : [];
  });
}

describe("marketing type scale", () => {
  it("has no arbitrary rem font sizes", () => {
    const offenders = roots.flatMap(files).flatMap((file) => {
      const matches = readFileSync(file, "utf8").match(/text-\[[\d.]+rem\]/g) ?? [];
      return matches.map((m) => `${file}: ${m}`);
    });
    expect(offenders).toEqual([]);
  });
});
