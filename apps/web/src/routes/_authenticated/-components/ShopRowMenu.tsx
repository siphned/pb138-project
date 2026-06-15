import { MoreHorizontalCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteShopsById } from "@/generated/hooks/useDeleteShopsById";
import { getShopsMeQueryKey } from "@/generated/hooks/useGetShopsMe";

interface ShopRowMenuProps {
  shopId: string;
  shopName: string;
}

export function ShopRowMenu({ shopId, shopName }: ShopRowMenuProps) {
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteShopsById();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmDelete = () => {
    deleteMutation.mutate(
      { id: shopId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getShopsMeQueryKey() });
          setConfirmOpen(false);
        },
      }
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button aria-label={`Manage ${shopName}`} size="icon" variant="ghost">
              <HugeiconsIcon className="h-4 w-4" icon={MoreHorizontalCircle01Icon} />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link params={{ id: shopId }} to="/shops/$id/edit" />}>
            Edit shop
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link params={{ id: shopId }} to="/shops/$id/images" />}>
            Manage images
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link params={{ id: shopId }} to="/shops/$id/availability" />}>
            Opening hours
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setConfirmOpen(true)} variant="destructive">
            Delete shop
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {shopName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This soft-deletes the shop and its inventory. Customers will no longer see it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
