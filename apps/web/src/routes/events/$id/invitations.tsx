import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { Badge } from "@/components/ui/badge";
import { useGetEventsByIdInvitations } from "@/generated/hooks/useGetEventsByIdInvitations";

export const Route = createFileRoute("/events/$id/invitations")({
  component: EventInvitationsPage,
});

function EventInvitationsPage() {
  const { id } = Route.useParams();
  const { data: invitations, isLoading, isError, refetch } = useGetEventsByIdInvitations(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <LoadingState variant="list" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        params={{ id }}
        to="/events/$id"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to event
      </Link>

      <PageHeader
        description="Winemakers invited to co-host this event."
        title="Event invitations"
      />

      {!invitations || invitations.length === 0 ? (
        <p className="text-muted-foreground">No invitations sent for this event yet.</p>
      ) : (
        <div className="space-y-3">
          {invitations.map((inv) => (
            <div
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
              key={inv.id}
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{inv.email}</p>
                <p className="text-xs text-muted-foreground">
                  Sent {new Date(inv.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={inv.deletedAt ? "secondary" : "outline"}>
                {inv.deletedAt ? "Revoked" : "Pending"}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
