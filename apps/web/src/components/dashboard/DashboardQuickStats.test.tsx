import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardQuickStats } from "./DashboardQuickStats";

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a data-testid="link" href={to}>
      {children}
    </a>
  ),
}));

import { useUser } from "@/context/UserContext";

const baseUser = {
  activeRole: "Customer",
  setActiveRole: vi.fn(),
  isLoading: false,
  updateUser: vi.fn(),
};

const mockUser = (roles: string[]) => ({
  ...baseUser,
  user: {
    id: "u1",
    fname: "Adam",
    lname: "M",
    email: "a@b.com",
    clerkId: "clerk_1",
    roles,
  },
});

describe("DashboardQuickStats", () => {
  it("renders nothing when there is no signed-in user", () => {
    vi.mocked(useUser).mockReturnValue({ ...baseUser, user: null } as ReturnType<typeof useUser>);
    const { container } = render(<DashboardQuickStats />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the customer orders tile when user is a customer", () => {
    vi.mocked(useUser).mockReturnValue(mockUser(["Customer"]) as ReturnType<typeof useUser>);
    render(<DashboardQuickStats />);
    expect(screen.getByText(/orders placed/i)).toBeInTheDocument();
  });

  it("renders winemaker, shop-owner, and admin tiles when those roles are present", () => {
    vi.mocked(useUser).mockReturnValue(
      mockUser(["Winemaker", "Shop Owner", "Admin"]) as ReturnType<typeof useUser>
    );
    render(<DashboardQuickStats />);
    expect(screen.getByText(/wines published/i)).toBeInTheDocument();
    expect(screen.getByText(/shops managed/i)).toBeInTheDocument();
    expect(screen.getByText(/pending approvals/i)).toBeInTheDocument();
  });

  it("renders a 'View full stats' link to /stats", () => {
    vi.mocked(useUser).mockReturnValue(mockUser(["Customer"]) as ReturnType<typeof useUser>);
    render(<DashboardQuickStats />);
    const link = screen.getAllByTestId("link").find((el) => el.getAttribute("href") === "/stats");
    expect(link).toBeDefined();
  });
});
