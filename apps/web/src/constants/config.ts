// Application configuration
export const APP_CONFIG = {
  appName: import.meta.env.VITE_APP_NAME || "My App",
  appVersion: "1.0.0",
  debug: import.meta.env.VITE_DEBUG === "true",
};

export const PAGINATION = {
  defaultPageSize: 10,
  maxPageSize: 100,
};

export const TIMEOUT = {
  apiCall: 30000, // 30 seconds
  debounce: 300, // 300ms
};
