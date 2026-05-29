import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EventForm, type EventFormValues } from "@/components/events/EventForm";
import { PageHeader } from "@/components/primitives/page-header";
import { usePostEvents } from "@/generated/hooks/usePostEvents";

export const Route = createFileRoute("/events/new")({
  component: EventCreatePage,
});

function toIsoString(local: string): string {
  return new Date(local).toISOString();
}

function EventCreatePage() {
  const navigate = useNavigate();
  const mutation = usePostEvents();

  const handleSubmit = (values: EventFormValues) => {
    mutation.mutate(
      {
        data: {
          address: {
            city: values.city,
            country: values.country,
            houseNumber: values.houseNumber,
            postalCode: values.postalCode,
            street: values.street,
          },
          capacity: values.capacity,
          description: values.description?.trim() || undefined,
          endTime: toIsoString(values.endTime),
          inviteType: values.inviteType,
          name: values.name,
          startTime: toIsoString(values.startTime),
          visibility: values.visibility,
        },
      },
      {
        onSuccess: (created) => {
          navigate({ params: { id: created.id }, to: "/events/$id" });
        },
      }
    );
  };

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        to="/events"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to events
      </Link>

      <PageHeader
        description="Host a wine tasting, vineyard tour, or harvest celebration. Your event goes live after admin approval."
        title="Create a new event"
      />

      <div className="max-w-3xl">
        <EventForm
          defaultValues={{}}
          isPending={mutation.isPending}
          onSubmit={handleSubmit}
          submitLabel="Create event"
        />
      </div>
    </div>
  );
}
