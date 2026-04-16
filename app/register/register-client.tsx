"use client";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FacebookIcon, GoogleIcon } from "@/components/oauth-icons";
import { oauthStartUrl, type AccountType } from "@/lib/auth-urls";
import { fetchJson } from "@/lib/api";

type RegisterResponse = {
  access_token: string;
  user_id: string;
  roles: string[];
  campain_id?: string;
};

function persistToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("affilflow_jwt", token);
  window.dispatchEvent(new Event("affilflow-token"));
}

export function RegisterClient() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<AccountType>("affiliate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        email: email.trim(),
        password,
        account_type: accountType,
      };
      if (displayName.trim()) body.display_name = displayName.trim();
      if (accountType === "merchant") {
        body.company_name = companyName.trim();
      }
      const res = await fetchJson<RegisterResponse>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      });
      persistToken(res.access_token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const oauthOpts = {
    accountType,
    companyName: accountType === "merchant" ? companyName.trim() : undefined,
  };

  const oauthDisabled =
    accountType === "merchant" && !companyName.trim();

  return (
    <div className="mt-8 space-y-8">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-foreground">I want to</legend>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input
              type="radio"
              name="account"
              className="accent-primary"
              checked={accountType === "affiliate"}
              onChange={() => setAccountType("affiliate")}
            />
            <span className="text-sm">
              <span className="font-medium">Join as a partner</span>
              <span className="block text-muted-foreground">Earn commissions (affiliate)</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input
              type="radio"
              name="account"
              className="accent-primary"
              checked={accountType === "merchant"}
              onChange={() => setAccountType("merchant")}
            />
            <span className="text-sm">
              <span className="font-medium">Run a company program</span>
              <span className="block text-muted-foreground">Merchant dashboard (merchant)</span>
            </span>
          </label>
        </div>
      </fieldset>

      {accountType === "merchant" ? (
        <div className="space-y-2">
          <Label htmlFor="company">Company name</Label>
          <Input
            id="company"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Your store or brand name"
            autoComplete="organization"
          />
          <p className="text-xs text-muted-foreground">Shown on your merchant program and invites.</p>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <p className="text-xs text-muted-foreground">At least 8 characters.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayName">Display name (optional)</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Creating account…" : "Create account with email"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {oauthDisabled ? (
          <>
            <Button type="button" size="lg" className="w-full sm:flex-1 gap-2" variant="outline" disabled>
              <GoogleIcon className="size-5 shrink-0" />
              Google
            </Button>
            <Button type="button" size="lg" className="w-full sm:flex-1 gap-2" variant="outline" disabled>
              <FacebookIcon className="size-5 shrink-0" />
              Facebook
            </Button>
          </>
        ) : (
          <>
            <Button asChild size="lg" className="w-full sm:flex-1 gap-2" variant="outline">
              <a href={oauthStartUrl("google", undefined, oauthOpts)}>
                <GoogleIcon className="size-5 shrink-0" />
                Google
              </a>
            </Button>
            <Button asChild size="lg" className="w-full sm:flex-1 gap-2" variant="outline">
              <a href={oauthStartUrl("facebook", undefined, oauthOpts)}>
                <FacebookIcon className="size-5 shrink-0" />
                Facebook
              </a>
            </Button>
          </>
        )}
      </div>
      {accountType === "merchant" && !companyName.trim() ? (
        <p className="text-center text-xs text-muted-foreground">Enter a company name above to use Google or Facebook.</p>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
      <p className="text-center text-sm">
        <Link to="/" className="text-muted-foreground hover:text-foreground">
          ← Back home
        </Link>
      </p>
    </div>
  );
}
