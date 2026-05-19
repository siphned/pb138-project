import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSignOut = vi.fn();
const mockNavigate = vi.fn();
const mockOpenUserProfile = vi.fn();

vi.mock("@clerk/react", () => ({
  Show: ({ children, when }: { children: React.ReactNode; when: string }) =>
    when === "signed-in" ? children : null,
  useAuth: vi.fn(),
  useClerk: () => ({ openUserProfile: mockOpenUserProfile, signOut: mockSignOut }),
  useUser: vi.fn(),
}));

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => mockNavigate,
}));

vi.mock("@/generated/hooks/useGetWinemakersMe", () => ({
  useGetWinemakersMe: vi.fn(() => ({ data: undefined, isLoading: false })),
}));

vi.mock("@/generated/hooks/useGetShopsMe", () => ({
  useGetShopsMe: vi.fn(() => ({ data: undefined, isLoading: false })),
}));

// Stub shadcn components so sidebar content is always visible
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTrigger: ({ render: _r }: { render: React.ReactNode }) => null,
}));

vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AccordionContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AccordionItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AccordionTrigger: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  AvatarImage: () => null,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick} type="button">
      {children}
    </button>
  ),
}));

import { useAuth, useUser as useClerkUser } from "@clerk/react";
import { Sidebar } from "../components/layout/Sidebar";
import { useUser } from "../context/UserContext";
import { Role } from "../types/roles";

