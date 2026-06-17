import { ClerkProvider } from "@clerk/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { Button } from "./components/ui/button";
import { ThemeProvider, UserProvider } from "./context";
import { routeTree } from "./routeTree.gen.ts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

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
    <ThemeProvider>
      <ClerkProvider afterSignOutUrl="/" publishableKey={PUBLISHABLE_KEY}>
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <AppErrorBoundary
              fallback={
                <div className="flex flex-col items-center justify-center min-h-dvh p-8 text-center bg-background">
                  <h1 className="text-2xl font-bold text-foreground mb-4">Something went wrong</h1>
                  <p className="text-muted-foreground mb-8">
                    An unexpected error occurred. Please try reloading the application.
                  </p>
                  <Button className="px-6 py-2" onClick={() => window.location.reload()}>
                    Reload App
                  </Button>
                </div>
              }
            >
              <RouterProvider router={router} />
            </AppErrorBoundary>
          </UserProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </ThemeProvider>
  </StrictMode>
);
