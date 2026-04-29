import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const mockSignOut = vi.fn();
const mockNavigate = vi.fn();

vi.mock("@clerk/react", () => ({
  Show: ({ children, when }: { children: React.ReactNode; when: string }) =>
    when === "signed-in" ? children : null,
  useAuth: () => ({ isLoaded: true, isSignedIn: true }),
  useClerk: () => ({ openUserProfile: vi.fn(), signOut: mockSignOut }),
  useUser: () => ({ user: { fullName: "Test User", imageUrl: undefined } }),
}));

vi.mock("@/context/UserContext", () => ({
  useUser: () => ({ isLoading: false, user: { fname: "Test", lname: "User", roles: [] } }),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => mockNavigate,
}));

// Stub shadcn Sheet so the sidebar content is always visible
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

import { Sidebar } from "../components/layout/Sidebar";
import { Role } from "../types/roles";

describe("Sidebar", () => {
  it("shows Log out button", () => {
    render(<Sidebar />);
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });

  it("calls signOut and navigates to / when Log out is clicked", async () => {
    const user = userEvent.setup();
    mockSignOut.mockResolvedValue(undefined);
    mockNavigate.mockReturnValue(undefined);
    render(<Sidebar />);
    await user.click(screen.getByText("Log out"));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("shows Explore Wines link", () => {
    render(<Sidebar />);
    expect(screen.getByText("Explore Wines")).toBeInTheDocument();
  });

  it("shows Bundles link", () => {
    render(<Sidebar />);
    expect(screen.getByText("Bundles")).toBeInTheDocument();
  });

  it("shows active role for single-role user", () => {
    render(<Sidebar activeRole={Role.customer} userRoles={[Role.customer]} />);
    expect(screen.getByText(Role.customer)).toBeInTheDocument();
  });

  it("Log out is a button not a navigation link", () => {
    render(<Sidebar />);
    const logoutEl = screen.getByText("Log out");
    expect(logoutEl.tagName).toBe("BUTTON");
  });
});
