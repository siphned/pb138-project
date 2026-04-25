import * as Sentry from "@sentry/react";
import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { LoaderCircle } from "lucide-react";

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 10,
      },
    },
  });

  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    context: { queryClient },
    defaultPendingComponent: () => (
      <div className="flex justify-center p-8">
        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
    defaultPendingMs: 1000,
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

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.tanstackRouterBrowserTracingIntegration(router),
    ],
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
