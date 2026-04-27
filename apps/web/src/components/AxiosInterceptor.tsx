import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import axiosInstance from "../api/client";

export function AxiosInterceptor({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error fetching Clerk token:", error);
      }
      return config;
    });

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.error("401 Unauthorized detected by AxiosInterceptor");
          console.debug("Request Headers:", error.config?.headers);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [getToken]);

  return <>{children}</>;
}
