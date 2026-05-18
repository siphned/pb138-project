import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductImage } from "./ProductImage";

vi.mock("@/generated/hooks/useGetProductsByIdImages", () => ({
  useGetProductsByIdImages: vi.fn(),
}));

import { useGetProductsByIdImages } from "@/generated/hooks/useGetProductsByIdImages";

const mock = (data: unknown, isLoading = false) =>
  vi
    .mocked(useGetProductsByIdImages)
    .mockReturnValue({ data, isLoading } as unknown as ReturnType<
      typeof useGetProductsByIdImages
    >);

describe("ProductImage", () => {
  it("renders the first attached image URL", () => {
    mock([{ id: "i1", url: "/uploads/product/bar.webp", entityId: "p1", entityType: "product" }]);
    render(<ProductImage alt="Bar" fallbackText="Bar" productId="p1" />);
    const img = screen.getByAltText("Bar");
    expect(img).toHaveAttribute("src", "/uploads/product/bar.webp");
  });

  it("renders the placeholder while the hook is loading", () => {
    mock(undefined, true);
    render(<ProductImage alt="Bar" fallbackText="Bar Bundle" productId="p1" />);
    expect(screen.queryByAltText("Bar")).not.toBeInTheDocument();
    expect(screen.getByText("Bar Bundle")).toBeInTheDocument();
  });

  it("renders the placeholder when no images are attached", () => {
    mock([]);
    render(<ProductImage alt="Bar" fallbackColor="white" fallbackText="Bar Bundle" productId="p1" />);
    expect(screen.queryByAltText("Bar")).not.toBeInTheDocument();
    expect(screen.getByText("Bar Bundle")).toBeInTheDocument();
    expect(screen.getByText("white")).toBeInTheDocument();
  });
});
