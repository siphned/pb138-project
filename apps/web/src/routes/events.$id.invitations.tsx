import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/primitives/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetEventsByIdInvitations } from "@/generated/hooks/useGetEventsByIdInvitations";
import type { GetEventsByIdInvitations200 } from "@/generated/types/GetEventsByIdInvitations";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events/$id/invitations")({
  component: EventInvitationsPage,
});

function formatDate(value: string | number): string {
  return new Date(String(value)).toLocaleDateString("en-IE");
}

function getStatusBadgeClass(status: string): string {
  if (status === "accepted") {
    return "bg-green-100/30 text-green-700 dark:text-green-400";
  }
  if (status === "pending") {
    return "bg-yellow-100/30 text-yellow-700 dark:text-yellow-400";
  }
  if (status === "declined" || status === "expired") {
    return "bg-destructive/30 text-destructive";
  }
  return "bg-muted text-muted-foreground";
}

type Invitation = GetEventsByIdInvitations200[number];

function InvitationRow({ invitation }: { invitation: Invitation }) {
  const status = "pending";

  return (
    <TableRow>
      <TableCell className="text-sm">{invitation.email}</TableCell>
      <TableCell>
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-semibold",
            getStatusBadgeClass(status)
          )}
        >
          {status}
        </span>
      </TableCell>
      <TableCell className="text-sm">{formatDate(invitation.createdAt)}</TableCell>
      <TableCell className="text-sm font-mono text-muted-foreground">
        {new Date(String(invitation.expiresAt)).toLocaleDateString("en-IE")}
      </TableCell>
    </TableRow>
  );
}

function InvitationsTableBody({
  isLoading,
  invitations,
}: {
  isLoading: boolean;
  invitations: GetEventsByIdInvitations200;
}) {
  if (isLoading) {
    return Array.from({ length: 4 }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: 4 }).map((__, j) => (
          <TableCell key={j}>
            <Skeleton className="h-5 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ));
  }
  if (invitations.length === 0) {
    return (
      <TableRow>
        <TableCell className="text-center text-muted-foreground" colSpan={4}>
          No invitations sent yet.
        </TableCell>
      </TableRow>
    );
  }
  return invitations.map((invitation) => (
    <InvitationRow invitation={invitation} key={invitation.id} />
  ));
}

function EventInvitationsPage() {
  const { id } = Route.useParams();
  const { data, isLoading, isError } = useGetEventsByIdInvitations(id);
  const invitations = data || [];

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <PageHeader
        description="Winemakers invited to co-host this event."
        title="Event Invitations"
      />

      {isError && (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p>Failed to load invitations.</p>
        </div>
      )}

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent Date</TableHead>
              <TableHead>Expires</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <InvitationsTableBody invitations={invitations} isLoading={isLoading} />
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
