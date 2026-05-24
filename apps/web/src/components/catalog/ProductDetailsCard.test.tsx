import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useUser } from "@/context/UserContext";
import { ProductDetailsCard } from "./ProductDetailsCard";

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

const mockProduct = {
  id: "prod-1",
  isBundle: true,
  name: "Gala Pálava Bundle",
  price: "1200",
  productWines: [{ wine: { color: "white", id: "wine-1", name: "Pálava 2022" } }],
  quantity: 10,
  shop: { id: "shop-1", name: "Vinotéka u Adama", ownerUserId: "user-1" },
} as any;

describe("ProductDetailsCard", () => {
  const mockOnAddToCart = vi.fn();

  it("renders product details and PageHeader", () => {
    vi.mocked(useUser).mockReturnValue({ user: null } as any);
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ProductDetailsCard
          isAddingToCart={false}
          onAddToCart={mockOnAddToCart}
          product={mockProduct}
        />
      </QueryClientProvider>
    );
    expect(screen.getAllByText("Gala Pálava Bundle")[0]).toBeInTheDocument();
    expect(screen.getByText(/Vinotéka u Adama/)).toBeInTheDocument();
    expect(screen.getByText(/€1,200/)).toBeInTheDocument();
    expect(screen.getByText(/in stock/i)).toBeInTheDocument();
  });

  it("calls onAddToCart when button is clicked", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ProductDetailsCard
          isAddingToCart={false}
          onAddToCart={mockOnAddToCart}
          product={mockProduct}
        />
      </QueryClientProvider>
    );
    fireEvent.click(screen.getByText(/add to cart/i));
    expect(mockOnAddToCart).toHaveBeenCalled();
  });

  it("disables button when isAddingToCart is true", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ProductDetailsCard
          isAddingToCart={true}
          onAddToCart={mockOnAddToCart}
          product={mockProduct}
        />
      </QueryClientProvider>
    );
    expect(screen.getByRole("button", { name: /adding/i })).toBeDisabled();
  });

  it("renders wines in bundle", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ProductDetailsCard
          isAddingToCart={false}
          onAddToCart={mockOnAddToCart}
          product={mockProduct}
        />
      </QueryClientProvider>
    );
    expect(screen.getByText("Wines in this product")).toBeInTheDocument();
    // Wine name appears in both the polaroid placeholder caption and the heading link.
    expect(screen.getAllByText("Pálava 2022").length).toBeGreaterThan(0);
  });

  it("shows owner actions for shop owner", () => {
    vi.mocked(useUser).mockReturnValue({
      user: { id: "user-1" },
    } as any);
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ProductDetailsCard
          isAddingToCart={false}
          onAddToCart={mockOnAddToCart}
          product={mockProduct}
        />
      </QueryClientProvider>
    );
    expect(screen.getByText(/edit product/i)).toBeInTheDocument();
  });
});
