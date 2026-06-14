import { Section } from "@/components/primitives/section";
import { DETAIL_CARD_GRID, DETAIL_CARD_ITEM } from "@/lib/detail-card-grid";
import { WineCard } from "@/routes/-components/WineCard";

interface BundleWinesSectionProps {
  // biome-ignore lint/suspicious/noExplicitAny: productWines.wine shape is narrower in OpenAPI than GetWines200Item (BE follow-up)
  productWines: any[] | undefined;
}

export function BundleWinesSection({ productWines }: BundleWinesSectionProps) {
  if (!productWines || productWines.length === 0) return null;

  return (
    <Section heading="Wines in this bundle">
      <div className={DETAIL_CARD_GRID}>
        {productWines.map((pw) => {
          const wineWithFallbacks = {
            color: "unknown",
            region: "",
            vintageYear: "",
            ...pw.wine,
            // biome-ignore lint/suspicious/noExplicitAny: productWines.wine in OpenAPI is narrower than GetWines200Item (BE follow-up)
          } as any;
          return (
            <div className={DETAIL_CARD_ITEM} key={pw.wine.id}>
              <WineCard wine={wineWithFallbacks} />
            </div>
          );
        })}
      </div>
    </Section>
  );
}
