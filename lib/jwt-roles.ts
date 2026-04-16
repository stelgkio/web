function base64UrlToUtf8(input: string): string {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Best-effort decode of AffilFlow JWT roles claim (no signature verification).
 * Used for UI only (nav). Server still enforces auth on API calls.
 */
export function parseAffilflowJwtRoles(jwt: string): string[] | null {
  const parts = jwt.split(".");
  if (parts.length < 2) return null;
  try {
    const payloadJson = base64UrlToUtf8(parts[1]);
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;
    const raw = payload.roles;
    if (Array.isArray(raw)) {
      const out: string[] = [];
      for (const x of raw) {
        if (typeof x === "string") out.push(x);
      }
      return out;
    }
    if (typeof raw === "string") {
      return [raw];
    }
    return [];
  } catch {
    return null;
  }
}
