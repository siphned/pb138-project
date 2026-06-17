import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { ReactElement } from "react";
import { describe, expect, it, type Mock } from "vitest";

/**
 * Shared describe block for the four entity image wrappers
 * (`WineImage`, `ProductImage`, `WinemakerImage`, `ShopImage`,
 * `EventImage`). Each wrapper has the same 3-state behavior:
 * render the first image, fall back while loading, fall back when empty.
 *
 * `mockHook` must be the `vi.mocked(useGetXByIdImages)` reference from the
 * caller file (vi.mock is hoisted and must stay in the caller).
 * `renderWrapper` returns the wrapper element under test.
 */
export function describeEntityImageWrapper({
  name,
  mockHook,
  renderWrapper,
  alt,
  fallbackText,
  sampleUrl,
}: {
  name: string;
  mockHook: Mock;
  renderWrapper: () => ReactElement;
  alt: string;
  fallbackText: string;
  sampleUrl: string;
}) {
  const setQuery = (data: unknown, isLoading = false) =>
    mockHook.mockReturnValue({ data, isLoading } as unknown as ReturnType<typeof mockHook>);

  describe(name, () => {
    it("renders the first attached image URL", () => {
      setQuery([{ url: sampleUrl }]);
      render(renderWrapper());
      expect(screen.getByAltText(alt)).toHaveAttribute("src", `http://localhost:3000${sampleUrl}`);
    });

    it("renders the placeholder while the hook is loading", () => {
      setQuery(undefined, true);
      render(renderWrapper());
      expect(screen.queryByAltText(alt)).not.toBeInTheDocument();
      expect(screen.getByText(fallbackText)).toBeInTheDocument();
    });

    it("renders the placeholder when no images are attached", () => {
      setQuery([]);
      render(renderWrapper());
      expect(screen.queryByAltText(alt)).not.toBeInTheDocument();
      expect(screen.getByText(fallbackText)).toBeInTheDocument();
    });
  });
}
