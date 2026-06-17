import { Elysia } from "elysia";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Hoist all mocks before any imports
const { mockVerifyClerkToken, mockLogger } = vi.hoisted(() => ({
  mockLogger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
  mockVerifyClerkToken: vi.fn().mockResolvedValue(null),
}));

vi.mock("./auth.utils", () => ({
  verifyClerkToken: mockVerifyClerkToken,
}));

vi.mock("../users/users.service", () => ({
  usersService: {
    lazyGetOrCreate: vi
      .fn()
      .mockResolvedValue({ email: "test@test.com", id: "u1", status: "active" }),
  },
}));

vi.mock("../carts/carts.service", () => ({
  cartsService: {
    mergeOnLogin: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../../utils/logger", () => ({
  logger: mockLogger,
}));

import { cartsService } from "../carts/carts.service";
import { usersService } from "../users/users.service";
import { authPlugin } from "./auth.plugin";

function createTestApp() {
  return new Elysia()
    .use(authPlugin)
    .get(
      "/test-auth",
      ({ clerkId, dbUser }) => {
        return { clerkId, dbUserId: dbUser.id };
      },
      { requireAuth: true } as never
    )
    .get(
      "/test-capability",
      ({ clerkId }) => {
        return { clerkId };
      },
      { requireCapability: "admin" } as never
    )
    .get(
      "/test-roles",
      ({ clerkId }) => {
        return { clerkId };
      },
      { requireRoles: ["admin", "shop_owner"] } as never
    );
}

describe("authPlugin macros", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyClerkToken.mockResolvedValue(null);
    vi.mocked(usersService.lazyGetOrCreate).mockResolvedValue({
      email: "test@test.com",
      id: "u1",
      status: "active",
    } as never);
    vi.mocked(cartsService.mergeOnLogin).mockResolvedValue(undefined);
  });

  // ── requireAuth ──────────────────────────────────────────────

  describe("requireAuth", () => {
    it("returns 401 when no valid token", async () => {
      mockVerifyClerkToken.mockResolvedValue(null);

      const app = createTestApp();
      const res = await app.handle(new Request("http://localhost/test-auth", { method: "GET" }));

      expect(res.status).toBe(401);
    });

    it("returns clerkId, dbUser when valid token", async () => {
      mockVerifyClerkToken.mockResolvedValue({
        roles: ["customer"],
        sub: "clerk-user-1",
      });

      const app = createTestApp();
      const res = await app.handle(
        new Request("http://localhost/test-auth", {
          headers: { Authorization: "Bearer valid-token" },
          method: "GET",
        })
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({
        clerkId: "clerk-user-1",
        dbUserId: "u1",
      });
    });

    it("returns 403 when the user is banned or suspended", async () => {
      mockVerifyClerkToken.mockResolvedValue({
        roles: ["customer"],
        sub: "clerk-user-1",
      });
      vi.mocked(usersService.lazyGetOrCreate).mockResolvedValue({
        email: "test@test.com",
        id: "u1",
        status: "banned",
      } as never);

      const app = createTestApp();
      const res = await app.handle(
        new Request("http://localhost/test-auth", {
          headers: { Authorization: "Bearer valid-token" },
          method: "GET",
        })
      );

      expect(res.status).toBe(403);
    });

    it("calls lazyGetOrCreate with the clerk sub", async () => {
      mockVerifyClerkToken.mockResolvedValue({
        roles: ["customer"],
        sub: "clerk-user-1",
      });

      const app = createTestApp();
      await app.handle(
        new Request("http://localhost/test-auth", {
          headers: { Authorization: "Bearer valid-token" },
          method: "GET",
        })
      );

      expect(usersService.lazyGetOrCreate).toHaveBeenCalledWith("clerk-user-1");
    });

    it("calls mergeOnLogin when guest_session_id cookie present", async () => {
      mockVerifyClerkToken.mockResolvedValue({
        roles: ["customer"],
        sub: "clerk-user-1",
      });

      const app = createTestApp();
      await app.handle(
        new Request("http://localhost/test-auth", {
          headers: {
            Authorization: "Bearer valid-token",
            cookie: "guest_session_id=gst-session-99",
          },
          method: "GET",
        })
      );

      expect(cartsService.mergeOnLogin).toHaveBeenCalledWith("u1", "gst-session-99");
    });
  });

  // ── requireCapability ────────────────────────────────────────

  describe("requireCapability", () => {
    it("returns 401 when no valid token", async () => {
      mockVerifyClerkToken.mockResolvedValue(null);

      const app = createTestApp();
      const res = await app.handle(
        new Request("http://localhost/test-capability", { method: "GET" })
      );

      expect(res.status).toBe(401);
    });

    it("returns 403 when lacking the required capability", async () => {
      mockVerifyClerkToken.mockResolvedValue({
        roles: ["customer"],
        sub: "clerk-user-1",
      });

      const app = createTestApp();
      const res = await app.handle(
        new Request("http://localhost/test-capability", {
          headers: { Authorization: "Bearer valid-token" },
          method: "GET",
        })
      );

      // Elysia resolve hooks that return a status code produce an error response
      expect(res.status).toBe(403);
    });

    it("succeeds when having the required capability", async () => {
      mockVerifyClerkToken.mockResolvedValue({
        roles: ["admin", "customer"],
        sub: "clerk-admin-1",
      });

      const app = createTestApp();
      const res = await app.handle(
        new Request("http://localhost/test-capability", {
          headers: { Authorization: "Bearer valid-token" },
          method: "GET",
        })
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.clerkId).toBe("clerk-admin-1");
    });
  });

  // ── requireRoles ─────────────────────────────────────────────

  describe("requireRoles", () => {
    it("returns 401 when no valid token", async () => {
      mockVerifyClerkToken.mockResolvedValue(null);

      const app = createTestApp();
      const res = await app.handle(new Request("http://localhost/test-roles", { method: "GET" }));

      expect(res.status).toBe(401);
    });

    it("returns 403 when lacking all required roles", async () => {
      mockVerifyClerkToken.mockResolvedValue({
        roles: ["customer"],
        sub: "clerk-user-1",
      });

      const app = createTestApp();
      const res = await app.handle(
        new Request("http://localhost/test-roles", {
          headers: { Authorization: "Bearer valid-token" },
          method: "GET",
        })
      );

      expect(res.status).toBe(403);
    });

    it("succeeds when having at least one required role", async () => {
      mockVerifyClerkToken.mockResolvedValue({
        roles: ["shop_owner"],
        sub: "clerk-shop-1",
      });

      const app = createTestApp();
      const res = await app.handle(
        new Request("http://localhost/test-roles", {
          headers: { Authorization: "Bearer valid-token" },
          method: "GET",
        })
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.clerkId).toBe("clerk-shop-1");
    });

    it("succeeds with admin role when admin or shop_owner required", async () => {
      mockVerifyClerkToken.mockResolvedValue({
        roles: ["admin"],
        sub: "clerk-admin-1",
      });

      const app = createTestApp();
      const res = await app.handle(
        new Request("http://localhost/test-roles", {
          headers: { Authorization: "Bearer valid-token" },
          method: "GET",
        })
      );

      expect(res.status).toBe(200);
    });
  });
});
