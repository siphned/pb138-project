import { useAuth } from "@clerk/react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useRoles } from "@/hooks/useRoles";

export const Route = createFileRoute("/_authenticated/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isLoaded } = useAuth();
  const roles = useRoles();
  const navigate = useNavigate();
  const hasAccess = isLoaded && roles.includes("admin");

  useEffect(() => {
    if (isLoaded && !hasAccess) {
      navigate({ to: "/dashboard" }).catch(() => {
        // Suppress navigation errors, already redirecting
      });
    }
  }, [isLoaded, hasAccess, navigate]);

  if (!isLoaded) return null;
  if (!hasAccess) return null;

  return <Outlet />;
}
