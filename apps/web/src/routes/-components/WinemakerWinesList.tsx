import type { GetWinemakersById200 } from "@/generated/types/GetWinemakersById";
import { WineCard } from "./WineCard";

interface WinemakerWinesListProps {
  wines: GetWinemakersById200["wines"];
  winemakerName: string;
}

export function WinemakerWinesList({ wines, winemakerName }: WinemakerWinesListProps) {
  if (!wines || wines.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="font-heading text-2xl font-bold">Wines</h2>
        <p className="text-muted-foreground italic">No wines listed for this winemaker yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold">Wines by {winemakerName}</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {wines.map((wine) => (
          <WineCard
            key={wine.id}
            product={{
              ...wine,
              isBundle: false,
              price: "0",
              rating: 0,
              reviewCount: 0,
              shopId: "", // Backend doesn't link wine to shop here directly?
              updatedAt: wine.updatedAt as string | null,
              wines: [
                {
                  ...wine,
                  winemaker: { id: "", name: winemakerName },
                },
              ],
            }}
          />
        ))}
      </div>
    </div>
  );
}
