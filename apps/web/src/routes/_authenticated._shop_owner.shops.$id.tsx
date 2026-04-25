import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_shop_owner/shops/$id")({
  component: ShopLayout,
});

function ShopLayout() {
  // In a real app, we might verify shop ownership here via an API call
  // For now, it's a layout that passes down the shop context
  return (
    <div class="flex flex-col gap-4">
      <div class="border-b pb-4">
        <h1 class="text-2xl font-bold">Shop Management</h1>
      </div>
      <Outlet />
    </div>
  );
}
