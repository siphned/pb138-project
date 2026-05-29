interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

interface AxiosLikeError {
  response?: { status?: number; data?: ApiErrorBody };
  status?: number;
}

export interface ParsedApiError {
  code?: string;
  message?: string;
  status?: number;
}

export function parseApiError(err: unknown): ParsedApiError | null {
  if (!err || typeof err !== "object") return null;
  const e = err as AxiosLikeError;
  const status = e.response?.status ?? e.status;
  const body = e.response?.data;
  const code = body?.error?.code;
  const rawMessage = body?.error?.message;
  // BE prepends "CODE: " to the message — strip it for display.
  const message = rawMessage && code ? rawMessage.replace(`${code}: `, "") : rawMessage;
  if (!status && !code) return null;
  return { code, message, status };
}
