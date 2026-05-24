import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeHero } from "./HomeHero";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a data-testid="link" href={to}>
      {children}
    </a>
  ),
}));

describe("HomeHero", () => {
  it("renders the marketing heading", () => {
    render(<HomeHero />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders a subtitle / tagline", () => {
    const { container } = render(<HomeHero />);
    expect(container.querySelector("[data-slot='home-hero-tagline']")).toBeInTheDocument();
  });

  it("renders a CTA linking to /wines", () => {
    render(<HomeHero />);
    const link = screen.getAllByTestId("link").find((el) => el.getAttribute("href") === "/wines");
    expect(link).toBeDefined();
  });

  it("renders a CTA linking to /events", () => {
    render(<HomeHero />);
    const link = screen.getAllByTestId("link").find((el) => el.getAttribute("href") === "/events");
    expect(link).toBeDefined();
  });

  it("has the home-hero data slot", () => {
    const { container } = render(<HomeHero />);
    expect(container.querySelector("[data-slot='home-hero']")).toBeInTheDocument();
  });
});
