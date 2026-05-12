import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ErrorState } from "./error-state";

describe("ErrorState", () => {
  it("renders default title and message", () => {
    render(<ErrorState />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/couldn't load/i)).toBeInTheDocument();
  });

  it("renders custom title and message", () => {
    render(<ErrorState message="kaboom" title="Boom" />);
    expect(screen.getByText("Boom")).toBeInTheDocument();
    expect(screen.getByText("kaboom")).toBeInTheDocument();
  });

  it("renders Retry only when onRetry is provided", () => {
    const { rerender } = render(<ErrorState />);
    expect(screen.queryByRole("button", { name: /try again/i })).toBeNull();
    rerender(<ErrorState onRetry={vi.fn()} />);
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("fires onRetry when Retry is clicked", async () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("has role=alert", () => {
    render(<ErrorState />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
