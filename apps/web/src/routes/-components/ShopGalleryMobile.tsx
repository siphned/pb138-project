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
            <div className="flex flex-col items-center aspect-shop-hero-mobile w-full overflow-hidden">
              <img
                alt={`${shopName} — ${i + 1}`}
                className="h-full rounded-md object-cover"
                src={src}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
