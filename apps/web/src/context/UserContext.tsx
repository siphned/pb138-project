import { useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { getProfileQueryKey, useGetProfile } from "@/generated/hooks/useGetProfile";
import { usePutProfile } from "@/generated/hooks/usePutProfile";

export interface UserProfile {
  name: string;
  location: string;
  website: string;
  bio: string;
  avatarUrl?: string;
  email: string;
}

interface UserContextType {
  user: UserProfile;
  updateUser: (newData: Partial<UserProfile>) => Promise<void>;
  isLoading: boolean;
}

const defaultUser: UserProfile = {
  name: "Loading...",
  location: "",
  website: "",
  bio: "",
  email: "",
  avatarUrl: "",
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: profile, isLoading } = useGetProfile();
  const queryClient = useQueryClient();
  const updateMutation = usePutProfile({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getProfileQueryKey() });
      },
    },
  });

  const [user, setUser] = useState<UserProfile>(defaultUser);
  useEffect(() => {
    if (profile) {
      setUser({
        name: profile.name || "",
        location: profile.location || "",
        website: profile.website || "",
        bio: profile.bio || "",
        email: profile.email || "",
        avatarUrl: profile.avatarUrl || "",
      });
    }
  }, [profile]);

  const updateUser = async (newData: Partial<UserProfile>) => {
    const updatedProfile = { ...user, ...newData };
    return updateMutation.mutateAsync({ data: updatedProfile });
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
