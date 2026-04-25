import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import appCss from "@/styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "PB138 — University App" },
      ],
      links: [{ rel: "stylesheet", href: appCss }],
    }),
    component: RootLayout,
    shellComponent: RootDocument,
  },
);

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootLayout() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="mx-auto max-w-[900px] p-8">
        <nav className="mb-8 flex items-center gap-6">
          <Link to="/" className="text-lg font-bold">
            PB138 University
          </Link>
          <Link
            to="/courses"
            activeProps={{ className: "font-semibold text-foreground" }}
            className="text-muted-foreground hover:text-foreground"
          >
            Courses
          </Link>
          <Link
            to="/students"
            activeProps={{ className: "font-semibold text-foreground" }}
            className="text-muted-foreground hover:text-foreground"
          >
            Students
          </Link>
        </nav>

        <main>
          <Outlet />
        </main>
      </div>

      <TanStackRouterDevtools position="bottom-right" />
    </QueryClientProvider>
  );
}
