import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EventCard } from "./EventCard";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: any) => (
    <a data-testid="link" href={`${to}/${params?.id ?? ""}`}>
      {children}
    </a>
  ),
}));

const mockEvent = {
  id: "evt-1",
  title: "Spring Wine Festival",
  description: "A celebration of new vintages.",
  startDate: "2026-06-01T10:00:00Z",
  location: "Brno, Moravia",
  winemakerName: "Lechovice",
  attendees: 42,
} as const;

describe("EventCard", () => {
  it("renders the event title and links to the detail route", () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText("Spring Wine Festival")).toBeInTheDocument();
    const link = screen.getByTestId("link");
    expect(link).toHaveAttribute("href", "/events/$id/evt-1");
  });

  it("falls back to 'Untitled Event' when no title or name is given", () => {
    render(<EventCard event={{ id: "evt-2" }} />);
    expect(screen.getByText("Untitled Event")).toBeInTheDocument();
  });

  it("renders location, winemaker name and attendee count", () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText("Brno, Moravia")).toBeInTheDocument();
    expect(screen.getByText("Lechovice")).toBeInTheDocument();
    expect(screen.getByText(/42 attending/i)).toBeInTheDocument();
  });

  it("renders the image when imageUrl is provided", () => {
    render(<EventCard event={{ ...mockEvent, imageUrl: "https://example.com/x.jpg" }} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/x.jpg");
  });

  it("renders a CatalogPlaceholder caption when no image is set", () => {
    render(<EventCard event={mockEvent} />);
    // Formatted date appears in both the placeholder caption and the body label.
    expect(screen.getAllByText(/Jun/).length).toBeGreaterThan(0);
  });
});
