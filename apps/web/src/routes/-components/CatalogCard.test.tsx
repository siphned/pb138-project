import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CatalogCard, catalogCardLinkClass } from "@/routes/-components/CatalogCard";

describe("CatalogCard", () => {
  it("renders the image slot, title link, and body children", () => {
    const { container } = render(
      <CatalogCard
        imageSlot={<div data-testid="image">img</div>}
        titleLink={<a href="/x">My title</a>}
      >
        <p>My subtitle</p>
      </CatalogCard>
    );
    expect(screen.getByTestId("image")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "My title" })).toBeInTheDocument();
    expect(screen.getByText("My subtitle")).toBeInTheDocument();
    expect(container.querySelector("[data-slot='catalog-card']")).toBeInTheDocument();
  });

  it("wraps the title in an h3 heading", () => {
    render(
      <CatalogCard imageSlot={<div />} titleLink={<a href="/x">My title</a>}>
        <p>body</p>
      </CatalogCard>
    );
    expect(screen.getByRole("heading", { level: 3, name: "My title" })).toBeInTheDocument();
  });

  it("renders an image overlay when provided", () => {
    render(
      <CatalogCard
        imageOverlay={<span data-testid="overlay">BUNDLE</span>}
        imageSlot={<div />}
        titleLink={<a href="/x">title</a>}
      />
    );
    expect(screen.getByTestId("overlay")).toBeInTheDocument();
  });

  it("does not render an overlay when none is provided", () => {
    render(<CatalogCard imageSlot={<div />} titleLink={<a href="/x">title</a>} />);
    expect(screen.queryByTestId("overlay")).not.toBeInTheDocument();
  });

  it("exports the stretched-link className for callers to apply on their Link", () => {
    expect(catalogCardLinkClass).toContain("stretched-link");
  });
});
