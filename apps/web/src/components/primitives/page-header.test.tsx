import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./page-header";

describe("PageHeader", () => {
  it("renders the title", () => {
    render(<PageHeader title="Explore wines" />);
    expect(screen.getByRole("heading", { level: 1, name: "Explore wines" })).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(<PageHeader description="some description" title="t" />);
    expect(screen.getByText("some description")).toBeInTheDocument();
  });

  it("renders the actions slot", () => {
    render(<PageHeader actions={<button type="button">Click</button>} title="t" />);
    expect(screen.getByRole("button", { name: "Click" })).toBeInTheDocument();
  });
});
