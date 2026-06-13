import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardQuickStats } from "./DashboardQuickStats";

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/generated/hooks/useGetStats", () => ({
  useGetStats: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a data-testid="link" href={to}>
      {children}
    </a>
  ),
}));

import { useUser } from "@/context/UserContext";
import { useGetStats } from "@/generated/hooks/useGetStats";

const baseUser = {
  isLoading: false,
  setActiveRole: vi.fn(),
  updateUser: vi.fn(),
};

const mockUser = (activeRole: string) => ({
  ...baseUser,
  activeRole,
  user: {
    clerkId: "clerk_1",
    email: "a@b.com",
    fname: "Adam",
    id: "u1",
    lname: "M",
    roles: [activeRole],
  },
});

const mockStats = (data: unknown, isLoading = false) =>
  ({
    data,
    isLoading,
  }) as unknown as ReturnType<typeof useGetStats>;

describe("DashboardQuickStats", () => {
  it("renders nothing when there is no signed-in user", () => {
    vi.mocked(useUser).mockReturnValue({
      ...baseUser,
      activeRole: undefined,
      user: null,
    } as unknown as ReturnType<typeof useUser>);
    vi.mocked(useGetStats).mockReturnValue(mockStats(undefined));
    const { container } = render(<DashboardQuickStats />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders customer tiles when activeRole is Customer", () => {
    vi.mocked(useUser).mockReturnValue(mockUser("Customer") as ReturnType<typeof useUser>);
    vi.mocked(useGetStats).mockReturnValue(
      mockStats({
        eventsAttended: 2,
        ordersCount: 5,
        reviewsWritten: 3,
        role: "customer",
        totalSpent: 120,
      })
    );
    render(<DashboardQuickStats />);
    expect(screen.getByText(/orders placed/i)).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders winemaker tiles when activeRole is Winemaker", () => {
    vi.mocked(useUser).mockReturnValue(mockUser("Winemaker") as ReturnType<typeof useUser>);
    vi.mocked(useGetStats).mockReturnValue(
      mockStats({
        avgReviewScore: 4.2,
        eventsByStatus: { approved: 3, pending: 1, rejected: 0 },
        role: "winemaker",
        supplyAgreementsByStatus: { approved: 0, pending: 0, rejected: 0 },
        totalStock: 100,
        wineCount: 12,
      })
    );
    render(<DashboardQuickStats />);
    expect(screen.getByText(/wines published/i)).toBeInTheDocument();
    expect(screen.getByText(/avg review score/i)).toBeInTheDocument();
  });

  it("renders shop-owner tiles when activeRole is Shop Owner", () => {
    vi.mocked(useUser).mockReturnValue(mockUser("Shop Owner") as ReturnType<typeof useUser>);
    vi.mocked(useGetStats).mockReturnValue(
      mockStats({
        orderItemsProcessed: 50,
        productsByType: { bundles: 5, standard: 30 },
        revenue: 2500,
        role: "shop_owner",
        shopsCount: 2,
        supplyAgreementsByStatus: { approved: 0, pending: 0, rejected: 0 },
        totalStockValue: 5000,
      })
    );
    render(<DashboardQuickStats />);
    expect(screen.getByText(/shops managed/i)).toBeInTheDocument();
    expect(screen.getByText(/revenue/i)).toBeInTheDocument();
  });

  it("renders admin tiles when activeRole is Admin", () => {
    vi.mocked(useUser).mockReturnValue(mockUser("Admin") as ReturnType<typeof useUser>);
    vi.mocked(useGetStats).mockReturnValue(
      mockStats({
        deletedReviews: 0,
        pendingEvents: 1,
        pendingRoleRequests: 2,
        role: "admin",
        totalEvents: 10,
        totalProducts: 50,
      })
    );
    render(<DashboardQuickStats />);
    expect(screen.getByText(/pending role requests/i)).toBeInTheDocument();
    expect(screen.getByText(/total events/i)).toBeInTheDocument();
  });

  it("renders a 'View full stats' link to /stats", () => {
    vi.mocked(useUser).mockReturnValue(mockUser("Customer") as ReturnType<typeof useUser>);
    vi.mocked(useGetStats).mockReturnValue(
      mockStats({
        eventsAttended: 0,
        ordersCount: 0,
        reviewsWritten: 0,
        role: "customer",
        totalSpent: 0,
      })
    );
    render(<DashboardQuickStats />);
    const link = screen.getAllByTestId("link").find((el) => el.getAttribute("href") === "/stats");
    expect(link).toBeDefined();
  });
});
