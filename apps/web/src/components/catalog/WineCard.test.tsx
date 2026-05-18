import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { GetWines200Item } from "./WineCard";
import { WineCard } from "./WineCard";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    params,
  }: {
    children: React.ReactNode;
    to: string;
    params?: { id?: string; productId?: string };
  }) => <a href={`${to}/${params?.id || params?.productId || ""}`}>{children}</a>,
}));

vi.mock("@/generated/hooks/useGetWinesByIdImages", () => ({
  useGetWinesByIdImages: vi.fn(),
}));

import { useGetWinesByIdImages } from "@/generated/hooks/useGetWinesByIdImages";

const mockWine = {
  color: "white",
  id: "wine-1",
  name: "Chardonnay 2022",
  region: "Moravia",
  vintageYear: 2022,
  winemaker: { id: "wm-1", name: "Lechovice" },
} as unknown as GetWines200Item;

const setImages = (data: unknown) =>
  vi.mocked(useGetWinesByIdImages).mockReturnValue({ data, isLoading: false } as unknown as ReturnType<
    typeof useGetWinesByIdImages
  >);

describe("WineCard", () => {
  it("renders wine name and region", () => {
    setImages([]);
    render(<WineCard wine={mockWine} />);
    expect(screen.getAllByText("Chardonnay 2022").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/white/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Moravia/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2022/).length).toBeGreaterThan(0);
  });

  it("renders link to correct URL", () => {
    setImages([]);
    render(<WineCard wine={mockWine} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/wines/$id/wine-1");
  });

  it("renders min-price badge when provided", () => {
    setImages([]);
    render(<WineCard minPrice={450} wine={mockWine} />);
    expect(screen.getByText(/from €450/i)).toBeInTheDocument();
  });

  it("renders CatalogPlaceholder when the images hook returns nothing", () => {
    setImages([]);
    render(<WineCard wine={mockWine} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getAllByText(/chardonnay/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/white/i).length).toBeGreaterThan(0);
  });

  it("renders the first image URL when the hook returns images", () => {
    setImages([{ id: "i1", entityId: "wine-1", entityType: "wine", url: "https://example.com/wine.jpg" }]);
    render(<WineCard wine={mockWine} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/wine.jpg");
  });
});
