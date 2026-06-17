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
import { useDeleteWinesById } from "@/generated/hooks/useDeleteWinesById";
import { getWinesQueryKey } from "@/generated/hooks/useGetWines";

interface WineRowMenuProps {
  wineId: string;
  wineName: string;
  /** Called after a successful delete (e.g. navigate away). The wine list is
   * refreshed automatically via query invalidation. */
  onDeleted?: () => void;
}

export function WineRowMenu({ wineId, wineName, onDeleted }: WineRowMenuProps) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutate, isPending } = useDeleteWinesById();

  const handleDelete = () => {
    mutate(
      { id: wineId },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          queryClient.invalidateQueries({ queryKey: getWinesQueryKey() });
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
            <Button aria-label={`Manage ${wineName}`} size="icon" variant="ghost">
              <HugeiconsIcon className="h-4 w-4" icon={MoreHorizontalCircle01Icon} />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link params={{ id: wineId }} to="/wines/$id/edit" />}>
            Edit wine
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link params={{ id: wineId }} to="/wines/$id/images" />}>
            Manage images
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setConfirmOpen(true)} variant="destructive">
            Delete wine
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {wineName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The wine will be removed from your catalog.
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
