"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { oauthStartUrl } from "@/lib/auth-urls";
import { fetchJson } from "@/lib/api";
import { useAccessToken } from "@/hooks/use-access-token";

type ValidateResponse = {
  valid: boolean;
  organization_id: string;
  expires_at: string;
};

export function JoinInviteClient({ token }: { token: string }) {
  const sp = useSearchParams();
  const { token: bearer, loading: authLoading } = useAccessToken();
  const [inv, setInv] = useState<ValidateResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [done, setDone] = useState(false);
  const acceptedRef = useRef(false);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const res = await fetchJson<ValidateResponse>(`/api/v1/invites/${encodeURIComponent(token)}/validate`, {
        method: "GET",
      });
      setInv(res);
    } catch (e) {
      setInv(null);
      setErr(e instanceof Error ? e.message : "Invalid invite");
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const acceptWithToken = useCallback(
    async (jwt: string) => {
      if (acceptedRef.current) return;
      setAccepting(true);
      setErr(null);
      try {
        await fetchJson(`/api/v1/invites/${encodeURIComponent(token)}/accept`, {
          method: "POST",
          token: jwt,
          body: JSON.stringify({}),
        });
        acceptedRef.current = true;
        setDone(true);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Could not accept invite");
      } finally {
        setAccepting(false);
      }
    },
    [token]
  );

  // OAuth redirect: .../join/{token}?accept=1&token=JWT
  useEffect(() => {
    const jwt = sp.get("token");
    const acceptFlag = sp.get("accept");
    if (!jwt || typeof window === "undefined") return;

    window.localStorage.setItem("affilflow_jwt", jwt);
    window.dispatchEvent(new Event("affilflow-token"));

    const url = new URL(window.location.href);
    url.searchParams.delete("token");
    window.history.replaceState({}, "", url.pathname + url.search);

    if (acceptFlag === "1") {
      void acceptWithToken(jwt);
    }
  }, [sp, acceptWithToken]);

  if (err && !inv) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm">
        {err}
      </div>
    );
  }

  if (!inv) {
    return <p className="text-sm text-muted-foreground">Checking invite…</p>;
  }

  const returnPath = `/join/${encodeURIComponent(token)}?accept=1`;
  const showOAuth = !authLoading && !bearer;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Organization ID: <code className="rounded bg-muted px-1 text-xs">{inv.organization_id}</code>
      </p>
      <p className="text-xs text-muted-foreground">Expires: {new Date(inv.expires_at).toLocaleString()}</p>

      {done ? (
        <p className="text-sm font-medium text-green-700 dark:text-green-400">
          You&apos;re in. Open your{" "}
          <Link href="/affiliate/dashboard" className="underline">
            partner dashboard
          </Link>
          .
        </p>
      ) : showOAuth ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild size="lg">
            <a href={oauthStartUrl("google", returnPath)}>Continue with Google</a>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href={oauthStartUrl("facebook", returnPath)}>Continue with Facebook</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Button type="button" onClick={() => bearer && void acceptWithToken(bearer)} disabled={accepting || !bearer}>
            {accepting ? "Joining…" : "Accept invite"}
          </Button>
          {err ? <p className="text-sm text-destructive">{err}</p> : null}
        </div>
      )}
    </div>
  );
}
