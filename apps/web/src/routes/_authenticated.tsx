import { useAuth } from "@clerk/react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

export function AuthenticatedLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate({ to: "/auth/login" }).catch(() => {
        /* redirect errors intentionally swallowed; Clerk re-checks on next render */
      });
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div
          aria-label="Loading"
          className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"
          role="status"
        />
      </div>
    );
  }

  if (!isSignedIn) return null;

  return <Outlet />;
}
