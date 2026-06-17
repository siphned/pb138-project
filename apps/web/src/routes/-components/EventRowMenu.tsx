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
import { useDeleteEventsById } from "@/generated/hooks/useDeleteEventsById";
import { getEventsQueryKey } from "@/generated/hooks/useGetEvents";

interface EventRowMenuProps {
  eventId: string;
  eventName: string;
  /** Called after a successful delete (e.g. navigate away). The event list is
   * refreshed automatically via query invalidation. */
  onDeleted?: () => void;
}

export function EventRowMenu({ eventId, eventName, onDeleted }: EventRowMenuProps) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutate, isPending } = useDeleteEventsById();

  const handleDelete = () => {
    mutate(
      { id: eventId },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          queryClient.invalidateQueries({ queryKey: getEventsQueryKey() });
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
            <Button aria-label={`Manage ${eventName}`} size="icon" variant="ghost">
              <HugeiconsIcon className="h-4 w-4" icon={MoreHorizontalCircle01Icon} />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link params={{ id: eventId }} to="/events/$id/edit" />}>
            Edit event
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setConfirmOpen(true)} variant="destructive">
            Delete event
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {eventName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The event will be removed.
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
