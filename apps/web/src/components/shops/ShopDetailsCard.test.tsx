import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShopDetailsCard } from "./ShopDetailsCard";

vi.mock("@/routes/-components/ShopHoursDisplay", () => ({
  ShopHoursDisplay: ({ shopId }: { shopId: string }) => (
    <div data-testid="shop-hours">{shopId}</div>
  ),
}));

vi.mock("@/hooks/useIsOwner", () => ({
  useIsOwner: vi.fn(() => false),
}));

import { useIsOwner } from "@/hooks/useIsOwner";

const mockShop = {
  id: "shop-1",
  name: "Wine Cellar",
  address: {
    city: "Brno",
    country: "Czech Republic",
    houseNumber: "10",
    id: "addr-1",
    postalCode: "60200",
    street: "Main St",
  },
  description: "A cozy place for wine lovers.",
  ownerUserId: "owner-1",
};

describe("ShopDetailsCard", () => {
  it("renders the shop description", () => {
    render(<ShopDetailsCard shop={mockShop as any} />);
    expect(screen.getByText("A cozy place for wine lovers.")).toBeInTheDocument();
  });

  it("renders the address details", () => {
    render(<ShopDetailsCard shop={mockShop as any} />);
    expect(screen.getByText(/Main St 10/)).toBeInTheDocument();
    expect(screen.getByText(/60200 Brno/)).toBeInTheDocument();
  });

  it("renders ShopHoursDisplay with correct shopId", () => {
    render(<ShopDetailsCard shop={mockShop as any} />);
    const hours = screen.getByTestId("shop-hours");
    expect(hours).toBeInTheDocument();
    expect(hours).toHaveTextContent("shop-1");
  });

  it("does not render Manage menu for non-owners", () => {
    vi.mocked(useIsOwner).mockReturnValue(false);
    render(<ShopDetailsCard shop={mockShop as any} />);
    expect(screen.queryByTestId("shop-manage-menu")).not.toBeInTheDocument();
  });

  it("renders Manage menu for owners", () => {
    vi.mocked(useIsOwner).mockReturnValue(true);
    render(<ShopDetailsCard shop={mockShop as any} />);
    expect(screen.getByTestId("shop-manage-menu")).toBeInTheDocument();
  });
});
