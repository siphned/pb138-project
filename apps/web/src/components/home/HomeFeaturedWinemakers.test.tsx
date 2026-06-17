import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeFeaturedWinemakers } from "./HomeFeaturedWinemakers";

vi.mock("@/generated/hooks/useGetWinemakers", () => ({
  useGetWinemakers: vi.fn(),
}));

vi.mock("@/components/catalog/WinemakerCard", () => ({
  WinemakerCard: ({ winemaker }: { winemaker: { id: string; name: string } }) => (
    <div data-testid="winemaker-card">{winemaker.name}</div>
  ),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a data-testid="link" href={to}>
      {children}
    </a>
  ),
}));

import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";

describe("HomeFeaturedWinemakers", () => {
  it("renders the loading state while fetching", () => {
    vi.mocked(useGetWinemakers).mockReturnValue({ isLoading: true } as ReturnType<
      typeof useGetWinemakers
    >);
    const { container } = render(<HomeFeaturedWinemakers />);
    expect(container.querySelector("[data-slot='loading-state']")).toBeInTheDocument();
  });

  it("renders nothing when the winemaker list is empty", () => {
    vi.mocked(useGetWinemakers).mockReturnValue({
      data: { data: [], limit: 0, page: 1, total: 0 },
      isLoading: false,
    } as ReturnType<typeof useGetWinemakers>);
    const { container } = render(<HomeFeaturedWinemakers />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders at most three winemakers from the list", () => {
    vi.mocked(useGetWinemakers).mockReturnValue({
      data: {
        data: Array.from({ length: 7 }, (_, i) => ({ id: `m${i}`, name: `Maker ${i}` })),
        limit: 0,
        page: 1,
        total: 7,
      },
      isLoading: false,
    } as ReturnType<typeof useGetWinemakers>);
    render(<HomeFeaturedWinemakers />);
    expect(screen.getAllByTestId("winemaker-card")).toHaveLength(3);
    expect(screen.queryByText("Maker 3")).not.toBeInTheDocument();
  });

  it("renders a View all link to /winemakers", () => {
    vi.mocked(useGetWinemakers).mockReturnValue({
      data: { data: [{ id: "m1", name: "Maker 1" }], limit: 0, page: 1, total: 1 },
      isLoading: false,
    } as ReturnType<typeof useGetWinemakers>);
    render(<HomeFeaturedWinemakers />);
    const link = screen
      .getAllByTestId("link")
      .find((el) => el.getAttribute("href") === "/winemakers");
    expect(link).toBeDefined();
  });
});
