import { cn } from "@/lib/utils";
import { CatalogPlaceholder } from "./CatalogPlaceholder";

interface ImagesQueryLike {
  data?: unknown;
  isLoading: boolean;
}

interface EntityImageProps {
  /** Result of a `useGet<Entity>ByIdImages` query — only `data` and `isLoading` are read. */
  imagesQuery: ImagesQueryLike;
  alt: string;
  fallbackText: string;
  fallbackColor?: string;
  className?: string;
}

/**
 * Shared rendering for entity image slots: render the first image URL from
 * the hook result, or fall back to a `<CatalogPlaceholder>` while loading
 * or when no image is attached.
 *
 * The thin per-entity wrappers (`WineImage`, `ProductImage`, etc.) call the
 * right `useGet<Entity>ByIdImages` hook and pass the result here.
 */
export function EntityImage({
  imagesQuery,
  alt,
  fallbackText,
  fallbackColor,
  className,
}: EntityImageProps) {
  const { data, isLoading } = imagesQuery;
  const first = !isLoading && Array.isArray(data) ? (data[0] as { url?: string } | undefined) : undefined;
  const url = first?.url;

  if (url) {
    return (
      <img
        alt={alt}
        className={cn(
          "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
          className
        )}
        src={url}
      />
    );
  }

  return <CatalogPlaceholder color={fallbackColor} text={fallbackText} />;
}
