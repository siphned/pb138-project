import { ShopGalleryDesktop } from "@/routes/-components/ShopGalleryDesktop";
import { ShopGalleryMobile } from "@/routes/-components/ShopGalleryMobile";

const PLACEHOLDER_IMAGES = ["/placeholders/winery.webp"];

interface WinemakerGalleryProps {
  winemakerName: string;
  images?: string[];
}

export function WinemakerGallery({ winemakerName, images }: WinemakerGalleryProps) {
  const resolved = images && images.length > 0 ? images : PLACEHOLDER_IMAGES;

  return (
    <>
      {/* Desktop: large image + thumbnail strip */}
      <div className="hidden md:block">
        <ShopGalleryDesktop images={resolved} shopName={winemakerName} />
      </div>

      {/* Mobile: single-image swipe carousel */}
      <div className="block md:hidden">
        <ShopGalleryMobile images={resolved} shopName={winemakerName} />
      </div>
    </>
  );
}
