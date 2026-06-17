import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useUser } from "@/context/UserContext";
import { WinemakerDetailsCard } from "./WinemakerDetailsCard";

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

const mockWinemaker = {
  address: { city: "Velké Bílovice", country: "Czech Republic" },
  description: "Traditional winemaker from Velké Bílovice.",
  email: "jan@novak.cz",
  id: "wm-1",
  name: "Jan Novák",
  phone: "+420 123 456 789",
  // Owner gating reads `winemaker.userId`, not `winemaker.id` (the latter is the entity PK).
  userId: "wm-1",
  websiteUrl: "https://novak.cz",
} as any;

describe("WinemakerDetailsCard", () => {
  it("renders winemaker details", () => {
    vi.mocked(useUser).mockReturnValue({ user: null } as any);
    render(<WinemakerDetailsCard winemaker={mockWinemaker} />);
    expect(screen.getByText("Jan Novák")).toBeInTheDocument();
    expect(screen.getByText(/Traditional winemaker/)).toBeInTheDocument();
    expect(screen.getByText("jan@novak.cz")).toBeInTheDocument();
  });

  it("shows owner actions for winemaker himself", () => {
    vi.mocked(useUser).mockReturnValue({
      user: { id: "wm-1" },
    } as any);
    render(<WinemakerDetailsCard winemaker={mockWinemaker} />);
    expect(screen.getByText(/edit profile/i)).toBeInTheDocument();
  });

  it("hides missing contact fields", () => {
    const limitedWinemaker = {
      ...mockWinemaker,
      email: null,
      phone: null,
    };
    render(<WinemakerDetailsCard winemaker={limitedWinemaker} />);
    expect(screen.queryByText(/email/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/phone/i)).not.toBeInTheDocument();
    expect(screen.getByText(/website/i)).toBeInTheDocument();
  });
});
