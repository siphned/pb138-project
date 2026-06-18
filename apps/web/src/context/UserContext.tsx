import { useAuth, useClerk } from "@clerk/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { AccountBlockedScreen } from "@/components/AccountBlockedScreen";
import { getCartsQueryKey } from "@/generated/hooks/useGetCarts";
import { getUsersMeQueryKey, getUsersMeQueryOptions } from "@/generated/hooks/useGetUsersMe";
import { usePostGuestSessions } from "@/generated/hooks/usePostGuestSessions";
import { usePutUsersMe } from "@/generated/hooks/usePutUsersMe";
import { parseApiError } from "@/lib/api-errors";
import { Role } from "@/types/roles";

export interface UserProfile {
  id: string;
  fname: string;
  lname: string;
  email: string;
  clerkId: string;
  roles: Role[];
}

// Backend sends lowercase/snake-case role strings (`customer`/`winemaker`/
// `shop_owner`/`admin`); the FE Role enum uses Title-Case display values.
// Map between them at the boundary; unknown roles (e.g. `admin`) are dropped.
const API_TO_ROLE: Record<string, Role> = {
  admin: Role.admin,
  customer: Role.customer,
  shop_owner: Role.shopOwner,
  winemaker: Role.winemaker,
};

const toRoles = (apiRoles: readonly string[] | null | undefined): Role[] =>
  (apiRoles ?? []).map((r) => API_TO_ROLE[r]).filter((r): r is Role => Boolean(r));

interface UserContextType {
  user: UserProfile | null;
  updateUser: (newData: Partial<Pick<UserProfile, "fname" | "lname">>) => Promise<UserProfile>;
  isLoading: boolean;
  // True once we can fetch the cart without a 400: Clerk has loaded (so the axios
  // interceptor can attach the token for signed-in users) or a guest session exists.
  isCartReady: boolean;
  activeRole: Role;
  setActiveRole: (role: Role) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useClerk();
  const {
    data: profile,
    isLoading: isQueryLoading,
    error: profileError,
  } = useQuery({
    ...getUsersMeQueryOptions(),
    enabled: isLoaded && isSignedIn,
  });
  const queryClient = useQueryClient();

  // The auth plugin returns 403 on /users/me for suspended/banned accounts.
  // Clerk still considers them signed in, so block the app explicitly.
  const isBlocked = isSignedIn === true && parseApiError(profileError)?.status === 403;
  const [guestSessionReady, setGuestSessionReady] = useState(false);
  const updateMutation = usePutUsersMe({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getUsersMeQueryKey() });
      },
    },
  });

  const { mutate: ensureGuestSession } = usePostGuestSessions({
    mutation: {
      onSuccess: () => {
        setGuestSessionReady(true);
        queryClient.invalidateQueries({ queryKey: getCartsQueryKey() });
      },
    },
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      ensureGuestSession();
    }
  }, [isLoaded, isSignedIn, ensureGuestSession]);

  // Derive user synchronously from profile so there is no render cycle where
  // the profile query has resolved but user is still null — that gap caused
  // the admin guard to see empty roles and redirect prematurely.
  const user = useMemo<UserProfile | null>(() => {
    if (!profile) return null;
    return {
      clerkId: profile.clerkId,
      email: profile.email,
      fname: profile.fname,
      id: profile.id,
      lname: profile.lname,
      roles: toRoles(profile.roles),
    };
  }, [profile]);

  const [activeRole, setActiveRole] = useState<Role>(Role.customer);
  useEffect(() => {
    if (user && user.roles.length > 0 && !user.roles.includes(activeRole)) {
      setActiveRole(user.roles[0] as Role);
    }
  }, [user, activeRole]);

  const updateUser = async (
    newData: Partial<Pick<UserProfile, "fname" | "lname">>
  ): Promise<UserProfile> => {
    if (!user) throw new Error("No user to update");
    const updated = await updateMutation.mutateAsync({ data: newData });
    return {
      clerkId: updated.clerkId,
      email: updated.email,
      fname: updated.fname,
      id: updated.id,
      lname: updated.lname,
      roles: toRoles(updated.roles),
    };
  };

  const isLoading = !isLoaded || (isSignedIn && isQueryLoading);
  const isCartReady = Boolean(isLoaded && (isSignedIn || guestSessionReady));

  // Hold the app behind a loader while a signed-in user's profile resolves, so a
  // suspended/banned account never flashes the real page before the blocked screen.
  const showAuthGate = isSignedIn === true && isQueryLoading;

  let content: ReactNode = children;
  if (isBlocked) {
    content = <AccountBlockedScreen onSignOut={() => signOut({ redirectUrl: "/" })} />;
  } else if (showAuthGate) {
    content = (
      <div
        aria-label="Loading"
        className="flex min-h-screen items-center justify-center bg-background"
        role="status"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <UserContext.Provider
      value={{ activeRole, isCartReady, isLoading, setActiveRole, updateUser, user }}
    >
      {content}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
