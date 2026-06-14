import { vi } from "vitest";
import { describeEntityImageWrapper } from "@/routes/-components/describeEntityImageWrapper";
import { ProductImage } from "@/routes/-components/ProductImage";

vi.mock("@/generated/hooks/useGetProductsByIdImages", () => ({
  useGetProductsByIdImages: vi.fn(),
}));

import { useGetProductsByIdImages } from "@/generated/hooks/useGetProductsByIdImages";

describeEntityImageWrapper({
  alt: "Bar",
  fallbackText: "Bar Bundle",
  mockHook: vi.mocked(useGetProductsByIdImages),
  name: "ProductImage",
  renderWrapper: () => <ProductImage alt="Bar" fallbackText="Bar Bundle" productId="p1" />,
  sampleUrl: "/uploads/product/bar.webp",
});
