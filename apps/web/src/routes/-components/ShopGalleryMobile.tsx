import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface ShopGalleryMobileProps {
  images: string[];
  shopName: string;
}

export function ShopGalleryMobile({ images, shopName }: ShopGalleryMobileProps) {
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {images.map((src, i) => (
          <CarouselItem key={src}>
            <div className="aspect-shop-hero-mobile w-full overflow-hidden rounded-2xl">
              <img
                alt={`${shopName} — ${i + 1}`}
                className="h-full w-full object-cover"
                src={src}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
