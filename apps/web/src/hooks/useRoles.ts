import { useAuth } from "@clerk/react";
import type { AppRole } from "@/types/roles";

export function useRoles(): AppRole[] {
  const { sessionClaims } = useAuth();
  return (sessionClaims?.roles as AppRole[]) ?? [];
}
