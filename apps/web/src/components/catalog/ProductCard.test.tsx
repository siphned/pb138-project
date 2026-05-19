import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { GetProducts200Item } from "./ProductCard";
import { ProductCard } from "./ProductCard";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    params,
  }: {
    children: React.ReactNode;
    to: string;
    params?: { productId?: string };
  }) => <a href={`${to}/${params?.productId || ""}`}>{children}</a>,
}));

vi.mock("@/generated/hooks/useGetProductsByIdImages", () => ({
  useGetProductsByIdImages: vi.fn(),
}));

import { useGetProductsByIdImages } from "@/generated/hooks/useGetProductsByIdImages";

const mockProduct = {
  id: "prod-1",
  isBundle: true,
  name: "Gala Pálava Bundle",
  price: "1200",
  shop: { id: "shop-1", name: "Vinotéka u Adama" },
  wines: [{ color: "white", name: "Pálava 2022" }],
} as unknown as GetProducts200Item;

const setImages = (data: unknown) =>
  vi
    .mocked(useGetProductsByIdImages)
    .mockReturnValue({ data, isLoading: false } as unknown as ReturnType<
      typeof useGetProductsByIdImages
    >);

describe("ProductCard", () => {
  it("renders product name and price", () => {
    setImages([]);
    render(<ProductCard product={mockProduct} />);
    expect(screen.getAllByText("Gala Pálava Bundle").length).toBeGreaterThan(0);
    expect(screen.getByText(/€1,200/)).toBeInTheDocument();
  });

  it("renders link to correct URL", () => {
    setImages([]);
    render(<ProductCard product={mockProduct} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/products/$productId/prod-1");
  });

  it("renders BUNDLE badge when isBundle is true", () => {
    setImages([]);
    render(<ProductCard product={mockProduct} />);
    expect(screen.getAllByText("BUNDLE").length).toBeGreaterThan(0);
  });

  it("does NOT render BUNDLE badge when isBundle is false", () => {
    setImages([]);
    const nonBundle = { ...mockProduct, isBundle: false };
    render(<ProductCard product={nonBundle} />);
    expect(screen.queryByText("BUNDLE")).not.toBeInTheDocument();
  });

  it("renders shop name by default", () => {
    setImages([]);
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/Vinotéka u Adama/)).toBeInTheDocument();
  });

  it("does NOT render shop name when showShopName is false", () => {
    setImages([]);
    render(<ProductCard product={mockProduct} showShopName={false} />);
    expect(screen.queryByText(/Vinotéka u Adama/)).not.toBeInTheDocument();
  });

  it("does NOT render shop name when product.shop is missing", () => {
    setImages([]);
    const noShop = { ...mockProduct, shop: undefined } as unknown as GetProducts200Item;
    render(<ProductCard product={noShop} />);
    expect(screen.queryByText(/Vinotéka u Adama/)).not.toBeInTheDocument();
  });

  it("renders the first image URL when the images hook returns data", () => {
    setImages([
      { id: "i1", entityId: "prod-1", entityType: "product", url: "https://example.com/p.jpg" },
    ]);
    render(<ProductCard product={mockProduct} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/p.jpg");
  });
});
