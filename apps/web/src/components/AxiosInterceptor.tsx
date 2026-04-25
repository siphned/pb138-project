import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import axios from "axios";

// Configure global axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function AxiosInterceptor({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    const injectToken = async () => {
      if (!isLoaded) return;

      if (isSignedIn) {
        try {
          const token = await getToken();
          axios.defaults.headers.common.Authorization = token ? `Bearer ${token}` : "";
        } catch (error) {
          console.error("Error fetching Clerk token:", error);
          axios.defaults.headers.common.Authorization = "";
        }
      } else {
        axios.defaults.headers.common.Authorization = "";
      }
    };

    injectToken();
  }, [getToken, isSignedIn, isLoaded]);

  return <>{children}</>;
}
