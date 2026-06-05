import { useAuth } from "@clerk/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { getCartsQueryKey } from "@/generated/hooks/useGetCarts";
import { getUsersMeQueryKey, getUsersMeQueryOptions } from "@/generated/hooks/useGetUsersMe";
import { usePostGuestSessions } from "@/generated/hooks/usePostGuestSessions";
import { usePutUsersMe } from "@/generated/hooks/usePutUsersMe";
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
  activeRole: Role;
  setActiveRole: (role: Role) => void;
}

const defaultUser: UserProfile | null = null;

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { data: profile, isLoading: isQueryLoading } = useQuery({
    ...getUsersMeQueryOptions(),
    enabled: isLoaded && isSignedIn,
  });
  const queryClient = useQueryClient();
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
        queryClient.invalidateQueries({ queryKey: getCartsQueryKey() });
      },
    },
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      ensureGuestSession();
    }
  }, [isLoaded, isSignedIn, ensureGuestSession]);

  const [user, setUser] = useState<UserProfile | null>(defaultUser);

  useEffect(() => {
    if (profile) {
      setUser({
        clerkId: profile.clerkId,
        email: profile.email,
        fname: profile.fname,
        id: profile.id,
        lname: profile.lname,
        roles: toRoles(profile.roles),
      });
    } else if (isLoaded && !isSignedIn) {
      setUser(null);
    }
  }, [profile, isLoaded, isSignedIn]);

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

  return (
    <UserContext.Provider value={{ activeRole, isLoading, setActiveRole, updateUser, user }}>
      {children}
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
