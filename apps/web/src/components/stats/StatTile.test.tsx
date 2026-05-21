import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatTile } from "./StatTile";

describe("StatTile", () => {
  it("renders label and value", () => {
    render(<StatTile label="Orders" value={42} />);
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders a string value", () => {
    render(<StatTile label="Total spent" value="€1,234" />);
    expect(screen.getByText("€1,234")).toBeInTheDocument();
  });

  it("renders the em-dash placeholder when value is —", () => {
    render(<StatTile label="Revenue" value="—" />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders an optional hint", () => {
    render(<StatTile hint="BE backlog" label="Reviews written" value="—" />);
    expect(screen.getByText("BE backlog")).toBeInTheDocument();
  });

  it("does not render a hint paragraph when not provided", () => {
    const { container } = render(<StatTile label="Wines" value={10} />);
    // small hint paragraph has data-slot stat-tile-hint
    expect(container.querySelector('[data-slot="stat-tile-hint"]')).toBeNull();
  });
});
