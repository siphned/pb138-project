import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/primitives/page-header";
import { usePostWinemakers } from "@/generated/hooks/usePostWinemakers";
import {
  WinemakerForm,
  type WinemakerFormValues,
} from "@/routes/winemakers/-components/WinemakerForm";

export const Route = createFileRoute("/winemakers/new")({
  component: WinemakerCreatePage,
});

function WinemakerCreatePage() {
  const navigate = useNavigate();
  const mutation = usePostWinemakers();

  const handleSubmit = (values: WinemakerFormValues) => {
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
          description: values.description,
          name: values.name,
        },
      },
      {
        onSuccess: (created) => {
          navigate({ params: { id: created.id }, to: "/winemakers/$id" });
        },
      }
    );
  };

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        to="/dashboard"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to dashboard
      </Link>

      <PageHeader
        description="Set up your winemaker profile so you can list wines and receive supply requests."
        title="Set up your winemaker profile"
      />

      {mutation.isError && (
        <div className="max-w-2xl rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Could not create your winemaker profile. Please try again."}
        </div>
      )}

      <div className="max-w-2xl">
        <WinemakerForm
          defaultValues={{}}
          isPending={mutation.isPending}
          onSubmit={handleSubmit}
          submitLabel="Create profile"
        />
      </div>
    </div>
  );
}
