import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShopHero } from "./ShopHero";

vi.mock("./ShopManageMenu", () => ({
  ShopManageMenu: () => <div data-testid="shop-manage-menu" />,
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
  it("renders shop name with large font structure", () => {
    render(<ShopHero shop={mockShop as any} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Gourmet Wine Shop" })
    ).toBeInTheDocument();
  });

  it("renders address summary", () => {
    render(<ShopHero shop={mockShop as any} />);
    expect(screen.getByText("Prague, Czech Republic")).toBeInTheDocument();
  });

  it("renders the management menu", () => {
    render(<ShopHero shop={mockShop as any} />);
    expect(screen.getByTestId("shop-manage-menu")).toBeInTheDocument();
  });
});
