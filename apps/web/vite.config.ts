import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true, target: "react" }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@repo/shared": fileURLToPath(new URL("../../packages/shared/src/index.ts", import.meta.url)),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    proxy: {
      "^/(users|wines|shops|events|carts|orders|products|reviews|winemakers|stats|admin|guest-sessions|supply-agreements|availability|role-requests|images|webhooks|profile|uploads|swagger|openapi)": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
