import type { QueryClient } from "@tanstack/react-query";

// QueryClient instance shared across the app
// This is initialized in main.tsx and exported here for use in route loaders
let queryClientInstance: QueryClient;

export function setQueryClient(client: QueryClient) {
  queryClientInstance = client;
}

export function getQueryClient(): QueryClient {
  if (!queryClientInstance) {
    throw new Error("Query client not initialized. Make sure setQueryClient is called in main.tsx");
  }
  return queryClientInstance;
}
