const apiBase = () =>
  (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

export function apiUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${apiBase()}${p}`;
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
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}
