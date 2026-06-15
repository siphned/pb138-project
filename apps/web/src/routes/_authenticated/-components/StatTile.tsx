import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
}

export function StatTile({ label, value, hint, className }: StatTileProps) {
  return (
    <Card className={cn("gap-2 px-6 py-5", className)} variant="section">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="font-heading text-3xl font-bold tracking-tight text-foreground">{value}</p>
      {hint && (
        <p className="text-xs text-muted-foreground" data-slot="stat-tile-hint">
          {hint}
        </p>
      )}
    </Card>
  );
}
