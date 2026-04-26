import { Elysia } from "elysia";
import { beforeEach, describe, expect, it, vi } from "vitest";

// 1. Mock the service
vi.mock("./admin.service", () => ({
  adminService: {
    listUsers: vi.fn(),
    setUserStatus: vi.fn(),
    listEvents: vi.fn(),
    approveEvent: vi.fn(),
    rejectEvent: vi.fn(),
    listAllReviews: vi.fn(),
    deleteReview: vi.fn(),
  },
}));

// 2. Mock auth plugin to be a simple plugin that provides the required context and macros
// In Elysia, macros are executed during route registration.
// To mock them, we need to ensure the macro is available when the plugin is .use()'d
vi.mock("../auth", () => {
  const plugin = new Elysia({ name: "auth-mock" })
    .derive(() => ({
      clerkPayload: { sub: "test-admin", roles: ["admin"] },
      dbUser: { id: "test-id" },
    }))
    .macro(
      () =>
        ({
          requireRoles: () => ({}),
          requireAuth: () => ({}),
        }) as any
    );

  return { authPlugin: plugin };
});

import { adminRoutes } from "./admin.routes";
import { adminService } from "./admin.service";

describe("admin.routes integration", () => {
  // Use a local app to ensure clean state
  const getApp = () => new Elysia().use(adminRoutes);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /admin/users returns 200", async () => {
    vi.mocked(adminService.listUsers).mockResolvedValue({ data: [], total: 0 });
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

    if (res.status === 500) {
      console.log(await res.text());
    }

    expect(res.status).toBe(200);
  });
});
