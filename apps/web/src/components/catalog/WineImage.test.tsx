import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WineImage } from "./WineImage";

vi.mock("@/generated/hooks/useGetWinesByIdImages", () => ({
  useGetWinesByIdImages: vi.fn(),
}));

import { useGetWinesByIdImages } from "@/generated/hooks/useGetWinesByIdImages";

const mock = (data: unknown, isLoading = false) =>
  vi
    .mocked(useGetWinesByIdImages)
    .mockReturnValue({ data, isLoading } as unknown as ReturnType<typeof useGetWinesByIdImages>);

describe("WineImage", () => {
  it("renders the first attached image URL", () => {
    mock([{ id: "i1", url: "/uploads/wine/foo.webp", entityId: "w1", entityType: "wine" }]);
    render(<WineImage alt="Foo" fallbackText="Foo" wineId="w1" />);
    const img = screen.getByAltText("Foo");
    expect(img).toHaveAttribute("src", "/uploads/wine/foo.webp");
  });

  it("renders the placeholder while the hook is loading", () => {
    mock(undefined, true);
    render(<WineImage alt="Foo" fallbackText="Foo Wine" wineId="w1" />);
    expect(screen.queryByAltText("Foo")).not.toBeInTheDocument();
    expect(screen.getByText("Foo Wine")).toBeInTheDocument();
  });

  it("renders the placeholder when no images are attached", () => {
    mock([]);
    render(<WineImage alt="Foo" fallbackColor="red" fallbackText="Foo Wine" wineId="w1" />);
    expect(screen.queryByAltText("Foo")).not.toBeInTheDocument();
    expect(screen.getByText("Foo Wine")).toBeInTheDocument();
    expect(screen.getByText("red")).toBeInTheDocument();
  });
});
