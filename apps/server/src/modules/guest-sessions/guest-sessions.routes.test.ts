import { describe, expect, it, vi } from "vitest";
import { app } from "../../app";

vi.mock("./guest-sessions.service", () => ({
  guestSessionsService: {
    getOrCreateSession: vi.fn().mockResolvedValue({
      id: "test-session-id",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1000000),
    }),
    validateSession: vi.fn().mockResolvedValue({
      id: "test-session-id",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1000000),
    }),
  },
}));

describe("guest-sessions routes", () => {
  it("POST /guest-sessions creates a session and sets cookie", async () => {
    const response = await app.handle(
      new Request("http://localhost/guest-sessions", {
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.id).toBe("test-session-id");
    
    const cookie = response.headers.get("Set-Cookie");
    expect(cookie).toContain("guest_session_id=test-session-id");
  });

  it("GET /guest-sessions/me returns session from cookie", async () => {
    const response = await app.handle(
      new Request("http://localhost/guest-sessions/me", {
        method: "GET",
        headers: {
          cookie: "guest_session_id=test-session-id",
        },
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.id).toBe("test-session-id");
  });

  it("GET /guest-sessions/me returns 404 if no cookie", async () => {
    const response = await app.handle(
      new Request("http://localhost/guest-sessions/me", {
        method: "GET",
      })
    );

    expect(response.status).toBe(404);
  });
});
