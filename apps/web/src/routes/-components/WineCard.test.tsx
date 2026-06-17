import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WineCard } from "@/routes/-components/WineCard";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: any) => (
    <a href={`${to}/${params?.id || params?.productId || ""}`}>{children}</a>
  ),
}));

// WineCard renders WineImage, which fetches via this generated react-query hook.
// Mock it so the card renders without a QueryClientProvider; empty data -> placeholder.
vi.mock("@/generated/hooks/useGetWinesByIdImages", () => ({
  useGetWinesByIdImages: vi.fn(() => ({ data: undefined, isLoading: false })),
}));

const mockWine = {
  color: "white",
  id: "wine-1",
  name: "Chardonnay 2022",
  region: "Moravia",
  vintageYear: 2022,
  winemaker: { id: "wm-1", name: "Lechovice" },
} as any;

describe("WineCard", () => {
  it("renders wine name and region", () => {
    render(<WineCard wine={mockWine} />);
    // Name appears in both the placeholder caption and the heading link.
    expect(screen.getAllByText("Chardonnay 2022").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/white/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Moravia/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2022/).length).toBeGreaterThan(0);
  });

  it("renders link to correct URL", () => {
    render(<WineCard wine={mockWine} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/wines/$id/wine-1");
  });

  it("renders min-price badge when provided", () => {
    render(<WineCard minPrice={450} wine={mockWine} />);
    expect(screen.getByText(/from 450.00 €/i)).toBeInTheDocument();
  });

  it("renders CatalogPlaceholder when no image", () => {
    render(<WineCard wine={mockWine} />);
    // Polaroid placeholder shows the wine name as caption + color label.
    expect(screen.getAllByText(/chardonnay/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/white/i).length).toBeGreaterThan(0);
  });

  it("renders image when an inline imageUrl is provided", () => {
    const wineWithImage = {
      ...mockWine,
      imageUrl: "https://example.com/wine.jpg",
    };
    render(<WineCard wine={wineWithImage} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/wine.jpg");
  });
});
