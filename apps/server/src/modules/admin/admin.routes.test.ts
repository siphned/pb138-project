import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuth } from "../../__tests__/helpers/auth";
import { del, get } from "../../__tests__/helpers/request";
import { app } from "../../app";

vi.mock("./admin.service", () => ({
  adminService: {
    deleteReview: vi.fn().mockResolvedValue(undefined),
    listAllReviews: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    listUsers: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    setUserStatus: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("../users/users.service", () => ({
  usersService: { lazyGetOrCreate: vi.fn().mockResolvedValue({ id: "u1" }) },
}));

vi.mock("../auth/auth.utils", () => ({
  verifyClerkToken: vi.fn().mockResolvedValue(null),
}));

vi.mock("../../utils/logger", () => ({
  logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

vi.mock("../carts/carts.service", () => ({
  cartsService: { mergeOnLogin: vi.fn().mockResolvedValue(undefined) },
}));

describe("admin routes", () => {
  afterEach(() => resetAuth());

  describe("GET /admin/users", () => {
    it("returns 401 when no auth token", async () => {
      const response = await app.handle(get("/admin/users"));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(get("/admin/users", { auth: { roles: ["customer"] } }));
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as admin", async () => {
      const response = await app.handle(get("/admin/users", { auth: { roles: ["admin"] } }));
      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /admin/reviews/:id", () => {
    it("returns 401 when no auth token", async () => {
      const response = await app.handle(del("/admin/reviews/r1"));
      expect(response.status).toBe(401);
    });

    it("returns 200 when authenticated as admin", async () => {
      const response = await app.handle(del("/admin/reviews/r1", { auth: { roles: ["admin"] } }));
      expect(response.status).toBe(200);
    });
  });
});
