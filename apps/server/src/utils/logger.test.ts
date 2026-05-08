import { beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "./logger";

describe("Logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should be defined", () => {
    expect(logger).toBeDefined();
  });

  it("should have expected methods", () => {
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.debug).toBe("function");
  });
});
