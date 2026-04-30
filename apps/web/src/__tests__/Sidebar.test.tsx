import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const mockSignOut = vi.fn();
const mockIsSignedIn = true;

vi.mock("@clerk/react", () => ({
  Show: ({ children, when }: { children: React.ReactNode; when: "signed-in" | "signed-out" }) => {
    if (when === "signed-in" && mockIsSignedIn) return <>{children}</>;
    if (when === "signed-out" && !mockIsSignedIn) return <>{children}</>;
    return null;
  },
  useAuth: () => ({ isSignedIn: mockIsSignedIn }),
  useClerk: () => ({ openUserProfile: vi.fn(), signOut: mockSignOut }),
  useUser: () => ({ user: { fullName: "Jan Novák" } }),
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
import { Role } from "../types/roles";

vi.mock("../context/UserContext", () => ({
  useUser: () => ({ user: { fname: "Jan", roles: ["customer"] } }),
}));

describe("Sidebar", () => {
  it("shows Log out button", () => {
    render(<Sidebar />);
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });

  it("calls signOut with redirect to / when Log out is clicked", async () => {
    const user = userEvent.setup();
    mockSignOut.mockResolvedValue(undefined);
    render(<Sidebar />);
    await user.click(screen.getByText("Log out"));
    expect(mockSignOut).toHaveBeenCalledWith({ redirectUrl: "/" });
  });

  it("shows Order History link for customer role", () => {
    render(<Sidebar activeRole={Role.customer} userRoles={[Role.customer]} />);
    expect(screen.getByText("Order History")).toBeInTheDocument();
  });

  it("shows My Wines and Bundles links for non-customer roles", () => {
    render(<Sidebar activeRole={Role.winemaker} userRoles={[Role.winemaker]} />);
    const nav = screen.getByRole("navigation");
    const winesLink = within(nav).getByRole("link", { name: /My Wines/i });
    const bundlesLinks = within(nav).getAllByRole("link", { name: /Bundles/i });
    const bundlesLink = bundlesLinks.find((l) => l.getAttribute("href") === "/bundles");

    expect(winesLink).toBeDefined();
    expect(bundlesLink).toBeDefined();
    expect(winesLink).toHaveAttribute("href", "/shops");
    expect(bundlesLink).toHaveAttribute("href", "/bundles");
  });

  it("Log out is a button not a navigation link", () => {
    render(<Sidebar />);
    const logoutEl = screen.getByText("Log out");
    expect(logoutEl.tagName).toBe("BUTTON");
  });
});
