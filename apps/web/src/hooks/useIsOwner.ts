import { useUser } from "@/context/UserContext";

interface UseIsOwnerArgs {
  ownerUserId: string | null | undefined;
}

export function useIsOwner({ ownerUserId }: UseIsOwnerArgs): boolean {
  const { user } = useUser();
  if (!user || !ownerUserId) return false;
  return user.id === ownerUserId;
}
