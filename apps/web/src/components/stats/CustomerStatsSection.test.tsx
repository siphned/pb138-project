import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CustomerStatsSection } from "./CustomerStatsSection";

describe("CustomerStatsSection", () => {
  it("renders the section heading", () => {
    render(<CustomerStatsSection />);
    expect(screen.getByText(/My activity/i)).toBeInTheDocument();
  });

  it("renders all four customer stat tiles", () => {
    render(<CustomerStatsSection />);
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Total spent")).toBeInTheDocument();
    expect(screen.getByText("Events attended")).toBeInTheDocument();
    expect(screen.getByText("Reviews written")).toBeInTheDocument();
  });

  it("renders em-dash placeholders for BE-missing metrics", () => {
    render(<CustomerStatsSection />);
    // All four customer metrics depend on hooks not yet generated.
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(4);
  });

  it("annotates every placeholder with a BE backlog hint", () => {
    const { container } = render(<CustomerStatsSection />);
    const hints = container.querySelectorAll('[data-slot="stat-tile-hint"]');
    expect(hints.length).toBeGreaterThanOrEqual(4);
    for (const hint of hints) {
      expect(hint.textContent).toMatch(/BE backlog/i);
    }
  });
});
