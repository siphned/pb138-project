import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useUser } from "@/context/UserContext";
import { useGetEventsByIdComments } from "@/generated/hooks/useGetEventsByIdComments";
import { usePostEventsByIdComments } from "@/generated/hooks/usePostEventsByIdComments";
import { EventCommentList } from "./EventCommentList";

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/generated/hooks/useGetEventsByIdComments", () => ({
  useGetEventsByIdComments: vi.fn(),
}));

vi.mock("@/generated/hooks/usePostEventsByIdComments", () => ({
  usePostEventsByIdComments: vi.fn(),
}));

const mockComments = (
  state: Partial<ReturnType<typeof useGetEventsByIdComments>> & { data?: unknown }
) => {
  vi.mocked(useGetEventsByIdComments).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...state,
  } as any);
};

const mockPost = (overrides: Partial<ReturnType<typeof usePostEventsByIdComments>> = {}) => {
  const mutate = vi.fn();
  vi.mocked(usePostEventsByIdComments).mockReturnValue({
    mutate,
    isPending: false,
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
    mockComments({ data: [] });
    mockPost();
    render(<EventCommentList eventId="evt-1" />);
    expect(screen.getByText(/no comments yet/i)).toBeInTheDocument();
  });

  it("renders existing comments with author and body", () => {
    vi.mocked(useUser).mockReturnValue({ user: null } as any);
    mockComments({
      data: [
        { id: "c-1", body: "Great event!", authorName: "Alice", createdAt: "2026-05-01T10:00:00Z" },
      ],
    });
    mockPost();
    render(<EventCommentList eventId="evt-1" />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Great event!")).toBeInTheDocument();
  });

  it("hides the post form when not signed in", () => {
    vi.mocked(useUser).mockReturnValue({ user: null } as any);
    mockComments({ data: [] });
    mockPost();
    render(<EventCommentList eventId="evt-1" />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText(/sign in to leave a comment/i)).toBeInTheDocument();
  });

  it("submits a new comment when the user clicks Post", () => {
    vi.mocked(useUser).mockReturnValue({ user: { id: "u-1" } } as any);
    mockComments({ data: [] });
    const mutate = mockPost();
    render(<EventCommentList eventId="evt-1" />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Looking forward!" } });
    fireEvent.click(screen.getByRole("button", { name: /post comment/i }));
    expect(mutate).toHaveBeenCalledWith({ id: "evt-1", data: { body: "Looking forward!" } });
  });
});
