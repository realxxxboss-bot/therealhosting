import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const path = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: "server-only", replacement: path("./tests/unit/server-only-stub.ts") },
      { find: /^@content\//, replacement: path("./content/") },
      { find: /^@\//, replacement: path("./src/") },
    ],
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
});
