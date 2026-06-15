import { vi } from "vitest";
import { describeEntityImageWrapper } from "@/routes/-components/describeEntityImageWrapper";
import { EventImage } from "@/routes/-components/EventImage";

vi.mock("@/generated/hooks/useGetEventsByIdImages", () => ({
  useGetEventsByIdImages: vi.fn(),
}));

import { useGetEventsByIdImages } from "@/generated/hooks/useGetEventsByIdImages";

describeEntityImageWrapper({
  alt: "Harvest",
  fallbackText: "Harvest Fest",
  mockHook: vi.mocked(useGetEventsByIdImages),
  name: "EventImage",
  renderWrapper: () => <EventImage alt="Harvest" eventId="e1" fallbackText="Harvest Fest" />,
  sampleUrl: "/uploads/event/h.webp",
});
