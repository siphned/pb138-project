import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { LoaderCircle } from "lucide-react";

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 10, // 10 minutes
      },
    },
  });

  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    context: { queryClient },
    // The default pendingComponent a route should use if no pending component is provided.
    defaultPendingComponent: () => (
      <div className="flex justify-center p-8">
        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
    // By default, TanStack Router will delay showing the pending component for 500ms to avoid flashing it for fast loads.
    defaultPendingMs: 1000,
    // The minimum amount of time to show the pending component once it's shown. This prevents it from flashing away too quickly.
    defaultPendingMinMs: 500,
    defaultNotFoundComponent: () => (
      <div className="p-8 text-center">
        <h2 className="mb-2 text-xl font-bold">Page not found</h2>
        <p className="mb-4 text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="text-sm underline">
          Back to home
        </Link>
      </div>
    ),
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
