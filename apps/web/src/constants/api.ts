// API URLs and endpoint configurations
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    register: "/auth/register",
  },
  // Users
  users: {
    create: "/users",
    delete: (id: string) => `/users/${id}`,
    getAll: "/users",
    getOne: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
  },
  // Add more as needed
};
