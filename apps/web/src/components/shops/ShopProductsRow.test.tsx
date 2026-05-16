import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShopProductsRow } from "./ShopProductsRow";

vi.mock("@/generated/hooks/useGetShopsByIdProducts", () => ({
  useGetShopsByIdProducts: vi.fn(),
}));

vi.mock("@/components/catalog/ProductCard", () => ({
  ProductCard: ({ product }: { product: any }) => (
    <div data-testid="product-card">{product.name}</div>
  ),
}));

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, search }: any) => (
    <div data-search={JSON.stringify(search)} data-testid="link" data-to={to}>
      {children}
    </div>
  ),
}));

import { useGetShopsByIdProducts } from "@/generated/hooks/useGetShopsByIdProducts";

describe("ShopProductsRow", () => {
  it("renders loading state", () => {
    vi.mocked(useGetShopsByIdProducts).mockReturnValue({ isLoading: true } as any);
    const { container } = render(<ShopProductsRow shopId="shop-1" />);
    expect(container.querySelector('[data-slot="loading-state"]')).toBeInTheDocument();
  });

  it("renders nothing when no items are found", () => {
    vi.mocked(useGetShopsByIdProducts).mockReturnValue({ data: [], isLoading: false } as any);
    const { container } = render(<ShopProductsRow shopId="shop-1" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a row of items with a View All link", () => {
    const mockItems = Array.from({ length: 12 }, (_, i) => ({
      id: `p${i}`,
      name: `Wine ${i}`,
    }));
    vi.mocked(useGetShopsByIdProducts).mockReturnValue({
      data: mockItems,
      isLoading: false,
    } as any);

    render(<ShopProductsRow shopId="shop-1" />);

    // Limit to 10
    expect(screen.getAllByTestId("product-card")).toHaveLength(10);
    expect(screen.getByText("Wine 0")).toBeInTheDocument();
    expect(screen.getByText("Wine 9")).toBeInTheDocument();
    expect(screen.queryByText("Wine 10")).not.toBeInTheDocument();

    const link = screen.getByTestId("link");
    expect(link).toHaveAttribute("data-to", "/products");
    expect(link).toHaveAttribute(
      "data-search",
      JSON.stringify({ isBundle: false, shopId: "shop-1" })
    );
  });

  it("handles bundles correctly", () => {
    vi.mocked(useGetShopsByIdProducts).mockReturnValue({
      data: [{ id: "b1", name: "Bundle 1" }],
      isLoading: false,
    } as any);

    render(<ShopProductsRow isBundle shopId="shop-1" />);

    expect(screen.getByText("Wine Bundles")).toBeInTheDocument();
    const link = screen.getByTestId("link");
    expect(JSON.parse(link.getAttribute("data-search") ?? "")).toEqual({
      isBundle: true,
      shopId: "shop-1",
    });
  });
});
