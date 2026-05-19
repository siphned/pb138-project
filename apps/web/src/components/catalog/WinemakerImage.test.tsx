import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WinemakerImage } from "./WinemakerImage";

vi.mock("@/generated/hooks/useGetWinemakersByIdImages", () => ({
  useGetWinemakersByIdImages: vi.fn(),
}));

import { useGetWinemakersByIdImages } from "@/generated/hooks/useGetWinemakersByIdImages";

const mock = (data: unknown, isLoading = false) =>
  vi
    .mocked(useGetWinemakersByIdImages)
    .mockReturnValue({ data, isLoading } as unknown as ReturnType<
      typeof useGetWinemakersByIdImages
    >);

describe("WinemakerImage", () => {
  it("renders the first attached image URL", () => {
    mock([{ id: "i1", entityId: "wm1", entityType: "winemaker", url: "/uploads/winemaker/a.webp" }]);
    render(<WinemakerImage alt="Acme" fallbackText="Acme" winemakerId="wm1" />);
    expect(screen.getByAltText("Acme")).toHaveAttribute("src", "/uploads/winemaker/a.webp");
  });

  it("renders the placeholder while the hook is loading", () => {
    mock(undefined, true);
    render(<WinemakerImage alt="Acme" fallbackText="Acme Winery" winemakerId="wm1" />);
    expect(screen.queryByAltText("Acme")).not.toBeInTheDocument();
    expect(screen.getByText("Acme Winery")).toBeInTheDocument();
  });

  it("renders the placeholder when no images are attached", () => {
    mock([]);
    render(<WinemakerImage alt="Acme" fallbackText="Acme Winery" winemakerId="wm1" />);
    expect(screen.queryByAltText("Acme")).not.toBeInTheDocument();
    expect(screen.getByText("Acme Winery")).toBeInTheDocument();
  });
});
