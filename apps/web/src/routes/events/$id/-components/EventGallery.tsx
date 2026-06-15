import { ShopGalleryDesktop } from "@/routes/-components/ShopGalleryDesktop";
import { ShopGalleryMobile } from "@/routes/-components/ShopGalleryMobile";

const PLACEHOLDER_IMAGES = ["/placeholders/event.webp"];

interface EventGalleryProps {
  eventName: string;
  images?: string[];
}

export function EventGallery({ eventName, images }: EventGalleryProps) {
  const resolved = images && images.length > 0 ? images : PLACEHOLDER_IMAGES;

  return (
    <>
      {/* Desktop: large image + thumbnail strip */}
      <div className="hidden md:block">
        <ShopGalleryDesktop images={resolved} shopName={eventName} />
      </div>

      {/* Mobile: single-image swipe carousel */}
      <div className="block md:hidden">
        <ShopGalleryMobile images={resolved} shopName={eventName} />
      </div>
    </>
  );
}
