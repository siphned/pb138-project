import { Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
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
import { useDeleteShopsByIdProductsByProductId } from "@/generated/hooks/useDeleteShopsByIdProductsByProductId";
import { getProductsQueryKey } from "@/generated/hooks/useGetProducts";

interface AdminProductDeleteButtonProps {
  shopId: string;
  productId: string;
  productName: string;
}

export function AdminProductDeleteButton({
  shopId,
  productId,
  productName,
}: AdminProductDeleteButtonProps) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutate, isPending } = useDeleteShopsByIdProductsByProductId();

  const handleDelete = () => {
    mutate(
      { id: shopId, productId },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          queryClient.invalidateQueries({ queryKey: getProductsQueryKey() });
        },
      }
    );
  };

  return (
    <>
      <Button
        aria-label={`Delete ${productName}`}
        onClick={() => setConfirmOpen(true)}
        size="icon-sm"
        variant="ghost"
      >
        <HugeiconsIcon className="h-4 w-4 text-destructive" icon={Delete01Icon} />
      </Button>

      <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {productName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the product from its shop. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel onClick={() => setConfirmOpen(false)} />
            <AlertDialogAction
              disabled={isPending}
              onClick={handleDelete}
              variant="solid-destructive"
            >
              {isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
