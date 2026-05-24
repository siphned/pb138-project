import { describe, expect, it } from "vitest";
import { parsePagination } from "./pagination";

describe("parsePagination", () => {
  it("uses default values when query is empty", () => {
    const result = parsePagination({});
<<<<<<< HEAD
    expect(result.limit).toBe(24);
=======
    expect(result.limit).toBe(20);
>>>>>>> origin/main
    expect(result.offset).toBe(0);
  });

  it("calculates offset correctly for page 2", () => {
    const result = parsePagination({ limit: 10, page: 2 });
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(10);
  });

  it("enforces minimum page 1", () => {
    const result = parsePagination({ page: 0 });
    expect(result.offset).toBe(0);
  });

  it("enforces maximum limit 100", () => {
    const result = parsePagination({ limit: 1000 });
    expect(result.limit).toBe(100);
  });
});
