import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuth } from "../../__tests__/helpers/auth";
import { get, patch } from "../../__tests__/helpers/request";
import { app } from "../../app";

const { defaultWinemaker } = vi.hoisted(() => ({
  defaultWinemaker: {
    address: {
      city: "Brno",
      country: "CZ",
      houseNumber: "1",
      id: "addr-wm1",
      postalCode: "60200",
      street: "Wine Street",
    },
    createdAt: new Date("2025-01-01"),
    description: "Test bio",
    email: "winery@test.com",
    events: [],
    id: "wm1",
    name: "Test Winery",
    phone: "+420123456789",
    updatedAt: new Date("2025-01-01"),
    websiteUrl: "https://testwinery.com",
    wineCount: 5,
    wines: [],
  },
}));

vi.mock("./winemakers.service", () => ({
  winemakersService: {
    getMyProfile: vi.fn().mockResolvedValue(defaultWinemaker),
    getWinemaker: vi.fn().mockResolvedValue(defaultWinemaker),
    listWinemakers: vi.fn().mockResolvedValue([defaultWinemaker]),
    updateMyProfile: vi.fn().mockResolvedValue(defaultWinemaker),
    updateWinemakerById: vi.fn().mockResolvedValue(defaultWinemaker),
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

describe("winemakers routes", () => {
  afterEach(() => resetAuth());

  describe("GET /winemakers", () => {
    it("returns 200 with winemaker list for public access", async () => {
      const response = await app.handle(get("/winemakers"));
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe("GET /winemakers/:id", () => {
    it("returns 200 with winemaker profile", async () => {
      const response = await app.handle(get("/winemakers/wm1"));
      expect(response.status).toBe(200);
    });
  });

  describe("GET /winemakers/me", () => {
    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(get("/winemakers/me"));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(get("/winemakers/me", { auth: { roles: ["customer"] } }));
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as winemaker", async () => {
      const response = await app.handle(get("/winemakers/me", { auth: { roles: ["winemaker"] } }));
      expect(response.status).toBe(200);
    });
  });

  describe("PATCH /winemakers/me", () => {
    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(patch("/winemakers/me", { body: { name: "Updated" } }));
      expect(response.status).toBe(401);
    });

    it("returns 200 when authenticated as winemaker", async () => {
      const response = await app.handle(
        patch("/winemakers/me", { auth: { roles: ["winemaker"] }, body: { name: "Updated" } })
      );
      expect(response.status).toBe(200);
    });
  });

  describe("PATCH /winemakers/:id", () => {
    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(patch("/winemakers/wm1", { body: { name: "Updated" } }));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
        patch("/winemakers/wm1", { auth: { roles: ["customer"] }, body: { name: "Updated" } })
      );
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as winemaker", async () => {
      const response = await app.handle(
        patch("/winemakers/wm1", { auth: { roles: ["winemaker"] }, body: { name: "Updated" } })
      );
      expect(response.status).toBe(200);
    });

    it("returns 200 when authenticated as admin", async () => {
      const response = await app.handle(
        patch("/winemakers/wm1", { auth: { roles: ["admin"] }, body: { name: "Updated" } })
      );
      expect(response.status).toBe(200);
    });
  });
});
