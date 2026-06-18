import { vi } from "vitest";
import { verifyClerkToken } from "../../modules/auth/auth.utils";
import { usersService } from "../../modules/users/users.service";

type AppRole = "customer" | "winemaker" | "shop_owner" | "admin";

export function mockClerkUser(roles: AppRole[] = ["customer"], sub = "test-user-1") {
  vi.mocked(verifyClerkToken).mockResolvedValue({ roles, sub } as never);
  vi.mocked(usersService.lazyGetOrCreate).mockResolvedValue({ id: sub, status: "active" } as never);
}

export function mockUnauthenticated() {
  vi.mocked(verifyClerkToken).mockResolvedValue(null);
}

export function resetAuth() {
  vi.mocked(verifyClerkToken).mockResolvedValue(null);
}
