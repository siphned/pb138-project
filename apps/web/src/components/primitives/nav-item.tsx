import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const navItemVariants = cva(
  "flex flex-none items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
  {
    defaultVariants: {
      variant: "active",
    },
    variants: {
      variant: {
        active: "bg-secondary text-primary hover:bg-secondary/80",
        destructive: "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
        muted: "text-muted-foreground hover:bg-secondary/50",
      },
    },
  }
);

function NavItem({
  className,
  render,
  variant = "active",
  ...props
}: useRender.ComponentProps<"button"> & VariantProps<typeof navItemVariants>) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">({ className: cn(navItemVariants({ variant }), className) }, props),
    render,
    state: { slot: "nav-item", variant },
  });
}

export { NavItem, navItemVariants };
