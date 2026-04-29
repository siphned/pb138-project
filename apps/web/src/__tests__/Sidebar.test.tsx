import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const mockSignOut = vi.fn();

vi.mock("@clerk/react", () => ({
  Show: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({ isSignedIn: true }),
  useClerk: () => ({ openUserProfile: vi.fn(), signOut: mockSignOut }),
  useUser: () => ({ user: null }),
}));

vi.mock("@/context/UserContext", () => ({
  useUser: () => ({ user: null }),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
}));

// Stub shadcn Sheet so the sidebar content is always visible
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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

import { Sidebar } from "../components/layout/Sidebar";

describe("Sidebar", () => {
  it("shows Log out button", () => {
    render(<Sidebar />);
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });

  it("calls signOut when Log out is clicked", async () => {
    const user = userEvent.setup();
    mockSignOut.mockResolvedValue(undefined);
    render(<Sidebar />);
    await user.click(screen.getByText("Log out"));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("shows Explore Wines link", () => {
    render(<Sidebar />);
    expect(screen.getByText("Explore Wines")).toBeInTheDocument();
  });

  it("shows Bundles link pointing to /bundles", () => {
    render(<Sidebar />);
    const bundlesLink = screen.getByText("Bundles").closest("a");
    expect(bundlesLink).toHaveAttribute("href", "/bundles");
  });

  it("shows Events link", () => {
    render(<Sidebar />);
    expect(screen.getByText("Events")).toBeInTheDocument();
  });

  it("Log out is a button not a navigation link", () => {
    render(<Sidebar />);
    const logoutEl = screen.getByText("Log out");
    expect(logoutEl.tagName).toBe("BUTTON");
  });
});
