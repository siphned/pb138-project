import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WinemakerStatsSection } from "./WinemakerStatsSection";

vi.mock("@/generated/hooks/useGetWines", () => ({
  useGetWines: vi.fn(),
}));
vi.mock("@/generated/hooks/useGetEvents", () => ({
  useGetEvents: vi.fn(),
}));
vi.mock("@/generated/hooks/useGetSupplyAgreementsWinemaker", () => ({
  useGetSupplyAgreementsWinemaker: vi.fn(),
}));

import { useGetEvents } from "@/generated/hooks/useGetEvents";
import { useGetSupplyAgreementsWinemaker } from "@/generated/hooks/useGetSupplyAgreementsWinemaker";
import { useGetWines } from "@/generated/hooks/useGetWines";

const mockWines = [
  { id: "w1", name: "Pálava 2022", quantity: 120 },
  { id: "w2", name: "Müller 2021", quantity: 80 },
  { id: "w3", name: "Riesling 2020", quantity: "55" },
];

const mockEvents = [{ id: "e1" }, { id: "e2" }];
const mockSupply = [{ id: "s1" }];

function setMocks({
  wines = mockWines,
  events = mockEvents,
  supply = mockSupply,
  isLoading = false,
}: {
  wines?: unknown;
  events?: unknown;
  supply?: unknown;
  isLoading?: boolean;
}) {
  vi.mocked(useGetWines).mockReturnValue({
    data: wines,
    isLoading,
    isError: false,
  } as any);
  vi.mocked(useGetEvents).mockReturnValue({
    data: events,
    isLoading,
    isError: false,
  } as any);
  vi.mocked(useGetSupplyAgreementsWinemaker).mockReturnValue({
    data: supply,
    isLoading,
    isError: false,
  } as any);
}

describe("WinemakerStatsSection", () => {
  it("renders the section heading", () => {
    setMocks({});
    render(<WinemakerStatsSection />);
    expect(screen.getByText(/winemaker/i)).toBeInTheDocument();
  });

  it("renders wine catalog count from useGetWines", () => {
    setMocks({});
    render(<WinemakerStatsSection />);
    expect(screen.getByText("Wines in catalog")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("sums total stock across wines (handles string and number quantities)", () => {
    setMocks({});
    render(<WinemakerStatsSection />);
    expect(screen.getByText("Total stock")).toBeInTheDocument();
    // 120 + 80 + 55 = 255
    expect(screen.getByText("255")).toBeInTheDocument();
  });

  it("renders events created count", () => {
    setMocks({});
    render(<WinemakerStatsSection />);
    expect(screen.getByText("Events created")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders supply agreements count", () => {
    setMocks({});
    render(<WinemakerStatsSection />);
    expect(screen.getByText("Supply agreements")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("shows loading state while any query is pending", () => {
    setMocks({ isLoading: true });
    const { container } = render(<WinemakerStatsSection />);
    expect(container.querySelector('[data-slot="loading-state"]')).toBeInTheDocument();
  });

  it("falls back to em-dash for the Average review score tile (BE backlog)", () => {
    setMocks({});
    render(<WinemakerStatsSection />);
    expect(screen.getByText("Average review score")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
