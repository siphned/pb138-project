import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useGetRoleRequestsById } from "@/generated/hooks/useGetRoleRequestsById";
import { usePatchRoleRequestsByIdApprove } from "@/generated/hooks/usePatchRoleRequestsByIdApprove";
import { usePatchRoleRequestsByIdReject } from "@/generated/hooks/usePatchRoleRequestsByIdReject";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/_admin/role-requests/$id")({
  component: AdminRoleRequestDetail,
});

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex conditional rendering needed for detail page
function AdminRoleRequestDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: request, isLoading, error } = useGetRoleRequestsById(id);
  const approveMutation = usePatchRoleRequestsByIdApprove();
  const rejectMutation = usePatchRoleRequestsByIdReject();
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  if (error || (!isLoading && !request)) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 p-6">
        <button
          className="inline-flex items-center gap-2 text-primary hover:underline mb-4"
          onClick={() => navigate({ to: "/role-requests" })}
          type="button"
        >
          <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
          Back to Requests
        </button>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p>Role request not found</p>
        </div>
      </main>
    );
  }

  const handleApprove = async () => {
    await approveMutation.mutateAsync({ id });
    navigate({ to: "/role-requests" });
  };

  const handleReject = async () => {
    await rejectMutation.mutateAsync({ id });
    navigate({ to: "/role-requests" });
  };

  const isPending = request?.status === "pending";
  const isProcessing = approveMutation.isPending || rejectMutation.isPending;

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <button
        className="inline-flex items-center gap-2 text-primary hover:underline mb-2"
        onClick={() => navigate({ to: "/role-requests" })}
        type="button"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to Requests
      </button>

      <h1 className="text-2xl font-semibold">Role Request Review</h1>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : null}

      {request ? (
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Applicant Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-mono text-sm">{request.userId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Business Name</p>
                <p className="font-medium">{request.businessName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Application Date</p>
                <p>
                  {new Date(request.submittedAt).toLocaleDateString()} at{" "}
                  {new Date(request.submittedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Request Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Requested Role</p>
                <Badge className="bg-blue-100/30 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {request.type === "winemaker" ? "Winemaker" : "Shop Owner"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Justification</p>
                <p className="whitespace-pre-wrap rounded-md bg-muted/50 p-3">
                  {request.details || "—"}
                </p>
              </div>
            </div>
          </Card>

          {isPending ? (
            <Card className="border-yellow-200/50 p-6 dark:border-yellow-900/50">
              <h2 className="mb-4 text-lg font-semibold">Decision</h2>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This request is pending review. Choose to approve or reject.
                </p>

                {showRejectReason && (
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground" htmlFor="reject-reason">
                      Rejection reason (optional)
                    </label>
                    <Textarea
                      className="min-h-24"
                      disabled={isProcessing}
                      id="reject-reason"
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Explain why this request is being rejected..."
                      value={rejectReason}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    className="bg-green-600 text-white hover:bg-green-700"
                    disabled={isProcessing}
                    onClick={handleApprove}
                  >
                    {approveMutation.isPending ? "Approving..." : "Approve"}
                  </Button>
                  {!showRejectReason ? (
                    <Button
                      className="border-destructive text-destructive hover:bg-destructive/10"
                      disabled={isProcessing}
                      onClick={() => setShowRejectReason(true)}
                      variant="outline"
                    >
                      Reject
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="bg-destructive text-white hover:bg-destructive/90"
                        disabled={isProcessing}
                        onClick={handleReject}
                      >
                        {rejectMutation.isPending ? "Rejecting..." : "Confirm Reject"}
                      </Button>
                      <Button
                        disabled={isProcessing}
                        onClick={() => {
                          setShowRejectReason(false);
                          setRejectReason("");
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card
              className={cn(
                "p-6",
                request.status === "approved"
                  ? "border-green-200/50 dark:border-green-900/50"
                  : "border-destructive/30 dark:border-destructive/50"
              )}
            >
              <h2 className="mb-4 text-lg font-semibold">Decision Status</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Status</p>
                  <Badge
                    className={
                      request.status === "approved"
                        ? "bg-green-100/30 text-green-700 dark:bg-green-950 dark:text-green-300"
                        : "bg-destructive/20 text-destructive dark:text-red-400"
                    }
                  >
                    {request.status === "approved" ? "Approved" : "Rejected"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  This request has been {request.status}.
                </p>
              </div>
            </Card>
          )}
        </div>
      ) : null}
    </main>
  );
}
