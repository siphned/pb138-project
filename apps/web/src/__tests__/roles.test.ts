import { describe, expect, it } from "vitest";
import { isCustomerView, Role } from "../types/roles";

describe("isCustomerView", () => {
  it("is true for the customer role (and the guest default)", () => {
    expect(isCustomerView(Role.customer)).toBe(true);
  });

  it("is false for management roles", () => {
    expect(isCustomerView(Role.winemaker)).toBe(false);
    expect(isCustomerView(Role.shopOwner)).toBe(false);
    expect(isCustomerView(Role.admin)).toBe(false);
  });
});
