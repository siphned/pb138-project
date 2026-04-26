import { Elysia } from "elysia";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./admin.service", () => ({
  adminService: {
    approveEvent: vi.fn(),
    deleteReview: vi.fn(),
    listAllReviews: vi.fn(),
    listEvents: vi.fn(),
    listUsers: vi.fn(),
    rejectEvent: vi.fn(),
    setUserStatus: vi.fn(),
  },
}));

vi.mock("../auth", () => ({
  authPlugin: new Elysia({ name: "auth" }).derive(() => ({
    clerkPayload: { roles: ["admin"], sub: "test-admin" },
    dbUser: {
      email: "admin@test.com",
      fname: "Admin",
      id: "test-id",
      lname: "User",
      role: "admin",
      status: "active",
    },
  })),
}));

import { adminRoutes } from "./admin.routes";
import { adminService } from "./admin.service";

describe("admin.routes integration", () => {
  const getApp = () => new Elysia().use(adminRoutes);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /admin/users returns 200", async () => {
    vi.mocked(adminService.listUsers).mockResolvedValue({
      data: [],
      total: 0,
    });
    const app = getApp();
    const res = await app.handle(new Request("http://localhost/admin/users"));
    expect(res.status).toBe(200);
  });

  it("DELETE /admin/reviews/:id returns 200", async () => {
    vi.mocked(adminService.deleteReview).mockResolvedValue(undefined);
    const app = getApp();
    const res = await app.handle(
      new Request("http://localhost/admin/reviews/r1", {
        method: "DELETE",
      })
    );
    expect([200, 204]).toContain(res.status);
  });
});
