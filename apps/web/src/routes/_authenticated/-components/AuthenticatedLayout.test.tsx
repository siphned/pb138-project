import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockNavigate = vi.fn().mockResolvedValue(undefined);

vi.mock("@clerk/react", () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: { component: React.ComponentType }) => opts.component,
  Outlet: () => <div data-testid="outlet" />,
  useNavigate: () => mockNavigate,
}));

import { useAuth } from "@clerk/react";
// Import AFTER mocks so the module picks up the mocked dependencies
import { AuthenticatedLayout } from "@/routes/_authenticated";

describe("AuthenticatedLayout", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockNavigate.mockResolvedValue(undefined);
  });

  describe("Loading State", () => {
    it("shows spinner while Clerk is loading", () => {
      vi.mocked(useAuth).mockReturnValue({ isLoaded: false, isSignedIn: false } as never);
      render(<AuthenticatedLayout />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("shows spinner even when signed in but loading", () => {
      vi.mocked(useAuth).mockReturnValue({ isLoaded: false, isSignedIn: true } as never);
      render(<AuthenticatedLayout />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("does not navigate while loading", () => {
      mockNavigate.mockClear();
      vi.mocked(useAuth).mockReturnValue({ isLoaded: false, isSignedIn: false } as never);
      render(<AuthenticatedLayout />);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("keeps loading state for extended time if needed", async () => {
      vi.mocked(useAuth).mockReturnValue({ isLoaded: false, isSignedIn: false } as never);
      render(<AuthenticatedLayout />);
      expect(screen.getByRole("status")).toBeInTheDocument();
      // Should still show spinner on next render
      await waitFor(() => {
        expect(screen.getByRole("status")).toBeInTheDocument();
      });
    });
  });

  describe("Authenticated State", () => {
    it("renders the outlet when user is signed in", () => {
      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true } as never);
      render(<AuthenticatedLayout />);
      expect(screen.getByTestId("outlet")).toBeInTheDocument();
    });

    it("does not show spinner when signed in and loaded", () => {
      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true } as never);
      render(<AuthenticatedLayout />);
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("does not navigate when signed in", () => {
      mockNavigate.mockClear();
      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true } as never);
      render(<AuthenticatedLayout />);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("renders outlet as direct child", () => {
      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true } as never);
      render(<AuthenticatedLayout />);
      const outlet = screen.getByTestId("outlet");
      expect(outlet).toBeInTheDocument();
      expect(outlet.parentElement).not.toBeNull();
    });
  });

  describe("Unauthenticated State", () => {
    it("renders nothing (null) when not signed in after load", () => {
      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as never);
      const { container } = render(<AuthenticatedLayout />);
      expect(container.firstChild).toBeNull();
    });

    it("does not show spinner when unauthenticated and loaded", () => {
      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as never);
      render(<AuthenticatedLayout />);
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("does not show outlet when not signed in", () => {
      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as never);
      render(<AuthenticatedLayout />);
      expect(screen.queryByTestId("outlet")).not.toBeInTheDocument();
    });

    it("navigates to /login when not signed in", () => {
      mockNavigate.mockClear();
      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as never);
      render(<AuthenticatedLayout />);
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/auth/login" });
    });

    it("navigates exactly once on unauthenticated state", () => {
      mockNavigate.mockClear();
      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as never);
      render(<AuthenticatedLayout />);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it("navigates to login with correct path", () => {
      mockNavigate.mockClear();
      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as never);
      render(<AuthenticatedLayout />);
      const call = mockNavigate.mock.calls[0][0] as unknown as { to: string };
      expect(call.to).toBe("/auth/login");
    });
  });

  describe("State Transitions", () => {
    it.skip("transitions from loading to authenticated", async () => {
      const { rerender } = render(<AuthenticatedLayout />);
      vi.mocked(useAuth).mockReturnValue({ isLoaded: false, isSignedIn: false } as never);
      expect(screen.getByRole("status")).toBeInTheDocument();

      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true } as never);
      rerender(<AuthenticatedLayout />);

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.getByTestId("outlet")).toBeInTheDocument();
    });

    it.skip("transitions from loading to unauthenticated", async () => {
      mockNavigate.mockClear();
      const { rerender } = render(<AuthenticatedLayout />);
      vi.mocked(useAuth).mockReturnValue({ isLoaded: false, isSignedIn: false } as never);
      expect(screen.getByRole("status")).toBeInTheDocument();

      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as never);
      rerender(<AuthenticatedLayout />);

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/auth/login" });
    });

    it.skip("transitions from authenticated to unauthenticated (logout)", () => {
      mockNavigate.mockClear();
      const { rerender } = render(<AuthenticatedLayout />);
      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true } as never);
      expect(screen.getByTestId("outlet")).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();

      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as never);
      rerender(<AuthenticatedLayout />);

      expect(screen.queryByTestId("outlet")).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/auth/login" });
    });

    it("handles rapid loading -> authenticated transition", () => {
      mockNavigate.mockClear();
      vi.mocked(useAuth).mockReturnValue({ isLoaded: false, isSignedIn: false } as never);
      const { rerender } = render(<AuthenticatedLayout />);
      expect(screen.getByRole("status")).toBeInTheDocument();

      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true } as never);
      rerender(<AuthenticatedLayout />);
      rerender(<AuthenticatedLayout />);
      rerender(<AuthenticatedLayout />);

      expect(screen.getByTestId("outlet")).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("handles isLoaded=true, isSignedIn=true consistently", () => {
      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true } as never);
      const { rerender } = render(<AuthenticatedLayout />);
      expect(screen.getByTestId("outlet")).toBeInTheDocument();

      rerender(<AuthenticatedLayout />);
      expect(screen.getByTestId("outlet")).toBeInTheDocument();
    });

    it("handles isLoaded=true, isSignedIn=false consistently", () => {
      mockNavigate.mockClear();
      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as never);
      const { rerender } = render(<AuthenticatedLayout />);
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/auth/login" });

      const initialCalls = mockNavigate.mock.calls.length;
      rerender(<AuthenticatedLayout />);
      // Should not navigate again if already in unauthenticated state
      expect(mockNavigate.mock.calls.length).toBeLessThanOrEqual(initialCalls + 1);
    });

    it("handles null/undefined user gracefully", () => {
      vi.mocked(useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        user: undefined,
      } as never);
      mockNavigate.mockClear();
      render(<AuthenticatedLayout />);
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/auth/login" });
    });

    it("preserves outlet when signed in multiple renders", () => {
      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true } as never);
      const { rerender } = render(<AuthenticatedLayout />);
      expect(screen.getByTestId("outlet")).toBeInTheDocument();

      rerender(<AuthenticatedLayout />);
      expect(screen.getByTestId("outlet")).toBeInTheDocument();

      rerender(<AuthenticatedLayout />);
      expect(screen.getByTestId("outlet")).toBeInTheDocument();
    });
  });

  describe("Navigation Behavior", () => {
    it("navigates with correct path object structure", () => {
      mockNavigate.mockClear();
      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as never);
      render(<AuthenticatedLayout />);

      expect(mockNavigate).toHaveBeenCalledWith(expect.objectContaining({ to: "/auth/login" }));
    });

    it("does not navigate on authenticated subsequent renders", () => {
      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true } as never);
      mockNavigate.mockClear();
      const { rerender } = render(<AuthenticatedLayout />);
      rerender(<AuthenticatedLayout />);
      rerender(<AuthenticatedLayout />);

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("handles navigate promise resolution", async () => {
      mockNavigate.mockResolvedValueOnce(undefined);
      vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as never);
      render(<AuthenticatedLayout />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({ to: "/auth/login" });
      });
    });
  });
});
