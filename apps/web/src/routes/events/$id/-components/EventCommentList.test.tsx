import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useUser } from "@/context/UserContext";
import { usePostEventsByIdComments } from "@/generated/hooks/usePostEventsByIdComments";
import { EventCommentList } from "@/routes/events/$id/-components/EventCommentList";
import { useEventComments } from "@/routes/events/$id/-components/use-event-comments";

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("./use-event-comments", () => ({
  eventCommentsQueryKey: (eventId: string) => ["events", eventId, "comments", "infinite"],
  useEventComments: vi.fn(),
}));

vi.mock("@/generated/hooks/usePostEventsByIdComments", () => ({
  usePostEventsByIdComments: vi.fn(),
}));

type CommentRow = {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; fname: string; lname: string };
};

const mockComments = (
  state: Partial<ReturnType<typeof useEventComments>> & { comments?: CommentRow[] }
) => {
  const { comments, ...rest } = state;
  vi.mocked(useEventComments).mockReturnValue({
    data: comments
      ? { pageParams: [1], pages: [{ data: comments, limit: 10, page: 1, total: comments.length }] }
      : undefined,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isError: false,
    isFetchingNextPage: false,
    isLoading: false,
    refetch: vi.fn(),
    ...rest,
  } as any);
};

const mockPost = (overrides: Partial<ReturnType<typeof usePostEventsByIdComments>> = {}) => {
  const mutate = vi.fn();
  vi.mocked(usePostEventsByIdComments).mockReturnValue({
    isPending: false,
    mutate,
    ...overrides,
  } as any);
  return mutate;
};

describe("EventCommentList", () => {
  it("renders a LoadingState while loading", () => {
    vi.mocked(useUser).mockReturnValue({ user: null } as any);
    mockComments({ isLoading: true });
    mockPost();
    render(<EventCommentList eventId="evt-1" />);
    expect(document.querySelector('[data-slot="loading-state"]')).toBeInTheDocument();
  });

  it("renders an ErrorState on error", () => {
    vi.mocked(useUser).mockReturnValue({ user: null } as any);
    mockComments({ isError: true });
    mockPost();
    render(<EventCommentList eventId="evt-1" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders an EmptyState when no comments are returned", () => {
    vi.mocked(useUser).mockReturnValue({ user: null } as any);
    mockComments({ comments: [] });
    mockPost();
    render(<EventCommentList eventId="evt-1" />);
    expect(screen.getByText(/no comments yet/i)).toBeInTheDocument();
  });

  it("renders existing comments with author and body", () => {
    vi.mocked(useUser).mockReturnValue({ user: null } as any);
    mockComments({
      comments: [
        {
          body: "Great event!",
          createdAt: "2026-05-01T10:00:00Z",
          id: "c-1",
          user: { fname: "Alice", id: "u-9", lname: "Wang" },
        },
      ],
    });
    mockPost();
    render(<EventCommentList eventId="evt-1" />);
    expect(screen.getByText("Alice Wang")).toBeInTheDocument();
    expect(screen.getByText("Great event!")).toBeInTheDocument();
  });

  it("hides the post form when not signed in", () => {
    vi.mocked(useUser).mockReturnValue({ user: null } as any);
    mockComments({ comments: [] });
    mockPost();
    render(<EventCommentList eventId="evt-1" />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText(/sign in to leave a comment/i)).toBeInTheDocument();
  });

  it("submits a new comment when the user clicks Post", () => {
    vi.mocked(useUser).mockReturnValue({ user: { id: "u-1" } } as any);
    mockComments({ comments: [] });
    const mutate = mockPost();
    render(<EventCommentList eventId="evt-1" />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Looking forward!" } });
    fireEvent.click(screen.getByRole("button", { name: /post comment/i }));
    expect(mutate).toHaveBeenCalledWith({ data: { body: "Looking forward!" }, id: "evt-1" });
  });
});
