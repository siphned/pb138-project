import { ShopGalleryDesktop } from "./ShopGalleryDesktop";
import { ShopGalleryMobile } from "./ShopGalleryMobile";

// TODO(BE): replace when GET /products/:id returns images[]
const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80",
  "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800&q=80",
  "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=800&q=80",
];

interface ProductGalleryProps {
  productName: string;
  images?: string[];
}

export function ProductGallery({ productName, images }: ProductGalleryProps) {
  const resolved = images && images.length > 0 ? images : PLACEHOLDER_IMAGES;

  return (
    <>
      <div className="hidden md:block">
        <ShopGalleryDesktop images={resolved} shopName={productName} />
      </div>
      <div className="block md:hidden">
        <ShopGalleryMobile images={resolved} shopName={productName} />
      </div>
    </>
  );
}
