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

  // Invalidate + force a refetch so the grid updates immediately. Plain
  // invalidate() didn't always trigger a refetch (depends on observer state),
  // so chain refetch() after to guarantee the new list lands in cache.
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey });
    await refetch();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const oversize = files.find((f) => f.size > MAX_BYTES);
    if (oversize) {
      setUploadError(
        `${oversize.name} is too large (max ${(MAX_BYTES / 1024 / 1024).toFixed(0)} MB).`
      );
      return;
    }
    setUploadError(null);

    let firstError: number | null = null;
    for (const file of files) {
      try {
        await uploadMutation.mutateAsync(file);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status ?? 0;
        firstError ??= status;
        // Continue uploading remaining files so a single bad one doesn't block the rest.
      }
    }

    if (firstError === 415) setUploadError("One or more files have an unsupported type.");
    else if (firstError === 413) setUploadError("One or more files are too large.");
    else if (firstError === 409) setUploadError("Some images are already uploaded.");
    else if (firstError) setUploadError("Some uploads failed. Please try again.");

    await refresh();
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
            multiple
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
          <Button
            disabled={uploadMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            <HugeiconsIcon className="mr-2 h-4 w-4" icon={Upload03Icon} />
            {uploadMutation.isPending ? "Uploading…" : "Choose images"}
          </Button>
          <span className="text-xs text-muted-foreground">Select one or more images.</span>
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
                            { onSuccess: () => refresh() }
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

      <div className="flex justify-end">
        <Button
          onClick={() => {
            // Return to wherever the user came from (shop edit page or the
            // post-create setup state on /shops/new). If history is empty
            // (direct link / refresh), fall back to the edit page.
            if (window.history.length > 1) window.history.back();
            else window.location.assign(`/shops/${id}/edit`);
          }}
        >
          Done
        </Button>
      </div>
    </div>
  );
}
