import { MoreHorizontalCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
import { useDeleteShopsByIdProductsByProductId } from "@/generated/hooks/useDeleteShopsByIdProductsByProductId";

interface ProductRowMenuProps {
  shopId: string;
  productId: string;
  productName: string;
  /** Called after a successful delete (e.g. refetch the inventory list). */
  onDeleted?: () => void;
}

export function ProductRowMenu({ shopId, productId, productName, onDeleted }: ProductRowMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutate, isPending } = useDeleteShopsByIdProductsByProductId();

  const handleDelete = () => {
    mutate(
      { id: shopId, productId },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          onDeleted?.();
        },
      }
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button aria-label={`Manage ${productName}`} size="icon" variant="ghost">
              <HugeiconsIcon className="h-4 w-4" icon={MoreHorizontalCircle01Icon} />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={
              <Link
                params={{ id: shopId, productId }}
                search={{ isBundle: undefined }}
                to="/shops/$id/inventory/$productId/edit"
              />
            }
          >
            Edit product
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setConfirmOpen(true)} variant="destructive">
            Delete product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {productName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be removed from your shop and its stock
              allocations reverted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel onClick={() => setConfirmOpen(false)} />
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
