import { cn } from "@/lib/utils";

interface CatalogPlaceholderProps {
  text: string;
  className?: string;
  textClassName?: string;
  color?: string;
}

export function CatalogPlaceholder({
  text,
  className,
  textClassName,
  color,
}: CatalogPlaceholderProps) {
  const tint =
    {
      gray: "bg-stone-200 dark:bg-stone-700/40",
      orange: "bg-orange-200 dark:bg-orange-900/40",
      red: "bg-red-200 dark:bg-red-900/40",
      rosé: "bg-rose-200 dark:bg-rose-900/40",
      tawny: "bg-amber-700/30 dark:bg-amber-900/50",
      white: "bg-amber-100 dark:bg-amber-900/30",
      yellow: "bg-yellow-100 dark:bg-yellow-900/30",
    }[color?.toLowerCase() || ""] ?? "bg-green-800/50 dark:bg-green-900/50";

  return (
    <div
      className={cn("flex h-full w-full flex-col items-center justify-center p-4", tint, className)}
    >
      <span
        className={cn(
          "font-heading text-center text-xl font-bold uppercase text-foreground/40",
          textClassName
        )}
      >
        {text}
      </span>
      {color && (
        <span className="text-[10px] font-medium uppercase tracking-widest text-foreground/30 mt-1">
          {color}
        </span>
      )}
    </div>
  );
}
