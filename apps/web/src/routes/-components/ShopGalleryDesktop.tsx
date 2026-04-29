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
      <div className="flex flex-col items-center h-120 overflow-hidden ">
        <img
          alt={shopName}
          className="h-full object-cover transition-all rounded-2xl duration-300"
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
