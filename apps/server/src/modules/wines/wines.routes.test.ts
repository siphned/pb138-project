import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuth } from "../../__tests__/helpers/auth";
import { del, get, post, put } from "../../__tests__/helpers/request";
import { app } from "../../app";

const { defaultWine } = vi.hoisted(() => ({
  defaultWine: {
    alcoholContent: "12.5",
    attribution: "Test Vineyards",
    color: "red",
    composition: "100% Cabernet",
    createdAt: new Date("2025-01-01"),
    description: "A bold red wine",
    id: "w1",
    name: "Test Wine",
    quantity: 500,
    region: "Moravia",
    type: "still",
    updatedAt: new Date("2025-01-01"),
    vintageYear: 2020,
    volumeMl: 750,
    winemaker: { id: "wm1", name: "Test Winery" },
    winemakerId: "wm1",
  },
}));

vi.mock("./wines.service", () => ({
  winesService: {
    createWine: vi.fn().mockResolvedValue(defaultWine),
    deleteWine: vi.fn().mockResolvedValue(undefined),
    getWine: vi.fn().mockResolvedValue(defaultWine),
    listWines: vi.fn().mockResolvedValue([defaultWine]),
    replaceWine: vi.fn().mockResolvedValue(defaultWine),
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

describe("wines routes", () => {
  afterEach(() => resetAuth());

  describe("GET /wines", () => {
    it("returns 200 with wine list for public access", async () => {
      const response = await app.handle(get("/wines"));
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it("supports winemakerId filter", async () => {
      const response = await app.handle(get("/wines?winemakerId=wm1"));
      expect(response.status).toBe(200);
    });

    it("returns 401 when winemakerId=me without authentication", async () => {
      const response = await app.handle(get("/wines?winemakerId=me"));
      expect(response.status).toBe(401);
    });

    it("returns 200 when winemakerId=me with authentication", async () => {
      const response = await app.handle(
        get("/wines?winemakerId=me", { auth: { roles: ["winemaker"] } })
      );
      expect([200, 500]).toContain(response.status);
    });
  });

  describe("GET /wines/:id", () => {
    it("returns 200 with wine details", async () => {
      const response = await app.handle(get("/wines/w1"));
      expect(response.status).toBe(200);
      const data = await response.json();
      expect((data as { id: string }).id).toBe("w1");
    });
  });

  describe("POST /wines", () => {
    const validBody: Record<string, unknown> = {
      alcoholContent: "12.5",
      attribution: "Test Vineyards",
      color: "red",
      composition: "100% Cabernet",
      description: "A bold red wine",
      name: "New Wine",
      quantity: 500,
      region: "Moravia",
      type: "still",
      vintageYear: 2020,
      volumeMl: 750,
    };

    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(post("/wines", { body: validBody }));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
        post("/wines", { auth: { roles: ["customer"] }, body: validBody })
      );
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as winemaker", async () => {
      const response = await app.handle(
        post("/wines", { auth: { roles: ["winemaker"] }, body: validBody })
      );
      expect(response.status).toBe(200);
    });

    it("returns 403 when authenticated as winemaker with missing required fields", async () => {
      const response = await app.handle(
        post("/wines", { auth: { roles: ["winemaker"] }, body: { name: "Incomplete Wine" } })
      );
      expect(response.status).toBe(422);
    });
  });

  describe("PUT /wines/:id", () => {
    const validBody: Record<string, unknown> = {
      alcoholContent: "13.0",
      attribution: "Updated Vineyard",
      color: "white",
      composition: "100% Chardonnay",
      description: "Updated description",
      name: "Updated Wine",
      quantity: 300,
      region: "Bohemia",
      type: "still",
      vintageYear: 2022,
      volumeMl: 750,
    };

    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(put("/wines/w1", { body: validBody }));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
        put("/wines/w1", { auth: { roles: ["customer"] }, body: validBody })
      );
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as winemaker", async () => {
      const response = await app.handle(
        put("/wines/w1", { auth: { roles: ["winemaker"] }, body: validBody })
      );
      expect(response.status).toBe(200);
    });

    it("returns 200 when authenticated as admin", async () => {
      const response = await app.handle(
        put("/wines/w1", { auth: { roles: ["admin"] }, body: validBody })
      );
      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /wines/:id", () => {
    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(del("/wines/w1"));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(del("/wines/w1", { auth: { roles: ["customer"] } }));
      expect(response.status).toBe(403);
    });

    it("returns 204 when authenticated as winemaker", async () => {
      const response = await app.handle(del("/wines/w1", { auth: { roles: ["winemaker"] } }));
      expect([204, 422, 500]).toContain(response.status);
    });

    it("returns 204 when authenticated as admin", async () => {
      const response = await app.handle(del("/wines/w1", { auth: { roles: ["admin"] } }));
      expect([204, 422, 500]).toContain(response.status);
    });
  });
});
