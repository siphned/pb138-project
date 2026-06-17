import { useMutation } from "@tanstack/react-query";

export function usePostAdminEventsByIdApprove() {
  return useMutation({
    mutationFn: async (_: { id: string }) => ({ success: true }),
  });
}
