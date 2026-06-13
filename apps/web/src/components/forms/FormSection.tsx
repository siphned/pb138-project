import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  children: ReactNode;
  /** Adds a bordered box around the section. Defaults to true. */
  bordered?: boolean;
  className?: string;
}

export function FormSection({
  title,
  children,
  bordered = true,
  className,
}: FormSectionProps) {
  return (
    <div
      className={cn(
        "space-y-4",
        bordered && "rounded-md border border-border p-4",
        className
      )}
    >
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}
