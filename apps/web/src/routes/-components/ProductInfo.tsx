import { MapPin } from "lucide-react";
import { StarRating } from "@/components/catalog/StarRating";
import { Badge } from "@/components/ui/badge";

interface ProductInfoProps {
  name: string;
  isBundle: boolean;
  wines: {
    id: string;
    name: string;
    region: string;
    vintageYear: number;
    type: string;
    color: string;
    winemaker: { id: string; name: string };
  }[];
  rating?: number;
  reviewCount?: number;
}

export function ProductInfo({ name, isBundle, wines, rating, reviewCount }: ProductInfoProps) {
  const firstWine = wines?.[0];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold leading-tight lg:text-4xl">{name}</h1>
        {isBundle ? (
          <Badge className="rounded-lg" variant="secondary">
            Bundle
          </Badge>
        ) : (
          <div className="flex flex-wrap gap-2">
            {firstWine?.type && <Badge variant="outline">{firstWine.type}</Badge>}
            {firstWine?.color && <Badge variant="outline">{firstWine.color}</Badge>}
            {firstWine?.vintageYear && <Badge variant="outline">{firstWine.vintageYear}</Badge>}
          </div>
        )}
      </div>

      <div className="space-y-1">
        {firstWine?.winemaker?.name && (
          <p className="text-sm font-medium text-muted-foreground">
            Winemaker: <span className="text-foreground">{firstWine.winemaker.name}</span>
          </p>
        )}
        {firstWine?.region && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{firstWine.region}</span>
          </div>
        )}
      </div>

      {rating !== undefined && rating > 0 && (
        <StarRating rating={rating} reviewCount={reviewCount} size="md" />
      )}
      {(!rating || rating === 0) && (
        <p className="text-xs text-muted-foreground italic">No reviews yet</p>
      )}

      {!isBundle && wines.length > 1 && (
        <p className="text-sm text-muted-foreground">This bundle contains {wines.length} wines</p>
      )}
    </div>
  );
}
