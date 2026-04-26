import { Elysia } from "elysia";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the service
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

import { createAdminRoutes } from "./admin.routes";
import { adminService } from "./admin.service";

describe("admin.routes integration", () => {
  const mockAuthState = {
    clerkPayload: { roles: ["admin"], sub: "test-admin" },
    dbUser: { id: "admin1", role: "admin" },
  };

  const mockAuth = new Elysia({ name: "auth-mock" })
    .derive(() => mockAuthState)
    .macro(
      () =>
        ({
          requireAuth: () => ({}),
          requireRoles: () => ({}),
        }) as any
    );

  const app = createAdminRoutes(mockAuth as any);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /admin/users returns 200 for admin", async () => {
    vi.mocked(adminService.listUsers).mockResolvedValue({ data: [], total: 0 });
    const res = await app.handle(new Request("http://localhost/admin/users"));
    expect(res.status).toBe(200);
  });

  it("DELETE /admin/reviews/:id returns 200", async () => {
    vi.mocked(adminService.deleteReview).mockResolvedValue(undefined);
    const res = await app.handle(
      new Request("http://localhost/admin/reviews/r1", {
        method: "DELETE",
      })
    );
    expect(res.status).toBe(200);
  });
});
