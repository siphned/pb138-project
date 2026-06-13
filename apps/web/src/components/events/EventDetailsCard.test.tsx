import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EventDetailsCard } from "./EventDetailsCard";

vi.mock("./EventRegistrationButton", () => ({
  EventRegistrationButton: ({
    eventId,
    isRegistered,
  }: {
    eventId: string;
    isRegistered: boolean;
  }) => (
    <button data-event-id={eventId} data-testid="register-btn" type="button">
      {isRegistered ? "registered" : "register"}
    </button>
  ),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    params,
  }: {
    children: React.ReactNode;
    to: string;
    params?: { id: string };
  }) => (
    <a data-testid="link" href={`${to}/${params?.id ?? ""}`}>
      {children}
    </a>
  ),
}));

const baseEvent = {
  address: {
    city: "Brno",
    country: "Czech Republic",
    houseNumber: "12",
    postalCode: "60200",
    street: "Hlavná",
  },
  attendees: 42,
  capacity: 80,
  description: "A celebration of new vintages and old friendships.",
  endTime: "2026-06-01T18:00:00Z",
  id: "evt-1",
  startTime: "2026-06-01T10:00:00Z",
  winemaker: { id: "wm-1", name: "Lechovice" },
};

describe("EventDetailsCard", () => {
  it("renders the 'About this event' heading and description", () => {
    render(<EventDetailsCard event={baseEvent} />);
    expect(screen.getByText(/about this event/i)).toBeInTheDocument();
    expect(screen.getByText(/celebration of new vintages/i)).toBeInTheDocument();
  });

  it("renders 'No description available.' fallback when description is missing", () => {
    render(<EventDetailsCard event={{ id: "evt-2" }} />);
    expect(screen.getByText(/no description available/i)).toBeInTheDocument();
  });

  it("renders a 'Hosted by' tablet with a link to the winemaker", () => {
    render(<EventDetailsCard event={baseEvent} />);
    expect(screen.getByText(/hosted by/i)).toBeInTheDocument();
    const link = screen.getAllByTestId("link").find((el) => el.textContent === "Lechovice");
    expect(link).toBeDefined();
    expect(link).toHaveAttribute("href", "/winemakers/$id/wm-1");
  });

  it("renders a Location tablet with the formatted address", () => {
    render(<EventDetailsCard event={baseEvent} />);
    expect(screen.getByText(/^location$/i)).toBeInTheDocument();
    expect(screen.getByText("Hlavná 12")).toBeInTheDocument();
    expect(screen.getByText("60200 Brno")).toBeInTheDocument();
    expect(screen.getByText("Czech Republic")).toBeInTheDocument();
  });

  it("renders a Capacity tablet with spots remaining", () => {
    render(<EventDetailsCard event={baseEvent} />);
    expect(screen.getByText(/80 total spots/i)).toBeInTheDocument();
    expect(screen.getByText(/of 80 spots remaining/i)).toBeInTheDocument();
    expect(screen.getByText(/42 attending/i)).toBeInTheDocument();
  });

  it("omits tablets for missing optional fields", () => {
    render(<EventDetailsCard event={{ id: "evt-3" }} />);
    expect(screen.queryByText(/hosted by/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^location$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^capacity$/i)).not.toBeInTheDocument();
  });

  it("forwards the eventId and registration status to EventRegistrationButton", () => {
    render(<EventDetailsCard event={{ ...baseEvent, isRegisteredByMe: true }} />);
    const btn = screen.getByTestId("register-btn");
    expect(btn).toHaveAttribute("data-event-id", "evt-1");
    expect(btn).toHaveTextContent("registered");
  });
});
