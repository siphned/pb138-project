import { vi } from "vitest";
import { describeEntityImageWrapper } from "@/routes/-components/describeEntityImageWrapper";
import { ShopImage } from "@/routes/-components/ShopImage";

vi.mock("@/generated/hooks/useGetShopsByIdImages", () => ({
  useGetShopsByIdImages: vi.fn(),
}));

import { useGetShopsByIdImages } from "@/generated/hooks/useGetShopsByIdImages";

describeEntityImageWrapper({
  alt: "Vinyard",
  fallbackText: "Vinyard Cellar",
  mockHook: vi.mocked(useGetShopsByIdImages),
  name: "ShopImage",
  renderWrapper: () => <ShopImage alt="Vinyard" fallbackText="Vinyard Cellar" shopId="s1" />,
  sampleUrl: "/uploads/shop/x.webp",
});
