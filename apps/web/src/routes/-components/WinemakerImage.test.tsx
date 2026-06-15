import { vi } from "vitest";
import { describeEntityImageWrapper } from "@/routes/-components/describeEntityImageWrapper";
import { WinemakerImage } from "@/routes/-components/WinemakerImage";

vi.mock("@/generated/hooks/useGetWinemakersByIdImages", () => ({
  useGetWinemakersByIdImages: vi.fn(),
}));

import { useGetWinemakersByIdImages } from "@/generated/hooks/useGetWinemakersByIdImages";

describeEntityImageWrapper({
  alt: "Acme",
  fallbackText: "Acme Winery",
  mockHook: vi.mocked(useGetWinemakersByIdImages),
  name: "WinemakerImage",
  renderWrapper: () => <WinemakerImage alt="Acme" fallbackText="Acme Winery" winemakerId="wm1" />,
  sampleUrl: "/uploads/winemaker/a.webp",
});
