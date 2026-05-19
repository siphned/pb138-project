import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShopImage } from "./ShopImage";

vi.mock("@/generated/hooks/useGetShopsByIdImages", () => ({
  useGetShopsByIdImages: vi.fn(),
}));

import { useGetShopsByIdImages } from "@/generated/hooks/useGetShopsByIdImages";

const mock = (data: unknown, isLoading = false) =>
  vi
    .mocked(useGetShopsByIdImages)
    .mockReturnValue({ data, isLoading } as unknown as ReturnType<typeof useGetShopsByIdImages>);

describe("ShopImage", () => {
  it("renders the first attached image URL", () => {
    mock([{ id: "i1", entityId: "s1", entityType: "shop", url: "/uploads/shop/x.webp" }]);
    render(<ShopImage alt="Vinyard" fallbackText="Vinyard" shopId="s1" />);
    expect(screen.getByAltText("Vinyard")).toHaveAttribute("src", "/uploads/shop/x.webp");
  });

  it("renders the placeholder while the hook is loading", () => {
    mock(undefined, true);
    render(<ShopImage alt="Vinyard" fallbackText="Vinyard Cellar" shopId="s1" />);
    expect(screen.queryByAltText("Vinyard")).not.toBeInTheDocument();
    expect(screen.getByText("Vinyard Cellar")).toBeInTheDocument();
  });

  it("renders the placeholder when no images are attached", () => {
    mock([]);
    render(<ShopImage alt="Vinyard" fallbackText="Vinyard Cellar" shopId="s1" />);
    expect(screen.queryByAltText("Vinyard")).not.toBeInTheDocument();
    expect(screen.getByText("Vinyard Cellar")).toBeInTheDocument();
  });
});
