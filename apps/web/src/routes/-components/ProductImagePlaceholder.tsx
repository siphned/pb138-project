interface ProductImagePlaceholderProps {
  wine?: { color?: string; type?: string; name?: string };
  isBundle?: boolean;
}

export function ProductImagePlaceholder({ wine, isBundle }: ProductImagePlaceholderProps) {
  const label = isBundle ? "BUNDLE" : (wine?.color ?? wine?.type ?? "Wine");

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-linear-to-b from-secondary/10 to-secondary/30">
      <div className="flex h-full w-full items-center justify-center">
        <span className="select-none -rotate-90 font-heading text-5xl font-bold uppercase tracking-widest text-secondary-foreground/20 lg:text-7xl">
          {label}
        </span>
      </div>
    </div>
  );
}
