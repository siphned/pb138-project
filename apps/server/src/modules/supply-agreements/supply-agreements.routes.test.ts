<<<<<<< HEAD
import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "../../app";
import { verifyClerkToken } from "../auth/auth.utils";
=======
import { describe, expect, it, vi } from "vitest";
import { app } from "../../app";
>>>>>>> origin/main

vi.mock("./supply-agreements.service", () => ({
  supplyAgreementsService: {
    createRequest: vi.fn().mockResolvedValue({
      createdAt: new Date(),
      id: "a1",
      respondedAt: null,
      shopId: "s1",
      status: "pending",
      winemakerId: "wm1",
    }),
    listForShop: vi.fn().mockResolvedValue([
      {
        createdAt: new Date(),
        id: "a1",
        respondedAt: null,
        shopId: "s1",
        status: "pending",
        winemakerId: "wm1",
      },
    ]),
    listForWinemaker: vi.fn().mockResolvedValue([
      {
        createdAt: new Date(),
        id: "a1",
        respondedAt: null,
        shopId: "s1",
        status: "pending",
        winemakerId: "wm1",
      },
    ]),
    respondToRequest: vi.fn().mockResolvedValue({
      createdAt: new Date(),
      id: "a1",
      respondedAt: new Date(),
      shopId: "s1",
      status: "approved",
      winemakerId: "wm1",
    }),
  },
}));

vi.mock("../auth/auth.utils", () => ({
<<<<<<< HEAD
  verifyClerkToken: vi.fn().mockResolvedValue(null),
}));

vi.mock("../users/users.service", () => ({
  usersService: { lazyGetOrCreate: vi.fn().mockResolvedValue({ id: "db_user_1" }) },
}));

vi.mock("../../utils/logger", () => ({
  logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

function mockAuth(roles: string[]) {
  vi.mocked(verifyClerkToken).mockResolvedValue({ roles, sub: "user_1" } as never);
}

function resetAuth() {
  vi.mocked(verifyClerkToken).mockResolvedValue(null);
}

describe("supply-agreements routes", () => {
  afterEach(() => resetAuth());

  it("POST /supply-agreements returns 401 without auth", async () => {
    const response = await app.handle(
      new Request("http://localhost/supply-agreements", {
        body: JSON.stringify({ shopId: "s1", winemakerId: "wm1" }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      })
    );
    expect(response.status).toBe(401);
  });

  it("POST /supply-agreements returns 200 with shop_owner auth", async () => {
    mockAuth(["shop_owner"]);
    const response = await app.handle(
      new Request("http://localhost/supply-agreements", {
        body: JSON.stringify({ shopId: "s1", winemakerId: "wm1" }),
=======
  verifyClerkToken: vi.fn().mockResolvedValue({
    roles: ["shop_owner", "winemaker"],
    sub: "user_1",
  }),
}));

vi.mock("../users/users.service", () => ({
  usersService: {
    lazyGetOrCreate: vi.fn().mockResolvedValue({ id: "db_user_1" }),
  },
}));

describe("supply-agreements routes", () => {
  it("POST /supply-agreements creates a request", async () => {
    const response = await app.handle(
      new Request("http://localhost/supply-agreements", {
        body: JSON.stringify({
          shopId: "s1",
          winemakerId: "wm1",
        }),
>>>>>>> origin/main
        headers: {
          Authorization: "Bearer token",
          "Content-Type": "application/json",
        },
        method: "POST",
      })
    );
<<<<<<< HEAD
    expect(response.status).toBe(200);
  });

  it("GET /supply-agreements/winemaker returns 401 without auth", async () => {
    const response = await app.handle(
      new Request("http://localhost/supply-agreements/winemaker", { method: "GET" })
    );
    expect(response.status).toBe(401);
  });

  it("GET /supply-agreements/winemaker returns 200 with winemaker auth", async () => {
    mockAuth(["winemaker"]);
    const response = await app.handle(
      new Request("http://localhost/supply-agreements/winemaker", {
        headers: { Authorization: "Bearer token" },
        method: "GET",
      })
    );
    expect(response.status).toBe(200);
  });

  it("GET /supply-agreements/shop/:shopId returns 200 with shop_owner auth", async () => {
    mockAuth(["shop_owner"]);
    const response = await app.handle(
      new Request("http://localhost/supply-agreements/shop/s1", {
        headers: { Authorization: "Bearer token" },
        method: "GET",
      })
    );
    expect(response.status).toBe(200);
=======

    expect(response.status).toBe(200);
    const data = (await response.json()) as unknown as { id: string };
    expect(data.id).toBe("a1");
  });

  it("GET /supply-agreements/winemaker lists agreements", async () => {
    const response = await app.handle(
      new Request("http://localhost/supply-agreements/winemaker", {
        headers: {
          Authorization: "Bearer token",
        },
        method: "GET",
      })
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as unknown as { id: string };
    expect(Array.isArray(data)).toBe(true);
>>>>>>> origin/main
  });
});
