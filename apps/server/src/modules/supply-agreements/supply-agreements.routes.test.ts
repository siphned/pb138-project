import { describe, expect, it, vi } from "vitest";
import { app } from "../../app";

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
        headers: {
          Authorization: "Bearer token",
          "Content-Type": "application/json",
        },
        method: "POST",
      })
    );

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
  });
});
