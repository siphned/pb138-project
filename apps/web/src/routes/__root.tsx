import { PublicLayout } from "@/components/layout/PublicLayout";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => <PublicLayout><Outlet /></PublicLayout>,
});
