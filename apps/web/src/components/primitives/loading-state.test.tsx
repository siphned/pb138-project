import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingState } from "./loading-state";

describe("LoadingState", () => {
  it("renders detail variant by default and sets aria-busy", () => {
    const { container } = render(<LoadingState />);
    const wrapper = container.querySelector("[data-slot='loading-state']");
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute("aria-busy")).toBe("true");
    expect(wrapper?.className).toMatch(/space-y-6/);
  });

  it("renders catalog variant with responsive grid classes", () => {
    const { container } = render(<LoadingState variant="catalog" />);
    const wrapper = container.querySelector("[data-slot='loading-state']");
    expect(wrapper?.className).toMatch(/grid/);
    expect(wrapper?.className).toMatch(/grid-cols-1/);
    expect(wrapper?.className).toMatch(/sm:grid-cols-2/);
    expect(wrapper?.className).toMatch(/lg:grid-cols-3/);
  });

  it("renders list variant", () => {
    const { container } = render(<LoadingState variant="list" />);
    const wrapper = container.querySelector("[data-slot='loading-state']");
    expect(wrapper?.className).toMatch(/space-y-3/);
  });

  it("renders form variant", () => {
    const { container } = render(<LoadingState variant="form" />);
    const wrapper = container.querySelector("[data-slot='loading-state']");
    expect(wrapper?.className).toMatch(/space-y-4/);
  });

  it("merges custom className", () => {
    const { container } = render(<LoadingState className="custom-x" />);
    const wrapper = container.querySelector("[data-slot='loading-state']");
    expect(wrapper?.className).toContain("custom-x");
  });
});
