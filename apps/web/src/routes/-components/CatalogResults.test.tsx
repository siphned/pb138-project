import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CatalogResults } from "@/routes/-components/CatalogResults";

describe("CatalogResults", () => {
  it("renders children in a grid", () => {
    render(
      <CatalogResults>
        <div data-testid="child">Child</div>
      </CatalogResults>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders count caption when provided", () => {
    render(
      <CatalogResults count={12}>
        <div>Children</div>
      </CatalogResults>
    );
    expect(screen.getByText(/12 results/i)).toBeInTheDocument();
  });

  it("renders nothing for count when not provided", () => {
    render(
      <CatalogResults>
        <div>Children</div>
      </CatalogResults>
    );
    expect(screen.queryByText(/results/i)).not.toBeInTheDocument();
  });
});
