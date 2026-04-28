import { Separator } from "@/components/ui/separator";

interface BundleContentsListProps {
  wines: {
    id: string;
    name: string;
    region: string;
    vintageYear: number;
    type: string;
    color: string;
    winemaker: { id: string; name: string };
  }[];
}

export function BundleContentsList({ wines }: BundleContentsListProps) {
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-bold">Contains</h2>
      <div className="rounded-2xl border-none bg-secondary/10 p-6">
        <div className="space-y-4">
          {wines?.map((wine, index) => (
            <div key={wine.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-heading font-semibold">{wine.name}</p>
                  <p className="text-xs text-muted-foreground">{wine.winemaker?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{wine.vintageYear}</p>
                  <p className="text-xs text-muted-foreground">{wine.region}</p>
                </div>
              </div>
              {index < (wines?.length ?? 0) - 1 && <Separator className="mt-4 bg-background/50" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
