import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { GetWinemakers200Item } from "./WinemakerCard";
import { WinemakerCard } from "./WinemakerCard";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    params,
  }: {
    children: React.ReactNode;
    to: string;
    params?: { id?: string };
  }) => <a href={`${to}/${params?.id || ""}`}>{children}</a>,
}));

vi.mock("@/generated/hooks/useGetWinemakersByIdImages", () => ({
  useGetWinemakersByIdImages: vi.fn(() => ({ data: [], isLoading: false })),
}));

const mockWinemaker = {
  address: { city: "Velké Bílovice", country: "Czech Republic" },
  id: "wm-1",
  name: "Jan Novák",
} as unknown as GetWinemakers200Item;

describe("WinemakerCard", () => {
  it("renders winemaker name and location", () => {
    render(<WinemakerCard winemaker={mockWinemaker} />);
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
    expect(screen.getAllByText("Jan Novák").length).toBeGreaterThan(0);
  });
});
