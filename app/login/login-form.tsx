"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FacebookIcon, GoogleIcon } from "@/components/oauth-icons";
import { oauthStartUrl } from "@/lib/auth-urls";
import { fetchJson } from "@/lib/api";

type LoginResponse = {
  access_token: string;
  user_id: string;
  roles: string[];
};

function persistToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("affilflow_jwt", token);
  window.dispatchEvent(new Event("affilflow-token"));
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetchJson<LoginResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      persistToken(res.access_token);
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Signing in…" : "Sign in with email"}
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

      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <Button asChild size="lg" className="w-full sm:flex-1 gap-2" variant="outline">
          <a href={oauthStartUrl("google")}>
            <GoogleIcon className="size-5 shrink-0" />
            Google
          </a>
        </Button>
        <Button asChild size="lg" className="w-full sm:flex-1 gap-2" variant="outline">
          <a href={oauthStartUrl("facebook")}>
            <FacebookIcon className="size-5 shrink-0" />
            Facebook
          </a>
        </Button>
      </div>
      <p className="mt-10 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/register" className="text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
      <p className="mt-4 text-center text-sm">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          ← Back home
        </Link>
      </p>
    </>
  );
}
