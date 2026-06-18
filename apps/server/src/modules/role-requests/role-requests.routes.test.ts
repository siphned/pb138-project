import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuth } from "../../__tests__/helpers/auth";
import { get, patch, post } from "../../__tests__/helpers/request";
import { app } from "../../app";

const { defaultRequest } = vi.hoisted(() => ({
  defaultRequest: {
    businessName: "Test Business",
    details: null,
    id: "rr1",
    status: "pending" as const,
    submittedAt: new Date("2025-01-01"),
    type: "winemaker" as const,
    userId: "u1",
  },
}));

vi.mock("./role-requests.service", () => ({
  roleRequestsService: {
    approve: vi.fn().mockResolvedValue({ ...defaultRequest, status: "approved" }),
    getById: vi.fn().mockResolvedValue(defaultRequest),
    lazyGetOrCreate: vi.fn().mockResolvedValue({ id: "u1", status: "active" }),
    listPending: vi.fn().mockResolvedValue([defaultRequest]),
    reject: vi.fn().mockResolvedValue({ ...defaultRequest, status: "rejected" }),
    submitRequest: vi.fn().mockResolvedValue(defaultRequest),
  },
}));

vi.mock("../users/users.service", () => ({
  usersService: { lazyGetOrCreate: vi.fn().mockResolvedValue({ id: "u1", status: "active" }) },
}));

vi.mock("../auth/auth.utils", () => ({
  verifyClerkToken: vi.fn().mockResolvedValue(null),
}));

vi.mock("../../utils/logger", () => ({
  logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

describe("role-requests routes", () => {
  afterEach(() => resetAuth());

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

    it("returns 201 when authenticated", async () => {
      const response = await app.handle(
        post("/role-requests", { auth: { roles: ["customer"] }, body: validBody })
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

    it("returns 200 when authenticated as admin", async () => {
      const response = await app.handle(get("/role-requests", { auth: { roles: ["admin"] } }));
      expect(response.status).toBe(200);
    });
  });

  describe("GET /role-requests/:id", () => {
    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(get("/role-requests/rr1"));
      expect(response.status).toBe(401);
    });

    it("returns 200 when authenticated as admin", async () => {
      const response = await app.handle(get("/role-requests/rr1", { auth: { roles: ["admin"] } }));
      expect(response.status).toBe(200);
    });
  });

  describe("PATCH /role-requests/:id/approve", () => {
    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(patch("/role-requests/rr1/approve"));
      expect(response.status).toBe(401);
    });

    it("returns 200 when admin approves", async () => {
      const response = await app.handle(
        patch("/role-requests/rr1/approve", { auth: { roles: ["admin"] } })
      );
      expect(response.status).toBe(200);
    });
  });

  describe("PATCH /role-requests/:id/reject", () => {
    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(patch("/role-requests/rr1/reject"));
      expect(response.status).toBe(401);
    });

    it("returns 200 when admin rejects", async () => {
      const response = await app.handle(
        patch("/role-requests/rr1/reject", { auth: { roles: ["admin"] } })
      );
      expect(response.status).toBe(200);
    });
  });
});
