import { Separator } from "@/components/ui/separator";
import { BundlesContainingWine } from "./BundlesContainingWine";

interface ProductRelatedSectionProps {
  isBundle: boolean;
  wines: { id: string }[];
  shopId: string;
}

export function ProductRelatedSection({ isBundle, wines, shopId }: ProductRelatedSectionProps) {
  // Bundles already list their wines in the product details card above, so only
  // single products get the "bundles containing this wine" cross-sell here.
  const firstWineId = isBundle ? undefined : wines[0]?.id;
  if (!firstWineId || !shopId) return null;

  return (
    <>
      <Separator />
      <BundlesContainingWine shopId={shopId} wineId={firstWineId} />
    </>
  );
}
