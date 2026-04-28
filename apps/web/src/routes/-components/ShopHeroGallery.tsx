interface ShopHeroGalleryProps {
  shopName: string;
}

export function ShopHeroGallery({ shopName }: ShopHeroGalleryProps) {
  return (
    <div className="relative h-72 w-full overflow-hidden bg-linear-to-br from-secondary/30 to-primary/20 lg:h-96">
      <div className="container mx-auto flex h-full items-center justify-center px-6 lg:px-12">
        <h1 className="text-center font-heading text-4xl font-bold text-foreground/80 lg:text-6xl">
          {shopName}
        </h1>
      </div>
      {/* TODO: replace with real images when API returns images[] */}
    </div>
  );
}
