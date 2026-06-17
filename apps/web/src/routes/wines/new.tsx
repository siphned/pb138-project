import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { useGetWinemakersMe } from "@/generated/hooks/useGetWinemakersMe";
import { usePostWines } from "@/generated/hooks/usePostWines";
import { axiosInstance } from "@/lib/axios";
import { WineForm, type WineFormValues } from "@/routes/wines/-components/WineForm";

export const Route = createFileRoute("/wines/new")({
  component: WineCreatePage,
});

async function uploadWineImage(wineId: string, file: File): Promise<void> {
  // Generated client posts { file: Blob } as JSON; multipart needs FormData.
  // Same workaround as shops.$id.images.tsx.
  const fd = new FormData();
  fd.append("file", file);
  await axiosInstance.post(`/wines/${wineId}/images`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

function WineCreatePage() {
  const navigate = useNavigate();
  const mutation = usePostWines();
  const winemakerQuery = useGetWinemakersMe();
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (values: WineFormValues, imageFiles: File[]) => {
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
        onSuccess: async (created) => {
          if (imageFiles.length > 0) {
            setIsUploading(true);
            try {
              for (const file of imageFiles) {
                await uploadWineImage(created.id, file);
              }
            } catch {
              // Image upload errors are non-fatal — wine was created. Land on
              // detail page; user can retry uploads from the wine images page.
            } finally {
              setIsUploading(false);
            }
          }
          navigate({
            params: { id: created.id },
            search: { page: 1, sort: "name" },
            to: "/wines/$id",
          });
        },
      }
    );
  };

  if (winemakerQuery.isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <LoadingState variant="detail" />
      </div>
    );
  }

  const winemakerName = winemakerQuery.data?.name ?? "";

  // Attribution is pre-filled from the winemaker profile and hidden in the form.
  // Without a profile it would be empty and the (required) hidden field would
  // fail validation silently — so block here with a clear message instead.
  if (winemakerQuery.isError || !winemakerName) {
    return (
      <div className="container mx-auto space-y-6 px-6 py-8 lg:px-12">
        <Link
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          to="/wines"
        >
          <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
          Back to wines
        </Link>
        <PageHeader
          description="You need a winemaker profile before you can add wines. Set one up from your dashboard first."
          title="Winemaker profile required"
        />
      </div>
    );
  }

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

      {mutation.isError && (
        <div className="max-w-3xl rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Could not create the wine. Please try again."}
        </div>
      )}

      <div className="max-w-3xl">
        <WineForm
          defaultValues={{ attribution: winemakerName }}
          hideAttribution
          isPending={mutation.isPending || isUploading}
          onSubmit={handleSubmit}
          showImageUpload
          submitLabel={isUploading ? "Uploading images…" : "Create wine"}
        />
      </div>
    </div>
  );
}
