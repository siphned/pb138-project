import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeFeaturedEvents } from "@/routes/-components/HomeFeaturedEvents";

vi.mock("@/generated/hooks/useGetEvents", () => ({
  useGetEvents: vi.fn(),
}));

vi.mock("@/routes/-components/EventCard", () => ({
  EventCard: ({ event }: { event: { id: string; name: string } }) => (
    <div data-testid="event-card">{event.name}</div>
  ),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a data-testid="link" href={to}>
      {children}
    </a>
  ),
}));

import { useGetEvents } from "@/generated/hooks/useGetEvents";

describe("HomeFeaturedEvents", () => {
  it("renders the loading state while fetching", () => {
    vi.mocked(useGetEvents).mockReturnValue({ isLoading: true } as ReturnType<typeof useGetEvents>);
    const { container } = render(<HomeFeaturedEvents />);
    expect(container.querySelector("[data-slot='loading-state']")).toBeInTheDocument();
  });

  it("renders nothing when no events are returned", () => {
    vi.mocked(useGetEvents).mockReturnValue({ data: [], isLoading: false } as ReturnType<
      typeof useGetEvents
    >);
    const { container } = render(<HomeFeaturedEvents />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders at most three events from the list", () => {
    vi.mocked(useGetEvents).mockReturnValue({
      data: Array.from({ length: 6 }, (_, i) => ({ id: `e${i}`, name: `Event ${i}` })),
      isLoading: false,
    } as ReturnType<typeof useGetEvents>);
    render(<HomeFeaturedEvents />);
    expect(screen.getAllByTestId("event-card")).toHaveLength(3);
    expect(screen.queryByText("Event 3")).not.toBeInTheDocument();
  });

  it("renders a View all link to /events", () => {
    vi.mocked(useGetEvents).mockReturnValue({
      data: [{ id: "e1", name: "Event 1" }],
      isLoading: false,
    } as ReturnType<typeof useGetEvents>);
    render(<HomeFeaturedEvents />);
    const link = screen.getAllByTestId("link").find((el) => el.getAttribute("href") === "/events");
    expect(link).toBeDefined();
  });
});
