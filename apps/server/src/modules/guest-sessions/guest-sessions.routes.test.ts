import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuth } from "../../__tests__/helpers/auth";
import { get } from "../../__tests__/helpers/request";
import { app } from "../../app";

vi.mock("./guest-sessions.service", () => ({
  guestSessionsService: {
    getOrCreateSession: vi.fn().mockResolvedValue({
      createdAt: new Date(),
      expiresAt: new Date(),
      id: "s1",
    }),
    validateSession: vi.fn().mockResolvedValue({
      createdAt: new Date(),
      expiresAt: new Date(),
      id: "s1",
    }),
  },
}));

vi.mock("../auth/auth.utils", () => ({
  verifyClerkToken: vi.fn().mockResolvedValue(null),
}));

vi.mock("../../utils/logger", () => ({
  logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

describe("guest-sessions routes", () => {
  afterEach(() => resetAuth());

  it("POST /guest-sessions returns 201 with session", async () => {
    const response = await app.handle(
      new Request("http://localhost/guest-sessions", { method: "POST" })
    );
    expect(response.status).toBe(201);
  });

  it("GET /guest-sessions/:id returns 200 with valid session", async () => {
    const response = await app.handle(new Request("http://localhost/guest-sessions/s1"));
    expect(response.status).toBe(200);
  });

  it("GET /guest-sessions/:id returns 404 when session not found", async () => {
    const { guestSessionsService } = await import("./guest-sessions.service");
    vi.mocked(guestSessionsService.validateSession).mockResolvedValueOnce(null as never);

    const response = await app.handle(new Request("http://localhost/guest-sessions/s1"));
    expect(response.status).toBe(404);
  });
});
