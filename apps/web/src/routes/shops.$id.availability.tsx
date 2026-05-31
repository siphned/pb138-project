import { ArrowLeft02Icon, Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { Section } from "@/components/primitives/section";
import { AvailabilityExceptionForm } from "@/components/shops/AvailabilityExceptionForm";
import { AvailabilityRegularForm } from "@/components/shops/AvailabilityRegularForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteShopsByIdAvailabilityExceptionsByEntryId } from "@/generated/hooks/useDeleteShopsByIdAvailabilityExceptionsByEntryId";
import { useDeleteShopsByIdAvailabilityRegularByEntryId } from "@/generated/hooks/useDeleteShopsByIdAvailabilityRegularByEntryId";
import {
  getShopsByIdAvailabilityQueryKey,
  useGetShopsByIdAvailability,
} from "@/generated/hooks/useGetShopsByIdAvailability";

export const Route = createFileRoute("/shops/$id/availability")({
  component: AvailabilityPage,
});

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTime(value: unknown): string {
  if (!value) return "";
  const s = String(value);
  if (s.includes("T")) {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
  }
  return s.slice(0, 5);
}

function formatDate(value: unknown): string {
  if (!value) return "";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function AvailabilityPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const queryKey = getShopsByIdAvailabilityQueryKey(id);
  const { data, isLoading, isError, refetch } = useGetShopsByIdAvailability(id);
  const deleteRegular = useDeleteShopsByIdAvailabilityRegularByEntryId();
  const deleteException = useDeleteShopsByIdAvailabilityExceptionsByEntryId();

  const [openRegular, setOpenRegular] = useState(false);
  const [openException, setOpenException] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <LoadingState variant="detail" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <ErrorState
          message="Could not load this shop's availability."
          onRetry={() => refetch()}
          title="Failed to load"
        />
      </div>
    );
  }

  const regular = (data.regular ?? []) as Array<{
    id: string;
    dow: string | number;
    startTime: unknown;
    endTime: unknown;
    type: string;
    validFrom: string;
    validTo: string | null;
  }>;

  const exceptions = (data.exceptions ?? []) as Array<{
    id: string;
    action: string;
    startsAt: unknown;
    endsAt: unknown;
    reason: string | null;
  }>;

  const regularByDay = DAYS.map((dayName, dow) => ({
    dayName,
    entries: regular.filter((r) => Number(r.dow) === dow),
  }));

  return (
    <div className="container mx-auto space-y-10 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        params={{ id }}
        to="/shops/$id/edit"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to shop settings
      </Link>

      <PageHeader
        description="Set the weekly hours your shop is open, plus any one-off exceptions like holidays."
        title="Opening hours"
      />

      <Section
        actions={<Button onClick={() => setOpenRegular(true)}>+ Add hours</Button>}
        heading="Regular weekly hours"
      >
        {regular.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No regular hours set yet. Add a row for each day you're open.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {regularByDay.map(({ dayName, entries }) => (
              <li className="p-4" key={dayName}>
                <div className="flex items-start justify-between gap-4">
                  <div className="w-28 font-medium text-foreground">{dayName}</div>
                  <div className="flex-1">
                    {entries.length === 0 ? (
                      <span className="text-sm text-muted-foreground">Closed</span>
                    ) : (
                      <ul className="space-y-2">
                        {entries.map((e) => (
                          <li className="flex items-center justify-between gap-3" key={e.id}>
                            <div className="text-sm">
                              <span className="font-medium text-foreground">
                                {e.type === "closed"
                                  ? "Closed"
                                  : `${formatTime(e.startTime)} – ${formatTime(e.endTime)}`}
                              </span>
                              <span className="ml-2 text-xs text-muted-foreground">
                                from {formatDate(e.validFrom)}
                                {e.validTo ? ` to ${formatDate(e.validTo)}` : ""}
                              </span>
                            </div>
                            <Button
                              aria-label={`Delete ${dayName} hours`}
                              disabled={deleteRegular.isPending}
                              onClick={() =>
                                deleteRegular.mutate(
                                  { entryId: e.id, id },
                                  { onSuccess: invalidate }
                                )
                              }
                              size="icon"
                              variant="ghost"
                            >
                              <HugeiconsIcon
                                className="h-4 w-4 text-destructive"
                                icon={Delete01Icon}
                              />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        actions={<Button onClick={() => setOpenException(true)}>+ Add exception</Button>}
        heading="Exceptions"
      >
        {exceptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No exceptions yet. Use these for holidays, private events, or temporary closures.
          </p>
        ) : (
          <ul className="space-y-3">
            {exceptions.map((ex) => (
              <li key={ex.id}>
                <Card variant="section">
                  <CardContent className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-medium text-foreground">
                          {ex.action === "closed"
                            ? "Closed"
                            : ex.action === "modified_hours"
                              ? "Modified hours"
                              : "Special event"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(ex.startsAt)} – {formatDate(ex.endsAt)}
                        </span>
                      </div>
                      {ex.reason && (
                        <p className="text-sm text-muted-foreground">{ex.reason}</p>
                      )}
                    </div>
                    <Button
                      aria-label="Delete exception"
                      disabled={deleteException.isPending}
                      onClick={() =>
                        deleteException.mutate(
                          { entryId: ex.id, id },
                          { onSuccess: invalidate }
                        )
                      }
                      size="icon"
                      variant="ghost"
                    >
                      <HugeiconsIcon className="h-4 w-4 text-destructive" icon={Delete01Icon} />
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Dialog onOpenChange={setOpenRegular} open={openRegular}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add weekly hours</DialogTitle>
            <DialogDescription>
              Set the open hours for a single day. Repeat to cover the whole week.
            </DialogDescription>
          </DialogHeader>
          <AvailabilityRegularForm
            onSuccess={() => {
              invalidate();
              setOpenRegular(false);
            }}
            shopId={id}
          />
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setOpenException} open={openException}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add exception</DialogTitle>
            <DialogDescription>
              Closures, modified hours, or special events that override your weekly schedule.
            </DialogDescription>
          </DialogHeader>
          <AvailabilityExceptionForm
            onSuccess={() => {
              invalidate();
              setOpenException(false);
            }}
            shopId={id}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
