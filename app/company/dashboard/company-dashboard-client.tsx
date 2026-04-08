"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DevTokenBar } from "@/components/dev-token";
import { useAccessToken } from "@/hooks/use-access-token";
import { fetchJson } from "@/lib/api";
import { formatEur } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Summary = {
  organization_id: string;
  organization_name: string;
  order_count: number;
  sales_total_cents: number;
  commissions_pending_cents: number;
  commissions_approved_cents: number;
  commissions_paid_cents: number;
  active_affiliate_count: number;
};

type Leader = {
  affiliate_id: string;
  code: string;
  user_id: string;
  commission_total_cents: number;
  attributed_orders: number;
};

type Response = {
  summary: Summary;
  leaders: Leader[] | null;
  note?: string;
};

export function CompanyDashboardClient() {
  const { token: bearer, loading: authLoading } = useAccessToken();
  const [orgOverride, setOrgOverride] = useState("");
  const [data, setData] = useState<Response | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (authLoading) return;
    const token = bearer;
    if (!token) {
      setErr("Sign in on the login page (or paste a dev token below). Your account needs the admin role.");
      setData(null);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const q =
        orgOverride.trim() !== ""
          ? `?organization_id=${encodeURIComponent(orgOverride.trim())}`
          : "";
      const res = await fetchJson<Response>(`/api/v1/dashboard/company${q}`, {
        method: "GET",
        token,
      });
      setData({
        ...res,
        leaders: res.leaders ?? [],
      });
    } catch (e) {
      setData(null);
      setErr(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [orgOverride, bearer, authLoading]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          ← Home
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Company program dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sales and commissions for your merchant organization. Requires the <code className="text-xs">admin</code>{" "}
          realm role. If your user has no org in the database yet, paste an organization UUID below (dev only).
        </p>
      </div>

      <DevTokenBar />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-2 max-w-md">
          <Label htmlFor="org">Organization ID (optional override)</Label>
          <Input
            id="org"
            placeholder="00000000-0000-0000-0000-000000000000"
            value={orgOverride}
            onChange={(e) => setOrgOverride(e.target.value)}
          />
        </div>
        <Button type="button" variant="secondary" onClick={() => void load()} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      {err ? (
        <p className="text-sm text-destructive whitespace-pre-wrap">{err}</p>
      ) : null}

      {data ? (
        <>
          <p className="text-xs text-muted-foreground">{data.note}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Orders" value={String(data.summary.order_count)} />
            <StatCard title="Sales" value={formatEur(data.summary.sales_total_cents)} />
            <StatCard title="Active affiliates" value={String(data.summary.active_affiliate_count)} />
            <StatCard
              title="Commissions (pending / approved / paid)"
              value={`${formatEur(data.summary.commissions_pending_cents)} / ${formatEur(data.summary.commissions_approved_cents)} / ${formatEur(data.summary.commissions_paid_cents)}`}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Top affiliates</CardTitle>
              <CardDescription>By total commission volume in {data.summary.organization_name}</CardDescription>
            </CardHeader>
            <CardContent>
              {data.leaders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No affiliate activity yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4">Code</th>
                        <th className="pb-2 pr-4">Attributed orders</th>
                        <th className="pb-2">Commission total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.leaders.map((r) => (
                        <tr key={r.affiliate_id} className="border-b border-border/50">
                          <td className="py-2 pr-4 font-mono">{r.code}</td>
                          <td className="py-2 pr-4">{r.attributed_orders}</td>
                          <td className="py-2">{formatEur(r.commission_total_cents)}</td>
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

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-xl font-semibold tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
