import fetch from "../../lib/axios";
import type { Client, RequestConfig, ResponseErrorConfig } from "../../lib/axios";

export async function postReviewsByIdFlag(
  id: string,
  config: Partial<RequestConfig> & { client?: Client } = {}
) {
  const { client: request = fetch, ...requestConfig } = config;
  const res = await request<{ success: boolean }, ResponseErrorConfig<Error>, unknown>({
    method: "POST",
    url: `/reviews/${id}/flag`,
    ...requestConfig,
  });
  return res.data;
}
