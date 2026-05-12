import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchSection } from "./SearchSection";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, search }: any) => {
    const searchStr = search ? `?q=${search.q}` : "";
    return <a href={`${to}${searchStr}`}>{children}</a>;
  },
}));

describe("SearchSection", () => {
  it("renders heading and children in a grid", () => {
    render(
      <SearchSection count={5} heading="Wines" viewAllHref="/explore">
        <div data-testid="child">Child</div>
      </SearchSection>
    );
    expect(screen.getByText("Wines")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders 'View all' link with correct count and search params", () => {
    render(
      <SearchSection
        count={12}
        heading="Wines"
        viewAllHref="/explore"
        viewAllSearch={{ q: "riesling" }}
      >
        <div>Children</div>
      </SearchSection>
    );
    const link = screen.getByRole("link", { name: /view all \(12\)/i });
    expect(link).toHaveAttribute("href", "/explore?q=riesling");
  });

  it("renders nothing if count is 0", () => {
    const { container } = render(
      <SearchSection count={0} heading="Wines" viewAllHref="/explore">
        <div>Children</div>
      </SearchSection>
    );
    expect(container.firstChild).toBeNull();
  });
});
