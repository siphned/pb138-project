import { beforeEach, describe, expect, it, vi } from "vitest";
import { Logger } from "./logger";

describe("Logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("error", () => {
    it("logs error message with context", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - intentionally empty
      });

      Logger.error("Test error", new Error("test"), { operation: "test", userId: "123" });

      expect(consoleErrorSpy).toHaveBeenCalled();
      const call = consoleErrorSpy.mock.calls[0][0];
      expect(call).toContain("[ERROR]");
      expect(call).toContain("Test error");
      expect(call).toContain("userId");

      consoleErrorSpy.mockRestore();
    });

    it("logs error with stack trace", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - intentionally empty
      });
      const testError = new Error("test");

      Logger.error("Failed operation", testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Stack trace:", testError.stack);

      consoleErrorSpy.mockRestore();
    });

    it("handles string errors", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - intentionally empty
      });

      Logger.error("Test error", "string error");

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("warn", () => {
    it("logs warning message", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
        // Mock implementation - intentionally empty
      });

      Logger.warn("Test warning");

      expect(consoleWarnSpy).toHaveBeenCalled();
      const call = consoleWarnSpy.mock.calls[0][0];
      expect(call).toContain("[WARN]");
      expect(call).toContain("Test warning");

      consoleWarnSpy.mockRestore();
    });
  });

  describe("info", () => {
    it("logs info message", () => {
      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {
        // Mock implementation - intentionally empty
      });

      Logger.info("Test info", { key: "value" });

      expect(consoleLogSpy).toHaveBeenCalled();
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain("[INFO]");
      expect(call).toContain("Test info");

      consoleLogSpy.mockRestore();
    });
  });

  describe("debug", () => {
    it("logs debug message", () => {
      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {
        // Mock implementation - intentionally empty
      });

      Logger.debug("Test debug");

      expect(consoleLogSpy).toHaveBeenCalled();
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain("[DEBUG]");

      consoleLogSpy.mockRestore();
    });
  });

  describe("context serialization", () => {
    it("includes context in log message", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - intentionally empty
      });

      Logger.error("Error", undefined, {
        operation: "checkout",
        orderId: "order456",
        userId: "user123",
      });

      const call = consoleErrorSpy.mock.calls[0][0];
      expect(call).toContain("userId");
      expect(call).toContain("operation");
      expect(call).toContain("orderId");

      consoleErrorSpy.mockRestore();
    });
  });
});
