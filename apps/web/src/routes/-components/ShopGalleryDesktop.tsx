import { useState } from "react";
import { ShopGalleryThumbnailStrip } from "./ShopGalleryThumbnailStrip";

interface ShopGalleryDesktopProps {
  images: string[];
  shopName: string;
}

export function ShopGalleryDesktop({ images, shopName }: ShopGalleryDesktopProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const mainSrc = images[selectedIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-shop-hero w-full overflow-hidden rounded-2xl">
        <img
          alt={shopName}
          className="h-full w-full object-cover transition-all duration-300"
          src={mainSrc}
        />
      </div>
      <ShopGalleryThumbnailStrip
        images={images}
        onSelect={setSelectedIndex}
        selectedIndex={selectedIndex}
      />
    </div>
  );
}
