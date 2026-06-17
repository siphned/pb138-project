import { describe, expect, it } from "vitest";
import { formatDate, formatDatetime } from "../utils/date-formatter";
import { getStockStatus } from "../utils/stock";
import { capitalize, capitalizeFirst, slugify, truncateString } from "../utils/string-utils";
import { validateEmail, validatePassword, validatePhoneNumber } from "../utils/validators";

describe("Utility functions", () => {
  describe("dateFormatter", () => {
    it("formatDate should return a string", () => {
      const date = new Date("2026-04-26");
      expect(typeof formatDate(date)).toBe("string");
    });

    it("formatDatetime should return a string", () => {
      const date = new Date("2026-04-26T12:00:00");
      expect(typeof formatDatetime(date)).toBe("string");
    });
  });

  describe("validators", () => {
    describe("validateEmail", () => {
      it("should return true for valid emails", () => {
        expect(validateEmail("test@example.com")).toBe(true);
        expect(validateEmail("user.name@domain.co.uk")).toBe(true);
      });

      it("should return false for invalid emails", () => {
        expect(validateEmail("test@")).toBe(false);
        expect(validateEmail("test@domain")).toBe(false);
        expect(validateEmail("test")).toBe(false);
      });
    });

    describe("validatePassword", () => {
      it("should return true for strong passwords", () => {
        expect(validatePassword("Password123")).toBe(true);
      });

      it("should return false for weak passwords", () => {
        expect(validatePassword("short")).toBe(false); // too short
        expect(validatePassword("password")).toBe(false); // no uppercase/number
        expect(validatePassword("PASSWORD")).toBe(false); // no lowercase/number
      });
    });

    describe("validatePhoneNumber", () => {
      it("should return true for valid formats", () => {
        expect(validatePhoneNumber("123-456-7890")).toBe(true);
        expect(validatePhoneNumber("+1234567890")).toBe(true);
      });
    });
  });

  describe("stringUtils", () => {
    it("truncateString should truncate correctly", () => {
      expect(truncateString("Hello World", 5)).toBe("Hello...");
      expect(truncateString("Short", 10)).toBe("Short");
    });

    it("capitalizeFirst should capitalize only first char", () => {
      expect(capitalizeFirst("hello world")).toBe("Hello world");
    });

    it("capitalize should capitalize each word", () => {
      expect(capitalize("hello world")).toBe("Hello World");
    });

    it("slugify should create URL-friendly strings", () => {
      expect(slugify("Hello World!")).toBe("hello-world");
      expect(slugify("  Lots   of Spaces  ")).toBe("lots-of-spaces");
    });
  });

  describe("stock", () => {
    it("should return In Stock for qty > 10", () => {
      const status = getStockStatus(15);
      expect(status.label).toBe("In Stock");
      expect(status.classes).toContain("green");
    });

    it("should return Low Stock for qty between 1 and 10", () => {
      const status = getStockStatus(5);
      expect(status.label).toBe("Low Stock");
      expect(status.classes).toContain("orange");
    });

    it("should return Out of Stock for qty <= 0", () => {
      const status = getStockStatus(0);
      expect(status.label).toBe("Out of Stock");
      expect(status.classes).toContain("red");
    });
  });
});
