import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShopHero } from "./ShopHero";

vi.mock("@/routes/-components/ShopHeroGallery", () => ({
  ShopHeroGallery: () => <div data-testid="shop-hero-gallery" />,
}));

vi.mock("@/routes/-components/ShopHoursDisplay", () => ({
  ShopHoursDisplay: () => <div data-testid="shop-hours" />,
}));

const mockShop = {
  address: {
    city: "Prague",
    country: "Czech Republic",
    houseNumber: "1",
    id: "addr-1",
    postalCode: "11000",
    street: "Wine St",
  },
  createdAt: "2026-01-01",
  description: "Best wines in town",
  id: "shop-1",
  name: "Gourmet Wine Shop",
  ownerUserId: "user-1",
  updatedAt: null,
};

describe("ShopHero", () => {
  it("renders shop name", () => {
    render(<ShopHero shop={mockShop as any} />);
    expect(screen.getByRole("heading", { name: "Gourmet Wine Shop" })).toBeInTheDocument();
  });

  it("renders address summary", () => {
    render(<ShopHero shop={mockShop as any} />);
    expect(screen.getByText("Prague, Czech Republic")).toBeInTheDocument();
  });

  it("renders description in About section", () => {
    render(<ShopHero shop={mockShop as any} />);
    expect(screen.getByText(/About/i)).toBeInTheDocument();
    expect(screen.getByText("Best wines in town")).toBeInTheDocument();
  });

  it("has the shop-hero data slot", () => {
    const { container } = render(<ShopHero shop={mockShop as any} />);
    expect(container.querySelector("[data-slot='shop-hero']")).not.toBeNull();
  });
});
