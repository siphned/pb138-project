import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductCard } from "@/routes/-components/ProductCard";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: any) => (
    <a href={`${to}/${params?.productId || ""}`}>{children}</a>
  ),
}));

const mockProduct = {
  id: "prod-1",
  isBundle: true,
  name: "Gala Pálava Bundle",
  price: "1200",
  shop: { id: "shop-1", name: "Vinotéka u Adama" },
  wines: [{ color: "white", name: "Pálava 2022" }],
} as any;

describe("ProductCard", () => {
  it("renders product name and price", () => {
    render(<ProductCard product={mockProduct} />);
    // Name appears in both the polaroid placeholder caption and the heading link.
    expect(screen.getAllByText("Gala Pálava Bundle").length).toBeGreaterThan(0);
    expect(screen.getByText(/1,200.00 €/)).toBeInTheDocument();
  });

  it("renders link to correct URL", () => {
    render(<ProductCard product={mockProduct} />);
    const link = screen.getAllByRole("link")[0];
    expect(link).toHaveAttribute("href", "/products/$productId/prod-1");
  });

  it("renders BUNDLE badge when isBundle is true", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getAllByText("BUNDLE").length).toBeGreaterThan(0);
  });

  it("does NOT render BUNDLE badge when isBundle is false", () => {
    const nonBundle = { ...mockProduct, isBundle: false };
    render(<ProductCard product={nonBundle} />);
    expect(screen.queryByText("BUNDLE")).not.toBeInTheDocument();
  });

  it("renders shop name", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/Vinotéka u Adama/)).toBeInTheDocument();
  });
});
