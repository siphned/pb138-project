import { ShopGalleryDesktop } from "@/routes/-components/ShopGalleryDesktop";
import { ShopGalleryMobile } from "@/routes/-components/ShopGalleryMobile";

const PLACEHOLDER_IMAGES = ["/placeholders/shop.webp"];

interface ShopHeroGalleryProps {
  shopName: string;
  images?: string[];
}

export function ShopHeroGallery({ shopName, images }: ShopHeroGalleryProps) {
  const resolved = images && images.length > 0 ? images : PLACEHOLDER_IMAGES;

  return (
    <>
      {/* Desktop: large image + thumbnail strip */}
      <div className="hidden md:block">
        <ShopGalleryDesktop images={resolved} shopName={shopName} />
      </div>

      {/* Mobile: single-image swipe carousel */}
      <div className="block md:hidden">
        <ShopGalleryMobile images={resolved} shopName={shopName} />
      </div>
    </>
  );
}
