import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WinemakerDetailsCard } from "@/routes/winemakers/$id/-components/WinemakerDetailsCard";

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
  websiteUrl: "https://novak.cz",
} as any;

describe("WinemakerDetailsCard", () => {
  it("renders winemaker details", () => {
    render(<WinemakerDetailsCard canManage={false} winemaker={mockWinemaker} />);
    expect(screen.getByText("Jan Novák")).toBeInTheDocument();
    expect(screen.getByText(/Traditional winemaker/)).toBeInTheDocument();
    expect(screen.getByText("jan@novak.cz")).toBeInTheDocument();
  });

  it("shows owner actions when canManage is true", () => {
    render(<WinemakerDetailsCard canManage winemaker={mockWinemaker} />);
    expect(screen.getByText(/edit profile/i)).toBeInTheDocument();
    expect(screen.getByText(/manage images/i)).toBeInTheDocument();
  });

  it("hides owner actions when canManage is false", () => {
    render(<WinemakerDetailsCard canManage={false} winemaker={mockWinemaker} />);
    expect(screen.queryByText(/edit profile/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/manage images/i)).not.toBeInTheDocument();
  });

  it("hides missing contact fields", () => {
    const limitedWinemaker = {
      ...mockWinemaker,
      email: null,
      phone: null,
    };
    render(<WinemakerDetailsCard canManage={false} winemaker={limitedWinemaker} />);
    expect(screen.queryByText(/email/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/phone/i)).not.toBeInTheDocument();
    expect(screen.getByText(/website/i)).toBeInTheDocument();
  });
});
