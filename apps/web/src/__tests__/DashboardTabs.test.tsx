import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardTabs } from "../components/dashboard/DashboardTabs";
import { Role } from "../types/roles";

// Mock the tab components
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
  it("renders Order History for customer role", () => {
    render(<DashboardTabs role={Role.customer} />);
    expect(screen.getByText("Order History")).toBeDefined();
    expect(screen.queryByText("My Wines")).toBeNull();
    expect(screen.queryByText("Bundles")).toBeNull();
  });

  it("renders My Wines and Bundles for winemaker role", () => {
    render(<DashboardTabs role={Role.winemaker} />);
    expect(screen.getByText("My Wines")).toBeDefined();
    expect(screen.getByText("Bundles")).toBeDefined();
  });

  it("always renders Events tab", () => {
    const { rerender } = render(<DashboardTabs role={Role.customer} />);
    expect(screen.getByText("Events")).toBeDefined();

    rerender(<DashboardTabs role={Role.winemaker} />);
    expect(screen.getByText("Events")).toBeDefined();
  });
});
