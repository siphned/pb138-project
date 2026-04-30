import { BundlesContainingWine } from "./BundlesContainingWine";
import { BundleWinesCarousel } from "./BundleWinesCarousel";

interface ProductRelatedSectionProps {
  isBundle: boolean;
  wines: { id: string }[];
  shopId: string;
}

export function ProductRelatedSection({ isBundle, wines, shopId }: ProductRelatedSectionProps) {
  if (isBundle) {
    const wineIds = wines.map((w) => w.id);
    if (wineIds.length === 0 || !shopId) return null;
    return <BundleWinesCarousel shopId={shopId} wineIds={wineIds} />;
  }

  const firstWineId = wines[0]?.id;
  if (firstWineId && shopId) {
    return <BundlesContainingWine shopId={shopId} wineId={firstWineId} />;
  }

  return null;
}
