import type { UseMutationOptions, UseMutationResult, QueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { postReviewsByIdFlag } from "../clients/postReviewsByIdFlag";
import type { Client, RequestConfig, ResponseErrorConfig } from "../../lib/axios";

export function usePostReviewsByIdFlag<TContext = unknown>(
  options: {
    mutation?: UseMutationOptions<
      { success: boolean },
      ResponseErrorConfig<Error>,
      { id: string },
      TContext
    > & { client?: QueryClient };
    client?: Partial<RequestConfig> & { client?: Client };
  } = {}
): UseMutationResult<{ success: boolean }, ResponseErrorConfig<Error>, { id: string }, TContext> {
  const { mutation = {}, client: config = {} } = options;
  const { client: _queryClient, ...mutationOptions } = mutation;
  return useMutation<{ success: boolean }, ResponseErrorConfig<Error>, { id: string }, TContext>({
    mutationFn: ({ id }) => postReviewsByIdFlag(id, config),
    ...mutationOptions,
  });
}
