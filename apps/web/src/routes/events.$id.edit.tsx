import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EventEditForm, type EventEditFormValues } from "@/components/events/EventEditForm";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { useGetEventsById } from "@/generated/hooks/useGetEventsById";
import { usePatchEventsById } from "@/generated/hooks/usePatchEventsById";
import { parseApiError } from "@/lib/api-errors";

export const Route = createFileRoute("/events/$id/edit")({
  component: EventEditPage,
});

function toIsoOrEmpty(value: unknown): string {
  if (!value) return "";
  const d = new Date(value as string | number);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function friendlyUpdateError(code?: string, fallback?: string): string {
  switch (code) {
    case "INVALID_DATES":
      return "Start must be in the future and end must be after start.";
    case "EVENT_STATUS_CONFLICT":
      return "This event has already started and can't be edited.";
    case "CAPACITY_TOO_LOW":
      return "Capacity can't be lower than the current number of registrations.";
    default:
      return fallback ?? "Couldn't save the event. Please try again.";
  }
}

function EventEditPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: event, isLoading, isError, refetch } = useGetEventsById(id);
  const mutation = usePatchEventsById();

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <LoadingState variant="detail" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <ErrorState
          message="We couldn't load the event to edit."
          onRetry={() => refetch()}
          title="Event not found"
        />
      </div>
    );
  }

  const handleSubmit = (values: EventEditFormValues) => {
    mutation.mutate(
      {
        data: {
          capacity: values.capacity,
          description: values.description?.trim() || null,
          endTime: values.endTime,
          name: values.name,
          startTime: values.startTime,
        },
        id,
      },
      {
        onSuccess: () => navigate({ params: { id }, to: "/events/$id" }),
      }
    );
  };

  const apiError = parseApiError(mutation.error);
  const serverError = apiError ? friendlyUpdateError(apiError.code, apiError.message) : null;

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
        description="Update the name, description, dates, or capacity."
        title="Edit event"
      />

      <div className="max-w-3xl">
        <EventEditForm
          defaultValues={{
            capacity: typeof event.capacity === "number" ? event.capacity : 30,
            description: event.description ?? "",
            endTime: toIsoOrEmpty(event.endTime),
            name: event.name ?? "",
            startTime: toIsoOrEmpty(event.startTime),
          }}
          isPending={mutation.isPending}
          onSubmit={handleSubmit}
          serverError={serverError}
        />
      </div>
    </div>
  );
}
