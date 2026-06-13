import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CustomerStatsSection } from "./CustomerStatsSection";

vi.mock("@/generated/hooks/useGetStats", () => ({
  useGetStats: vi.fn(),
}));

import { useGetStats } from "@/generated/hooks/useGetStats";

const mock = (data: unknown, overrides: Record<string, unknown> = {}) =>
  vi.mocked(useGetStats).mockReturnValue({
    data,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useGetStats>);

describe("CustomerStatsSection", () => {
  it("renders the loading state while fetching", () => {
    mock(undefined, { isLoading: true });
    const { container } = render(<CustomerStatsSection />);
    expect(container.querySelector("[data-slot='stat-tiles-skeleton']")).toBeInTheDocument();
  });

  it("renders all four customer stat tiles with API values", () => {
    mock({
      eventsAttended: 4,
      ordersCount: 12,
      reviewsWritten: 7,
      role: "customer",
      totalSpent: 350,
    });
    render(<CustomerStatsSection />);
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Events attended")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Reviews written")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Total spent")).toBeInTheDocument();
  });

  it("falls back to the error state when the hook fails", () => {
    mock(undefined, { isError: true });
    render(<CustomerStatsSection />);
    expect(screen.getByText(/Stats unavailable/i)).toBeInTheDocument();
  });
});
