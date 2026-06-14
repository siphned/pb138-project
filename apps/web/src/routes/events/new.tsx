import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/primitives/page-header";
import { usePostEvents } from "@/generated/hooks/usePostEvents";
import { parseApiError } from "@/lib/api-errors";
import { axiosInstance } from "@/lib/axios";
import { EventForm, type EventFormValues } from "@/routes/events/-components/EventForm";

export const Route = createFileRoute("/events/new")({
  component: EventCreatePage,
});

async function uploadEventImage(eventId: string, file: File): Promise<void> {
  // Generated client posts { file: Blob } as JSON; multipart needs FormData.
  // Same workaround as shops.$id.images.tsx.
  const fd = new FormData();
  fd.append("file", file);
  await axiosInstance.post(`/events/${eventId}/images`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

function friendlyCreateError(code?: string, fallback?: string): string {
  switch (code) {
    case "INVALID_DATES":
      return "Start must be in the future and end must be after start.";
    case "WINEMAKER_NOT_FOUND":
      return "Only winemakers can create events.";
    default:
      return fallback ?? "Couldn't create the event. Please try again.";
  }
}

function EventCreatePage() {
  const navigate = useNavigate();
  const mutation = usePostEvents();
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (values: EventFormValues, imageFiles: File[]) => {
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
          endTime: values.endTime,
          inviteType: values.inviteType,
          name: values.name,
          startTime: values.startTime,
          visibility: values.visibility,
        },
      },
      {
        onSuccess: async (created) => {
          if (imageFiles.length > 0) {
            setIsUploading(true);
            try {
              for (const file of imageFiles) {
                await uploadEventImage(created.id, file);
              }
            } catch {
              // Image upload errors are non-fatal — event was created. Land on detail
              // page; user can retry uploads from the event images page.
            } finally {
              setIsUploading(false);
            }
          }
          navigate({ params: { id: created.id }, to: "/events/$id" });
        },
      }
    );
  };

  const apiError = parseApiError(mutation.error);
  const serverError = apiError ? friendlyCreateError(apiError.code, apiError.message) : null;

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
        description="Host a wine tasting, vineyard tour, or harvest celebration. Your event will be visible to customers immediately."
        title="Create a new event"
      />

      <div className="max-w-3xl">
        <EventForm
          defaultValues={{}}
          isPending={mutation.isPending || isUploading}
          onSubmit={handleSubmit}
          serverError={serverError}
          showImageUpload
          submitLabel={isUploading ? "Uploading images…" : "Create event"}
        />
      </div>
    </div>
  );
}
