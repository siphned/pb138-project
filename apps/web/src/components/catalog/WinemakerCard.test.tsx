import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WinemakerCard } from "./WinemakerCard";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: any) => <a href={`${to}/${params?.id || ""}`}>{children}</a>,
}));

const mockWinemaker = {
  address: { city: "Velké Bílovice", country: "Czech Republic" },
  id: "wm-1",
  name: "Jan Novák",
} as any;

describe("WinemakerCard", () => {
  it("renders winemaker name and location", () => {
    render(<WinemakerCard winemaker={mockWinemaker} />);
    expect(screen.getByText("Jan Novák")).toBeInTheDocument();
    expect(screen.getByText(/Velké Bílovice/)).toBeInTheDocument();
  });

  it("renders link to correct URL", () => {
    render(<WinemakerCard winemaker={mockWinemaker} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/winemakers/$id/wm-1");
  });

  it("renders initials placeholder", () => {
    render(<WinemakerCard winemaker={mockWinemaker} />);
    expect(screen.getByText("JN")).toBeInTheDocument();
  });
});