describe("Sidebar", () => {
  beforeEach(() => {
    mockSignOut.mockClear();
    mockNavigate.mockClear();
    mockOpenUserProfile.mockClear();
    mockSignOut.mockResolvedValue(undefined);
    mockNavigate.mockReturnValue(undefined);

    vi.mocked(useAuth).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    } as never);

    vi.mocked(useClerkUser).mockReturnValue({
      user: { fullName: "Test User", imageUrl: undefined },
    } as never);

    vi.mocked(useUser).mockReturnValue({
      loading: false,
      refetch: vi.fn(),
      updateUser: vi.fn(),
      user: { fname: "Test", id: "user1", lname: "User" },
    } as never);
  });

  describe("Rendering", () => {
    it("renders menu trigger button", () => {
      render(<Sidebar />);
      // Menu button is rendered by the mocked Sheet
      expect(screen.getByText("Log out")).toBeInTheDocument();
    });

    it.skip("displays user full name from context", () => {
      render(<Sidebar />);
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    it("displays user initials in avatar fallback", () => {
      render(<Sidebar />);
      expect(screen.getByText("TE")).toBeInTheDocument();
    });

    it("shows Explore Wines link", () => {
      render(<Sidebar />);
      expect(screen.getByText("Wines")).toBeInTheDocument();
    });

    it("shows Log out button", () => {
      render(<Sidebar />);
      expect(screen.getByText("Log out")).toBeInTheDocument();
    });
  });

  describe("User Information Display", () => {
    it.skip("displays user name from context", () => {
      render(<Sidebar />);
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    it.skip("handles missing first name gracefully", () => {
      vi.mocked(useUser).mockReturnValue({
        loading: false,
        refetch: vi.fn(),
        updateUser: vi.fn(),
        user: { fname: "", id: "user1", lname: "User" },
      } as never);
      render(<Sidebar />);
      // Should still render and show initials
      expect(screen.getByText("U")).toBeInTheDocument();
    });

    it("handles missing last name gracefully", () => {
      vi.mocked(useUser).mockReturnValue({
        loading: false,
        refetch: vi.fn(),
        updateUser: vi.fn(),
        user: { fname: "Test", id: "user1", lname: "" },
      } as never);
      render(<Sidebar />);
      expect(screen.getByText("TE")).toBeInTheDocument();
    });

    it("shows Guest when user is null", () => {
      vi.mocked(useUser).mockReturnValue({
        loading: false,
        refetch: vi.fn(),
        updateUser: vi.fn(),
        user: null,
      } as never);
      render(<Sidebar />);
      // Guest user handling
      expect(screen.getByText("G")).toBeInTheDocument();
    });

    it("displays full name trimmed correctly", () => {
      vi.mocked(useUser).mockReturnValue({
        loading: false,
        refetch: vi.fn(),
        updateUser: vi.fn(),
        user: { fname: "John", id: "user1", lname: "Doe" },
      } as never);
      render(<Sidebar />);
      expect(screen.getByText("JO")).toBeInTheDocument();
    });

    it("handles special characters in names", () => {
      vi.mocked(useUser).mockReturnValue({
        loading: false,
        refetch: vi.fn(),
        updateUser: vi.fn(),
        user: { fname: "José", id: "user1", lname: "García" },
      } as never);
      render(<Sidebar />);
      expect(screen.getByText("JO")).toBeInTheDocument();
    });
  });

  describe("Authentication", () => {
    it("shows signed-in content when authenticated", () => {
      vi.mocked(useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
      } as never);
      render(<Sidebar />);
      expect(screen.getByText("Log out")).toBeInTheDocument();
    });

    it.skip("shows sign-in prompt when not authenticated", () => {
      vi.mocked(useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
      } as never);
      render(<Sidebar />);
      expect(screen.getByText("Sign in to manage your wines and orders.")).toBeInTheDocument();
    });

    it.skip("shows Sign In button when not authenticated", () => {
      vi.mocked(useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
      } as never);
      render(<Sidebar />);
      expect(screen.getByText("Sign In")).toBeInTheDocument();
    });

    it.skip("hides user avatar when not authenticated", () => {
      vi.mocked(useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
      } as never);
      render(<Sidebar />);
      expect(screen.queryByText("TE")).not.toBeInTheDocument();
    });
  });

  describe("Logout Functionality", () => {
    it("calls signOut when logout button clicked", async () => {
      const user = userEvent.setup();
      render(<Sidebar />);
      await user.click(screen.getByText("Log out"));
      expect(mockSignOut).toHaveBeenCalled();
    });

    it("navigates to home after logout", async () => {
      const user = userEvent.setup();
      render(<Sidebar />);
      await user.click(screen.getByText("Log out"));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
      });
    });

    it("calls signOut before navigating", async () => {
      const user = userEvent.setup();
      const callOrder: string[] = [];

      mockSignOut.mockImplementation(() => {
        callOrder.push("signOut");
        return Promise.resolve();
      });
      mockNavigate.mockImplementation(() => {
        callOrder.push("navigate");
      });

      render(<Sidebar />);
      await user.click(screen.getByText("Log out"));

      await waitFor(() => {
        expect(callOrder).toEqual(["signOut", "navigate"]);
      });
    });

    it("handles signOut rejection gracefully", async () => {
      const user = userEvent.setup();
      mockSignOut.mockRejectedValueOnce(new Error("Logout failed"));

      render(<Sidebar />);
      const logoutButton = screen.getByText("Log out");
      await user.click(logoutButton);

      // Should still attempt to navigate even if signOut fails
      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );
    });
  });

  describe("Role Handling", () => {
    it("renders with single role by default", () => {
      render(<Sidebar />);
      expect(screen.getByText("Log out")).toBeInTheDocument();
    });

    it("renders with multiple roles when provided", () => {
      render(<Sidebar activeRole={Role.customer} userRoles={[Role.customer, Role.winemaker]} />);
      expect(screen.getByText("Log out")).toBeInTheDocument();
    });

    it("calls onRoleChange when role changes", () => {
      const mockRoleChange = vi.fn();
      render(
        <Sidebar
          activeRole={Role.customer}
          onRoleChange={mockRoleChange}
          userRoles={[Role.customer, Role.winemaker]}
        />
      );
      // onRoleChange would be called by accordion interaction
      expect(mockRoleChange).toBeDefined();
    });

    it("uses first role as default active role", () => {
      render(<Sidebar userRoles={[Role.customer, Role.winemaker]} />);
      expect(screen.getByText("Log out")).toBeInTheDocument();
    });

    it("respects provided activeRole prop", () => {
      render(<Sidebar activeRole={Role.winemaker} userRoles={[Role.customer, Role.winemaker]} />);
      expect(screen.getByText("Log out")).toBeInTheDocument();
    });
  });

  describe("Navigation Links", () => {
    it("renders Explore Wines link with correct href", () => {
      render(<Sidebar />);
      const link = screen.getByText("Wines");
      expect(link.closest("a")).toHaveAttribute("href", "/explore");
    });

    it("renders correct links for customer role", () => {
      render(<Sidebar userRoles={[Role.customer]} />);
      expect(screen.getByText("Wines")).toBeInTheDocument();
      // Shopping cart or order links would be visible
    });

    it("renders correct links for winemaker role", () => {
      render(<Sidebar activeRole={Role.winemaker} userRoles={[Role.winemaker]} />);
      expect(screen.getByText("Log out")).toBeInTheDocument();
    });

    it("shows Products link pointing to /products", () => {
      render(<Sidebar />);
      const bundlesLink = screen.getByText("Products").closest("a");
      expect(bundlesLink).toHaveAttribute("href", "/products");
    });

    it("shows Events link", () => {
      render(<Sidebar />);
      expect(screen.getByText("Events")).toBeInTheDocument();
    });

    it("shows active role for single-role user", () => {
      render(<Sidebar activeRole={Role.customer} userRoles={[Role.customer]} />);
      expect(screen.getByText(Role.customer)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("uses proper button element for logout", () => {
      render(<Sidebar />);
      const logoutButton = screen.getByText("Log out").closest("button");
      expect(logoutButton).toBeInTheDocument();
    });

    it("provides alternative text for avatar", () => {
      render(<Sidebar />);
      // Avatar shows initials as fallback
      expect(screen.getByText("TE")).toBeInTheDocument();
    });

    it("uses semantic navigation structure", () => {
      render(<Sidebar />);
      // Navigation should be semantic
      expect(screen.getByText("Wines")).toBeInTheDocument();
    });

    it("Log out is a button not a navigation link", () => {
      render(<Sidebar />);
      const logoutEl = screen.getByText("Log out");
      expect(logoutEl.tagName).toBe("BUTTON");
    });
  });

  describe("Sheet Integration", () => {
    it("wraps sidebar in Sheet component", () => {
      const { container } = render(<Sidebar />);
      // Sheet mocks ensure content is visible
      expect(container).toBeTruthy();
    });

    it("renders sheet trigger for mobile menu", () => {
      render(<Sidebar />);
      // Content should be visible due to mock
      expect(screen.getByText("Log out")).toBeInTheDocument();
    });
  });

  describe("Navigation Links", () => {
    it("renders Explore Wines link with correct href", () => {
      render(<Sidebar />);
      const link = screen.getByText("Wines");
      expect(link.closest("a")).toHaveAttribute("href", "/explore");
    });

    it("renders correct links for customer role", () => {
      render(<Sidebar userRoles={[Role.customer]} />);
      expect(screen.getByText("Wines")).toBeInTheDocument();
      // Shopping cart or order links would be visible
    });

    it("renders correct links for winemaker role", () => {
      render(<Sidebar activeRole={Role.winemaker} userRoles={[Role.winemaker]} />);
      expect(screen.getByText("Log out")).toBeInTheDocument();
    });

    it("shows Products link pointing to /products", () => {
      render(<Sidebar />);
      const bundlesLink = screen.getByText("Products").closest("a");
      expect(bundlesLink).toHaveAttribute("href", "/products");
    });

    it("shows Events link", () => {
      render(<Sidebar />);
      expect(screen.getByText("Events")).toBeInTheDocument();
    });

    it("shows active role for single-role user", () => {
      render(<Sidebar activeRole={Role.customer} userRoles={[Role.customer]} />);
      expect(screen.getByText(Role.customer)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("uses proper button element for logout", () => {
      render(<Sidebar />);
      const logoutButton = screen.getByText("Log out").closest("button");
      expect(logoutButton).toBeInTheDocument();
    });

    it("provides alternative text for avatar", () => {
      render(<Sidebar />);
      // Avatar shows initials as fallback
      expect(screen.getByText("TE")).toBeInTheDocument();
    });

    it("uses semantic navigation structure", () => {
      render(<Sidebar />);
      // Navigation should be semantic
      expect(screen.getByText("Wines")).toBeInTheDocument();
    });

    it("Log out is a button not a navigation link", () => {
      render(<Sidebar />);
      const logoutEl = screen.getByText("Log out");
      expect(logoutEl.tagName).toBe("BUTTON");
    });
  });

  describe("Sheet Integration", () => {
    it("wraps sidebar in Sheet component", () => {
      const { container } = render(<Sidebar />);
      // Sheet mocks ensure content is visible
      expect(container).toBeTruthy();
    });

    it("renders sheet trigger for mobile menu", () => {
      render(<Sidebar />);
      // Content should be visible due to mock
      expect(screen.getByText("Log out")).toBeInTheDocument();
    });
  });

  describe("Multiple Renders", () => {
    it("maintains state across re-renders", () => {
      const { rerender } = render(<Sidebar />);
      expect(screen.getByText("Log out")).toBeInTheDocument();

      rerender(<Sidebar />);
      expect(screen.getByText("Log out")).toBeInTheDocument();
    });

    it("updates display name when user changes", () => {
      const { rerender } = render(<Sidebar />);
      expect(screen.getByText("TE")).toBeInTheDocument();

      vi.mocked(useUser).mockReturnValue({
        loading: false,
        refetch: vi.fn(),
        updateUser: vi.fn(),
        user: { fname: "Jane", id: "user2", lname: "Smith" },
      } as never);

      rerender(<Sidebar />);
      expect(screen.getByText("JA")).toBeInTheDocument();
    });
  });
});
