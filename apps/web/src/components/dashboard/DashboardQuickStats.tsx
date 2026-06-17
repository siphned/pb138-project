import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";

interface StatTile {
  label: string;
  value: string;
}

const TILES_BY_ROLE: Record<string, StatTile> = {
  Admin: { label: "Pending approvals", value: "—" },
  Customer: { label: "Orders placed", value: "—" },
  "Shop Owner": { label: "Shops managed", value: "—" },
  Winemaker: { label: "Wines published", value: "—" },
};

export function DashboardQuickStats() {
  const { user } = useUser();
  if (!user) return null;

  const tiles = (user.roles ?? [])
    .map((role) => TILES_BY_ROLE[role])
    .filter((tile): tile is StatTile => Boolean(tile));

  if (tiles.length === 0) return null;

  return (
    <div className="space-y-4" data-slot="dashboard-quick-stats">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Card className="flex flex-col gap-2 p-5" key={tile.label}>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {tile.label}
            </span>
            <span className="font-heading text-3xl font-bold text-foreground">{tile.value}</span>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button render={<Link to="/stats" />} size="sm" variant="outline">
          View full stats
          <HugeiconsIcon className="ml-2 h-3.5 w-3.5" icon={ArrowRight01Icon} />
        </Button>
      </div>
    </div>
  );
}
