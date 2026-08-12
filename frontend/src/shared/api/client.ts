/**
 * Tiny fetch wrapper for the backend REST API.
 *
 * All data access goes through here so the base URL, auth header, and error
 * shape live in one place. The base URL comes from VITE_API_URL (see .env),
 * falling back to the local backend for a zero-config dev setup.
 */
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

/**
 * Origin of the backend (API_URL minus the trailing /api) — the base for
 * static assets it serves, e.g. uploaded painting images under /images/*.
 */
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

/** Thrown for any non-2xx response; carries the HTTP status for callers. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// The admin bearer token, held in module scope so every request can attach it
// without callers threading it through. AuthContext sets it on login/logout and
// when restoring a session. Public GETs simply ignore it server-side.
let authToken: string | null = null;
export function setAuthToken(token: string | null): void {
  authToken = token;
}

// Invoked when an AUTHENTICATED request comes back 401 — i.e. the stored
// token expired or was revoked mid-session. AuthContext registers a handler
// that clears the session so the route guard redirects to the login page.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

function buildHeaders(extra?: HeadersInit): HeadersInit {
  return {
    Accept: 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...extra,
  };
}

async function parseError(res: Response): Promise<never> {
  // The backend returns errors as { error: string }; surface that when present.
  let message = `Request failed with status ${res.status}`;
  try {
    const body = (await res.json()) as { error?: string };
    if (body?.error) message = body.error;
  } catch {
    // non-JSON error body — keep the generic message
  }
  // A 401 with a token attached means the session went stale (an expired or
  // revoked JWT) — not a failed login, which runs without a token.
  if (res.status === 401 && authToken) onUnauthorized?.();
  throw new ApiError(res.status, message);
}

/** GET `path` (relative to the API base) and parse the JSON body as `T`. */
export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: buildHeaders(),
    signal,
  });
  if (!res.ok) return parseError(res);
  return res.json() as Promise<T>;
}

/** Shared implementation for POST/PUT/DELETE. */
async function send<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: buildHeaders(body !== undefined ? { 'Content-Type': 'application/json' } : undefined),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) return parseError(res);
  // 204 No Content (e.g. DELETE) has no body to parse.
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiPost = <T>(path: string, body?: unknown): Promise<T> => send<T>('POST', path, body);
export const apiPut = <T>(path: string, body?: unknown): Promise<T> => send<T>('PUT', path, body);
export const apiDelete = (path: string): Promise<void> => send<void>('DELETE', path);

/**
 * POST multipart form data (file uploads). We deliberately do NOT set
 * Content-Type — the browser sets it with the correct multipart boundary. The
 * bearer token is still attached.
 */
export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(),
    body: formData,
  });
  if (!res.ok) return parseError(res);
  return res.json() as Promise<T>;
}
