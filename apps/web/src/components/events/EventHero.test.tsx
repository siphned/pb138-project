import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EventHero } from "./EventHero";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: any) => (
    <a data-testid="link" href={`${to}/${params?.id ?? ""}`}>
      {children}
    </a>
  ),
}));

const baseEvent = {
  id: "evt-1",
  title: "Spring Wine Festival",
  startDate: "2026-06-01T10:00:00Z",
  endDate: "2026-06-01T18:00:00Z",
  location: "Brno, Moravia",
  winemakerName: "Lechovice",
  winemakerId: "wm-1",
} as const;

describe("EventHero", () => {
  it("renders the event title", () => {
    render(<EventHero event={baseEvent} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Spring Wine Festival");
  });

  it("falls back to 'Untitled Event' when no title or name", () => {
    render(<EventHero event={{ id: "evt-2" }} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Untitled Event");
  });

  it("renders the location and winemaker name", () => {
    render(<EventHero event={baseEvent} />);
    expect(screen.getByText("Brno, Moravia")).toBeInTheDocument();
    expect(screen.getByText("Lechovice")).toBeInTheDocument();
  });

  it("links the winemaker name when winemakerId is provided", () => {
    render(<EventHero event={baseEvent} />);
    const link = screen.getByTestId("link");
    expect(link).toHaveAttribute("href", "/winemakers/$id/wm-1");
  });

  it("renders the image when imageUrl is provided", () => {
    render(<EventHero event={{ ...baseEvent, imageUrl: "https://example.com/hero.jpg" }} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/hero.jpg");
  });
});
