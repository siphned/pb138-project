import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { useGetProfile } from "@/generated/hooks/useGetProfile";

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
  const { data: profile, isLoading, refetch } = useGetProfile();

  const [user, setUser] = useState<UserProfile>(defaultUser);
  useEffect(() => {
    if (profile) {
      // Ensure no undefined values trigger controlled/uncontrolled warnings
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

    // Kubb generates mutation hooks that take 'client' options (like data) in the hook call
    // or passed via a custom implementation.
    // In this project's configuration, we need to pass the data through the mutation's options.

    try {
      // We manually call the putProfile client to ensure data is passed correctly
      // since the current generated usePutProfile hook from Kubb (v4) might be
      // configured in a way that requires data to be passed to the hook itself.

      // But let's try the idiomatic way with mutateAsync if we can find the right param.
      // Based on usePutProfile.ts, it doesn't take variables in mutationFn.
      // So we use the client directly to be sure.

      const { putProfile } = await import("@/generated/clients/putProfile");
      await putProfile({
        data: updatedProfile,
      });

      await refetch();
    } catch (error) {
      console.error("Mutation failed", error);
      throw error;
    }
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
