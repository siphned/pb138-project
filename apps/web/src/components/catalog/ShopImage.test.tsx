import { vi } from "vitest";
import { describeEntityImageWrapper } from "./__tests__/describeEntityImageWrapper";
import { ShopImage } from "./ShopImage";

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
