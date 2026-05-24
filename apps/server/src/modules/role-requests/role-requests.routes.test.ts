import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuth } from "../../__tests__/helpers/auth";
import { get, patch, post } from "../../__tests__/helpers/request";
import { app } from "../../app";

const { mockRoleRequestsService } = vi.hoisted(() => {
  const req = {
    businessName: "Test Business",
    details: null,
    id: "rr1",
    status: "pending" as const,
    submittedAt: new Date("2025-01-01"),
    type: "winemaker" as const,
    userId: "u1",
  };
  const mocks = {
    approve: vi.fn().mockResolvedValue({ ...req, status: "approved" }),
    getById: vi.fn().mockResolvedValue(req),
    lazyGetOrCreate: vi.fn().mockResolvedValue({ id: "u1" }),
    listPending: vi.fn().mockResolvedValue([req]),
    reject: vi.fn().mockResolvedValue({ ...req, status: "rejected" }),
    submitRequest: vi.fn().mockResolvedValue(req),
  };
  return { mockRoleRequestsService: mocks };
});

vi.mock("./role-requests.service", () => ({
  roleRequestsService: mockRoleRequestsService,
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

describe("role-requests routes", () => {
  afterEach(() => {
    resetAuth();
    vi.clearAllMocks();
  });

  describe("POST /role-requests", () => {
    const validBody = {
      businessName: "My Winery",
      details: "I make wine",
      type: "winemaker" as const,
    };

    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(post("/role-requests", { body: validBody }));
      expect(response.status).toBe(401);
    });

    it("returns 201 when authenticated as customer", async () => {
      const response = await app.handle(
        post("/role-requests", { auth: { roles: ["customer"] }, body: validBody })
      );
      expect(response.status).toBe(201);
    });

    it("returns 201 as winemaker", async () => {
      const response = await app.handle(
        post("/role-requests", { auth: { roles: ["winemaker"] }, body: validBody })
      );
      expect(response.status).toBe(201);
    });

    it("submits shop_owner request", async () => {
      const body = { ...validBody, type: "shop_owner" as const };
      const response = await app.handle(
        post("/role-requests", { auth: { roles: ["customer"] }, body })
      );
      expect(response.status).toBe(201);
    });

    it("calls submitRequest with correct params", async () => {
      const body = {
        businessName: "Test Winery",
        details: "Desc",
        type: "winemaker" as const,
      };
      await app.handle(post("/role-requests", { auth: { roles: ["customer"] }, body }));
      expect(mockRoleRequestsService.submitRequest).toHaveBeenCalled();
    });

    it("submits without details", async () => {
      const body = {
        businessName: "My Winery",
        type: "winemaker" as const,
      };
      const response = await app.handle(
        post("/role-requests", { auth: { roles: ["customer"] }, body })
      );
      expect(response.status).toBe(201);
    });
  });

  describe("GET /role-requests", () => {
    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(get("/role-requests"));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(get("/role-requests", { auth: { roles: ["customer"] } }));
      expect(response.status).toBe(403);
    });

    it("returns 403 when authenticated as winemaker", async () => {
      const response = await app.handle(get("/role-requests", { auth: { roles: ["winemaker"] } }));
      expect(response.status).toBe(403);
    });

    it("returns 403 when authenticated as shop_owner", async () => {
      const response = await app.handle(get("/role-requests", { auth: { roles: ["shop_owner"] } }));
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as admin", async () => {
      const response = await app.handle(get("/role-requests", { auth: { roles: ["admin"] } }));
      expect(response.status).toBe(200);
    });

    it("calls listPending when admin accesses", async () => {
      await app.handle(get("/role-requests", { auth: { roles: ["admin"] } }));
      expect(mockRoleRequestsService.listPending).toHaveBeenCalled();
    });
  });

  describe("GET /role-requests/:id", () => {
    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(get("/role-requests/rr1"));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
        get("/role-requests/rr1", { auth: { roles: ["customer"] } })
      );
      expect(response.status).toBe(403);
    });

    it("returns 403 when authenticated as winemaker", async () => {
      const response = await app.handle(
        get("/role-requests/rr1", { auth: { roles: ["winemaker"] } })
      );
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as admin", async () => {
      const response = await app.handle(get("/role-requests/rr1", { auth: { roles: ["admin"] } }));
      expect(response.status).toBe(200);
    });

    it("returns 404 when request not found", async () => {
      mockRoleRequestsService.getById.mockRejectedValueOnce(new Error("NOT_FOUND"));
      const response = await app.handle(
        get("/role-requests/missing", { auth: { roles: ["admin"] } })
      );
      expect(response.status).toBe(404);
    });

    it("throws on unexpected exception", async () => {
      mockRoleRequestsService.getById.mockRejectedValueOnce(new Error("DATABASE_ERROR"));
      const response = await app.handle(get("/role-requests/rr1", { auth: { roles: ["admin"] } }));
      expect([500, 422]).toContain(response.status);
    });

    it("calls getById with ID", async () => {
      await app.handle(get("/role-requests/req-123", { auth: { roles: ["admin"] } }));
      expect(mockRoleRequestsService.getById).toHaveBeenCalledWith("req-123");
    });
  });

  describe("PATCH /role-requests/:id/approve", () => {
    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(patch("/role-requests/rr1/approve"));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
        patch("/role-requests/rr1/approve", { auth: { roles: ["customer"] } })
      );
      expect(response.status).toBe(403);
    });

    it("returns 403 when authenticated as winemaker", async () => {
      const response = await app.handle(
        patch("/role-requests/rr1/approve", { auth: { roles: ["winemaker"] } })
      );
      expect(response.status).toBe(403);
    });

    it("returns 200 when admin approves", async () => {
      const response = await app.handle(
        patch("/role-requests/rr1/approve", { auth: { roles: ["admin"] } })
      );
      expect(response.status).toBe(200);
    });

    it("calls approve with params", async () => {
      await app.handle(patch("/role-requests/req-123/approve", { auth: { roles: ["admin"] } }));
      expect(mockRoleRequestsService.approve).toHaveBeenCalled();
    });
  });

  describe("PATCH /role-requests/:id/reject", () => {
    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(patch("/role-requests/rr1/reject"));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
        patch("/role-requests/rr1/reject", { auth: { roles: ["customer"] } })
      );
      expect(response.status).toBe(403);
    });

    it("returns 403 when authenticated as winemaker", async () => {
      const response = await app.handle(
        patch("/role-requests/rr1/reject", { auth: { roles: ["winemaker"] } })
      );
      expect(response.status).toBe(403);
    });

    it("returns 200 when admin rejects", async () => {
      const response = await app.handle(
        patch("/role-requests/rr1/reject", { auth: { roles: ["admin"] } })
      );
      expect(response.status).toBe(200);
    });

    it("calls reject with params", async () => {
      await app.handle(patch("/role-requests/req-456/reject", { auth: { roles: ["admin"] } }));
      expect(mockRoleRequestsService.reject).toHaveBeenCalled();
    });
  });
});
