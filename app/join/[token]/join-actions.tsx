"use client";

import { useState } from "react";
import { fetchJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStoredToken } from "@/components/dev-token";

export function JoinActions({ token }: { token: string }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function accept() {
    const jwt = getStoredToken();
    if (!jwt) {
      setMsg("Sign in via Keycloak, then paste your access token in the field below.");
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      await fetchJson(`/api/v1/invites/${encodeURIComponent(token)}/accept`, {
        method: "POST",
        token: jwt,
        body: JSON.stringify({
          email: email.trim() || undefined,
        }),
      });
      setMsg("Invite accepted. You can open the affiliate dashboard when it is wired.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Paste your Keycloak access token (same as other pages), then complete onboarding.
      </p>
      <Button disabled={loading} onClick={accept}>
        {loading ? "Working…" : "Accept invite"}
      </Button>
      {msg ? <p className="text-sm">{msg}</p> : null}
    </div>
  );
}
