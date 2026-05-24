import { ShoppingCart01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-6">
        <HugeiconsIcon className="h-12 w-12 text-muted-foreground" icon={ShoppingCart01Icon} />
      </div>
      <h3 className="mb-2 text-xl font-semibold">Your cart is empty</h3>
      <p className="mb-8 text-muted-foreground">
        Looks like you haven&apos;t added any wines to your cart yet.
      </p>
      <Link className={cn(buttonVariants({ variant: "outline" }))} to="/explore">
        Browse wines
      </Link>
    </div>
  );
}
