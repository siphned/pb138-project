import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EntityImage } from "./EntityImage";

describe("EntityImage", () => {
  it("renders the first attached image URL", () => {
    render(
      <EntityImage
        alt="Foo"
        fallbackText="Foo"
        imagesQuery={{ data: [{ url: "/uploads/x/foo.webp" }], isLoading: false }}
      />
    );
    expect(screen.getByAltText("Foo")).toHaveAttribute("src", "/uploads/x/foo.webp");
  });

  it("shows a skeleton while loading", () => {
    render(<EntityImage alt="Foo" fallbackText="Foo Item" imagesQuery={{ isLoading: true }} />);
    expect(screen.queryByAltText("Foo")).not.toBeInTheDocument();
    expect(screen.queryByText("Foo Item")).not.toBeInTheDocument();
    expect(document.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
  });

  it("renders the placeholder when no images are attached", () => {
    render(
      <EntityImage
        alt="Foo"
        fallbackColor="red"
        fallbackText="Foo Item"
        imagesQuery={{ data: [], isLoading: false }}
      />
    );
    expect(screen.queryByAltText("Foo")).not.toBeInTheDocument();
    expect(screen.getByText("Foo Item")).toBeInTheDocument();
    expect(screen.getByText("red")).toBeInTheDocument();
  });

  it("renders the placeholder when data is not an array", () => {
    render(
      <EntityImage
        alt="Foo"
        fallbackText="Foo Item"
        imagesQuery={{ data: undefined, isLoading: false }}
      />
    );
    expect(screen.queryByAltText("Foo")).not.toBeInTheDocument();
    expect(screen.getByText("Foo Item")).toBeInTheDocument();
  });
});
