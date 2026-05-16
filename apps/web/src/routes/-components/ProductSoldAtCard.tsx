import { Store01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

interface ProductSoldAtCardProps {
  shopId: string;
  shopName?: string;
}

export function ProductSoldAtCard({ shopId, shopName }: ProductSoldAtCardProps) {
  return (
    <Card className="rounded-2xl border-none bg-secondary/10 p-4 shadow-none">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Sold at
      </p>
      <Link
        className="flex items-center gap-2 font-heading font-semibold text-foreground transition-colors hover:text-primary"
        params={{ id: shopId }}
        to="/shops/$id"
      >
        <HugeiconsIcon className="h-4 w-4 shrink-0" icon={Store01Icon} />
        {shopName ?? "View Shop"}
      </Link>
    </Card>
  );
}
