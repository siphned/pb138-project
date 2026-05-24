import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeFeaturedWines } from "./HomeFeaturedWines";

vi.mock("@/generated/hooks/useGetWines", () => ({
  useGetWines: vi.fn(),
}));

vi.mock("@/components/catalog/WineCard", () => ({
  WineCard: ({ wine }: { wine: { id: string; name: string } }) => (
    <div data-testid="wine-card">{wine.name}</div>
  ),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a data-testid="link" href={to}>
      {children}
    </a>
  ),
}));

import { useGetWines } from "@/generated/hooks/useGetWines";

describe("HomeFeaturedWines", () => {
  it("renders nothing when loading", () => {
    vi.mocked(useGetWines).mockReturnValue({ isLoading: true } as ReturnType<typeof useGetWines>);
    const { container } = render(<HomeFeaturedWines />);
    expect(container.querySelector("[data-slot='loading-state']")).toBeInTheDocument();
  });

  it("renders nothing when the wine list is empty", () => {
    vi.mocked(useGetWines).mockReturnValue({ data: [], isLoading: false } as ReturnType<
      typeof useGetWines
    >);
    const { container } = render(<HomeFeaturedWines />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders at most three wines from the list", () => {
    vi.mocked(useGetWines).mockReturnValue({
      data: Array.from({ length: 5 }, (_, i) => ({ id: `w${i}`, name: `Wine ${i}` })),
      isLoading: false,
    } as ReturnType<typeof useGetWines>);
    render(<HomeFeaturedWines />);
    expect(screen.getAllByTestId("wine-card")).toHaveLength(3);
    expect(screen.getByText("Wine 0")).toBeInTheDocument();
    expect(screen.queryByText("Wine 3")).not.toBeInTheDocument();
  });

  it("renders a View all link to /explore", () => {
    vi.mocked(useGetWines).mockReturnValue({
      data: [{ id: "w1", name: "Wine 1" }],
      isLoading: false,
    } as ReturnType<typeof useGetWines>);
    render(<HomeFeaturedWines />);
    const link = screen.getAllByTestId("link").find((el) => el.getAttribute("href") === "/explore");
    expect(link).toBeDefined();
  });
});
