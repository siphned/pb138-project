import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShopProductsGrid } from "./ShopProductsGrid";

vi.mock("@/generated/hooks/useGetShopsByIdProducts", () => ({
  useGetShopsByIdProducts: vi.fn(),
}));

vi.mock("@/components/catalog/ProductCard", () => ({
  ProductCard: ({ product }: { product: any }) => <div data-testid="product-card">{product.name}</div>,
}));

vi.mock("@/components/primitives/data-grid", () => ({
  DataGrid: ({ children }: { children: any }) => <div data-testid="data-grid">{children}</div>,
}));

import { useGetShopsByIdProducts } from "@/generated/hooks/useGetShopsByIdProducts";

describe("ShopProductsGrid", () => {
  it("renders loading state", () => {
    vi.mocked(useGetShopsByIdProducts).mockReturnValue({ isLoading: true } as any);
    const { container } = render(<ShopProductsGrid shopId="shop-1" />);
    expect(container.querySelector('[data-slot="loading-state"]')).toBeInTheDocument();
  });

  it("renders error state", () => {
    vi.mocked(useGetShopsByIdProducts).mockReturnValue({ isError: true, refetch: vi.fn() } as any);
    const { container } = render(<ShopProductsGrid shopId="shop-1" />);
    expect(container.querySelector('[data-slot="error-state"]')).toBeInTheDocument();
    expect(screen.getByText("Error loading products")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    vi.mocked(useGetShopsByIdProducts).mockReturnValue({ data: [], isLoading: false } as any);
    const { container } = render(<ShopProductsGrid shopId="shop-1" />);
    expect(container.querySelector('[data-slot="empty-state"]')).toBeInTheDocument();
    expect(screen.getByText("No products found")).toBeInTheDocument();
  });

  it("renders a grid of product cards", () => {
    const mockProducts = [
      { id: "p1", name: "Wine A" },
      { id: "p2", name: "Wine B" },
    ];
    vi.mocked(useGetShopsByIdProducts).mockReturnValue({ data: mockProducts, isLoading: false } as any);
    render(<ShopProductsGrid shopId="shop-1" />);
    expect(screen.getByTestId("data-grid")).toBeInTheDocument();
    expect(screen.getAllByTestId("product-card")).toHaveLength(2);
    expect(screen.getByText("Wine A")).toBeInTheDocument();
    expect(screen.getByText("Wine B")).toBeInTheDocument();
  });
});
