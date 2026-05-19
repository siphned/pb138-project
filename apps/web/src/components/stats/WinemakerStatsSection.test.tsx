import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WinemakerStatsSection } from "./WinemakerStatsSection";

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

describe("WinemakerStatsSection", () => {
  it("renders the loading state while fetching", () => {
    mock(undefined, { isLoading: true });
    const { container } = render(<WinemakerStatsSection />);
    expect(container.querySelector("[data-slot='stat-tiles-skeleton']")).toBeInTheDocument();
  });

  it("renders winemaker tiles populated from the API", () => {
    mock({
      avgReviewScore: 4.25,
      eventsByStatus: { approved: 3, pending: 1, rejected: 0 },
      role: "winemaker",
      supplyAgreementsByStatus: { approved: 2, pending: 4, rejected: 1 },
      totalStock: 215,
      wineCount: 11,
    });
    render(<WinemakerStatsSection />);
    expect(screen.getByText("Wines in catalog")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("Total stock")).toBeInTheDocument();
    expect(screen.getByText("215")).toBeInTheDocument();
    expect(screen.getByText("Approved events")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Approved supply agreements")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/4\.[23]/)).toBeInTheDocument();
  });

  it("falls back to an em-dash when avgReviewScore is null", () => {
    mock({
      avgReviewScore: null,
      eventsByStatus: { approved: 0, pending: 0, rejected: 0 },
      role: "winemaker",
      supplyAgreementsByStatus: { approved: 0, pending: 0, rejected: 0 },
      totalStock: 0,
      wineCount: 0,
    });
    render(<WinemakerStatsSection />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders an error state when the hook fails", () => {
    mock(undefined, { isError: true });
    render(<WinemakerStatsSection />);
    expect(screen.getByText(/Stats unavailable/i)).toBeInTheDocument();
  });
});
