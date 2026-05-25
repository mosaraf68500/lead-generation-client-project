/**
 * Typed fetch wrapper for the Express backend.
 *
 * - Adds the Better Auth bearer token (server) or cookies (browser) so the
 *   API can resolve the session.
 * - Throws a structured `ApiError` for any non-2xx response.
 * - Returns the unwrapped `data` payload from our `{ success, data, meta }` envelope.
 *
 * IMPORTANT: this module is consumed by both Server and Client Components
 * (e.g. LeadForm uses it from the browser). A static `import 'next/headers'`
 * would poison the whole module for client use, so the server-only branch of
 * `buildHeaders` dynamic-imports it instead, keeping it out of the client chunk.
 */

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5001/api';

export class ApiError extends Error {
  public readonly status: number;
  public readonly errorSources?: Array<{ path: string; message: string }>;
  constructor(
    message: string,
    status: number,
    errorSources?: Array<{ path: string; message: string }>,
  ) {
    super(message);
    this.status = status;
    this.errorSources = errorSources;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
  errorSources?: Array<{ path: string; message: string }>;
}

export interface ApiResult<T> {
  data: T;
  meta?: Record<string, unknown>;
  message: string;
}

interface FetchOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown;
  headers?: Record<string, string>;
  /** Only honoured during a Server Component fetch. */
  tags?: string[];
}

const isServer = typeof window === 'undefined';

const buildHeaders = async (init?: Record<string, string>): Promise<Headers> => {
  const out = new Headers(init);
  if (!out.has('Accept')) out.set('Accept', 'application/json');

  if (isServer) {
    try {
      const { headers: nextHeaders, cookies: nextCookies } = await import('next/headers');
      const cookieHeader = nextHeaders().get('cookie');
      if (cookieHeader) out.set('cookie', cookieHeader);
      const token = nextCookies().get('better-auth.session_token')?.value;
      if (token) out.set('Authorization', `Bearer ${token}`);
    } catch {
      // Outside a request scope (e.g. during build).
    }
  }
  return out;
};

const apiFetch = async <T>(
  path: string,
  options: FetchOptions = {},
): Promise<ApiResult<T>> => {
  const url = path.startsWith('http') ? path : `${baseURL}${path.startsWith('/') ? path : `/${path}`}`;

  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = await buildHeaders(options.headers);
  if (!isFormData && options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const init: RequestInit & { next?: { tags?: string[] } } = {
    ...options,
    headers,
    body:
      options.body === undefined
        ? undefined
        : isFormData
          ? (options.body as FormData)
          : JSON.stringify(options.body),
    credentials: 'include',
  };
  if (options.tags && isServer) init.next = { tags: options.tags };

  const response = await fetch(url, init);
  const json = (await response.json().catch(() => ({}))) as ApiEnvelope<T> | Record<string, unknown>;

  if (!response.ok || (json as ApiEnvelope<T>).success === false) {
    const envelope = json as ApiEnvelope<T>;
    throw new ApiError(
      envelope.message || `Request failed with status ${response.status}`,
      response.status,
      envelope.errorSources,
    );
  }

  const envelope = json as ApiEnvelope<T>;
  return { data: envelope.data, meta: envelope.meta, message: envelope.message };
};

export const api = {
  get: <T>(path: string, options?: FetchOptions) => apiFetch<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: FetchOptions) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }),
};
