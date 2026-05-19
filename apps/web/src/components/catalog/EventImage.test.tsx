import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EventImage } from "./EventImage";

vi.mock("@/generated/hooks/useGetEventsByIdImages", () => ({
  useGetEventsByIdImages: vi.fn(),
}));

import { useGetEventsByIdImages } from "@/generated/hooks/useGetEventsByIdImages";

const mock = (data: unknown, isLoading = false) =>
  vi
    .mocked(useGetEventsByIdImages)
    .mockReturnValue({ data, isLoading } as unknown as ReturnType<typeof useGetEventsByIdImages>);

describe("EventImage", () => {
  it("renders the first attached image URL", () => {
    mock([{ id: "i1", entityId: "e1", entityType: "event", url: "/uploads/event/h.webp" }]);
    render(<EventImage alt="Harvest" eventId="e1" fallbackText="Harvest" />);
    expect(screen.getByAltText("Harvest")).toHaveAttribute("src", "/uploads/event/h.webp");
  });

  it("renders the placeholder while the hook is loading", () => {
    mock(undefined, true);
    render(<EventImage alt="Harvest" eventId="e1" fallbackText="Harvest Fest" />);
    expect(screen.queryByAltText("Harvest")).not.toBeInTheDocument();
    expect(screen.getByText("Harvest Fest")).toBeInTheDocument();
  });

  it("renders the placeholder when no images are attached", () => {
    mock([]);
    render(<EventImage alt="Harvest" eventId="e1" fallbackText="Harvest Fest" />);
    expect(screen.queryByAltText("Harvest")).not.toBeInTheDocument();
    expect(screen.getByText("Harvest Fest")).toBeInTheDocument();
  });
});
