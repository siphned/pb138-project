import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuth } from "../../__tests__/helpers/auth";
import { del, get, patch, post } from "../../__tests__/helpers/request";
import { app } from "../../app";

const mockAdminService = {
  approveEvent: vi.fn().mockResolvedValue({ id: "e1", status: "approved" }),
  deleteReview: vi.fn().mockResolvedValue(undefined),
  getUser: vi.fn().mockResolvedValue({ id: "u1", status: "active" }),
  listAllReviews: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  listEvents: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  listUsers: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  rejectEvent: vi.fn().mockResolvedValue({ id: "e1", status: "rejected" }),
  setUserStatus: vi.fn().mockResolvedValue({ id: "u1", status: "suspended" }),
};

vi.mock("./admin.service", () => ({
  adminService: {
    approveEvent: vi.fn().mockResolvedValue({
      createdAt: new Date(),
      endTime: new Date(),
      id: "e1",
      name: "Wine Tasting",
      startTime: new Date(),
      status: "approved",
      winemakerId: "wm1",
    }),
    deleteReview: vi.fn().mockResolvedValue(undefined),
    getUser: vi.fn().mockResolvedValue({
      clerkId: "clerk_1",
      createdAt: new Date(),
      email: "user@example.com",
      id: "u1",
      name: "Test User",
      roles: ["customer"],
      status: "active",
    }),
    listAllReviews: vi.fn().mockResolvedValue({
      data: [
        {
          createdAt: new Date(),
          id: "r1",
          productId: "p1",
          rating: 5,
          text: "Great wine!",
          userId: "u1",
        },
      ],
      total: 1,
    }),
    listEvents: vi.fn().mockResolvedValue({
      data: [
        {
          createdAt: new Date(),
          endTime: new Date(),
          id: "e1",
          name: "Wine Tasting",
          startTime: new Date(),
          status: "pending",
          winemakerId: "wm1",
        },
      ],
      total: 1,
    }),
    listUsers: vi.fn().mockResolvedValue({
      data: [
        {
          clerkId: "clerk_1",
          createdAt: new Date(),
          email: "user@example.com",
          id: "u1",
          name: "Test User",
          roles: ["customer"],
          status: "active",
        },
      ],
      total: 1,
    }),
    rejectEvent: vi.fn().mockResolvedValue({
      createdAt: new Date(),
      endTime: new Date(),
      id: "e1",
      name: "Wine Tasting",
      startTime: new Date(),
      status: "rejected",
      winemakerId: "wm1",
    }),
    setUserStatus: vi.fn().mockResolvedValue({
      clerkId: "clerk_1",
      createdAt: new Date(),
      email: "user@example.com",
      id: "u1",
      name: "Test User",
      roles: ["customer"],
      status: "suspended",
    }),
  },
  adminService: mockAdminService,
const { mockAdminService } = vi.hoisted(() => {
  const mocks = {
    approveEvent: vi.fn().mockResolvedValue({ id: "e1", status: "approved" }),
    deleteReview: vi.fn().mockResolvedValue(undefined),
    getUser: vi.fn().mockResolvedValue({ id: "u1", status: "active" }),
    listAllReviews: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    listEvents: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    listUsers: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    rejectEvent: vi.fn().mockResolvedValue({ id: "e1", status: "rejected" }),
    setUserStatus: vi.fn().mockResolvedValue({ id: "u1", status: "suspended" }),
  };
  return { mockAdminService: mocks };
});

vi.mock("./admin.service", () => ({
  adminService: mockAdminService,
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
  afterEach(() => {
    resetAuth();
    vi.clearAllMocks();
  });

  describe("GET /admin/events", () => {
    it("returns 401 when no auth token", async () => {
      const response = await app.handle(get("/admin/events"));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(get("/admin/events", { auth: { roles: ["customer"] } }));
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as admin", async () => {
      const response = await app.handle(get("/admin/events", { auth: { roles: ["admin"] } }));
      expect(response.status).toBe(200);
    });

    it("returns 200 when authenticated as admin with status filter", async () => {
    it("returns 200 with status filter", async () => {
      const response = await app.handle(
        get("/admin/events?status=approved", { auth: { roles: ["admin"] } })
      );
      expect(response.status).toBe(200);
    });

    it("returns 200 when authenticated as admin with pagination", async () => {
    it("returns 200 with pagination", async () => {
      const response = await app.handle(
        get("/admin/events?page=1&status=pending", { auth: { roles: ["admin"] } })
      );
      expect(response.status).toBe(200);
    });
  });

  describe("POST /admin/events/:id/approve", () => {
    it("returns 401 when no auth token", async () => {
      const response = await app.handle(post("/admin/events/e1/approve", { body: {} }));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
        post("/admin/events/e1/approve", { auth: { roles: ["customer"] }, body: {} })
      );
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as admin", async () => {
      const response = await app.handle(
        post("/admin/events/e1/approve", { auth: { roles: ["admin"] }, body: {} })
      );
      expect(response.status).toBe(200);
    });

    it("calls adminService.approveEvent with correct ID", async () => {
      await app.handle(
        post("/admin/events/test-event-id/approve", { auth: { roles: ["admin"] }, body: {} })
      );
      expect(mockAdminService.approveEvent).toHaveBeenCalledWith("test-event-id");
    it("calls approveEvent with ID", async () => {
      await app.handle(
        post("/admin/events/test-id/approve", { auth: { roles: ["admin"] }, body: {} })
      );
      expect(mockAdminService.approveEvent).toHaveBeenCalledWith("test-id");
    });
  });

  describe("POST /admin/events/:id/reject", () => {
    it("returns 401 when no auth token", async () => {
      const response = await app.handle(post("/admin/events/e1/reject", { body: {} }));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
        post("/admin/events/e1/reject", { auth: { roles: ["customer"] }, body: {} })
      );
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as admin", async () => {
      const response = await app.handle(
        post("/admin/events/e1/reject", { auth: { roles: ["admin"] }, body: {} })
      );
      expect(response.status).toBe(200);
    });

    it("calls adminService.rejectEvent with correct ID", async () => {
      await app.handle(
        post("/admin/events/test-event-id/reject", { auth: { roles: ["admin"] }, body: {} })
      );
      expect(mockAdminService.rejectEvent).toHaveBeenCalledWith("test-event-id");
    });
  });

  describe("GET /admin/events", () => {
    it("returns 401 when no auth token", async () => {
      const response = await app.handle(get("/admin/events"));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(get("/admin/events", { auth: { roles: ["customer"] } }));
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as admin", async () => {
      const response = await app.handle(get("/admin/events", { auth: { roles: ["admin"] } }));
      expect(response.status).toBe(200);
    });

    it("supports status query parameter", async () => {
      const response = await app.handle(
        get("/admin/events?status=pending", { auth: { roles: ["admin"] } })
      );
      expect(response.status).toBe(200);
    });

    it("supports pagination via page query parameter", async () => {
      const response = await app.handle(
        get("/admin/events?page=2", { auth: { roles: ["admin"] } })
      );
      expect(response.status).toBe(200);
    });
  });

  describe("POST /admin/events/:id/approve", () => {
    it("returns 401 when no auth token", async () => {
      const response = await app.handle(post("/admin/events/e1/approve"));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
        post("/admin/events/e1/approve", { auth: { roles: ["customer"] } })
      );
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as admin", async () => {
      const response = await app.handle(
        post("/admin/events/e1/approve", { auth: { roles: ["admin"] } })
      );
      expect(response.status).toBe(200);
    });
  });

  describe("POST /admin/events/:id/reject", () => {
    it("returns 401 when no auth token", async () => {
      const response = await app.handle(post("/admin/events/e1/reject"));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
        post("/admin/events/e1/reject", { auth: { roles: ["customer"] } })
      );
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as admin", async () => {
      const response = await app.handle(
        post("/admin/events/e1/reject", { auth: { roles: ["admin"] } })
      );
      expect(response.status).toBe(200);
    it("calls rejectEvent with ID", async () => {
      await app.handle(
        post("/admin/events/test-id/reject", { auth: { roles: ["admin"] }, body: {} })
      );
      expect(mockAdminService.rejectEvent).toHaveBeenCalledWith("test-id");
    });
  });

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

    it("supports role filter query parameter", async () => {
    it("returns 200 with role filter", async () => {
    it("returns 200 with role filter", async () => {
      const response = await app.handle(
        get("/admin/users?role=winemaker", { auth: { roles: ["admin"] } })
      );
      expect(response.status).toBe(200);
    });

    it("supports status filter query parameter", async () => {
      const response = await app.handle(
        get("/admin/users?status=suspended", { auth: { roles: ["admin"] } })
    it("returns 200 with status filter", async () => {
      const response = await app.handle(
        get("/admin/users?status=active", { auth: { roles: ["admin"] } })
    it("returns 200 with status filter", async () => {
      const response = await app.handle(
        get("/admin/users?status=active", { auth: { roles: ["admin"] } })
      );
      expect(response.status).toBe(200);
    });

    it("supports pagination via page query parameter", async () => {
      const response = await app.handle(get("/admin/users?page=2", { auth: { roles: ["admin"] } }));
    it("returns 200 with pagination", async () => {
      const response = await app.handle(
        get("/admin/users?page=1&role=customer&status=suspended", {
          auth: { roles: ["admin"] },
        })
      );
      expect(response.status).toBe(200);
    });
  });

  describe("GET /admin/users/:id", () => {
    it("returns 401 when no auth token", async () => {
      const response = await app.handle(get("/admin/users/u1"));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(get("/admin/users/u1", { auth: { roles: ["customer"] } }));
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as admin", async () => {
      const response = await app.handle(get("/admin/users/u1", { auth: { roles: ["admin"] } }));
      expect(response.status).toBe(200);
    });

    it("returns 404 when user not found", async () => {
      const { adminService } = await import("./admin.service");
      vi.mocked(adminService.getUser).mockRejectedValueOnce(new Error("NOT_FOUND"));

      const response = await app.handle(
        get("/admin/users/nonexistent", { auth: { roles: ["admin"] } })
      );
      expect(response.status).toBe(404);
    });
  });

  describe("PATCH /admin/users/:id/status", () => {
    it("returns 401 when no auth token", async () => {
      const response = await app.handle(
        patch("/admin/users/u1/status", { body: { status: "suspended" } })
      );
      mockAdminService.getUser.mockRejectedValueOnce(new Error("NOT_FOUND"));
      const response = await app.handle(
        get("/admin/users/missing", { auth: { roles: ["admin"] } })
      );
      expect(response.status).toBe(404);
    });

    it("throws error on unexpected exception", async () => {
      mockAdminService.getUser.mockRejectedValueOnce(new Error("DATABASE_ERROR"));
      const response = await app.handle(get("/admin/users/u1", { auth: { roles: ["admin"] } }));
      expect([500, 422]).toContain(response.status);
    });
  });

  describe("PATCH /admin/users/:id/status", () => {
    const validBody = { status: "suspended" };

    it("returns 401 when no auth token", async () => {
      const response = await app.handle(patch("/admin/users/u1/status", { body: validBody }));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
        patch("/admin/users/u1/status", {
          auth: { roles: ["customer"] },
          body: { status: "suspended" },
        })
        patch("/admin/users/u1/status", { auth: { roles: ["customer"] }, body: validBody })
        patch("/admin/users/u1/status", { auth: { roles: ["customer"] }, body: validBody })
      );
      expect(response.status).toBe(403);
    });

    it("returns 200 and updates user status when authenticated as admin", async () => {
    it("returns 200 when authenticated as admin with active status", async () => {
    it("returns 200 active status", async () => {
      const response = await app.handle(
        patch("/admin/users/u1/status", {
          auth: { roles: ["admin"] },
          body: { status: "active" },
        })
      );
      expect(response.status).toBe(200);
    });

    it("returns 200 when authenticated as admin with suspended status", async () => {
    it("returns 200 suspended status", async () => {
      const response = await app.handle(
        patch("/admin/users/u1/status", {
          auth: { roles: ["admin"] },
          body: { status: "suspended" },
        })
      );
      expect(response.status).toBe(200);
    });

    it("accepts 'active', 'suspended', and 'banned' status values", async () => {
      for (const status of ["active", "suspended", "banned"]) {
        const response = await app.handle(
          patch("/admin/users/u1/status", {
            auth: { roles: ["admin"] },
            body: { status },
          })
        );
        expect(response.status).toBe(200);
      }
    it("returns 200 when authenticated as admin with banned status", async () => {
    it("returns 200 banned status", async () => {
      const response = await app.handle(
        patch("/admin/users/u1/status", { auth: { roles: ["admin"] }, body: { status: "banned" } })
      );
      expect(response.status).toBe(200);
    });

    it("calls setUserStatus with correct parameters", async () => {
      await app.handle(
        patch("/admin/users/user-123/status", {
    it("calls setUserStatus with ID and status", async () => {
      await app.handle(
        patch("/admin/users/u123/status", {
          auth: { roles: ["admin"] },
          body: { status: "suspended" },
        })
      );
      expect(mockAdminService.setUserStatus).toHaveBeenCalledWith("user-123", "suspended");
      expect(mockAdminService.setUserStatus).toHaveBeenCalledWith("u123", "suspended");
    });
  });

  describe("GET /admin/reviews", () => {
    it("returns 401 when no auth token", async () => {
      const response = await app.handle(get("/admin/reviews"));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(get("/admin/reviews", { auth: { roles: ["customer"] } }));
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as admin", async () => {
      const response = await app.handle(get("/admin/reviews", { auth: { roles: ["admin"] } }));
      expect(response.status).toBe(200);
    });

    it("supports pagination via page query parameter", async () => {
    it("returns 200 with pagination", async () => {
    it("returns 200 with pagination", async () => {
      const response = await app.handle(
        get("/admin/reviews?page=2", { auth: { roles: ["admin"] } })
      );
      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /admin/reviews/:id", () => {
    it("returns 401 when no auth token", async () => {
      const response = await app.handle(del("/admin/reviews/r1"));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
        del("/admin/reviews/r1", { auth: { roles: ["customer"] } })
      );
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as admin", async () => {
      const response = await app.handle(del("/admin/reviews/r1", { auth: { roles: ["admin"] } }));
      expect(response.status).toBe(200);
    });

    it("returns success: true in response body", async () => {
      const response = await app.handle(del("/admin/reviews/r1", { auth: { roles: ["admin"] } }));
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ success: true });
    it("calls deleteReview with correct ID", async () => {
      await app.handle(del("/admin/reviews/review-123", { auth: { roles: ["admin"] } }));
      expect(mockAdminService.deleteReview).toHaveBeenCalledWith("review-123");
    });

    it("returns success response with correct structure", async () => {
      const response = await app.handle(del("/admin/reviews/r1", { auth: { roles: ["admin"] } }));
      expect(response.status).toBe(200);
    it("calls deleteReview with ID", async () => {
      await app.handle(del("/admin/reviews/r123", { auth: { roles: ["admin"] } }));
      expect(mockAdminService.deleteReview).toHaveBeenCalledWith("r123");
    });

    it("returns 200 with success", async () => {
      const response = await app.handle(del("/admin/reviews/r1", { auth: { roles: ["admin"] } }));
      expect(response.status).toBe(200);
    });
  });
});
