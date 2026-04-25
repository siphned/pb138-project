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
  role: "user" | "admin";
}

interface UserContextType {
  user: UserProfile | null;
  updateUser: (newData: Partial<Pick<UserProfile, "fname" | "lname">>) => Promise<UserProfile>;
  isLoading: boolean;
}

const defaultUser: UserProfile | null = null;

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: profile, isLoading } = useQuery(getGetUsersMeQueryOptions());
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
        id: profile.id,
        fname: profile.fname,
        lname: profile.lname,
        email: profile.email,
        clerkId: profile.clerkId,
        role: profile.role as "user" | "admin",
      });
    }
  }, [profile]);

  const updateUser = async (newData: Partial<Pick<UserProfile, "fname" | "lname">>) => {
    if (!user) throw new Error("No user to update");
    return updateMutation.mutateAsync({ data: newData });
  };

  return (
    <UserContext.Provider value={{ user, updateUser, isLoading }}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
