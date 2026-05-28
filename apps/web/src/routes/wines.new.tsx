import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { WineForm, type WineFormValues } from "@/components/catalog/WineForm";
import { PageHeader } from "@/components/primitives/page-header";
import { usePostWines } from "@/generated/hooks/usePostWines";

export const Route = createFileRoute("/wines/new")({
  component: WineCreatePage,
});

function WineCreatePage() {
  const navigate = useNavigate();
  const mutation = usePostWines();

  const handleSubmit = (values: WineFormValues) => {
    mutation.mutate(
      {
        data: {
          alcoholContent: values.alcoholContent,
          attribution: values.attribution,
          color: values.color,
          composition: values.composition,
          description: values.description,
          name: values.name,
          quantity: values.quantity,
          region: values.region,
          type: values.type,
          vintageYear: values.vintageYear,
          volumeMl: values.volumeMl,
        },
      },
      {
        onSuccess: (created) => {
          navigate({
            params: { id: created.id },
            search: { page: 1, sort: "name" },
            to: "/wines/$id",
          });
        },
      }
    );
  };

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        to="/wines"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to wines
      </Link>

      <PageHeader
        description="Add a wine to your catalog. Shop owners can then request supply for retail."
        title="Add a new wine"
      />

      <div className="max-w-3xl">
        <WineForm
          defaultValues={{}}
          isPending={mutation.isPending}
          onSubmit={handleSubmit}
          submitLabel="Create wine"
        />
      </div>
    </div>
  );
}
