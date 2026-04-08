"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DevTokenBar } from "@/components/dev-token";
import { useAccessToken } from "@/hooks/use-access-token";
import { fetchJson } from "@/lib/api";
import { formatEur } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Program = {
  organization_id: string;
  organization_name: string;
  accrued_cents: number;
  paid_cents: number;
  attributed_orders: number;
  referral_code: string;
};

type AffiliateResponse = {
  programs: Program[];
  totals: { accrued_cents: number; paid_cents: number };
  payout_note?: string;
  currency?: string;
};

export function AffiliateDashboardClient() {
  const { token: bearer, loading: authLoading } = useAccessToken();
  const [data, setData] = useState<AffiliateResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (authLoading) return;
    const token = bearer;
    if (!token) {
      setErr("Sign in on the login page (or paste a dev token below).");
      setData(null);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const res = await fetchJson<AffiliateResponse>("/api/v1/dashboard/affiliate", {
        method: "GET",
        token,
      });
      setData(res);
    } catch (e) {
      setData(null);
      setErr(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [bearer, authLoading]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          ← Home
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Affiliate earnings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Each row is a <strong>merchant program</strong> you belong to. Accrued = pending + approved (not paid
          yet). Paid = already settled in AffilFlow. Real payout timing follows each brand&apos;s schedule (e.g.
          month-end).
        </p>
      </div>

      <DevTokenBar />

      <div className="flex items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => void load()} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      {err ? <p className="text-sm text-destructive whitespace-pre-wrap">{err}</p> : null}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardDescription>Total accrued (unpaid pipeline)</CardDescription>
                <CardTitle className="text-2xl tabular-nums">{formatEur(data.totals.accrued_cents)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Total paid out (historical)</CardDescription>
                <CardTitle className="text-2xl tabular-nums">{formatEur(data.totals.paid_cents)}</CardTitle>
              </CardHeader>
            </Card>
          </div>
          {data.payout_note ? (
            <p className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3">{data.payout_note}</p>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>By program</CardTitle>
              <CardDescription>Organizations you promote — your referral code and attributed performance</CardDescription>
            </CardHeader>
            <CardContent>
              {data.programs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No affiliate profiles yet. Join a program from the directory or accept an invite link.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4">Program (brand)</th>
                        <th className="pb-2 pr-4">Your code</th>
                        <th className="pb-2 pr-4">Orders</th>
                        <th className="pb-2 pr-4">Accrued</th>
                        <th className="pb-2">Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.programs.map((p) => (
                        <tr key={p.organization_id} className="border-b border-border/50">
                          <td className="py-3 pr-4 font-medium">{p.organization_name}</td>
                          <td className="py-3 pr-4 font-mono text-xs">{p.referral_code}</td>
                          <td className="py-3 pr-4 tabular-nums">{p.attributed_orders}</td>
                          <td className="py-3 pr-4 tabular-nums">{formatEur(p.accrued_cents)}</td>
                          <td className="py-3 tabular-nums">{formatEur(p.paid_cents)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : !err ? (
        <p className="text-sm text-muted-foreground">Set a token to load data.</p>
      ) : null}
    </div>
  );
}
