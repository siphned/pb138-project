import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WinemakerTabs } from "../routes/-components/WinemakerTabs";

// Mock the router
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: any) => <a href="/">{children}</a>,
}));

// Mock the hook
vi.mock("@/generated/hooks/useGetWinemakersByIdReviews", () => ({
  useGetWinemakersByIdReviews: vi.fn(),
}));

// Mock the components used inside - use paths relative to the test file
vi.mock("../routes/-components/WinemakerWinesList", () => ({
  WinemakerWinesList: () => <div data-testid="wines-list">Wines List</div>,
}));
vi.mock("../routes/-components/EventCard", () => ({
  EventCard: ({ event }: any) => <div data-testid="event-card">{event.name}</div>,
}));
vi.mock("../routes/-components/EntityReviewsSection", () => ({
  EntityReviewsSection: ({ title }: any) => <div data-testid="reviews-section">{title}</div>,
}));

import { useGetWinemakersByIdReviews } from "@/generated/hooks/useGetWinemakersByIdReviews";

describe("WinemakerTabs", () => {
  const mockWinemaker = {
    events: [{ endTime: "2024-01-01", id: "e1", name: "Event 1", startTime: "2024-01-01" }],
    id: "wm1",
    name: "Winemaker 1",
    wines: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetWinemakersByIdReviews).mockReturnValue({ isLoading: false } as any);
  });

  it("renders wines tab by default", () => {
    render(<WinemakerTabs winemaker={mockWinemaker as any} />);
    expect(screen.getByTestId("wines-list")).toBeInTheDocument();
  });

  it("switches to events tab", async () => {
    const user = userEvent.setup();
    render(<WinemakerTabs winemaker={mockWinemaker as any} />);

    await user.click(screen.getByRole("tab", { name: /events/i }));
    expect(screen.getByTestId("event-card")).toHaveTextContent("Event 1");
  });

  it("switches to reviews tab", async () => {
    const user = userEvent.setup();
    render(<WinemakerTabs winemaker={mockWinemaker as any} />);

    await user.click(screen.getByRole("tab", { name: /reviews/i }));
    expect(screen.getByTestId("reviews-section")).toHaveTextContent("Winemaker Reviews");
  });
});
