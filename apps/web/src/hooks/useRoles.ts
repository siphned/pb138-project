import { useUser } from "@/context/UserContext";
import { type AppRole, Role } from "@/types/roles";

// The Role enum stores Title-Case display strings ("Admin", "Shop Owner", …)
// while AppRole is the wire/BE form ("admin", "shop_owner", …). UserContext
// holds the BE-synced roles in the Role enum; callers of useRoles want the
// AppRole form, so map back here.
const ROLE_TO_APP: Record<Role, AppRole> = {
  [Role.admin]: "admin",
  [Role.customer]: "customer",
  [Role.shopOwner]: "shop_owner",
  [Role.winemaker]: "winemaker",
};

/**
 * Returns the signed-in user's roles in the BE/wire form (`"admin"`,
 * `"shop_owner"`, …). Source-of-truth is the UserContext, which fetches
 * GET /users/me — the BE returns roles synced from Clerk publicMetadata.
 *
 * We deliberately do NOT read directly from `useAuth().sessionClaims`:
 * Clerk's default JWT template doesn't include a `roles` claim, so reading
 * from there returns `[]` for legitimate admins / winemakers / shop owners
 * and breaks route guards (e.g. `_authenticated._admin`).
 */
export function useRoles(): AppRole[] {
  const { user } = useUser();
  if (!user) return [];
  return user.roles.map((r) => ROLE_TO_APP[r]).filter((r): r is AppRole => Boolean(r));
}
