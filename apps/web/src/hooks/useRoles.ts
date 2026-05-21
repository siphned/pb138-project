import { useAuth } from "@clerk/react";
import type { AppRole } from "@/types/roles";

export function useRoles(): AppRole[] {
  const { sessionClaims } = useAuth();
  if (!sessionClaims) return [];
  const roles = (
    sessionClaims.public_metadata?.roles ??
    sessionClaims.roles ??
    []
  ) as AppRole[];
  return roles;
}
