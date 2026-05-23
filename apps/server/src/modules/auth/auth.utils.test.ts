import { beforeEach, describe, expect, it, vi } from "vitest";
import { verifyClerkToken } from "./auth.utils";

vi.mock("@clerk/backend", () => ({
  verifyToken: vi.fn(),
}));

vi.mock("../../utils/logger", () => ({
  logger: { error: vi.fn() },
}));

import { verifyToken } from "@clerk/backend";
import { logger } from "../../utils/logger";

describe("verifyClerkToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_JWT_KEY = "test-jwt-key";
    process.env.FRONTEND_URL = "http://localhost:5173";
  });

  it("returns null for undefined auth header", async () => {
    const result = await verifyClerkToken(undefined);
    expect(result).toBeNull();
    expect(verifyToken).not.toHaveBeenCalled();
  });

  it("returns null for non-Bearer header", async () => {
    const result = await verifyClerkToken("Basic abc123");
    expect(result).toBeNull();
    expect(verifyToken).not.toHaveBeenCalled();
  });

  it("returns null for empty header", async () => {
    const result = await verifyClerkToken("");
    expect(result).toBeNull();
  });

  it("throws when CLERK_JWT_KEY is missing", async () => {
    delete process.env.CLERK_JWT_KEY;
    await expect(verifyClerkToken("Bearer abcdefg")).rejects.toThrow(
      "Missing env var: CLERK_JWT_KEY"
    );
  });

  it("throws when FRONTEND_URL is missing", async () => {
    delete process.env.FRONTEND_URL;
    await expect(verifyClerkToken("Bearer abcdefg")).rejects.toThrow(
      "Missing env var: FRONTEND_URL"
    );
  });

  it("returns payload on successful verification", async () => {
    const mockPayload = { roles: ["customer"], sub: "user-1" };
    vi.mocked(verifyToken).mockResolvedValue(mockPayload as never);

    const result = await verifyClerkToken("Bearer valid-token-xxx");

    expect(result).toEqual(mockPayload);
    expect(verifyToken).toHaveBeenCalledWith("valid-token-xxx", {
      authorizedParties: ["http://localhost:5173"],
      jwtKey: "test-jwt-key",
    });
  });

  it("returns null and logs error when verification fails", async () => {
    const verifyError = new Error("Invalid token");
    vi.mocked(verifyToken).mockRejectedValue(verifyError);

    const result = await verifyClerkToken("Bearer bad-token-xxxxx");

    expect(result).toBeNull();
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        err: verifyError,
        operation: "verifyClerkToken",
        tokenPrefix: "bad-token-xxxxx",
      }),
      "JWT token verification failed"
    );
  });
});
