import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders default title and message", () => {
    render(<EmptyState />);
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
    expect(screen.getByText("There's nothing to show.")).toBeInTheDocument();
  });

  it("renders custom title and message", () => {
    render(<EmptyState message="Add one to get started" title="No wines" />);
    expect(screen.getByText("No wines")).toBeInTheDocument();
    expect(screen.getByText("Add one to get started")).toBeInTheDocument();
  });

  it("renders the action slot", () => {
    render(<EmptyState action={<button type="button">Add</button>} />);
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("has the empty-state data slot", () => {
    const { container } = render(<EmptyState />);
    expect(container.querySelector("[data-slot='empty-state']")).not.toBeNull();
  });
});
