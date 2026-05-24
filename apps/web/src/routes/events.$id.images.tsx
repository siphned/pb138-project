import { Add01Icon, Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteEventsByIdImagesByImageId } from "@/generated/hooks/useDeleteEventsByIdImagesByImageId";
import { useGetEventsByIdImages } from "@/generated/hooks/useGetEventsByIdImages";
import { usePostEventsByIdImages } from "@/generated/hooks/usePostEventsByIdImages";

export const Route = createFileRoute("/events/$id/images")({
  component: EventImagesPage,
});

type ImageItem = { id: string; url?: string; publicUrl?: string };

function EventImagesPage() {
  const { id } = Route.useParams();
  const { data, isLoading, refetch } = useGetEventsByIdImages(id);
  const uploadMutation = usePostEventsByIdImages();
  const deleteMutation = useDeleteEventsByIdImagesByImageId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = Array.isArray(data) ? (data as ImageItem[]) : [];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(
      { data: { file }, id },
      {
        onSuccess: () => {
          refetch();
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
      }
    );
  };

  const handleDelete = (imageId: string) => {
    deleteMutation.mutate({ id, imageId }, { onSuccess: () => refetch() });
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-6 py-8 lg:px-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Event Images</h1>
        <div>
          <input
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            ref={fileInputRef}
            type="file"
          />
          <Button
            disabled={uploadMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
            size="sm"
          >
            <HugeiconsIcon className="mr-2 h-4 w-4" icon={Add01Icon} />
            {uploadMutation.isPending ? "Uploading..." : "Upload Image"}
          </Button>
        </div>
      </div>

      {uploadMutation.isError && (
        <p className="text-sm text-destructive">Upload failed. Please try again.</p>
      )}

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton className="aspect-video w-full rounded-lg" key={i} />
          ))}
        </div>
      )}
      {!isLoading && images.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-16 text-center">
          <p className="text-muted-foreground">No images yet. Upload the first one!</p>
        </div>
      )}
      {!isLoading && images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((img) => {
            const src = img.url ?? img.publicUrl;
            if (!src) return null;
            return (
              <div className="group relative overflow-hidden rounded-lg" key={img.id}>
                <img alt="Event" className="aspect-video w-full object-cover" src={src} />
                <button
                  aria-label="Delete image"
                  className="absolute right-2 top-2 rounded-md bg-destructive/90 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleDelete(img.id)}
                  type="button"
                >
                  <HugeiconsIcon className="h-4 w-4 text-white" icon={Delete01Icon} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
