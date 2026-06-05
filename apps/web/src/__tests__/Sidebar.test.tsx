import { useAuth, useUser as useClerkUser } from "@clerk/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "../components/layout/Sidebar";
import { useUser } from "../context";
import { Role } from "../types/roles";

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

vi.mock("../context", () => ({
  useTheme: vi.fn(() => ({ theme: "light", toggleTheme: vi.fn() })),
  useUser: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, className, onClick }: any) => (
    <a className={className} href={to} onClick={onClick}>
      {children}
    </a>
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
  AvatarImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, className }: any) => (
    <button className={className} onClick={onClick} type="button">
      {children}
    </button>
  ),
}));

vi.mock("@/components/primitives/nav-item", () => ({
  NavItem: ({ children, onClick, render: renderProp }: any) => {
    if (React.isValidElement(renderProp)) {
      return React.cloneElement(renderProp as React.ReactElement<any>, { children, onClick });
    }
    return <div onClick={onClick}>{children}</div>;
  },
}));

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      isSignedIn: true,
      userId: "user-123",
    } as never);

    vi.mocked(useClerkUser).mockReturnValue({
      user: {
        fullName: "Clerk User",
        imageUrl: "https://example.com/avatar.jpg",
      },
    } as never);

    vi.mocked(useUser).mockReturnValue({
      loading: false,
      refetch: vi.fn(),
      user: {
        fname: "John",
        id: "user-123",
        lname: "Doe",
      },
    } as never);
  });

  describe("Rendering", () => {
    it("renders menu trigger button", () => {
      render(<Sidebar />);
      expect(screen.getByText(/Explore Wines/i)).toBeInTheDocument();
    });

    it("displays user initials in avatar fallback", () => {
      render(<Sidebar />);
      expect(screen.getByText("JO")).toBeInTheDocument();
    });

    it("shows Explore Wines link", () => {
      render(<Sidebar />);
      expect(screen.getByText(/Explore Wines/i)).toBeInTheDocument();
    });

    it("shows Log out button", () => {
      render(<Sidebar />);
      expect(screen.getByText(/Log out/i)).toBeInTheDocument();
    });
  });

  describe("User Information Display", () => {
    it("handles missing last name gracefully", () => {
      vi.mocked(useUser).mockReturnValue({
        user: { fname: "John", id: "user-123", lname: null },
      } as any);
      render(<Sidebar />);
      expect(screen.getByText("John")).toBeInTheDocument();
    });

    it("shows Guest when user is null", () => {
      vi.mocked(useUser).mockReturnValue({ user: null } as any);
      vi.mocked(useAuth).mockReturnValue({ isSignedIn: false } as any);
      render(<Sidebar />);
      expect(screen.getAllByText("Guest")).toHaveLength(2);
    });

    it("displays full name trimmed correctly", () => {
      vi.mocked(useUser).mockReturnValue({
        user: { fname: "  John  ", id: "user-123", lname: "  Doe  " },
      } as any);
      render(<Sidebar />);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("handles special characters in names", () => {
      vi.mocked(useUser).mockReturnValue({
        user: { fname: "François", id: "user-123", lname: "O'Reilly" },
      } as any);
      render(<Sidebar />);
      expect(screen.getByText("François O'Reilly")).toBeInTheDocument();
    });
  });

  describe("Authentication", () => {
    it("shows signed-in content when authenticated", () => {
      render(<Sidebar />);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Clerk User")).toBeInTheDocument();
    });
  });

  describe("Logout Functionality", () => {
    it("calls signOut when logout button clicked", async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      const logoutBtn = screen.getByText(/Log out/i);
      await user.click(logoutBtn);

      expect(mockSignOut).toHaveBeenCalled();
    });

    it("navigates to home after logout", async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      const logoutBtn = screen.getByText(/Log out/i);
      await user.click(logoutBtn);

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
    });
  });

  describe("Role Handling", () => {
    it("renders with single role by default", () => {
      render(<Sidebar userRoles={[Role.customer]} />);
      expect(screen.getByText(Role.customer)).toBeInTheDocument();
    });

    it("renders with multiple roles when provided", () => {
      render(<Sidebar userRoles={[Role.customer, Role.winemaker]} />);
      expect(screen.getByText(Role.customer)).toBeInTheDocument();
    });
  });

  describe("Navigation Links", () => {
    it("renders Explore Wines link with correct href", () => {
      render(<Sidebar />);
      const link = screen.getByText(/Explore Wines/i).closest("a");
      expect(link).toHaveAttribute("href", "/wines");
    });

    it("renders correct links for customer role", () => {
      render(<Sidebar activeRole={Role.customer} />);
      expect(screen.getByText(/Order History/i)).toBeInTheDocument();
    });

    it("renders correct links for winemaker role", () => {
      render(<Sidebar activeRole={Role.winemaker} />);
      expect(screen.getByText(/My Wines/i)).toBeInTheDocument();
    });

    it("shows My Events for the customer role", () => {
      render(<Sidebar activeRole={Role.customer} />);
      expect(screen.getByText(/My Events/i)).toBeInTheDocument();
    });

    it("renders My Shops and My Products for the shop owner role", () => {
      render(<Sidebar activeRole={Role.shopOwner} />);
      expect(screen.getByText(/My Shops/i)).toBeInTheDocument();
      expect(screen.getByText(/My Products/i)).toBeInTheDocument();
    });

    it("hides discovery and cart outside the customer view", () => {
      render(<Sidebar activeRole={Role.winemaker} />);
      expect(screen.queryByText(/Explore Wines/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Shopping cart/i)).not.toBeInTheDocument();
    });

    it("shows Products link pointing to /products", () => {
      render(<Sidebar />);
      expect(screen.getByText(/Products/i).closest("a")).toHaveAttribute("href", "/products");
    });

    it("shows Events link", () => {
      render(<Sidebar />);
      expect(screen.getAllByText(/Events/i).length).toBeGreaterThan(0);
    });

    it("shows Statistics link when authenticated", () => {
      render(<Sidebar />);
      expect(screen.getByText(/Statistics/i)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("provides alternative text for avatar", () => {
      render(<Sidebar />);
      expect(screen.getByAltText("Clerk User")).toBeInTheDocument();
    });

    it("uses semantic navigation structure", () => {
      render(<Sidebar />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });
  });

  describe("Multiple Renders", () => {
    it("maintains state across re-renders", () => {
      const { rerender } = render(<Sidebar />);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      rerender(<Sidebar />);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("updates display name when user changes", () => {
      const { rerender } = render(<Sidebar />);
      vi.mocked(useUser).mockReturnValue({
        user: { fname: "Jane", id: "user-123", lname: "Smith" },
      } as any);
      rerender(<Sidebar />);
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });
  });
});
