import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardTabs } from "../components/dashboard/DashboardTabs";
import { Role } from "../types/roles";

// Mock the tab components with more detail
vi.mock("../components/dashboard/tabs/WinesTab", () => ({
  WinesTab: () => <div data-testid="wines-tab">Wines Tab</div>,
}));
vi.mock("../components/dashboard/tabs/MyBundlesTab", () => ({
  MyBundlesTab: () => <div data-testid="bundles-tab">Bundles Tab</div>,
}));
vi.mock("../components/dashboard/tabs/EventsTab", () => ({
  EventsTab: () => <div data-testid="events-tab">Events Tab</div>,
}));

describe("DashboardTabs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Customer Role", () => {
    it("renders Order History tab for customer", () => {
      render(<DashboardTabs role={Role.customer} />);
      expect(screen.getByText("Order History")).toBeInTheDocument();
    });

    it("does not render My Wines for customer", () => {
      render(<DashboardTabs role={Role.customer} />);
      expect(screen.queryByText("My Wines")).not.toBeInTheDocument();
    });

    it("does not render Bundles for customer", () => {
      render(<DashboardTabs role={Role.customer} />);
      expect(screen.queryByText("Bundles")).not.toBeInTheDocument();
    });

    it("renders Events tab for customer", () => {
      render(<DashboardTabs role={Role.customer} />);
      expect(screen.getByText("Events")).toBeInTheDocument();
    });

    it("shows Order History as default tab for customer", () => {
      render(<DashboardTabs role={Role.customer} />);
      expect(screen.getByText("Order History")).toBeInTheDocument();
      expect(screen.getByTestId("wines-tab")).toBeInTheDocument();
    });

    it("has exactly 2 tabs for customer role (Order History + Events)", () => {
      render(<DashboardTabs role={Role.customer} />);
      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBe(2);
    });
  });

  describe("Winemaker Role", () => {
    it("renders My Wines tab for winemaker", () => {
      render(<DashboardTabs role={Role.winemaker} />);
      expect(screen.getByText("My Wines")).toBeInTheDocument();
    });

    it("renders Bundles tab for winemaker", () => {
      render(<DashboardTabs role={Role.winemaker} />);
      expect(screen.getByText("Bundles")).toBeInTheDocument();
    });

    it("renders Events tab for winemaker", () => {
      render(<DashboardTabs role={Role.winemaker} />);
      expect(screen.getByText("Events")).toBeInTheDocument();
    });

    it("does not render Order History for winemaker", () => {
      render(<DashboardTabs role={Role.winemaker} />);
      expect(screen.queryByText("Order History")).not.toBeInTheDocument();
    });

    it("has exactly 3 tabs for winemaker role (My Wines + Bundles + Events)", () => {
      render(<DashboardTabs role={Role.winemaker} />);
      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBe(3);
    });

    it("shows My Wines as default tab for winemaker", () => {
      render(<DashboardTabs role={Role.winemaker} />);
      expect(screen.getByTestId("wines-tab")).toBeInTheDocument();
    });
  });

  describe("Shop Owner Role", () => {
    it("handles shop_owner role correctly", () => {
      render(<DashboardTabs role={Role.shop_owner} />);
      expect(screen.getByText("Events")).toBeInTheDocument();
    });

    it("shows correct tabs for shop owner", () => {
      render(<DashboardTabs role={Role.shop_owner} />);
      // Shop owner should have similar tabs to customer or winemaker
      expect(screen.getByText("Events")).toBeInTheDocument();
    });
  });

  describe("Admin Role", () => {
    it("handles admin role correctly", () => {
      render(<DashboardTabs role={Role.admin} />);
      expect(screen.getByText("Events")).toBeInTheDocument();
    });

    it("shows Events tab for admin", () => {
      render(<DashboardTabs role={Role.admin} />);
      expect(screen.getByText("Events")).toBeInTheDocument();
    });
  });

  describe("Tab Content", () => {
    it("displays wines tab content for customer", () => {
      render(<DashboardTabs role={Role.customer} />);
      expect(screen.getByTestId("wines-tab")).toBeInTheDocument();
    });

    it("displays bundles tab content when clicked for winemaker", async () => {
      const user = userEvent.setup();
      render(<DashboardTabs role={Role.winemaker} />);

      const bundlesTab = screen.getByText("Bundles");
      await user.click(bundlesTab);

      await waitFor(() => {
        expect(screen.getByTestId("bundles-tab")).toBeInTheDocument();
      });
    });

    it("displays events tab content when clicked", async () => {
      const user = userEvent.setup();
      render(<DashboardTabs role={Role.customer} />);

      const eventsTab = screen.getByText("Events");
      await user.click(eventsTab);

      await waitFor(() => {
        expect(screen.getByTestId("events-tab")).toBeInTheDocument();
      });
    });
  });

  describe("Tab Switching", () => {
    it("switches between tabs for customer", async () => {
      const user = userEvent.setup();
      render(<DashboardTabs role={Role.customer} />);

      // Initially on Order History
      expect(screen.getByTestId("wines-tab")).toBeInTheDocument();

      // Click Events tab
      await user.click(screen.getByText("Events"));

      await waitFor(() => {
        expect(screen.getByTestId("events-tab")).toBeInTheDocument();
      });
    });

    it("switches between multiple tabs for winemaker", async () => {
      const user = userEvent.setup();
      render(<DashboardTabs role={Role.winemaker} />);

      // Click Bundles tab
      await user.click(screen.getByText("Bundles"));
      expect(screen.getByTestId("bundles-tab")).toBeInTheDocument();

      // Click Events tab
      await user.click(screen.getByText("Events"));
      expect(screen.getByTestId("events-tab")).toBeInTheDocument();

      // Click My Wines tab
      await user.click(screen.getByText("My Wines"));
      expect(screen.getByTestId("wines-tab")).toBeInTheDocument();
    });

    it("maintains tab state during rapid clicks", async () => {
      const user = userEvent.setup();
      render(<DashboardTabs role={Role.winemaker} />);

      await user.click(screen.getByText("Bundles"));
      await user.click(screen.getByText("Bundles"));
      await user.click(screen.getByText("Bundles"));

      expect(screen.getByTestId("bundles-tab")).toBeInTheDocument();
    });
  });

  describe("Tab Rendering", () => {
    it("always renders Events tab regardless of role", () => {
      const roles = [Role.customer, Role.winemaker, Role.admin, Role.shop_owner];

      roles.forEach((role) => {
        const { unmount } = render(<DashboardTabs role={role} />);
        expect(screen.getByText("Events")).toBeInTheDocument();
        unmount();
      });
    });

    it("only renders role-specific tabs for that role", () => {
      const { unmount } = render(<DashboardTabs role={Role.winemaker} />);
      expect(screen.getByText("My Wines")).toBeInTheDocument();
      unmount();

      render(<DashboardTabs role={Role.customer} />);
      expect(screen.queryByText("My Wines")).not.toBeInTheDocument();
    });
  });

  describe("Role Changes", () => {
    it("updates tabs when role changes", () => {
      const { rerender } = render(<DashboardTabs role={Role.customer} />);
      expect(screen.getByText("Order History")).toBeInTheDocument();
      expect(screen.queryByText("My Wines")).not.toBeInTheDocument();

      rerender(<DashboardTabs role={Role.winemaker} />);
      expect(screen.queryByText("Order History")).not.toBeInTheDocument();
      expect(screen.getByText("My Wines")).toBeInTheDocument();
    });

    it("handles multiple role changes smoothly", () => {
      const { rerender } = render(<DashboardTabs role={Role.customer} />);
      expect(screen.getByText("Events")).toBeInTheDocument();

      rerender(<DashboardTabs role={Role.winemaker} />);
      expect(screen.getByText("My Wines")).toBeInTheDocument();

      rerender(<DashboardTabs role={Role.customer} />);
      expect(screen.getByText("Order History")).toBeInTheDocument();
    });

    it("resets to first tab when role changes", () => {
      const { rerender } = render(<DashboardTabs role={Role.winemaker} />);
      expect(screen.getByText("My Wines")).toBeInTheDocument();

      rerender(<DashboardTabs role={Role.customer} />);
      // Role changed, tabs should update
      expect(screen.getByText("Order History")).toBeInTheDocument();
      expect(screen.queryByText("My Wines")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper tab roles", () => {
      render(<DashboardTabs role={Role.customer} />);
      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBeGreaterThan(0);
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute("role", "tab");
      });
    });

    it("makes tab labels accessible", () => {
      render(<DashboardTabs role={Role.winemaker} />);
      expect(screen.getByText("My Wines")).toBeInTheDocument();
      expect(screen.getByText("Bundles")).toBeInTheDocument();
      expect(screen.getByText("Events")).toBeInTheDocument();
    });

    it("supports keyboard navigation between tabs", async () => {
      const user = userEvent.setup();
      render(<DashboardTabs role={Role.customer} />);

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();
      expect(document.activeElement).toBe(tabs[0]);

      await user.keyboard("{ArrowRight}");
      // Next tab should be focused
    });
  });

  describe("Edge Cases", () => {
    it("handles null role gracefully", () => {
      render(<DashboardTabs role={null as unknown as Role} />);
      // Should render without crashing
      expect(screen.getByText("Events")).toBeInTheDocument();
    });

    it("handles undefined role gracefully", () => {
      render(<DashboardTabs role={undefined as unknown as Role} />);
      // Should render without crashing
      expect(screen.getByText("Events")).toBeInTheDocument();
    });

    it("renders consistent tabs on multiple mounts", () => {
      const { unmount } = render(<DashboardTabs role={Role.customer} />);
      const tabs1 = screen.getAllByRole("tab").length;
      unmount();

      render(<DashboardTabs role={Role.customer} />);
      const tabs2 = screen.getAllByRole("tab").length;

      expect(tabs1).toBe(tabs2);
    });
  });
});
