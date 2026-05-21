import { mockClerkUser } from "./auth";

type AppRole = "customer" | "winemaker" | "shop_owner" | "admin";

interface RequestOpts {
  auth?: { roles: AppRole[]; sub?: string };
  body?: unknown;
  cookies?: Record<string, string>;
  query?: Record<string, string>;
}

export function buildRequest(method: string, path: string, opts: RequestOpts = {}): Request {
  const url = new URL(path, "http://localhost");

  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      url.searchParams.set(k, v);
    }
  }

  const headers: Record<string, string> = {};

  if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (opts.auth) {
    headers.Authorization = `Bearer mock-token-${opts.auth.sub ?? "test-user"}`;
    mockClerkUser(opts.auth.roles, opts.auth.sub);
  }

  if (opts.cookies) {
    headers.cookie = Object.entries(opts.cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }

  return new Request(url.toString(), {
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    headers,
    method,
  });
}

export function get(path: string, opts?: RequestOpts) {
  return buildRequest("GET", path, opts);
}

export function post(path: string, opts?: RequestOpts) {
  return buildRequest("POST", path, opts);
}

export function patch(path: string, opts?: RequestOpts) {
  return buildRequest("PATCH", path, opts);
}

export function put(path: string, opts?: RequestOpts) {
  return buildRequest("PUT", path, opts);
}

export function del(path: string, opts?: RequestOpts) {
  return buildRequest("DELETE", path, opts);
}
