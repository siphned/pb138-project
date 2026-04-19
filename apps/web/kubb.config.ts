import { defineConfig } from "@kubb/core";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginClient } from "@kubb/plugin-client";
import { pluginReactQuery } from "@kubb/plugin-react-query";

export default defineConfig({
  input: {
    path: "http://localhost:3000/swagger/json",
  },
  output: {
    path: "src/generated",
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
