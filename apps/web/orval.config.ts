import { defineConfig } from "orval";

export default defineConfig({
  winemarket: {
    input: {
      target: "../server/openapi.json",
    },
    output: {
      client: "react-query",
      httpClient: "axios",
      mode: "tags-split",
      override: {
        mutator: {
          name: "customInstance",
          path: "./src/lib/custom-instance.ts",
        },
        query: {
          signal: true,
          useInfinite: false,
          useInvalidate: true,
          useMutation: true,
          useQuery: true,
        },
      },
      schemas: "src/generated/model",
      target: "src/generated",
    },
  },
});
