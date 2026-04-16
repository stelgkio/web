const apiBase = () =>
  (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

export function apiUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${apiBase()}${p}`;
}

type ApiErrorEnvelope = {
  error?: { message?: string; code?: string };
  message?: string;
};

/** Extract user-facing text from API error bodies (backend/pkg/response JSONError shape). */
export function messageFromApiErrorBody(body: string): string | null {
  const trimmed = body.trim();
  if (!trimmed) return null;
  try {
    const j = JSON.parse(trimmed) as ApiErrorEnvelope;
    if (typeof j.error?.message === "string" && j.error.message.trim()) {
      return j.error.message.trim();
    }
    if (typeof j.message === "string" && j.message.trim()) {
      return j.message.trim();
    }
  } catch {
    /* not JSON */
  }
  if (!trimmed.startsWith("{")) {
    return trimmed;
  }
  return null;
}

export async function fetchJson<T>(
  path: string,
  init?: RequestInit & { token?: string | null }
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const tok = init?.token;
  if (tok) {
    headers.set("Authorization", `Bearer ${tok}`);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- strip token before fetch
  const { token, ...rest } = init ?? {};
  const res = await fetch(apiUrl(path), { ...rest, headers });
  if (!res.ok) {
    const text = await res.text();
    const fromApi = messageFromApiErrorBody(text);
    const fallback = `${res.status} ${res.statusText}`.trim();
    throw new Error(fromApi ?? (text.trim() || fallback));
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}
