import { defineConfig } from "orval";

export default defineConfig({
  winemarket: {
    input: {
      target: "../server/openapi.json",
    },
    output: {
      mode: "tags-split",
      target: "src/generated",
      schemas: "src/generated/model",
      client: "react-query",
      httpClient: "axios",
      override: {
        mutator: {
          path: "./src/lib/custom-instance.ts",
          name: "customInstance",
        },
        query: {
          useQuery: true,
          useMutation: true,
          useInfinite: false,
          useInvalidate: true,
          signal: true,
        },
      },
    },
  },
});
