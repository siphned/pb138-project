import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useUser } from "@/context/UserContext";
import { EventManageMenu } from "./EventManageMenu";

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: any) => (
    <a data-testid="link" href={`${to}/${params?.id ?? ""}`}>
      {children}
    </a>
  ),
}));

describe("EventManageMenu", () => {
  it("renders nothing when the current user is not the owner", () => {
    vi.mocked(useUser).mockReturnValue({ user: { id: "u-other" } } as any);
    const { container } = render(
      <EventManageMenu eventId="evt-1" ownerUserId="u-owner" />
    );
    expect(container.textContent ?? "").not.toMatch(/manage/i);
  });

  it("renders nothing when there is no signed-in user", () => {
    vi.mocked(useUser).mockReturnValue({ user: null } as any);
    const { container } = render(
      <EventManageMenu eventId="evt-1" ownerUserId="u-owner" />
    );
    expect(container.textContent ?? "").not.toMatch(/manage/i);
  });

  it("renders the manage trigger when the current user is the owner", () => {
    vi.mocked(useUser).mockReturnValue({ user: { id: "u-owner" } } as any);
    render(<EventManageMenu eventId="evt-1" ownerUserId="u-owner" />);
    expect(screen.getByRole("button", { name: /manage event/i })).toBeInTheDocument();
  });
});
