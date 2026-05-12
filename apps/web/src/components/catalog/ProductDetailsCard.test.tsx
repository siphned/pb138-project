import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductDetailsCard } from "./ProductDetailsCard";
import { useUser } from "@/context/UserContext";

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

const mockProduct = {
  id: "prod-1",
  name: "Gala Pálava Bundle",
  price: "1200",
  isBundle: true,
  quantity: 10,
  shop: { id: "shop-1", name: "Vinotéka u Adama", ownerUserId: "user-1" },
  productWines: [
    { wine: { id: "wine-1", name: "Pálava 2022", color: "white" } }
  ]
} as any;

describe("ProductDetailsCard", () => {
  const mockOnAddToCart = vi.fn();

  it("renders product details and PageHeader", () => {
    vi.mocked(useUser).mockReturnValue({ user: null } as any);
    render(
      <ProductDetailsCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        isAddingToCart={false}
      />
    );
    expect(screen.getByText("Gala Pálava Bundle")).toBeInTheDocument();
    expect(screen.getByText(/Vinotéka u Adama/)).toBeInTheDocument();
    expect(screen.getByText(/€1,200/)).toBeInTheDocument();
    expect(screen.getByText(/10 in stock/i)).toBeInTheDocument();
  });

  it("calls onAddToCart when button is clicked", () => {
    render(
      <ProductDetailsCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        isAddingToCart={false}
      />
    );
    fireEvent.click(screen.getByText(/add to cart/i));
    expect(mockOnAddToCart).toHaveBeenCalled();
  });

  it("disables button when isAddingToCart is true", () => {
    render(
      <ProductDetailsCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        isAddingToCart={true}
      />
    );
    expect(screen.getByRole("button", { name: /adding/i })).toBeDisabled();
  });

  it("renders wines in bundle", () => {
    render(
      <ProductDetailsCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        isAddingToCart={false}
      />
    );
    expect(screen.getByText("Wines in this product")).toBeInTheDocument();
    expect(screen.getByText("Pálava 2022")).toBeInTheDocument();
  });

  it("shows owner actions for shop owner", () => {
    vi.mocked(useUser).mockReturnValue({
      user: { id: "user-1" },
    } as any);
    render(
      <ProductDetailsCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        isAddingToCart={false}
      />
    );
    expect(screen.getByText(/edit product/i)).toBeInTheDocument();
  });
});
