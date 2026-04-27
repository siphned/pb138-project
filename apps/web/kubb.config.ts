import { defineConfig } from "@kubb/core";
import { pluginClient } from "@kubb/plugin-client";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginReactQuery } from "@kubb/plugin-react-query";
import { pluginTs } from "@kubb/plugin-ts";

export default defineConfig({
  input: {
    path: "../server/openapi.json",
  },
  output: {
    path: "src/generated",
    format: false,
  },
  plugins: [
    pluginOas(),
    pluginTs(),
    pluginClient({
      output: { path: "clients" },
    }),
    pluginReactQuery({
      output: { path: "hooks" },
    }),
  ],
});
