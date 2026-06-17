import { defineConfig } from "@kubb/core";
import { pluginClient } from "@kubb/plugin-client";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginReactQuery } from "@kubb/plugin-react-query";
import { pluginTs } from "@kubb/plugin-ts";

// Run `bun run generate` in apps/server first to produce openapi.json,
// then run `bun run generate` here (or `turbo generate` from the root).

export default defineConfig({
  input: {
    path: "../server/openapi.json",
  },
  output: {
    clean: true,
    format: false,
    path: "./src/generated",
  },
  plugins: [
    pluginOas({ generators: [] }),

    // 1. TypeScript types for all schemas
    pluginTs({
      output: { path: "types" },
    }),

    // 2. Axios-based fetch functions
    pluginClient({
      importPath: "../../lib/axios",
      output: { path: "clients" },
    }),

    // 3. TanStack Query hooks (useQuery / useMutation)
    pluginReactQuery({
      client: {
        importPath: "../../lib/axios",
      },
      output: { path: "hooks" },
    }),
  ],
  root: ".",
});
