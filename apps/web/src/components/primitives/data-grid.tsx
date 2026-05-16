import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const dataGridVariants = cva("grid gap-6", {
  defaultVariants: { variant: "catalog" },
  variants: {
    variant: {
      catalog: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      gallery: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
      list: "grid-cols-1",
    },
  },
});

interface DataGridProps extends VariantProps<typeof dataGridVariants> {
  children: ReactNode;
  className?: string;
}

export function DataGrid({ variant, children, className }: DataGridProps) {
  return <div className={cn(dataGridVariants({ variant }), className)}>{children}</div>;
}

export { dataGridVariants };
