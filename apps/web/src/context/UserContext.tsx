import { useAuth } from "@clerk/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import {
  getGetUsersMeQueryKey,
  getGetUsersMeQueryOptions,
  usePutUsersMe,
} from "@/generated/users/users";

export interface UserProfile {
  id: string;
  fname: string;
  lname: string;
  email: string;
  clerkId: string;
  roles: string[];
}

interface UserContextType {
  user: UserProfile | null;
  updateUser: (newData: Partial<Pick<UserProfile, "fname" | "lname">>) => Promise<UserProfile>;
  isLoading: boolean;
}

const defaultUser: UserProfile | null = null;

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { data: profile, isLoading: isQueryLoading } = useQuery({
    ...getGetUsersMeQueryOptions(),
    enabled: isLoaded && isSignedIn,
  });
  const queryClient = useQueryClient();
  const updateMutation = usePutUsersMe({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUsersMeQueryKey() });
      },
    },
  });

  const [user, setUser] = useState<UserProfile | null>(defaultUser);
  useEffect(() => {
    if (profile) {
      setUser({
        clerkId: profile.clerkId,
        email: profile.email,
        fname: profile.fname,
        id: profile.id,
        lname: profile.lname,
        roles: profile.roles ?? [],
      });
    } else if (isLoaded && !isSignedIn) {
      setUser(null);
    }
  }, [profile, isLoaded, isSignedIn]);

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
      roles: updated.roles ?? [],
    };
  };

  const isLoading = !isLoaded || (isSignedIn && isQueryLoading);

  return (
    <UserContext.Provider value={{ isLoading, updateUser, user }}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
