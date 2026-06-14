import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WinesAvailableInShops } from "@/routes/wines/-components/WinesAvailableInShops";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: any) => <a href="/">{children}</a>,
}));

vi.mock("@/generated/hooks/useGetProducts", () => ({
  useGetProducts: vi.fn(),
}));

vi.mock("@/routes/-components/ProductCard", () => ({
  ProductCard: ({ product }: any) => <div data-testid="product-card">{product.name}</div>,
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
    expect(screen.getAllByTestId("skeleton")).toHaveLength(4);
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

    expect(screen.getByTestId("product-card")).toHaveTextContent("Product 1");
  });
});
