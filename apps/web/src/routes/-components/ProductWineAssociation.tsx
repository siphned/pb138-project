import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ProductWineAssociationProps {
  wine: {
    id: string;
    name: string;
    region: string;
    vintageYear: number;
    type: string;
    color: string;
    winemaker: { id: string; name: string };
  };
}

export function ProductWineAssociation({ wine }: ProductWineAssociationProps) {
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-bold">About This Wine</h2>
      <Card className="rounded-2xl border-none bg-secondary/10 p-6 shadow-none">
        <div className="space-y-4">
          <div>
            <h3 className="font-heading text-xl font-semibold">{wine.name}</h3>
            <p className="text-sm text-muted-foreground">Winemaker: {wine.winemaker?.name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{wine.type}</Badge>
            <Badge variant="outline">{wine.color}</Badge>
            <Badge variant="outline">{wine.region}</Badge>
            <Badge variant="outline">{wine.vintageYear}</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
