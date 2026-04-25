import { useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { getUsersMeQueryKey, useGetUsersMe } from "@/generated/hooks/useGetUsersMe";
import { usePutUsersMe } from "@/generated/hooks/usePutUsersMe";
import type { PutUsersMeMutationRequest } from "@/generated/types";

export interface UserProfile {
  id: string;
  fname: string;
  lname: string;
  email: string;
  role: "user" | "admin";
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
  role: "user",
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: profile, isLoading } = useGetUsersMe();
  const queryClient = useQueryClient();
  const updateMutation = usePutUsersMe({
    mutation: {
      onSuccess: (): void => {
        void queryClient.invalidateQueries({ queryKey: getUsersMeQueryKey() });
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
        role: profile.role,
      });
    }
  }, [profile]);

  const updateUser = async (newData: Partial<UserProfile>): Promise<void> => {
    const mutationData: PutUsersMeMutationRequest = {};
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
