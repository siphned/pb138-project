import { setConfig } from "@kubb/plugin-client/clients/axios";
import { ClerkProvider } from "@clerk/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AxiosInterceptor } from "./components/AxiosInterceptor.tsx";
import { UserProvider } from "./context/UserContext.tsx";
import { routeTree } from "./routeTree.gen.ts";

setConfig({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000" });

const queryClient = new QueryClient();
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env.local");
}

// biome-ignore lint/style/noNonNullAssertion: root element is guaranteed to exist in index.html
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider afterSignOutUrl="/" publishableKey={PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <AxiosInterceptor>
            <RouterProvider router={router} />
          </AxiosInterceptor>
        </UserProvider>
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>
);
