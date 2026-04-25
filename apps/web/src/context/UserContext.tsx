import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import type { PutUsersMeBodyOne } from "@/generated/model/putUsersMeBodyOne";
import { getGetUsersMeQueryKey, useGetUsersMe, usePutUsersMe } from "@/generated/users/users";

export interface UserProfile {
  id: string;
  fname: string;
  lname: string;
  email: string;
}

interface UserContextType {
  user: UserProfile;
  updateUser: (newData: Partial<UserProfile>) => Promise<void>;
  isLoading: boolean;
}

const defaultUser: UserProfile = {
  id: "",
  fname: "",
  lname: "",
  email: "",
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();
  const { data: profile, isLoading } = useGetUsersMe({ query: { enabled: isSignedIn } });
  const queryClient = useQueryClient();
  const updateMutation = usePutUsersMe({
    mutation: {
      onSuccess: async (): Promise<void> => {
        await queryClient.invalidateQueries({ queryKey: getGetUsersMeQueryKey() });
      },
    },
  });

  const [user, setUser] = useState<UserProfile>(defaultUser);
  useEffect(() => {
    if (profile) {
      setUser({
        id: profile.id,
        fname: profile.fname,
        lname: profile.lname,
        email: profile.email,
      });
    }
  }, [profile]);

  const updateUser = async (newData: Partial<UserProfile>): Promise<void> => {
    const mutationData: PutUsersMeBodyOne = {};
    if (newData.fname !== undefined) {
      mutationData.fname = newData.fname;
    }
    if (newData.lname !== undefined) {
      mutationData.lname = newData.lname;
    }
    await updateMutation.mutateAsync({ data: mutationData });
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
