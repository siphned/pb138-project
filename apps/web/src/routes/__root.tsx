import { createRootRoute, Outlet } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";

export const Route = createRootRoute({
  component: () => (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  ),
});
