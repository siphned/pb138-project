import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardQuickLinks } from "@/routes/-components/DashboardQuickLinks";

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
  isLoading: false,
  setActiveRole: vi.fn(),
  updateUser: vi.fn(),
  user: {
    clerkId: "clerk_1",
    email: "a@b.com",
    fname: "Adam",
    id: "u1",
    lname: "M",
    roles: ["Customer", "Winemaker", "Shop Owner", "Admin"],
  },
};

describe("DashboardQuickLinks", () => {
  it("renders customer links when activeRole is Customer", () => {
    vi.mocked(useUser).mockReturnValue({
      ...baseUser,
      activeRole: "Customer",
    } as ReturnType<typeof useUser>);
    render(<DashboardQuickLinks />);
    const hrefs = screen.getAllByTestId("link").map((el) => el.getAttribute("href"));
    expect(hrefs).toContain("/orders");
    expect(hrefs).toContain("/cart");
  });

  it("renders winemaker links when activeRole is Winemaker", () => {
    vi.mocked(useUser).mockReturnValue({
      ...baseUser,
      activeRole: "Winemaker",
    } as ReturnType<typeof useUser>);
    render(<DashboardQuickLinks />);
    const hrefs = screen.getAllByTestId("link").map((el) => el.getAttribute("href"));
    expect(hrefs).toContain("/events/new");
    expect(hrefs).toContain("/wines");
  });

  it("renders shop-owner links when activeRole is Shop Owner", () => {
    vi.mocked(useUser).mockReturnValue({
      ...baseUser,
      activeRole: "Shop Owner",
    } as ReturnType<typeof useUser>);
    render(<DashboardQuickLinks />);
    const hrefs = screen.getAllByTestId("link").map((el) => el.getAttribute("href"));
    expect(hrefs).toContain("/shops");
    expect(hrefs).toContain("/shops/new");
  });

  it("renders admin links when activeRole is Admin", () => {
    vi.mocked(useUser).mockReturnValue({
      ...baseUser,
      activeRole: "Admin",
    } as ReturnType<typeof useUser>);
    render(<DashboardQuickLinks />);
    const hrefs = screen.getAllByTestId("link").map((el) => el.getAttribute("href"));
    expect(hrefs).toContain("/admin/users");
    expect(hrefs).toContain("/admin/moderation");
  });

  it("renders nothing when there is no signed-in user", () => {
    vi.mocked(useUser).mockReturnValue({
      ...baseUser,
      activeRole: "Customer",
      user: null,
    } as ReturnType<typeof useUser>);
    const { container } = render(<DashboardQuickLinks />);
    expect(container).toBeEmptyDOMElement();
  });
});
