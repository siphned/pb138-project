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
import { getRoleRequestsQueryKey } from "@/generated/hooks/useGetRoleRequests";
import { usePatchRoleRequestsByIdApprove } from "@/generated/hooks/usePatchRoleRequestsByIdApprove";
import { usePatchRoleRequestsByIdReject } from "@/generated/hooks/usePatchRoleRequestsByIdReject";

interface AdminRoleRequestRowMenuProps {
  requestId: string;
  status: string;
}

export function AdminRoleRequestRowMenu({ requestId, status }: AdminRoleRequestRowMenuProps) {
  const queryClient = useQueryClient();
  const approve = usePatchRoleRequestsByIdApprove();
  const reject = usePatchRoleRequestsByIdReject();
  const isPending = approve.isPending || reject.isPending;

  if (status !== "pending") {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  const refresh = () => queryClient.invalidateQueries({ queryKey: getRoleRequestsQueryKey() });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label="Role request actions"
            disabled={isPending}
            size="icon-sm"
            variant="ghost"
          >
            <HugeiconsIcon className="h-4 w-4" icon={MoreHorizontalCircle01Icon} />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => approve.mutate({ id: requestId }, { onSuccess: refresh })}>
          Accept
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => reject.mutate({ id: requestId }, { onSuccess: refresh })}
          variant="destructive"
        >
          Decline
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
