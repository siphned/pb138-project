import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShopOwnerStatsSection } from "./ShopOwnerStatsSection";

vi.mock("@/generated/hooks/useGetStats", () => ({
  useGetStats: vi.fn(),
}));

import { useGetStats } from "@/generated/hooks/useGetStats";

const mock = (data: unknown, overrides: Record<string, unknown> = {}) =>
  vi.mocked(useGetStats).mockReturnValue({
    data,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useGetStats>);

describe("ShopOwnerStatsSection", () => {
  it("renders the loading state while fetching", () => {
    mock(undefined, { isLoading: true });
    const { container } = render(<ShopOwnerStatsSection />);
    expect(container.querySelector("[data-slot='loading-state']")).toBeInTheDocument();
  });

  it("renders shop-owner tiles populated from the API", () => {
    mock({
      orderItemsProcessed: 42,
      productsByType: { bundles: 5, standard: 18 },
      revenue: 12500,
      role: "shop_owner",
      shopsCount: 3,
      supplyAgreementsByStatus: { approved: 6, pending: 1, rejected: 0 },
      totalStockValue: 9300,
    });
    render(<ShopOwnerStatsSection />);
    expect(screen.getByText("Shops")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.getByText("Bundles")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Orders processed")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders an error state when the hook fails", () => {
    mock(undefined, { isError: true });
    render(<ShopOwnerStatsSection />);
    expect(screen.getByText(/Stats unavailable/i)).toBeInTheDocument();
  });
});
