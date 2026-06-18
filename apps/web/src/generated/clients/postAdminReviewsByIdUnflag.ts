import fetch from "../../lib/axios";
import type { Client, RequestConfig, ResponseErrorConfig } from "../../lib/axios";

export async function postAdminReviewsByIdUnflag(
  id: string,
  config: Partial<RequestConfig> & { client?: Client } = {}
) {
  const { client: request = fetch, ...requestConfig } = config;
  const res = await request<{ success: boolean }, ResponseErrorConfig<Error>, unknown>({
    method: "POST",
    url: `/admin/reviews/${id}/unflag`,
    ...requestConfig,
  });
  return res.data;
}
