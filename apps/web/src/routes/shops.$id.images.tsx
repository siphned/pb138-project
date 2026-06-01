import {
  ArrowLeft02Icon,
  Delete01Icon,
  Image01Icon,
  Upload03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { Section } from "@/components/primitives/section";
import { Button } from "@/components/ui/button";
import { useDeleteShopsByIdImagesByImageId } from "@/generated/hooks/useDeleteShopsByIdImagesByImageId";
import {
  getShopsByIdImagesQueryKey,
  useGetShopsByIdImages,
} from "@/generated/hooks/useGetShopsByIdImages";
import { axiosInstance } from "@/lib/axios";

export const Route = createFileRoute("/shops/$id/images")({
  component: ShopImagesPage,
});

interface ImageRow {
  id: string;
  url: string;
  createdAt?: string | number;
}

const ACCEPT = "image/png,image/jpeg,image/webp,image/avif";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB — match BE 413 boundary expectation.

function ShopImagesPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const queryKey = getShopsByIdImagesQueryKey(id);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useGetShopsByIdImages(id);
  // Generated client posts { file: Blob } as JSON, which can't upload binary.
  // POST manually with FormData; axios infers the multipart Content-Type +
  // boundary when it sees a FormData body (the JSON default header is
  // overridden by the FormData detection in the axios request transformer).
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await axiosInstance.post(`/shops/${id}/images`, fd, {
        // Set explicitly so the axios instance default "application/json"
        // doesn't win; axios fills in the boundary parameter for FormData.
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
  });
  const deleteMutation = useDeleteShopsByIdImagesByImageId();

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_BYTES) {
      setUploadError(`File is too large (max ${(MAX_BYTES / 1024 / 1024).toFixed(0)} MB).`);
      return;
    }
    setUploadError(null);

    uploadMutation.mutate(file, {
      onError: (err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 415) setUploadError("Unsupported file type.");
        else if (status === 413) setUploadError("File is too large.");
        else if (status === 409) setUploadError("That image is already uploaded.");
        else setUploadError("Upload failed. Please try again.");
      },
      onSuccess: () => {
        invalidate();
      },
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <LoadingState variant="detail" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <ErrorState
          message="Could not load images for this shop."
          onRetry={() => refetch()}
          title="Failed to load"
        />
      </div>
    );
  }

  const images = (Array.isArray(data) ? data : []) as ImageRow[];

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        params={{ id }}
        to="/shops/$id/edit"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to shop settings
      </Link>

      <PageHeader
        description="Upload photos so customers recognise your shop. PNG, JPEG, WebP, or AVIF up to 10 MB."
        title="Shop images"
      />

      <Section heading="Upload">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            accept={ACCEPT}
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
          <Button
            disabled={uploadMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            <HugeiconsIcon className="mr-2 h-4 w-4" icon={Upload03Icon} />
            {uploadMutation.isPending ? "Uploading…" : "Choose image"}
          </Button>
          {uploadError && (
            <p className="text-sm text-destructive" role="alert">
              {uploadError}
            </p>
          )}
        </div>
      </Section>

      <Section heading={`Existing images (${images.length})`}>
        {images.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border p-12 text-center">
            <HugeiconsIcon className="h-8 w-8 text-muted-foreground" icon={Image01Icon} />
            <p className="text-sm text-muted-foreground">No images yet.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((img) => {
              const pending = deleteMutation.isPending && deleteMutation.variables?.imageId === img.id;
              return (
                <li key={img.id}>
                  <div className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      src={img.url}
                    />
                    <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        aria-label="Delete image"
                        disabled={pending}
                        onClick={() =>
                          deleteMutation.mutate(
                            { id, imageId: img.id },
                            { onSuccess: invalidate }
                          )
                        }
                        size="icon-sm"
                        variant="destructive"
                      >
                        <HugeiconsIcon className="h-4 w-4" icon={Delete01Icon} />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </div>
  );
}
