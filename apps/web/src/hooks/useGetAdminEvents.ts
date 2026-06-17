import { useQuery } from "@tanstack/react-query";

export function useGetAdminEvents() {
  return useQuery({
    queryFn: () => Promise.resolve([]) as Promise<unknown[]>,
    queryKey: ["admin-events"],
  });
}
