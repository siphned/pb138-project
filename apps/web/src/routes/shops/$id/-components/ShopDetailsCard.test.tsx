import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShopDetailsCard } from "@/routes/shops/$id/-components/ShopDetailsCard";

vi.mock("@/routes/shops/$id/-components/ShopHoursDisplay", () => ({
  ShopHoursDisplay: ({ shopId }: { shopId: string }) => (
    <div data-testid="shop-hours">{shopId}</div>
  ),
}));

const mockShop = {
  address: {
    city: "Brno",
    country: "Czech Republic",
    houseNumber: "10",
    id: "addr-1",
    postalCode: "60200",
    street: "Main St",
  },
  description: "A cozy place for wine lovers.",
  id: "shop-1",
  name: "Wine Cellar",
  ownerUserId: "owner-1",
};

describe("ShopDetailsCard", () => {
  it("renders the shop description under a specific heading", () => {
    render(<ShopDetailsCard shop={mockShop as any} />);
    expect(screen.getByText("About Our Shop")).toBeInTheDocument();
    expect(screen.getByText("A cozy place for wine lovers.")).toBeInTheDocument();
  });

  it("renders location information", () => {
    render(<ShopDetailsCard shop={mockShop as any} />);
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText(/Main St 10/)).toBeInTheDocument();
  });

  it("renders ShopHoursDisplay with correct shopId", () => {
    render(<ShopDetailsCard shop={mockShop as any} />);
    const hours = screen.getByTestId("shop-hours");
    expect(hours).toBeInTheDocument();
    expect(hours).toHaveTextContent("shop-1");
  });

  it("has the shop-details-sidebar data slot", () => {
    const { container } = render(<ShopDetailsCard shop={mockShop as any} />);
    expect(container.querySelector("[data-slot='shop-details-sidebar']")).not.toBeNull();
  });
});
