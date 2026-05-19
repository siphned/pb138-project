import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminStatsSection } from "./AdminStatsSection";

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

describe("AdminStatsSection", () => {
  it("renders the loading state while fetching", () => {
    mock(undefined, { isLoading: true });
    const { container } = render(<AdminStatsSection />);
    expect(container.querySelector("[data-slot='stat-tiles-skeleton']")).toBeInTheDocument();
  });

  it("renders admin tiles populated from the API", () => {
    mock({
      deletedReviews: 3,
      pendingEvents: 2,
      pendingRoleRequests: 4,
      role: "admin",
      totalEvents: 50,
      totalProducts: 120,
      totalRevenue: 999,
      totalShops: 7,
      totalWinemakers: 11,
      usersByRole: { admin: 1, customer: 30, shop_owner: 4, winemaker: 6 },
    });
    render(<AdminStatsSection />);
    expect(screen.getByText("Users (total)")).toBeInTheDocument();
    expect(screen.getByText("41")).toBeInTheDocument(); // 1 + 30 + 4 + 6
    expect(screen.getByText("Pending role requests")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Pending events")).toBeInTheDocument();
    expect(screen.getByText("Deleted reviews")).toBeInTheDocument();
    expect(screen.getByText("Total products")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("Total shops")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Total winemakers")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
  });

  it("renders an error state when the hook fails", () => {
    mock(undefined, { isError: true });
    render(<AdminStatsSection />);
    expect(screen.getByText(/Stats unavailable/i)).toBeInTheDocument();
  });
});
