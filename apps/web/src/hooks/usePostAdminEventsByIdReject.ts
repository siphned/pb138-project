import { useMutation } from "@tanstack/react-query";

export function usePostAdminEventsByIdReject() {
  return useMutation({
    mutationFn: async (_: { id: string }) => ({ success: true }),
  });
}
