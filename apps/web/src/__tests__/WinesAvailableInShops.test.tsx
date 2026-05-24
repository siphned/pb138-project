import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WinesAvailableInShops } from "../routes/-components/WinesAvailableInShops";

// Mock the router
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: any) => <a href="/">{children}</a>,
}));

// Mock the hook
vi.mock("@/generated/hooks/useGetProducts", () => ({
  useGetProducts: vi.fn(),
}));

// Mock the components used inside - use paths relative to the test file
vi.mock("../routes/-components/ProductPriceRow", () => ({
  ProductPriceRow: ({ productId, price }: any) => (
    <div data-testid="price-row">
      {productId}: {price}
    </div>
  ),
}));
vi.mock("../routes/-components/ProductSoldAtCard", () => ({
  ProductSoldAtCard: ({ shopName }: any) => <div data-testid="shop-card">{shopName}</div>,
}));
vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: any) => <div className={className} data-testid="skeleton" />,
}));

import { useGetProducts } from "@/generated/hooks/useGetProducts";

describe("WinesAvailableInShops", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    vi.mocked(useGetProducts).mockReturnValue({ isLoading: true } as any);
    render(<WinesAvailableInShops wineId="w1" />);
    expect(screen.getAllByTestId("skeleton")).toHaveLength(2);
  });

  it("renders empty state when no products found", () => {
    vi.mocked(useGetProducts).mockReturnValue({ data: { data: [] }, isLoading: false } as any);
    render(<WinesAvailableInShops wineId="w1" />);
    expect(screen.getByText(/not currently available/i)).toBeInTheDocument();
  });

  it("renders products when available", () => {
    const mockData = {
      data: [
        {
          id: "p1",
          name: "Product 1",
          price: "100",
          quantity: 5,
          shop: { id: "s1", name: "Shop 1" },
        },
      ],
    };
    vi.mocked(useGetProducts).mockReturnValue({ data: mockData, isLoading: false } as any);

    render(<WinesAvailableInShops wineId="w1" />);

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByTestId("shop-card")).toHaveTextContent("Shop 1");
    expect(screen.getByTestId("price-row")).toHaveTextContent("p1: 100");
  });
});
