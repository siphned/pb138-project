import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useRoles } from "@/hooks/useRoles";

export const Route = createFileRoute("/_authenticated/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const roles = useRoles();
  const navigate = useNavigate();
  const hasAccess = roles.includes("admin");

  useEffect(() => {
    if (!hasAccess) {
      navigate({ to: "/dashboard" }).catch(() => {
        // redirect errors are intentionally swallowed
      });
    }
  }, [hasAccess, navigate]);

  if (!hasAccess) return null;

  return <Outlet />;
}
