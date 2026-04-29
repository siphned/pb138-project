import Axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";

export const axiosInstance = Axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = await window.Clerk?.session?.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Orval uses named export and expects the response data directly.
export const customInstance = <T, R = unknown>(
  config: AxiosRequestConfig<R>,
  options?: AxiosRequestConfig<R>
): Promise<T> => {
  return axiosInstance({
    ...config,
    ...options,
  }).then(({ data }) => data);
};

type KubbErrorType<E> = E;

// Kubb uses the default export and expects an AxiosResponse.
const kubbInstance = <T, E = unknown, R = unknown>(
  config: AxiosRequestConfig<R>,
  options?: AxiosRequestConfig<R>
): Promise<AxiosResponse<T> & { __errorType?: KubbErrorType<E> }> => {
  return axiosInstance({
    ...config,
    ...options,
  });
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;

// Type exports required by Kubb-generated hooks
export type Client = typeof kubbInstance;
export type RequestConfig<T = unknown> = AxiosRequestConfig<T>;
export type ResponseErrorConfig<E> = AxiosError<E>;

// Default export for Kubb client import
export default kubbInstance;

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string | null>;
      };
    };
  }
}
