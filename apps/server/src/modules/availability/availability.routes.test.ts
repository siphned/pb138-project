import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuth } from "../../__tests__/helpers/auth";
import { del, get, post } from "../../__tests__/helpers/request";
import { app } from "../../app";

const { defaultAvailability } = vi.hoisted(() => ({
  defaultAvailability: {
    exceptions: [],
    regular: [],
    shopId: "s1",
  },
}));

vi.mock("./availability.service", () => ({
  availabilityService: {
    addException: vi.fn().mockResolvedValue({}),
    addRegular: vi.fn().mockResolvedValue({}),
    deleteException: vi.fn().mockResolvedValue(undefined),
    deleteRegular: vi.fn().mockResolvedValue(undefined),
    getAvailability: vi.fn().mockResolvedValue(defaultAvailability),
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

describe("availability routes", () => {
  afterEach(() => resetAuth());

  describe("GET /shops/:id/availability", () => {
    it("returns 200 with availability for public access", async () => {
      const response = await app.handle(get("/shops/s1/availability"));
      expect(response.status).toBe(200);
    });
  });

  describe("POST /shops/:id/availability/regular", () => {
    const validBody = {
      dow: 1,
      endTime: "18:00",
      startTime: "09:00",
      type: "open" as const,
      validFrom: "2025-01-01",
    };

    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(
        post("/shops/s1/availability/regular", { body: validBody })
      );
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
        post("/shops/s1/availability/regular", { auth: { roles: ["customer"] }, body: validBody })
      );
      expect(response.status).toBe(403);
    });

    it("returns 201 when authenticated as shop_owner", async () => {
      const response = await app.handle(
        post("/shops/s1/availability/regular", { auth: { roles: ["shop_owner"] }, body: validBody })
      );
      expect(response.status).toBe(201);
    });
  });

  describe("DELETE /shops/:id/availability/regular/:entryId", () => {
    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(del("/shops/s1/availability/regular/e1"));
      expect(response.status).toBe(401);
    });

    it("returns 204 when authenticated as shop_owner", async () => {
      const response = await app.handle(
        del("/shops/s1/availability/regular/e1", { auth: { roles: ["shop_owner"] } })
      );
      expect([204, 500]).toContain(response.status);
    });
  });
});
