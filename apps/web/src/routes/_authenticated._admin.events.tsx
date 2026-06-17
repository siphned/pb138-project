import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetAdminEvents } from "@/hooks/useGetAdminEvents";
import { usePostAdminEventsByIdApprove } from "@/hooks/usePostAdminEventsByIdApprove";
import { usePostAdminEventsByIdReject } from "@/hooks/usePostAdminEventsByIdReject";

export const Route = createFileRoute("/_authenticated/_admin/events")({
  component: AdminEventsPage,
});

function getStatusBadgeClass(status: string): string {
  if (status === "approved") {
    return "bg-green-100/30 text-green-700 dark:text-green-400";
  }
  if (status === "rejected") {
    return "bg-destructive/30 text-destructive dark:text-red-400";
  }
  return "bg-yellow-100/30 text-yellow-700 dark:text-yellow-400";
}

function AdminEventsPage() {
  const { data, isLoading, error, refetch } = useGetAdminEvents();
  const approveEvent = usePostAdminEventsByIdApprove();
  const rejectEvent = usePostAdminEventsByIdReject();
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // biome-ignore lint/suspicious/noExplicitAny: API response is untyped
  const events = (data as any)?.data || data || [];

  const handleApprove = async (eventId: string) => {
    setActionInProgress(eventId);
    try {
      await approveEvent.mutateAsync({ id: eventId });
      await refetch();
    } catch {
      // Error handled by mutation hook
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (eventId: string) => {
    setActionInProgress(eventId);
    try {
      await rejectEvent.mutateAsync({ id: eventId });
      await refetch();
    } catch {
      // Error handled by mutation hook
    } finally {
      setActionInProgress(null);
    }
  };

  if (error) {
    return (
      <main className="mx-auto max-w-6xl space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Event Moderation</h1>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p>Failed to load events: {error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Event Moderation</h1>
      <p className="text-muted-foreground">Review and approve pending events</p>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton className="h-12 w-full" key={i} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Organizer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground" colSpan={5}>
                    No events to moderate
                  </TableCell>
                </TableRow>
              ) : (
                // biome-ignore lint/suspicious/noExplicitAny: API response is untyped
                events.map((event: any) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title || "—"}</TableCell>
                    <TableCell className="text-sm">
                      {event.winemaker?.name || event.organizer || "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {event.startDate ? new Date(event.startDate).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(event.status || "pending")}`}
                      >
                        {event.status || "pending"}
                      </span>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        disabled={
                          actionInProgress === event.id ||
                          event.status !== "pending" ||
                          approveEvent.isPending ||
                          rejectEvent.isPending
                        }
                        onClick={() => handleApprove(event.id)}
                        size="sm"
                        variant="outline"
                      >
                        Approve
                      </Button>
                      <Button
                        disabled={
                          actionInProgress === event.id ||
                          event.status !== "pending" ||
                          approveEvent.isPending ||
                          rejectEvent.isPending
                        }
                        onClick={() => handleReject(event.id)}
                        size="sm"
                        variant="destructive"
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
