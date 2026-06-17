import { MoreHorizontalCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAdminUsersQueryKey } from "@/generated/hooks/useGetAdminUsers";
import { usePatchAdminUsersByIdStatus } from "@/generated/hooks/usePatchAdminUsersByIdStatus";

interface AdminUserRowMenuProps {
  userId: string;
  status: string;
}

export function AdminUserRowMenu({ userId, status }: AdminUserRowMenuProps) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = usePatchAdminUsersByIdStatus();

  const setStatus = (next: "active" | "suspended" | "banned") => {
    mutate(
      { data: { status: next }, id: userId },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getAdminUsersQueryKey() }),
      }
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button aria-label="User actions" disabled={isPending} size="icon-sm" variant="ghost">
            <HugeiconsIcon className="h-4 w-4" icon={MoreHorizontalCircle01Icon} />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {status !== "suspended" && (
          <DropdownMenuItem onClick={() => setStatus("suspended")}>Suspend</DropdownMenuItem>
        )}
        {status !== "banned" && (
          <DropdownMenuItem onClick={() => setStatus("banned")} variant="destructive">
            Ban
          </DropdownMenuItem>
        )}
        {status !== "active" && (
          <DropdownMenuItem onClick={() => setStatus("active")}>Unban</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
