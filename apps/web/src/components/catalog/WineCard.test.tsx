import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WineCard } from "./WineCard";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: any) => (
    <a href={`${to}/${params?.id || params?.productId || ""}`}>{children}</a>
  ),
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
    expect(screen.getByText("Chardonnay 2022")).toBeInTheDocument();
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
    expect(screen.getByText(/from €450/i)).toBeInTheDocument();
  });

  it("renders CatalogPlaceholder when no image", () => {
    render(<WineCard wine={mockWine} />);
    expect(screen.getByText("WHITE")).toBeInTheDocument(); // CatalogPlaceholder text
  });

  it("renders image when provided", () => {
    const wineWithImage = {
      ...mockWine,
      images: [{ url: "https://example.com/wine.jpg" }],
    };
    render(<WineCard wine={wineWithImage} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/wine.jpg");
  });
});
