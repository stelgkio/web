import { apiUrl } from "@/lib/api";

function appOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return (process.env.NEXT_PUBLIC_APP_ORIGIN ?? "http://localhost:3001").replace(/\/$/, "");
}

export type AccountType = "affiliate" | "merchant";

export type OAuthStartOptions = {
  /** affiliate = partner; merchant = company (requires companyName when using OAuth). */
  accountType?: AccountType;
  /** Required when accountType is merchant (OAuth start). */
  companyName?: string;
};

/** Backend OAuth start URL; optional web path to return to after /auth/callback (stored in OAuth state). */
export function oauthStartUrl(
  provider: "google" | "facebook",
  returnToPath?: string,
  opts?: OAuthStartOptions
) {
  const origin = appOrigin();
  const afterCallback =
    returnToPath && returnToPath.length > 0
      ? `${origin}${returnToPath.startsWith("/") ? returnToPath : `/${returnToPath}`}`
      : `${origin}/auth/callback`;
  const params = new URLSearchParams();
  params.set("next", afterCallback);
  const accountType = opts?.accountType ?? "affiliate";
  params.set("account_type", accountType);
  if (accountType === "merchant") {
    const name = (opts?.companyName ?? "").trim();
    if (name) {
      params.set("company_name", name);
    }
  }
  return `${apiUrl(`/api/v1/auth/providers/${provider}/start`)}?${params.toString()}`;
}
