import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext } from "react";
import { getUsersMeQueryKey, useGetUsersMe } from "@/generated/hooks/useGetUsersMe";
import { usePutUsersMe } from "@/generated/hooks/usePutUsersMe";

export interface UserProfile {
  id: string;
  fname: string;
  lname: string;
  email: string;
  role: "user" | "admin";
}

interface UserContextType {
  user: UserProfile | null;
  updateUser: (newData: Partial<UserProfile>) => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const queryClient = useQueryClient();

  // Only fetch the profile if the user is signed in and Clerk is loaded
  const { data: profile, isLoading: isProfileLoading } = useGetUsersMe({
    query: {
      enabled: !!isSignedIn && isLoaded,
    },
  });

  const updateMutation = usePutUsersMe({
    mutation: {
      onSuccess: (): void => {
        void queryClient.invalidateQueries({ queryKey: getUsersMeQueryKey() });
      },
    },
  });

  const updateUser = async (newData: Partial<UserProfile>): Promise<void> => {
    if (!profile) return;

    await updateMutation.mutateAsync({
      data: {
        fname: newData.fname,
        lname: newData.lname,
      },
    });
  };

  const value = {
    user: profile ?? null,
    updateUser,
    isLoading: !isLoaded || isProfileLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
