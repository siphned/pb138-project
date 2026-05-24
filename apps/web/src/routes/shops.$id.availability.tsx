import { Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AvailabilityExceptionForm } from "@/components/shops/AvailabilityExceptionForm";
import { AvailabilityRegularForm } from "@/components/shops/AvailabilityRegularForm";
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
import { useDeleteShopsByIdAvailabilityExceptionsByEntryId } from "@/generated/hooks/useDeleteShopsByIdAvailabilityExceptionsByEntryId";
import { useDeleteShopsByIdAvailabilityRegularByEntryId } from "@/generated/hooks/useDeleteShopsByIdAvailabilityRegularByEntryId";
import { useGetShopsByIdAvailability } from "@/generated/hooks/useGetShopsByIdAvailability";
import type { GetShopsByIdAvailability200 } from "@/generated/types/GetShopsByIdAvailability";

export const Route = createFileRoute("/shops/$id/availability")({
  component: ShopAvailabilityPage,
});

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime(value: string | number): string {
  return String(value).slice(0, 5);
}

function formatDate(value: string | number): string {
  return new Date(String(value)).toLocaleDateString("en-IE");
}

type RegularEntry = GetShopsByIdAvailability200["regular"][number];
type ExceptionEntry = GetShopsByIdAvailability200["exceptions"][number];

function RegularTable({
  entries,
  shopId,
  onDelete,
}: {
  entries: RegularEntry[];
  shopId: string;
  onDelete: () => void;
}) {
  const deleteMutation = useDeleteShopsByIdAvailabilityRegularByEntryId();

  const handleDelete = (entryId: string) => {
    deleteMutation.mutate({ entryId, id: shopId }, { onSuccess: onDelete });
  };

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No regular hours configured yet.</p>;
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Day</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Valid From</TableHead>
            <TableHead>Valid To</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="text-sm font-medium">
                {DAY_NAMES[Number(entry.dow)] ?? entry.dow}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    entry.type === "open"
                      ? "bg-green-100/30 text-green-700 dark:text-green-400"
                      : "bg-destructive/30 text-destructive"
                  }`}
                >
                  {entry.type}
                </span>
              </TableCell>
              <TableCell className="text-sm">
                {entry.type === "open"
                  ? `${formatTime(entry.startTime)} – ${formatTime(entry.endTime)}`
                  : "—"}
              </TableCell>
              <TableCell className="text-sm">{formatDate(entry.validFrom)}</TableCell>
              <TableCell className="text-sm">
                {entry.validTo ? formatDate(entry.validTo) : "—"}
              </TableCell>
              <TableCell>
                <Button
                  disabled={deleteMutation.isPending}
                  onClick={() => handleDelete(entry.id)}
                  size="sm"
                  variant="ghost"
                >
                  <HugeiconsIcon className="h-4 w-4 text-destructive" icon={Delete01Icon} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ExceptionsTable({
  entries,
  shopId,
  onDelete,
}: {
  entries: ExceptionEntry[];
  shopId: string;
  onDelete: () => void;
}) {
  const deleteMutation = useDeleteShopsByIdAvailabilityExceptionsByEntryId();

  const handleDelete = (entryId: string) => {
    deleteMutation.mutate({ entryId, id: shopId }, { onSuccess: onDelete });
  };

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No exceptions configured.</p>;
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Starts</TableHead>
            <TableHead>Ends</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>
                <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-yellow-100/30 text-yellow-700 dark:text-yellow-400 capitalize">
                  {entry.action.replace("_", " ")}
                </span>
              </TableCell>
              <TableCell className="text-sm">{formatDate(entry.startsAt)}</TableCell>
              <TableCell className="text-sm">{formatDate(entry.endsAt)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{entry.reason ?? "—"}</TableCell>
              <TableCell>
                <Button
                  disabled={deleteMutation.isPending}
                  onClick={() => handleDelete(entry.id)}
                  size="sm"
                  variant="ghost"
                >
                  <HugeiconsIcon className="h-4 w-4 text-destructive" icon={Delete01Icon} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ShopAvailabilityPage() {
  const { id } = Route.useParams();
  const { data, isLoading, isError, refetch } = useGetShopsByIdAvailability(id);
  const [showRegularForm, setShowRegularForm] = useState(false);
  const [showExceptionForm, setShowExceptionForm] = useState(false);

  const regular = data?.regular ?? [];
  const exceptions = data?.exceptions ?? [];

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-8 px-6 py-8 lg:px-12">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton className="h-14 w-full" key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto max-w-4xl space-y-4 px-6 py-8 lg:px-12">
        <p className="text-destructive">Failed to load availability.</p>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-10 px-6 py-8 lg:px-12">
      <h1 className="text-2xl font-bold">Shop Availability</h1>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Regular Hours</h2>
          <Button onClick={() => setShowRegularForm((v) => !v)} size="sm" variant="outline">
            {showRegularForm ? "Cancel" : "Add Hours"}
          </Button>
        </div>

        {showRegularForm && (
          <div className="rounded-lg border border-border bg-card p-6">
            <AvailabilityRegularForm
              onSuccess={() => {
                setShowRegularForm(false);
                refetch();
              }}
              shopId={id}
            />
          </div>
        )}

        <RegularTable entries={regular} onDelete={() => refetch()} shopId={id} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Exceptions</h2>
          <Button onClick={() => setShowExceptionForm((v) => !v)} size="sm" variant="outline">
            {showExceptionForm ? "Cancel" : "Add Exception"}
          </Button>
        </div>

        {showExceptionForm && (
          <div className="rounded-lg border border-border bg-card p-6">
            <AvailabilityExceptionForm
              onSuccess={() => {
                setShowExceptionForm(false);
                refetch();
              }}
              shopId={id}
            />
          </div>
        )}

        <ExceptionsTable entries={exceptions} onDelete={() => refetch()} shopId={id} />
      </section>
    </div>
  );
}
