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
import { getAdminUsersQueryKey } from "@/generated/hooks/useGetAdminUsers";
import { usePatchAdminUsersByIdStatus } from "@/generated/hooks/usePatchAdminUsersByIdStatus";

type Action = "suspend" | "ban" | "reactivate";

interface UserRowMenuProps {
  userId: string;
  userName: string;
  status?: string;
}

const ACTION_TO_STATUS: Record<Action, "active" | "suspended" | "banned"> = {
  ban: "banned",
  reactivate: "active",
  suspend: "suspended",
};

const ACTION_COPY: Record<Action, { title: string; description: string; confirm: string }> = {
  ban: {
    confirm: "Ban account",
    description: "will be permanently restricted from using the platform. Reversible by an admin.",
    title: "Ban user account",
  },
  reactivate: {
    confirm: "Reactivate account",
    description: "will be able to log in and use the platform again.",
    title: "Reactivate user account",
  },
  suspend: {
    confirm: "Suspend account",
    description: "will not be able to log in or perform any actions.",
    title: "Suspend user account",
  },
};

export function UserRowMenu({ userId, userName, status }: UserRowMenuProps) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = usePatchAdminUsersByIdStatus();
  const [pendingAction, setPendingAction] = useState<Action | null>(null);

  const handleConfirm = () => {
    if (!pendingAction) return;
    mutate(
      { data: { status: ACTION_TO_STATUS[pendingAction] }, id: userId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminUsersQueryKey() });
          setPendingAction(null);
        },
      }
    );
  };

  const copy = pendingAction ? ACTION_COPY[pendingAction] : null;
  const isActive = status === "active";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button aria-label={`Manage ${userName}`} size="icon" variant="ghost">
              <HugeiconsIcon className="h-4 w-4" icon={MoreHorizontalCircle01Icon} />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link params={{ id: userId }} to="/users/$id" />}>
            View details
          </DropdownMenuItem>
          {isActive ? (
            <>
              <DropdownMenuItem onClick={() => setPendingAction("suspend")}>
                Suspend account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPendingAction("ban")} variant="destructive">
                Ban account
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={() => setPendingAction("reactivate")}>
              Reactivate account
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        onOpenChange={(open) => !open && setPendingAction(null)}
        open={pendingAction !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{copy?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {userName} {copy?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={
                pendingAction === "reactivate"
                  ? ""
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }
              disabled={isPending}
              onClick={handleConfirm}
            >
              {isPending ? "Processing…" : (copy?.confirm ?? "Confirm")}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
