import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShopManageMenu } from "./ShopManageMenu";

// Mock @tanstack/react-router Link
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params, search }: any) => (
    <div
      data-params={JSON.stringify(params)}
      data-search={JSON.stringify(search)}
      data-testid="link"
      data-to={to}
    >
      {children}
    </div>
  ),
}));

// Mock useIsOwner
vi.mock("@/hooks/useIsOwner", () => ({
  useIsOwner: vi.fn(() => false),
}));

import { useIsOwner } from "@/hooks/useIsOwner";

const mockShop = {
  id: "shop-123",
  name: "Wine Hub",
  ownerUserId: "owner-abc",
};

describe("ShopManageMenu", () => {
  it("does not render when user is not the owner", () => {
    vi.mocked(useIsOwner).mockReturnValue(false);
    const { container } = render(<ShopManageMenu shop={mockShop as any} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders when user is the owner", () => {
    vi.mocked(useIsOwner).mockReturnValue(true);
    render(<ShopManageMenu shop={mockShop as any} />);
    expect(screen.getByRole("button", { name: /open management menu/i })).toBeInTheDocument();
  });

  it("contains all management links with correct hrefs", () => {
    vi.mocked(useIsOwner).mockReturnValue(true);
    render(<ShopManageMenu shop={mockShop as any} />);

    // We need to open the menu to see the items
    const trigger = screen.getByRole("button", { name: /open management menu/i });
    fireEvent.click(trigger);

    const expectedLinks = [
      { text: /edit shop details/i, to: "/shops/$id/edit" },
      { text: /manage images/i, to: "/shops/$id/images" },
      { text: /manage availability/i, to: "/shops/$id/availability" },
      { search: { isBundle: undefined }, text: /manage inventory/i, to: "/shops/$id/inventory" },
      { text: /incoming orders/i, to: "/shops/$id/orders" },
      { text: /supply agreements/i, to: "/shops/$id/supply-browse" },
    ];

    for (const link of expectedLinks) {
      const el = screen.getByText(link.text).closest('[data-testid="link"]');
      expect(el).toHaveAttribute("data-to", link.to);
      expect(el).toHaveAttribute("data-params", JSON.stringify({ id: "shop-123" }));
      if (link.search) {
        expect(el).toHaveAttribute("data-search", JSON.stringify(link.search));
      }
    }
  });
});
