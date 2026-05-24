<<<<<<< HEAD
import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAuth } from "../../__tests__/helpers/auth";
=======
import { describe, expect, it, vi } from "vitest";
>>>>>>> origin/main
import { app } from "../../app";

vi.mock("./guest-sessions.service", () => ({
  guestSessionsService: {
    getOrCreateSession: vi.fn().mockResolvedValue({
      createdAt: new Date(),
<<<<<<< HEAD
      expiresAt: new Date(),
      id: "s1",
    }),
    validateSession: vi.fn().mockResolvedValue({
      createdAt: new Date(),
      expiresAt: new Date(),
      id: "s1",
=======
      expiresAt: new Date(Date.now() + 1000000),
      id: "test-session-id",
    }),
    validateSession: vi.fn().mockResolvedValue({
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1000000),
      id: "test-session-id",
>>>>>>> origin/main
    }),
  },
}));

<<<<<<< HEAD
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
=======
describe("guest-sessions routes", () => {
  it("POST /guest-sessions creates a session and sets cookie", async () => {
    const response = await app.handle(
      new Request("http://localhost/guest-sessions", {
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as unknown as { id: string };
    expect(data.id).toBe("test-session-id");

    const cookie = response.headers.get("Set-Cookie");
    expect(cookie).toContain("guest_session_id=test-session-id");
  });

  it("GET /guest-sessions/me returns session from cookie", async () => {
    const response = await app.handle(
      new Request("http://localhost/guest-sessions/me", {
        headers: {
          cookie: "guest_session_id=test-session-id",
        },
        method: "GET",
      })
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as unknown as { id: string };
    expect(data.id).toBe("test-session-id");
  });

  it("GET /guest-sessions/me returns 404 if no cookie", async () => {
    const response = await app.handle(
      new Request("http://localhost/guest-sessions/me", {
        method: "GET",
      })
    );

>>>>>>> origin/main
    expect(response.status).toBe(404);
  });
});
