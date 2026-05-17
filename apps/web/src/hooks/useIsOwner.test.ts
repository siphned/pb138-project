import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useUser } from "@/context/UserContext";
import { useIsOwner } from "./useIsOwner";

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);

describe("useIsOwner", () => {
  it("returns false when user is null", () => {
    mockUseUser.mockReturnValue({ user: null } as ReturnType<typeof useUser>);
    const { result } = renderHook(() => useIsOwner({ ownerUserId: "u1" }));
    expect(result.current).toBe(false);
  });

  it("returns false when ownerUserId is null", () => {
    mockUseUser.mockReturnValue({ user: { id: "u1" } } as ReturnType<typeof useUser>);
    const { result } = renderHook(() => useIsOwner({ ownerUserId: null }));
    expect(result.current).toBe(false);
  });

  it("returns true when user.id matches ownerUserId", () => {
    mockUseUser.mockReturnValue({ user: { id: "u1" } } as ReturnType<typeof useUser>);
    const { result } = renderHook(() => useIsOwner({ ownerUserId: "u1" }));
    expect(result.current).toBe(true);
  });

  it("returns false when ids differ", () => {
    mockUseUser.mockReturnValue({ user: { id: "u1" } } as ReturnType<typeof useUser>);
    const { result } = renderHook(() => useIsOwner({ ownerUserId: "u2" }));
    expect(result.current).toBe(false);
  });
});
