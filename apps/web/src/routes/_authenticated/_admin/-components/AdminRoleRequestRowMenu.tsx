import { MoreHorizontalCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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

  const handleApprove = () =>
    approve.mutate(
      { id: requestId },
      {
        onError: (err) => {
          const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response
            ?.data?.error?.message;
          toast.error(msg ?? "Failed to approve request");
        },
        onSuccess: () => {
          toast.success("Role request approved");
          refresh();
        },
      }
    );

  const handleReject = () =>
    reject.mutate(
      { id: requestId },
      {
        onError: (err) => {
          const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response
            ?.data?.error?.message;
          toast.error(msg ?? "Failed to decline request");
        },
        onSuccess: () => {
          toast.success("Role request declined");
          refresh();
        },
      }
    );

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
        <DropdownMenuItem onClick={handleApprove}>Accept</DropdownMenuItem>
        <DropdownMenuItem onClick={handleReject} variant="destructive">
          Decline
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
