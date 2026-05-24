import { Link } from "@tanstack/react-router";
import { GlassWater } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProductWinemakerCardProps {
  winemakerId: string;
  winemakerName: string;
}

export function ProductWinemakerCard({ winemakerId, winemakerName }: ProductWinemakerCardProps) {
  return (
    <Card className="rounded-2xl border-none bg-secondary/10 p-4 shadow-none">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Winemaker
      </p>
      <Link
        className="flex items-center gap-2 font-heading font-semibold text-foreground hover:text-primary transition-colors"
        params={{ id: winemakerId }}
        to="/winemakers/$id"
      >
        <GlassWater className="h-4 w-4 shrink-0" />
        {winemakerName}
      </Link>
    </Card>
  );
}
