import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShopCard } from "./ShopCard";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: any) => (
    <a href={to} data-params={JSON.stringify(params)}>
      {children}
    </a>
  ),
}));

const mockShop = {
  id: "shop-1",
  name: "Test Wine Shop",
  address: {
    city: "Brno",
    country: "Czech Republic",
  },
  images: [{ url: "https://example.com/shop.jpg" }],
};

describe("ShopCard", () => {
  it("renders shop name and city", () => {
    render(<ShopCard shop={mockShop as any} />);
    expect(screen.getByText("Test Wine Shop")).toBeInTheDocument();
    expect(screen.getByText("Brno, Czech Republic")).toBeInTheDocument();
  });

  it("renders the shop image when provided", () => {
    render(<ShopCard shop={mockShop as any} />);
    const img = screen.getByAltText("Test Wine Shop");
    expect(img).toHaveAttribute("src", "https://example.com/shop.jpg");
  });

  it("renders placeholder when no image is provided", () => {
    const shopWithoutImage = { ...mockShop, images: [] };
    render(<ShopCard shop={shopWithoutImage as any} />);
    expect(screen.queryByAltText("Test Wine Shop")).not.toBeInTheDocument();
    // CatalogPlaceholder and the Link both contain the shop name
    expect(screen.getAllByText("Test Wine Shop")).toHaveLength(2);
  });

  it("links to the correct shop detail page", () => {
    render(<ShopCard shop={mockShop as any} />);
    const link = screen.getByRole("link", { name: "Test Wine Shop" });
    expect(link).toHaveAttribute("href", "/shops/$id");
    expect(link).toHaveAttribute("data-params", JSON.stringify({ id: "shop-1" }));
  });
});
