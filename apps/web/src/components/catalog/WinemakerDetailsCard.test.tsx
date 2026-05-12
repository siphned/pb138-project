import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WinemakerDetailsCard } from "./WinemakerDetailsCard";
import { useUser } from "@/context/UserContext";

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

const mockWinemaker = {
  id: "wm-1",
  name: "Jan Novák",
  description: "Traditional winemaker from Velké Bílovice.",
  email: "jan@novak.cz",
  phone: "+420 123 456 789",
  websiteUrl: "https://novak.cz",
  address: { city: "Velké Bílovice", country: "Czech Republic" },
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
