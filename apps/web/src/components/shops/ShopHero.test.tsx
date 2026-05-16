import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShopHero } from "./ShopHero";

vi.mock("./ShopManageMenu", () => ({
  ShopManageMenu: () => <div data-testid="shop-manage-menu" />,
}));

const mockShop = {
  id: "shop-1",
  name: "Gourmet Wine Shop",
  address: {
    city: "Prague",
    country: "Czech Republic",
    houseNumber: "1",
    id: "addr-1",
    postalCode: "11000",
    street: "Wine St",
  },
  description: "Best wines in town",
  ownerUserId: "user-1",
  createdAt: "2026-01-01",
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

  it("has the shop-hero data slot", () => {
    const { container } = render(<ShopHero shop={mockShop as any} />);
    expect(container.querySelector("[data-slot='shop-hero']")).not.toBeNull();
  });
});
