import { createRootRoute, Outlet } from "@tanstack/react-router";
<<<<<<< HEAD
import { PublicLayout } from "@/components/layout/PublicLayout";

export const Route = createRootRoute({
  component: () => (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  ),
=======

export const Route = createRootRoute({
  component: () => <Outlet />,
>>>>>>> origin/main
});
