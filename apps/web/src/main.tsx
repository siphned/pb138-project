import { ClerkProvider } from "@clerk/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { Button } from "./components/ui/button";
import { UserProvider } from "./context/UserContext.tsx";
import { routeTree } from "./routeTree.gen.ts";

// Add artificial delay to query functions for smoother skeleton transitions
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey, signal }) => {
        // Global 200ms delay
        await new Promise((resolve) => setTimeout(resolve, 200));
        const url = queryKey.join("/");
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      },
      retry: 1, // 5 minutes
      staleTime: 1000 * 60 * 5,
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
    <ClerkProvider afterSignOutUrl="/" publishableKey={PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <AppErrorBoundary
            fallback={
              <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background">
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
  </StrictMode>
);
