import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useUser } from "@/context/UserContext";
import { ShowOwner } from "./show-owner";

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);

describe("ShowOwner", () => {
  it("renders children when user.id matches ownerUserId", () => {
    mockUseUser.mockReturnValue({ user: { id: "u1" } } as ReturnType<typeof useUser>);
    render(
      <ShowOwner ownerUserId="u1">
        <span>owner-only</span>
      </ShowOwner>
    );
    expect(screen.getByText("owner-only")).toBeInTheDocument();
  });

  it("renders fallback when user.id does not match", () => {
    mockUseUser.mockReturnValue({ user: { id: "u1" } } as ReturnType<typeof useUser>);
    render(
      <ShowOwner fallback={<span>not-owner</span>} ownerUserId="u2">
        <span>owner-only</span>
      </ShowOwner>
    );
    expect(screen.queryByText("owner-only")).toBeNull();
    expect(screen.getByText("not-owner")).toBeInTheDocument();
  });

  it("renders nothing by default when not owner", () => {
    mockUseUser.mockReturnValue({ user: null } as ReturnType<typeof useUser>);
    const { container } = render(
      <ShowOwner ownerUserId="u1">
        <span>owner-only</span>
      </ShowOwner>
    );
    expect(container.textContent).toBe("");
  });
});
