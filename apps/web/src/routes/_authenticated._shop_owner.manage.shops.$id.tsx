import { Alert02Icon, Loading03Icon, ShieldMinusIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { useGetShopsById } from "@/generated/hooks/useGetShopsById";

export const Route = createFileRoute("/_authenticated/_shop_owner/manage/shops/$id")({
  component: ShopOwnerLayout,
});

function ShopOwnerLayout() {
  const { id } = Route.useParams();
  const { user } = useUser();

  const { data: shop, isLoading, isError } = useGetShopsById(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24">
        <HugeiconsIcon
          className="h-6 w-6 animate-spin text-muted-foreground"
          icon={Loading03Icon}
        />
        <span className="text-muted-foreground">Loading shop...</span>
      </div>
    );
  }

  if (isError || !shop) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <HugeiconsIcon className="h-12 w-12 text-destructive" icon={Alert02Icon} />
        <h2 className="text-xl font-semibold">Shop not found</h2>
        <p className="text-muted-foreground">
          The shop you are looking for does not exist or has been removed.
        </p>
        <Button onClick={() => window.history.back()} variant="outline">
          Go back
        </Button>
      </div>
    );
  }

  if (!user || shop.ownerUserId !== user.id) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <HugeiconsIcon className="h-12 w-12 text-destructive" icon={ShieldMinusIcon} />
        <h2 className="text-xl font-semibold">Access denied</h2>
        <p className="max-w-md text-center text-muted-foreground">
          You do not have permission to manage this shop. Only the shop owner can access management
          features.
        </p>
        <Button onClick={() => window.history.back()} variant="outline">
          Go back
        </Button>
      </div>
    );
  }

  return <Outlet />;
}
