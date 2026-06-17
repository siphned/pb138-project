import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { EntityImage, firstImageUrl } from "@/routes/-components/EntityImage";

describe("EntityImage", () => {
  it("renders the provided image URL", () => {
    render(<EntityImage alt="Foo" fallbackText="Foo" imageUrl="/uploads/x/foo.webp" />);
    expect(screen.getByAltText("Foo")).toHaveAttribute("src", "/uploads/x/foo.webp");
  });

  it("renders a skeleton while loading", () => {
    const { container } = render(<EntityImage alt="Foo" fallbackText="Foo Item" isLoading />);
    expect(screen.queryByAltText("Foo")).not.toBeInTheDocument();
    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
  });

  it("renders the placeholder when no image URL is provided", () => {
    render(<EntityImage alt="Foo" fallbackColor="red" fallbackText="Foo Item" imageUrl={null} />);
    expect(screen.queryByAltText("Foo")).not.toBeInTheDocument();
    expect(screen.getByText("Foo Item")).toBeInTheDocument();
    expect(screen.getByText("red")).toBeInTheDocument();
  });

  it("renders the entity placeholder webp when entityType is given and no URL", () => {
    render(<EntityImage alt="Foo" entityType="product" fallbackText="Foo Item" imageUrl={null} />);
    expect(screen.getByAltText("Foo")).toHaveAttribute("src", "/placeholders/product.webp");
  });
});

describe("firstImageUrl", () => {
  it("returns the first url from an array", () => {
    expect(firstImageUrl([{ url: "/a.webp" }, { url: "/b.webp" }])).toBe("/a.webp");
  });

  it("returns undefined for empty array or non-array", () => {
    expect(firstImageUrl([])).toBeUndefined();
    expect(firstImageUrl(undefined)).toBeUndefined();
  });
});
