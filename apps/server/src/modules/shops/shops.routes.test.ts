import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuth } from "../../__tests__/helpers/auth";
import { del, get, patch, post } from "../../__tests__/helpers/request";
import { app } from "../../app";

const { defaultShop } = vi.hoisted(() => ({
  defaultShop: {
    address: {
      city: "Brno",
      country: "CZ",
      houseNumber: "1",
      id: "addr-1",
      postalCode: "60200",
      street: "Test Street",
    },
    createdAt: new Date("2025-01-01"),
    description: "A test shop",
    id: "s1",
    name: "Test Shop",
    ownerUserId: "u1",
    updatedAt: null,
  },
}));

vi.mock("./shops.service", () => ({
  shopsService: {
    createShop: vi.fn().mockResolvedValue(defaultShop),
    deleteShop: vi.fn().mockResolvedValue(undefined),
    getShop: vi.fn().mockResolvedValue(defaultShop),
    listMyShops: vi.fn().mockResolvedValue([defaultShop]),
    listShops: vi.fn().mockResolvedValue([defaultShop]),
    updateShop: vi.fn().mockResolvedValue(defaultShop),
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

describe("shops routes", () => {
  afterEach(() => resetAuth());

  describe("GET /shops", () => {
    it("returns 200 with shop list for public access", async () => {
      const response = await app.handle(get("/shops"));
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe("GET /shops/:id", () => {
    it("returns 200 with shop details", async () => {
      const response = await app.handle(get("/shops/s1"));
      expect(response.status).toBe(200);
      const data = await response.json();
      expect((data as { id: string }).id).toBe("s1");
    });
  });

  describe("GET /shops/me", () => {
    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(get("/shops/me"));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(get("/shops/me", { auth: { roles: ["customer"] } }));
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as shop_owner", async () => {
      const response = await app.handle(get("/shops/me", { auth: { roles: ["shop_owner"] } }));
      expect(response.status).toBe(200);
    });
  });

  describe("POST /shops", () => {
    const validBody = {
      address: {
        city: "Brno",
        country: "CZ",
        houseNumber: "1",
        postalCode: "60200",
        street: "Main Street",
      },
      description: "A wine shop",
      name: "New Shop",
    };

    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(post("/shops", { body: validBody }));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
        post("/shops", { auth: { roles: ["customer"] }, body: validBody })
      );
      expect(response.status).toBe(403);
    });

    it("returns 201 when authenticated as shop_owner", async () => {
      const response = await app.handle(
        post("/shops", { auth: { roles: ["shop_owner"] }, body: validBody })
      );
      expect(response.status).toBe(201);
    });

    it("returns 422 when body is missing required field name", async () => {
      const { name, ...invalidBody } = validBody;
      const response = await app.handle(
        post("/shops", { auth: { roles: ["shop_owner"] }, body: invalidBody })
      );
      expect(response.status).toBe(422);
    });
  });

  describe("PATCH /shops/:id", () => {
    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(patch("/shops/s1", { body: { name: "Updated" } }));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
        patch("/shops/s1", { auth: { roles: ["customer"] }, body: { name: "Updated" } })
      );
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as shop_owner", async () => {
      const response = await app.handle(
        patch("/shops/s1", { auth: { roles: ["shop_owner"] }, body: { name: "Updated" } })
      );
      expect(response.status).toBe(200);
    });

    it("returns 200 when authenticated as admin", async () => {
      const response = await app.handle(
        patch("/shops/s1", { auth: { roles: ["admin"] }, body: { name: "Updated" } })
      );
      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /shops/:id", () => {
    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(del("/shops/s1"));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(del("/shops/s1", { auth: { roles: ["customer"] } }));
      expect(response.status).toBe(403);
    });

    it("returns 200 when authenticated as shop_owner", async () => {
      const response = await app.handle(del("/shops/s1", { auth: { roles: ["shop_owner"] } }));
      expect(response.status).toBe(200);
      const data = await response.json();
      expect((data as { success: boolean }).success).toBe(true);
    });
  });
});
