import { useAuth } from "@clerk/react";
import type { AppRole } from "@/types/roles";

export function useRoles(): AppRole[] {
  const { sessionClaims } = useAuth();
<<<<<<< HEAD
  if (!sessionClaims) return [];
  const claims = sessionClaims as Record<string, unknown>;
  const metadata = claims.public_metadata as Record<string, unknown> | undefined;
  const roles = (metadata?.roles ?? claims.roles ?? []) as AppRole[];
  return roles;
=======
  return (sessionClaims?.roles as AppRole[]) ?? [];
>>>>>>> origin/main
}
