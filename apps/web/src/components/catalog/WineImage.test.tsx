import { vi } from "vitest";
import { describeEntityImageWrapper } from "./__tests__/describeEntityImageWrapper";
import { WineImage } from "./WineImage";

vi.mock("@/generated/hooks/useGetWinesByIdImages", () => ({
  useGetWinesByIdImages: vi.fn(),
}));

import { useGetWinesByIdImages } from "@/generated/hooks/useGetWinesByIdImages";

describeEntityImageWrapper({
  alt: "Foo",
  fallbackText: "Foo Wine",
  mockHook: vi.mocked(useGetWinesByIdImages),
  name: "WineImage",
  renderWrapper: () => <WineImage alt="Foo" fallbackText="Foo Wine" wineId="w1" />,
  sampleUrl: "/uploads/wine/foo.webp",
});
