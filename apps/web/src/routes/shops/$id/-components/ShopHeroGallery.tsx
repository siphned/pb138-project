import { ShopGalleryDesktop } from "@/routes/-components/ShopGalleryDesktop";
import { ShopGalleryMobile } from "@/routes/-components/ShopGalleryMobile";

// TODO(BE): replace PLACEHOLDER_IMAGES when GET /shops/:id returns images[]
const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80",
  "https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=800&q=80",
  "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800&q=80",
];

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
