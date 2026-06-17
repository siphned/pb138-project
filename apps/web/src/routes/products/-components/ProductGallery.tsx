import { ShopGalleryDesktop } from "@/routes/-components/ShopGalleryDesktop";
import { ShopGalleryMobile } from "@/routes/-components/ShopGalleryMobile";

const PLACEHOLDER_IMAGES = ["/placeholders/product.webp"];

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
