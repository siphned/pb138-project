import { vi } from "vitest";
import { describeEntityImageWrapper } from "./__tests__/describeEntityImageWrapper";
import { ProductImage } from "./ProductImage";

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
