import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRoles } from "../hooks/useRoles";
import { Role } from "../types/roles";

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

import { useUser } from "@/context/UserContext";

describe("useRoles", () => {
  it("converts UserContext Title-Case roles into BE/wire AppRole form", () => {
    vi.mocked(useUser).mockReturnValue({
      activeRole: Role.admin,
      isLoading: false,
      setActiveRole: vi.fn(),
      updateUser: vi.fn(),
      user: {
        clerkId: "clerk_1",
        email: "a@b.com",
        fname: "Adam",
        id: "u1",
        lname: "M",
        roles: [Role.admin, Role.customer],
      },
    });

    const { result } = renderHook(() => useRoles());

    expect(result.current).toEqual(["admin", "customer"]);
  });

  it("returns empty array when user is null (signed out)", () => {
    vi.mocked(useUser).mockReturnValue({
      activeRole: Role.customer,
      isLoading: false,
      setActiveRole: vi.fn(),
      updateUser: vi.fn(),
      user: null,
    });

    const { result } = renderHook(() => useRoles());

    expect(result.current).toEqual([]);
  });

  it("returns empty array when user has no roles", () => {
    vi.mocked(useUser).mockReturnValue({
      activeRole: Role.customer,
      isLoading: false,
      setActiveRole: vi.fn(),
      updateUser: vi.fn(),
      user: {
        clerkId: "clerk_1",
        email: "a@b.com",
        fname: "Adam",
        id: "u1",
        lname: "M",
        roles: [],
      },
    });

    const { result } = renderHook(() => useRoles());

    expect(result.current).toEqual([]);
  });
});
