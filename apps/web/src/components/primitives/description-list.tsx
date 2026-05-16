import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DescriptionListProps {
  children: ReactNode;
  className?: string;
}

export function DescriptionList({ children, className }: DescriptionListProps) {
  return (
    <dl className={cn("grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm", className)}>
      {children}
    </dl>
  );
}

interface PropertyRowProps {
  label: string;
  value: ReactNode;
}

export function PropertyRow({ label, value }: PropertyRowProps) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </>
  );
}
