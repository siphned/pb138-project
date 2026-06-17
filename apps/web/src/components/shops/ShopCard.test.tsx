import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { GetShops200Item } from "./ShopCard";
import { ShopCard } from "./ShopCard";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    params,
  }: {
    children: React.ReactNode;
    to: string;
    params?: { id?: string };
  }) => (
    <a data-params={JSON.stringify(params)} href={to}>
      {children}
    </a>
  ),
}));

vi.mock("@/generated/hooks/useGetShopsByIdImages", () => ({
  useGetShopsByIdImages: vi.fn(() => ({ data: [], isLoading: false })),
}));

import { useGetShopsByIdImages } from "@/generated/hooks/useGetShopsByIdImages";

const mockShop = {
  address: { city: "Brno", country: "Czech Republic" },
  id: "shop-1",
  name: "Test Wine Shop",
} as unknown as GetShops200Item;

describe("ShopCard", () => {
  it("renders shop name and city", () => {
    render(<ShopCard shop={mockShop} />);
    expect(screen.getAllByText("Test Wine Shop").length).toBeGreaterThan(0);
    expect(screen.getByText("Brno, Czech Republic")).toBeInTheDocument();
  });

  it("renders the shop image when the images hook returns data", () => {
    vi.mocked(useGetShopsByIdImages).mockReturnValueOnce({
      data: [{ url: "https://example.com/shop.jpg" }],
      isLoading: false,
    } as unknown as ReturnType<typeof useGetShopsByIdImages>);
    render(<ShopCard shop={mockShop} />);
    const img = screen.getByAltText("Test Wine Shop");
    expect(img).toHaveAttribute("src", "https://example.com/shop.jpg");
  });

  it("renders placeholder when the images hook returns nothing", () => {
    render(<ShopCard shop={mockShop} />);
    expect(screen.getAllByText("Test Wine Shop").length).toBeGreaterThanOrEqual(2);
  });

  it("links to the correct shop detail page", () => {
    render(<ShopCard shop={mockShop} />);
    const link = screen.getByRole("link", { name: "Test Wine Shop" });
    expect(link).toHaveAttribute("href", "/shops/$id");
    expect(link).toHaveAttribute("data-params", JSON.stringify({ id: "shop-1" }));
  });
});
