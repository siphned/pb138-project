import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { ReactElement } from "react";
import { describe, expect, it, type Mock } from "vitest";

/**
 * Shared describe block for the five entity image wrappers
 * (`WineImage`, `ProductImage`, `WinemakerImage`, `ShopImage`,
 * `EventImage`). Each wrapper has the same rendering logic:
 * 1. Loading         → <Skeleton> (no alt-text element, no fallback text)
 * 2. Image present   → <img> with the real URL
 * 3. No image        → <img> webp placeholder (alt present, src ≠ sampleUrl)
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
      expect(screen.getByAltText(alt)).toHaveAttribute("src", sampleUrl);
    });

    it("shows a skeleton while the hook is loading", () => {
      setQuery(undefined, true);
      render(renderWrapper());
      expect(screen.queryByAltText(alt)).not.toBeInTheDocument();
      expect(document.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
    });

    it("shows the webp placeholder when no images are attached", () => {
      setQuery([]);
      render(renderWrapper());
      const img = screen.getByAltText(alt);
      expect(img).toBeInTheDocument();
      expect(img).not.toHaveAttribute("src", sampleUrl);
    });
  });
}
