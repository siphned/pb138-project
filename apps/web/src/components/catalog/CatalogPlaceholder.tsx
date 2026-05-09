import { cn } from "@/lib/utils";

interface CatalogPlaceholderProps {
  text: string;
  className?: string;
  textClassName?: string;
}

export function CatalogPlaceholder({ text, className, textClassName }: CatalogPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-linear-to-b from-secondary/10 to-secondary/30",
        className
      )}
    >
      <span
        className={cn(
          "font-heading font-bold uppercase text-secondary-foreground/20",
          textClassName
        )}
      >
        {text}
      </span>
    </div>
  );
}
