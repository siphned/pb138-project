import type { ReactNode } from "react";
import { useIsOwner } from "@/hooks/useIsOwner";

interface ShowOwnerProps {
  ownerUserId: string | null | undefined;
  fallback?: ReactNode;
  children: ReactNode;
}

export function ShowOwner({ ownerUserId, fallback = null, children }: ShowOwnerProps) {
  const isOwner = useIsOwner({ ownerUserId });
  return <>{isOwner ? children : fallback}</>;
}
