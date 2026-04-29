import { Link } from "@tanstack/react-router";
import { Store } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProductSoldAtCardProps {
  shopId: string;
  shopName?: string;
}

export function ProductSoldAtCard({ shopId, shopName }: ProductSoldAtCardProps) {
  return (
    <Card className="rounded-2xl border-none bg-secondary/10 p-4 shadow-none">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Sold at
      </p>
      <Link
        className="flex items-center gap-2 font-heading font-semibold text-foreground hover:text-primary transition-colors"
        params={{ id: shopId }}
        to="/shops/$id"
      >
        <Store className="h-4 w-4 shrink-0" />
        {shopName ?? "View Shop"}
      </Link>
    </Card>
  );
}
