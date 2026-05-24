import { Link } from "@tanstack/react-router";
import { ShoppingCart01Icon } from "hugeicons-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-6">
        <ShoppingCart01Icon className="h-12 w-12 text-muted-foreground" />
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
