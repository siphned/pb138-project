import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataGrid } from "./data-grid";

describe("DataGrid", () => {
  it("renders catalog variant by default", () => {
    const { container } = render(
      <DataGrid>
        <div>a</div>
      </DataGrid>,
    );
    const grid = container.firstElementChild;
    expect(grid?.className).toMatch(/grid-cols-1/);
    expect(grid?.className).toMatch(/sm:grid-cols-2/);
    expect(grid?.className).toMatch(/lg:grid-cols-3/);
  });

  it("renders gallery variant", () => {
    const { container } = render(
      <DataGrid variant="gallery">
        <div>a</div>
      </DataGrid>,
    );
    expect(container.firstElementChild?.className).toMatch(/lg:grid-cols-4/);
  });

  it("renders list variant", () => {
    const { container } = render(
      <DataGrid variant="list">
        <div>a</div>
      </DataGrid>,
    );
    expect(container.firstElementChild?.className).toMatch(/grid-cols-1/);
    expect(container.firstElementChild?.className).not.toMatch(/sm:grid-cols-/);
  });
});
