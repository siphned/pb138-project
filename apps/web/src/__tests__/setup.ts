import "@testing-library/jest-dom";
import { vi } from "vitest";

const noop = () => undefined;

class NoopObserver {
  observe = noop;
  unobserve = noop;
  disconnect = noop;
  takeRecords = () => [];
}

vi.stubGlobal("IntersectionObserver", NoopObserver);
if (!globalThis.ResizeObserver) {
  vi.stubGlobal("ResizeObserver", NoopObserver);
}
