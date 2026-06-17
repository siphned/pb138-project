import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WinemakerCard } from "@/routes/-components/WinemakerCard";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: any) => <a href={`${to}/${params?.id || ""}`}>{children}</a>,
}));

// WinemakerCard renders WinemakerImage, which fetches via this generated hook.
// Mock it so the card renders without a QueryClientProvider; empty data -> placeholder.
vi.mock("@/generated/hooks/useGetWinemakersByIdImages", () => ({
  useGetWinemakersByIdImages: vi.fn(() => ({ data: undefined, isLoading: false })),
}));

const mockWinemaker = {
  address: { city: "Velké Bílovice", country: "Czech Republic" },
  id: "wm-1",
  name: "Jan Novák",
} as any;

describe("WinemakerCard", () => {
  it("renders winemaker name and location", () => {
    render(<WinemakerCard winemaker={mockWinemaker} />);
    // Name appears in both the polaroid placeholder caption and the heading link.
    expect(screen.getAllByText("Jan Novák").length).toBeGreaterThan(0);
    expect(screen.getByText(/Velké Bílovice/)).toBeInTheDocument();
  });

  it("renders link to correct URL", () => {
    render(<WinemakerCard winemaker={mockWinemaker} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/winemakers/$id/wm-1");
  });

  it("renders name placeholder when no image", () => {
    render(<WinemakerCard winemaker={mockWinemaker} />);
    // Polaroid placeholder caption is the winemaker name (was initials in pre-polaroid design).
    expect(screen.getAllByText("Jan Novák").length).toBeGreaterThan(0);
  });
});
