import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useEntityReviews } from "@/components/reviews/use-entity-reviews";
import { EntityReviewsSection } from "./EntityReviewsSection";

vi.mock("@/components/reviews/use-entity-reviews", () => ({
  entityReviewsQueryKey: (...args: unknown[]) => ["reviews", ...args],
  useEntityReviews: vi.fn(),
}));

type ReviewRow = {
  id: string;
  body: string | null;
  rating: number;
  createdAt: string;
  user: { fname: string; lname: string };
};

const mockReviews = (
  state: Partial<ReturnType<typeof useEntityReviews>> & {
    reviews?: ReviewRow[];
    averageRating?: number | null;
    totalCount?: number;
  }
) => {
  const { reviews, averageRating = null, totalCount = 0, ...rest } = state;
  vi.mocked(useEntityReviews).mockReturnValue({
    data: reviews
      ? { pageParams: [1], pages: [{ averageRating, reviews, totalCount }] }
      : undefined,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isError: false,
    isFetchingNextPage: false,
    isLoading: false,
    refetch: vi.fn(),
    ...rest,
  } as unknown as ReturnType<typeof useEntityReviews>);
};

describe("EntityReviewsSection", () => {
  it("renders skeletons while loading", () => {
    mockReviews({ isLoading: true });
    render(<EntityReviewsSection entityId="p-1" entityType="product" />);
    expect(document.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
  });

  it("renders the empty message when there are no reviews", () => {
    mockReviews({ reviews: [] });
    render(
      <EntityReviewsSection emptyMessage="No reviews here." entityId="p-1" entityType="product" />
    );
    expect(screen.getByText("No reviews here.")).toBeInTheDocument();
  });

  it("renders reviews, the summary, and the sort control", () => {
    mockReviews({
      averageRating: 4.8,
      reviews: [
        {
          body: "Skvelé víno.",
          createdAt: "2026-06-03T10:00:00Z",
          id: "r-1",
          rating: 5,
          user: { fname: "Radek", lname: "Pospíšil" },
        },
      ],
      totalCount: 5,
    });
    render(<EntityReviewsSection entityId="p-1" entityType="product" />);
    expect(screen.getByText("Radek Pospíšil")).toBeInTheDocument();
    expect(screen.getByText("Skvelé víno.")).toBeInTheDocument();
    expect(screen.getByText("4.8")).toBeInTheDocument();
    expect(screen.getByText("5 reviews")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
