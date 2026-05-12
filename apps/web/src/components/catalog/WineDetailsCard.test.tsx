import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WineDetailsCard } from "./WineDetailsCard";
import { useUser } from "@/context/UserContext";

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

const mockWine = {
  id: "wine-1",
  name: "Chardonnay",
  color: "white",
  region: "Moravia",
  vintageYear: 2022,
  alcoholContent: "12.5",
  description: "A fine white wine.",
  winemaker: { userId: "user-1", name: "Lechovice" },
} as any;

describe("WineDetailsCard", () => {
  it("renders wine details", () => {
    vi.mocked(useUser).mockReturnValue({ user: null } as any);
    render(<WineDetailsCard wine={mockWine} />);
    expect(screen.getByText("About this wine")).toBeInTheDocument();
    expect(screen.getByText("A fine white wine.")).toBeInTheDocument();
    expect(screen.getByText("12.5%")).toBeInTheDocument();
  });

  it("shows owner actions when user is winemaker", () => {
    vi.mocked(useUser).mockReturnValue({
      user: { id: "user-1" },
    } as any);
    render(<WineDetailsCard wine={mockWine} />);
    expect(screen.getByText(/edit/i)).toBeInTheDocument();
    expect(screen.getByText(/delete/i)).toBeInTheDocument();
  });

  it("hides owner actions when user is NOT winemaker", () => {
    vi.mocked(useUser).mockReturnValue({
      user: { id: "user-2" },
    } as any);
    render(<WineDetailsCard wine={mockWine} />);
    expect(screen.queryByText(/edit/i)).not.toBeInTheDocument();
  });
});
