import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Section } from "./section";

describe("Section", () => {
  it("renders heading and children", () => {
    render(
      <Section heading="Reviews">
        <p>body</p>
      </Section>,
    );
    expect(screen.getByText("Reviews")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("renders without a heading", () => {
    render(
      <Section>
        <p>body</p>
      </Section>,
    );
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("supports render prop polymorphism", () => {
    const { container } = render(
      <Section render={<article data-testid="art" />}>
        <p>body</p>
      </Section>,
    );
    expect(container.querySelector("article")).not.toBeNull();
  });
});
