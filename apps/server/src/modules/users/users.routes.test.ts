import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuth } from "../../__tests__/helpers/auth";
import { get, post, put } from "../../__tests__/helpers/request";
import { app } from "../../app";

const { defaultUser, defaultAddress } = vi.hoisted(() => ({
  defaultAddress: {
    city: "Brno",
    country: "CZ",
    createdAt: new Date("2025-01-01"),
    houseNumber: "1",
    id: "addr-1",
    postalCode: "60200",
    street: "Test Street",
  },
  defaultUser: {
    billingAddressId: null,
    clerkId: "clerk-u1",
    createdAt: new Date("2025-01-01"),
    email: "test@example.com",
    fname: "Test",
    id: "u1",
    lname: "User",
    roles: ["customer"],
    shippingAddressId: null,
  },
}));

vi.mock("./users.service", () => ({
  usersService: {
    getAddresses: vi.fn().mockResolvedValue({ billing: null, shipping: defaultAddress }),
    getUserWithRoles: vi.fn().mockResolvedValue(defaultUser),
    lazyGetOrCreate: vi.fn().mockResolvedValue({ id: "u1" }),
    updateProfileById: vi.fn().mockResolvedValue(undefined),
    upsertAddress: vi.fn().mockResolvedValue(defaultAddress),
  },
}));

vi.mock("../auth/auth.utils", () => ({
  verifyClerkToken: vi.fn().mockResolvedValue(null),
}));

vi.mock("../../utils/logger", () => ({
  logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

describe("users routes", () => {
  afterEach(() => resetAuth());

  describe("GET /users/me", () => {
    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(get("/users/me"));
      expect(response.status).toBe(401);
    });

    it("returns 200 with user profile when authenticated", async () => {
      const response = await app.handle(get("/users/me", { auth: { roles: ["customer"] } }));
      expect(response.status).toBe(200);
      const data = await response.json();
      expect((data as { id: string }).id).toBe("u1");
    });
  });

  describe("PUT /users/me", () => {
    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(put("/users/me", { body: { fname: "Updated" } }));
      expect(response.status).toBe(401);
    });

    it("returns 200 when authenticated", async () => {
      const response = await app.handle(
        put("/users/me", { auth: { roles: ["customer"] }, body: { fname: "Updated" } })
      );
      expect(response.status).toBe(200);
    });

    it("returns 200 when body is empty (all fields optional)", async () => {
      const response = await app.handle(
        put("/users/me", { auth: { roles: ["customer"] }, body: {} })
      );
      expect(response.status).toBe(200);
    });
  });

  describe("GET /users/me/addresses", () => {
    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(get("/users/me/addresses"));
      expect(response.status).toBe(401);
    });

    it("returns 200 with addresses when authenticated", async () => {
      const response = await app.handle(
        get("/users/me/addresses", { auth: { roles: ["customer"] } })
      );
      expect(response.status).toBe(200);
    });
  });

  describe("POST /users/me/addresses", () => {
    const validBody = {
      city: "Brno",
      country: "CZ",
      houseNumber: "1",
      postalCode: "60200",
      street: "Main Street",
      type: "shipping" as const,
    };

    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(post("/users/me/addresses", { body: validBody }));
      expect(response.status).toBe(401);
    });

    it("returns 200 when authenticated", async () => {
      const response = await app.handle(
        post("/users/me/addresses", { auth: { roles: ["customer"] }, body: validBody })
      );
      expect(response.status).toBe(200);
    });

    it("returns 422 when type is invalid", async () => {
      const response = await app.handle(
        post("/users/me/addresses", {
          auth: { roles: ["customer"] },
          body: { ...validBody, type: "invalid" },
        })
      );
      expect(response.status).toBe(422);
    });
  });
});
