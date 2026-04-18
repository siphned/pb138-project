// Application configuration
export const APP_CONFIG = {
  APP_NAME: import.meta.env.VITE_APP_NAME || 'My App',
  APP_VERSION: '1.0.0',
  DEBUG: import.meta.env.VITE_DEBUG === 'true',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

export const TIMEOUT = {
  API_CALL: 30000, // 30 seconds
  DEBOUNCE: 300,   // 300ms
};
