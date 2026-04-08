"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { apiUrl, fetchJson } from "@/lib/api";
import { formatEurFromCents } from "@/lib/format-money";
import { oauthStartUrl } from "@/lib/auth-urls";
import { useAccessToken } from "@/hooks/use-access-token";

type CampaignDetail = {
  organization: {
    id: string;
    name: string;
    slug: string | null;
    approval_mode: "open" | "request_to_join" | "invite_only";
    discovery_enabled: boolean;
  };
  stats: {
    order_count: number;
    sales_total_cents: number;
    commissions_pending_cents: number;
    commissions_approved_cents: number;
    commissions_paid_cents: number;
    active_affiliate_count: number;
  };
  top_partners: {
    code: string;
    commission_total_cents: number;
    attributed_orders: number;
  }[];
};

function approvalLabel(mode: string): string {
  return mode.replace(/_/g, " ");
}

export function CampaignDetailClient() {
  const { campaignRef } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenPersisted = useRef(false);
  const { token, loading: tokenLoading } = useAccessToken();
  const [data, setData] = useState<CampaignDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applyDone, setApplyDone] = useState(false);
  const [applying, setApplying] = useState(false);

  const ref = campaignRef ?? "";

  useEffect(() => {
    const t = searchParams.get("token");
    if (!t || tokenPersisted.current) return;
    tokenPersisted.current = true;
    window.localStorage.setItem("affilflow_jwt", t);
    window.dispatchEvent(new Event("affilflow-token"));
    const next = new URLSearchParams(searchParams);
    next.delete("token");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!ref) return;
    let cancelled = false;
    setLoadError(null);
    void (async () => {
      try {
        const res = await fetch(apiUrl(`/api/v1/campaigns/${encodeURIComponent(ref)}`));
        if (!res.ok) {
          if (cancelled) return;
          setLoadError(res.status === 404 ? "Campaign not found or not public." : "Could not load campaign.");
          setData(null);
          return;
        }
        const json = (await res.json()) as CampaignDetail;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) {
          setLoadError("Could not load campaign.");
          setData(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ref]);

  const apply = useCallback(async () => {
    if (!data || !token) return;
    setApplying(true);
    setApplyError(null);
    try {
      await fetchJson<void>(`/api/v1/campaigns/${data.organization.id}/apply`, {
        method: "POST",
        token,
        body: JSON.stringify({}),
      });
      setApplyDone(true);
    } catch (e) {
      setApplyError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setApplying(false);
    }
  }, [data, token]);

  if (!ref) {
    return <p className="text-sm text-muted-foreground">Missing campaign.</p>;
  }

  if (loadError) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-destructive">{loadError}</p>
        <Link to="/campaigns" className="text-sm text-primary underline-offset-4 hover:underline">
          ← Back to campaigns
        </Link>
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const { organization: o, stats, top_partners } = data;
  const loginReturn = `/login?returnTo=${encodeURIComponent(`/campaigns/${ref}`)}`;
  const canApply = o.approval_mode === "open" || o.approval_mode === "request_to_join";
  const authed = Boolean(token);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link to="/campaigns" className="text-sm text-muted-foreground hover:underline">
          ← All campaigns
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{o.name}</h1>
        <p className="text-muted-foreground text-sm">
          Partner onboarding: <span className="text-foreground">{approvalLabel(o.approval_mode)}</span>
        </p>
      </div>

      <section className="rounded-lg border p-4">
        <h2 className="text-sm font-medium text-muted-foreground">How it&apos;s going</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">Attributed orders</dt>
            <dd className="text-lg font-semibold tabular-nums">{stats.order_count}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Sales (tracked)</dt>
            <dd className="text-lg font-semibold tabular-nums">{formatEurFromCents(stats.sales_total_cents)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Active partners</dt>
            <dd className="text-lg font-semibold tabular-nums">{stats.active_affiliate_count}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Commissions pending</dt>
            <dd className="text-lg font-semibold tabular-nums">{formatEurFromCents(stats.commissions_pending_cents)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Commissions approved</dt>
            <dd className="text-lg font-semibold tabular-nums">{formatEurFromCents(stats.commissions_approved_cents)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Commissions paid</dt>
            <dd className="text-lg font-semibold tabular-nums">{formatEurFromCents(stats.commissions_paid_cents)}</dd>
          </div>
        </dl>
      </section>

      {top_partners.length > 0 ? (
        <section className="rounded-lg border p-4">
          <h2 className="text-sm font-medium text-muted-foreground">Top partners (by commission)</h2>
          <ul className="mt-3 divide-y">
            {top_partners.map((p) => (
              <li key={p.code} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span className="font-mono">{p.code}</span>
                <span className="text-muted-foreground tabular-nums">
                  {formatEurFromCents(p.commission_total_cents)} · {p.attributed_orders} orders
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <h2 className="font-medium">Become a partner</h2>
        {o.approval_mode === "invite_only" ? (
          <p className="mt-2 text-sm text-muted-foreground">
            This campaign is invite-only. You need a personal invite link from the merchant.
          </p>
        ) : applyDone ? (
          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;re in — open your{" "}
            <Link to="/affiliate/dashboard" className="font-medium text-primary underline-offset-4 hover:underline">
              affiliate dashboard
            </Link>{" "}
            for next steps.
          </p>
        ) : tokenLoading ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading session…</p>
        ) : !authed ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-muted-foreground">Sign in to join this campaign.</p>
            <div className="flex flex-wrap gap-2">
              <Link
                to={loginReturn}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-95"
              >
                Log in
              </Link>
              <a
                href={oauthStartUrl("google", `/campaigns/${ref}`)}
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Continue with Google
              </a>
              <a
                href={oauthStartUrl("facebook", `/campaigns/${ref}`)}
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Continue with Facebook
              </a>
            </div>
          </div>
        ) : canApply ? (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-muted-foreground">
              {o.approval_mode === "open"
                ? "Request access — open campaigns may add you right away if capacity allows."
                : "Submit a request — the merchant will review your application."}
            </p>
            {applyError ? <p className="text-sm text-destructive">{applyError}</p> : null}
            <button
              type="button"
              disabled={applying}
              onClick={() => void apply()}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-95 disabled:opacity-50"
            >
              {applying ? "Submitting…" : "Become a partner"}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
