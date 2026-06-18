import { Delete01Icon, Image01Icon, Upload03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useRef, useState } from "react";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { Section } from "@/components/primitives/section";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/axios";

interface ImageRow {
  id: string;
  url: string;
}

const ACCEPT = "image/png,image/jpeg,image/webp,image/avif";
const MAX_BYTES = 10 * 1024 * 1024;

function toImageRows(data: unknown): ImageRow[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (i): i is ImageRow =>
      typeof i === "object" &&
      i !== null &&
      typeof (i as ImageRow).id === "string" &&
      typeof (i as ImageRow).url === "string"
  );
}

function uploadErrorMessage(status: number | null): string | null {
  if (status === 415) return "One or more files have an unsupported type.";
  if (status === 413) return "One or more files are too large.";
  if (status === 409) return "Some images are already uploaded.";
  if (status) return "Some uploads failed. Please try again.";
  return null;
}

interface EntityImagesManagerProps {
  uploadUrl: string;
  queryKey: readonly unknown[];
  data: unknown;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onDelete: (imageId: string, options: { onSuccess: () => void }) => void;
  isDeleting: boolean;
  deletingImageId: string | undefined;
  title: string;
  description: string;
  loadErrorMessage: string;
  doneHref: string;
  backLink: ReactNode;
}

export function EntityImagesManager({
  uploadUrl,
  queryKey,
  data,
  isLoading,
  isError,
  onRetry,
  onDelete,
  isDeleting,
  deletingImageId,
  title,
  description,
  loadErrorMessage,
  doneHref,
  backLink,
}: EntityImagesManagerProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey });

  // The generated client posts { file: Blob } as JSON and can't upload binary,
  // so POST FormData manually; axios fills in the multipart boundary itself.
  const uploadFiles = async (files: File[]): Promise<number | null> => {
    let firstError: number | null = null;
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        await axiosInstance.post(uploadUrl, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (err) {
        const status = (err as { response?: { status?: number } })?.response?.status ?? 0;
        firstError ??= status;
      }
    }
    return firstError;
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
    setIsUploading(true);
    const firstError = await uploadFiles(files);
    setIsUploading(false);
    setUploadError(uploadErrorMessage(firstError));
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
        <ErrorState message={loadErrorMessage} onRetry={onRetry} title="Failed to load" />
      </div>
    );
  }

  const images = toImageRows(data);

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      {backLink}

      <PageHeader description={description} title={title} />

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
          <Button disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
            <HugeiconsIcon className="mr-2 h-4 w-4" icon={Upload03Icon} />
            {isUploading ? "Uploading…" : "Choose images"}
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
            {images.map((img) => (
              <li key={img.id}>
                <div className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                  <img alt="" className="h-full w-full object-cover" src={img.url} />
                  <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      aria-label="Delete image"
                      disabled={isDeleting && deletingImageId === img.id}
                      onClick={() => onDelete(img.id, { onSuccess: refresh })}
                      size="icon-sm"
                      variant="destructive"
                    >
                      <HugeiconsIcon className="h-4 w-4" icon={Delete01Icon} />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="flex justify-end">
        <Button
          onClick={() => {
            if (window.history.length > 1) window.history.back();
            else window.location.assign(doneHref);
          }}
        >
          Done
        </Button>
      </div>
    </div>
  );
}
