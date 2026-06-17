import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/primitives/page-header";
import { usePostWinemakers } from "@/generated/hooks/usePostWinemakers";
import { axiosInstance } from "@/lib/axios";
import {
  WinemakerForm,
  type WinemakerFormValues,
} from "@/routes/winemakers/-components/WinemakerForm";

export const Route = createFileRoute("/winemakers/new")({
  component: WinemakerCreatePage,
});

async function uploadWinemakerImage(winemakerId: string, file: File): Promise<void> {
  // Generated client posts { file: Blob } as JSON; multipart needs FormData.
  // Same workaround as wines.new.tsx and shops.$id.images.tsx.
  const fd = new FormData();
  fd.append("file", file);
  await axiosInstance.post(`/winemakers/${winemakerId}/images`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

function WinemakerCreatePage() {
  const navigate = useNavigate();
  const mutation = usePostWinemakers();
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (values: WinemakerFormValues, imageFiles: File[]) => {
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
        onSuccess: async (created) => {
          if (imageFiles.length > 0) {
            setIsUploading(true);
            try {
              for (const file of imageFiles) {
                await uploadWinemakerImage(created.id, file);
              }
            } catch {
              // Image upload errors are non-fatal — the profile was created.
              // The owner can retry from the winemaker images page.
            } finally {
              setIsUploading(false);
            }
          }
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
          isPending={mutation.isPending || isUploading}
          onSubmit={handleSubmit}
          showImageUpload
          submitLabel={isUploading ? "Uploading images…" : "Create profile"}
        />
      </div>
    </div>
  );
}
