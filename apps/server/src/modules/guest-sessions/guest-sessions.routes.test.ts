import { Elysia } from "elysia";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Repo
vi.mock("./guest-sessions.repository", () => ({
  findById: vi.fn(),
}));

// Mock Service
vi.mock("./guest-sessions.service", () => ({
  guestSessionsService: {
    getOrCreateSession: vi.fn(),
    validateSession: vi.fn(),
  },
}));

// Mock Auth
vi.mock("../auth", () => ({
  authPlugin: new (require("elysia").Elysia)({ name: "auth" }),
}));

import * as guestSessionsRepo from "./guest-sessions.repository";
import { guestSessionsRoutes } from "./guest-sessions.routes";
import { guestSessionsService } from "./guest-sessions.service";

describe("guest-sessions routes", () => {
  const app = new Elysia().use(guestSessionsRoutes);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /guest-sessions creates a session", async () => {
    const mockSession = { createdAt: new Date(), expiresAt: new Date(), id: "test-id" };
    vi.mocked(guestSessionsService.getOrCreateSession).mockResolvedValue(mockSession as any);

    const response = await app.handle(
      new Request("http://localhost/guest-sessions", { method: "POST" })
    );

    expect(response.status).toBe(201);
  });

  it("GET /guest-sessions/:id returns session", async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const mockSession = { createdAt: new Date(), expiresAt: futureDate, id: "test-id" };

    vi.mocked(guestSessionsRepo.findById).mockResolvedValue(mockSession as any);

    const response = await app.handle(new Request("http://localhost/guest-sessions/test-id"));

    expect(response.status).toBe(200);
  });
});
