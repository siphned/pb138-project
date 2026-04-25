import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRoles } from "../hooks/useRoles";

vi.mock("@clerk/react", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@clerk/react";

describe("useRoles", () => {
  it("returns roles from sessionClaims", () => {
    vi.mocked(useAuth).mockReturnValue({
      sessionClaims: {
        roles: ["admin", "customer"],
      },
    } as never);

    const { result } = renderHook(() => useRoles());

    expect(result.current).toEqual(["admin", "customer"]);
  });

  it("returns empty array if no sessionClaims", () => {
    vi.mocked(useAuth).mockReturnValue({
      sessionClaims: null,
    } as never);

    const { result } = renderHook(() => useRoles());

    expect(result.current).toEqual([]);
  });

  it("returns empty array if roles missing in sessionClaims", () => {
    vi.mocked(useAuth).mockReturnValue({
      sessionClaims: {},
    } as never);

    const { result } = renderHook(() => useRoles());

    expect(result.current).toEqual([]);
  });
});
