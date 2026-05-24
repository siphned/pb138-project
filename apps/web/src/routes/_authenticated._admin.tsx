<<<<<<< HEAD
import { useAuth } from "@clerk/react";
=======
>>>>>>> origin/main
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useRoles } from "@/hooks/useRoles";

export const Route = createFileRoute("/_authenticated/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
<<<<<<< HEAD
  const { isLoaded } = useAuth();
  const roles = useRoles();
  const navigate = useNavigate();
  const hasAccess = isLoaded && roles.includes("admin");

  useEffect(() => {
    if (isLoaded && !hasAccess) {
      navigate({ to: "/dashboard" }).catch(() => {
        /* navigation already redirecting */
      });
    }
  }, [isLoaded, hasAccess, navigate]);

  if (!isLoaded) return null;
=======
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

>>>>>>> origin/main
  if (!hasAccess) return null;

  return <Outlet />;
}
