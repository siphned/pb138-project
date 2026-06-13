import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CatalogPlaceholder } from "./CatalogPlaceholder";

export function firstImageUrl(data: unknown): string | undefined {
  const first = Array.isArray(data) ? (data[0] as { url?: string } | undefined) : undefined;
  return first?.url;
}

interface EntityImageProps {
  imageUrl?: string | null;
  isLoading?: boolean;
  alt: string;
  fallbackText: string;
  fallbackColor?: string;
  className?: string;
  entityType?: "wine" | "product" | "shop" | "winery" | "event";
}

export function EntityImage({
  imageUrl,
  isLoading = false,
  alt,
  fallbackText,
  fallbackColor,
  className,
  entityType,
}: EntityImageProps) {
  if (isLoading) {
    return <Skeleton className={cn("h-full w-full", className)} />;
  }

  if (imageUrl) {
    return (
      <img
        alt={alt}
        className={cn(
          "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
          className
        )}
        src={imageUrl}
      />
    );
  }

  if (entityType) {
    return (
      <img
        alt={alt}
        className={cn("h-full w-full object-cover opacity-60 dark:opacity-40", className)}
        src={`/placeholders/${entityType}.webp`}
      />
    );
  }

  return <CatalogPlaceholder color={fallbackColor} text={fallbackText} />;
}
