import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DescriptionList, PropertyRow } from "./description-list";

describe("DescriptionList + PropertyRow", () => {
  it("renders rows", () => {
    render(
      <DescriptionList>
        <PropertyRow label="Region" value="Tokaj" />
        <PropertyRow label="Vintage" value="2021" />
      </DescriptionList>
    );
    expect(screen.getByText("Region")).toBeInTheDocument();
    expect(screen.getByText("Tokaj")).toBeInTheDocument();
    expect(screen.getByText("Vintage")).toBeInTheDocument();
    expect(screen.getByText("2021")).toBeInTheDocument();
  });

  it("renders dt and dd elements", () => {
    const { container } = render(
      <DescriptionList>
        <PropertyRow label="X" value="Y" />
      </DescriptionList>
    );
    expect(container.querySelector("dl")).not.toBeNull();
    expect(container.querySelector("dt")?.textContent).toBe("X");
    expect(container.querySelector("dd")?.textContent).toBe("Y");
  });
});
