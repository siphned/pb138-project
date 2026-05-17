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

const baseEvent = {
  id: "evt-1",
  description: "A celebration of new vintages and old friendships.",
  startDate: "2026-06-01T10:00:00Z",
  endDate: "2026-06-01T18:00:00Z",
  location: "Brno, Moravia",
  capacity: 80,
  attendees: 42,
};

describe("EventDetailsCard", () => {
  it("renders the section heading", () => {
    render(<EventDetailsCard event={baseEvent} />);
    expect(screen.getByText(/about this event/i)).toBeInTheDocument();
  });

  it("renders the description text", () => {
    render(<EventDetailsCard event={baseEvent} />);
    expect(screen.getByText(/celebration of new vintages/i)).toBeInTheDocument();
  });

  it("renders location, capacity and attendees", () => {
    render(<EventDetailsCard event={baseEvent} />);
    expect(screen.getByText("Brno, Moravia")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("42 people")).toBeInTheDocument();
  });

  it("forwards the eventId and registration status to EventRegistrationButton", () => {
    render(<EventDetailsCard event={{ ...baseEvent, isRegisteredByMe: true }} />);
    const btn = screen.getByTestId("register-btn");
    expect(btn).toHaveAttribute("data-event-id", "evt-1");
    expect(btn).toHaveTextContent("registered");
  });

  it("omits property rows for missing optional fields", () => {
    render(<EventDetailsCard event={{ id: "evt-2" }} />);
    expect(screen.queryByText("Location")).not.toBeInTheDocument();
    expect(screen.queryByText("Capacity")).not.toBeInTheDocument();
  });
});
