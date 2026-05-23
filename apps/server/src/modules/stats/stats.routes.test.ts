import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuth } from "../../__tests__/helpers/auth";
import { get } from "../../__tests__/helpers/request";
import { app } from "../../app";

const { defaultStats } = vi.hoisted(() => ({
  defaultStats: {
    eventsAttended: 0,
    ordersCount: 0,
    reviewsWritten: 0,
    role: "customer" as const,
    totalSpent: 0,
  },
}));

vi.mock("./stats.service", () => ({
  statsService: { getStats: vi.fn().mockResolvedValue(defaultStats) },
}));

vi.mock("../users/users.service", () => ({
  usersService: { lazyGetOrCreate: vi.fn().mockResolvedValue({ id: "u1" }) },
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

describe("stats routes", () => {
  afterEach(() => resetAuth());

  describe("GET /stats", () => {
    it("returns 401 when no auth token (role query required)", async () => {
      const response = await app.handle(get("/stats", { query: { role: "customer" } }));
      expect(response.status).toBe(401);
    });

    it("returns 200 when authenticated as customer requesting customer stats", async () => {
      const response = await app.handle(
        get("/stats", { auth: { roles: ["customer"] }, query: { role: "customer" } })
      );
      expect(response.status).toBe(200);
    });

    it("returns 200 when authenticated as winemaker requesting winemaker stats", async () => {
      const response = await app.handle(
        get("/stats", { auth: { roles: ["winemaker"] }, query: { role: "winemaker" } })
      );
      expect(response.status).toBe(200);
    });

    it("returns 200 when authenticated as admin requesting admin stats", async () => {
      const response = await app.handle(
        get("/stats", { auth: { roles: ["admin"] }, query: { role: "admin" } })
      );
      expect(response.status).toBe(200);
    });
  });
});
