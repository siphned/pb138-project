import { useAuth } from "@clerk/react";
import { axiosInstance as kubbAxiosInstance } from "@kubb/plugin-client/clients/axios";
import { useEffect } from "react";
import axiosInstance from "../api/client";

export function AxiosInterceptor({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    const addAuthHeader = async (config: import("axios").InternalAxiosRequestConfig) => {
      const token = await getToken().catch(() => null);
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    };

    const handle401 = (error: unknown) => Promise.reject(error);

    const i1 = axiosInstance.interceptors.request.use(addAuthHeader);
    const i2 = axiosInstance.interceptors.response.use((r) => r, handle401);
    const i3 = kubbAxiosInstance.interceptors.request.use(addAuthHeader);
    const i4 = kubbAxiosInstance.interceptors.response.use((r) => r, handle401);

    return () => {
      axiosInstance.interceptors.request.eject(i1);
      axiosInstance.interceptors.response.eject(i2);
      kubbAxiosInstance.interceptors.request.eject(i3);
      kubbAxiosInstance.interceptors.response.eject(i4);
    };
  }, [getToken]);

  return <>{children}</>;
}
