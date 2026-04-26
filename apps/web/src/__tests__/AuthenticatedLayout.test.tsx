import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mockNavigate = vi.fn().mockResolvedValue(undefined);

vi.mock("@clerk/react", () => ({
  useAuth: vi.fn(),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: { component: React.ComponentType }) => opts.component,
  Outlet: () => <div data-testid="outlet" />,
  useNavigate: () => mockNavigate,
}));

import { useAuth } from "@clerk/react";
// Import AFTER mocks so the module picks up the mocked dependencies
import { AuthenticatedLayout } from "../routes/_authenticated";

describe("AuthenticatedLayout", () => {
  it("shows spinner while Clerk is loading", () => {
    vi.mocked(useAuth).mockReturnValue({ isLoaded: false, isSignedIn: false } as never);
    render(<AuthenticatedLayout />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders the outlet when user is signed in", () => {
    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true } as never);
    render(<AuthenticatedLayout />);
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });

  it("renders nothing (null) when not signed in after load", () => {
    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as never);
    const { container } = render(<AuthenticatedLayout />);
    expect(container).toBeEmptyDOMElement();
  });

  it("navigates to /login when not signed in", () => {
    mockNavigate.mockClear();
    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as never);
    render(<AuthenticatedLayout />);
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/auth/login" });
  });

  it("does not navigate while still loading", () => {
    mockNavigate.mockClear();
    vi.mocked(useAuth).mockReturnValue({ isLoaded: false, isSignedIn: false } as never);
    render(<AuthenticatedLayout />);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("does not navigate when signed in", () => {
    mockNavigate.mockClear();
    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true } as never);
    render(<AuthenticatedLayout />);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
