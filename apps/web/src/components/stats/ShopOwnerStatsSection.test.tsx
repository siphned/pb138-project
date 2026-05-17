import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShopOwnerStatsSection } from "./ShopOwnerStatsSection";

vi.mock("@/generated/hooks/useGetShopsMe", () => ({
  useGetShopsMe: vi.fn(),
}));

import { useGetShopsMe } from "@/generated/hooks/useGetShopsMe";

const mockShops = [
  { id: "s1", name: "Shop A" },
  { id: "s2", name: "Shop B" },
];

describe("ShopOwnerStatsSection", () => {
  it("renders the section heading", () => {
    vi.mocked(useGetShopsMe).mockReturnValue({
      data: mockShops,
      isLoading: false,
    } as any);
    render(<ShopOwnerStatsSection />);
    expect(screen.getByText(/Shop performance/i)).toBeInTheDocument();
  });

  it("renders shops count from useGetShopsMe", () => {
    vi.mocked(useGetShopsMe).mockReturnValue({
      data: mockShops,
      isLoading: false,
    } as any);
    render(<ShopOwnerStatsSection />);
    expect(screen.getByText("Shops")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders all six shop owner tiles", () => {
    vi.mocked(useGetShopsMe).mockReturnValue({
      data: mockShops,
      isLoading: false,
    } as any);
    render(<ShopOwnerStatsSection />);
    expect(screen.getByText("Shops")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Bundles")).toBeInTheDocument();
    expect(screen.getByText("Total stock value")).toBeInTheDocument();
    expect(screen.getByText("Orders processed")).toBeInTheDocument();
    expect(screen.getByText("Revenue")).toBeInTheDocument();
  });

  it("shows loading state while shops query is pending", () => {
    vi.mocked(useGetShopsMe).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);
    const { container } = render(<ShopOwnerStatsSection />);
    expect(container.querySelector('[data-slot="loading-state"]')).toBeInTheDocument();
  });

  it("renders em-dash placeholders for BE-backlog tiles", () => {
    vi.mocked(useGetShopsMe).mockReturnValue({
      data: mockShops,
      isLoading: false,
    } as any);
    const { container } = render(<ShopOwnerStatsSection />);
    // 5 tiles depend on missing BE aggregator endpoints
    const hints = container.querySelectorAll('[data-slot="stat-tile-hint"]');
    expect(hints.length).toBeGreaterThanOrEqual(5);
  });
});
