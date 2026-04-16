"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAccessToken } from "@/hooks/use-access-token";
import { useMerchantCampainId, withMerchantCampainQuery } from "@/hooks/use-merchant-campain-id";
import { fetchJson } from "@/lib/api";
import { formatEur } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { MerchantActiveCampainBar, notifyMerchantCampainListChanged } from "@/components/merchant-app/merchant-active-campain-bar";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    window.prompt("Copy this value:", text);
  }
}

type Summary = {
  campain_id: string;
  campain_name: string;
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

type DashboardResponse = {
  summary: Summary;
  leaders: Leader[];
  note?: string;
};

type Campain = {
  id: string;
  name: string;
  slug?: string | null;
  discovery_enabled: boolean;
  approval_mode: string;
  tagline?: string | null;
  description?: string | null;
  brand_website_url?: string | null;
  terms_url?: string | null;
  default_commission_rate: number;
  attribution_window_days: number;
};

type LinkedStores = {
  shopify_domain?: string | null;
  woocommerce_site_url?: string | null;
  woocommerce_signing_secret_set?: boolean;
};

type ProgramBundle = {
  campain: Campain;
  linked_stores: LinkedStores;
  pending_applications_count: number;
  pending_invites_count: number;
  webhook_note: string;
};

type ApplicationRow = {
  id: string;
  campain_id: string;
  applicant_user_id?: string | null;
  applicant_email?: string | null;
  status: string;
  created_at: string;
};

type IntegrationSetup = {
  api_base_url: string;
  shopify: {
    linked_shop_domain?: string | null;
    webhook_delivery_url?: string;
    webhook_event_suggestion?: string;
    steps?: string[];
  };
  woocommerce: {
    linked_site_url?: string | null;
    signing_secret_configured?: boolean;
    webhook_delivery_url?: string;
    webhook_topic_suggestion?: string;
    steps?: string[];
  };
};

type WooSaveResponse = {
  site_base_url: string;
  webhook_signing_secret?: string;
  copy_hint?: string;
};

export type MerchantDashboardView = "overview" | "program" | "partners" | "integrations";

export type CompanyDashboardClientProps = {
  view: MerchantDashboardView;
  /** When true, the active-campaign bar is not rendered (parent page provides it). */
  hideActiveCampainBar?: boolean;
  /** When true, program view omits the page title (used on the combined campaigns page). */
  embeddedProgram?: boolean;
};

export function CompanyDashboardClient({
  view,
  hideActiveCampainBar,
  embeddedProgram,
}: CompanyDashboardClientProps) {
  const { token: bearer, loading: authLoading } = useAccessToken();
  const { campainId: selectedCampainId } = useMerchantCampainId();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [program, setProgram] = useState<ProgramBundle | null>(null);
  const [programErr, setProgramErr] = useState<string | null>(null);
  const [programLoading, setProgramLoading] = useState(false);
  const [savingProgram, setSavingProgram] = useState(false);

  const [progName, setProgName] = useState("");
  const [progSlug, setProgSlug] = useState("");
  const [progDiscovery, setProgDiscovery] = useState(false);
  const [progMode, setProgMode] = useState("invite_only");
  const [progTagline, setProgTagline] = useState("");
  const [progDescription, setProgDescription] = useState("");
  const [progBrandUrl, setProgBrandUrl] = useState("");
  const [progTermsUrl, setProgTermsUrl] = useState("");
  const [progCommissionPct, setProgCommissionPct] = useState("10");
  const [progAttrDays, setProgAttrDays] = useState("30");

  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [appLoading, setAppLoading] = useState(false);
  const [appAction, setAppAction] = useState<string | null>(null);

  const [shopDomain, setShopDomain] = useState("");
  const [wooUrl, setWooUrl] = useState("");
  const [storeSaving, setStoreSaving] = useState<"shopify" | "woo" | "woo_rotate" | null>(null);

  const [integrationSetup, setIntegrationSetup] = useState<IntegrationSetup | null>(null);
  const [wooSecretFlash, setWooSecretFlash] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (authLoading) return;
    const token = bearer;
    if (!token) {
      setErr("Sign in on the login page (or paste a dev token below). Your account needs the merchant role.");
      setData(null);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const path = withMerchantCampainQuery("/api/v1/dashboard/company", selectedCampainId);
      const res = await fetchJson<DashboardResponse>(path, {
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
  }, [selectedCampainId, bearer, authLoading]);

  const loadProgram = useCallback(async () => {
    if (authLoading || !bearer) {
      setProgram(null);
      return;
    }
    setProgramLoading(true);
    setProgramErr(null);
    try {
      const p = await fetchJson<ProgramBundle>(withMerchantCampainQuery("/api/v1/merchant/program", selectedCampainId), {
        method: "GET",
        token: bearer,
      });
      setProgram(p);
      setProgName(p.campain.name);
      setProgSlug(p.campain.slug ?? "");
      setProgDiscovery(p.campain.discovery_enabled);
      setProgMode(p.campain.approval_mode);
      setProgTagline(p.campain.tagline ?? "");
      setProgDescription(p.campain.description ?? "");
      setProgBrandUrl(p.campain.brand_website_url ?? "");
      setProgTermsUrl(p.campain.terms_url ?? "");
      const rate = typeof p.campain.default_commission_rate === "number" ? p.campain.default_commission_rate : 0.1;
      setProgCommissionPct(String(Math.round(rate * 10000) / 100));
      setProgAttrDays(String(p.campain.attribution_window_days ?? 30));
      try {
        const setup = await fetchJson<IntegrationSetup>(
          withMerchantCampainQuery("/api/v1/merchant/integrations/setup", selectedCampainId),
          {
            method: "GET",
            token: bearer,
          }
        );
        setIntegrationSetup(setup);
      } catch {
        setIntegrationSetup(null);
      }
    } catch (e) {
      setProgram(null);
      setProgramErr(e instanceof Error ? e.message : "Failed to load program settings");
    } finally {
      setProgramLoading(false);
    }
  }, [bearer, authLoading, selectedCampainId]);

  const loadApplications = useCallback(async () => {
    if (authLoading || !bearer) {
      setApplications([]);
      return;
    }
    setAppLoading(true);
    try {
      const list = await fetchJson<ApplicationRow[]>(
        withMerchantCampainQuery("/api/v1/merchant/applications?status=pending", selectedCampainId),
        {
          method: "GET",
          token: bearer,
        }
      );
      setApplications(Array.isArray(list) ? list : []);
    } catch {
      setApplications([]);
    } finally {
      setAppLoading(false);
    }
  }, [bearer, authLoading, selectedCampainId]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    void loadProgram();
    void loadApplications();
  }, [loadProgram, loadApplications]);

  async function saveProgram() {
    if (!bearer) return;
    setSavingProgram(true);
    setProgramErr(null);
    try {
      const pct = parseFloat(progCommissionPct.replace(",", "."));
      if (Number.isNaN(pct) || pct <= 0 || pct > 100) {
        setProgramErr("Default commission must be a percent between 0 and 100 (e.g. 10 for 10%).");
        setSavingProgram(false);
        return;
      }
      const days = parseInt(progAttrDays, 10);
      if (Number.isNaN(days) || days < 1 || days > 365) {
        setProgramErr("Attribution window must be between 1 and 365 days.");
        setSavingProgram(false);
        return;
      }
      const slugTrim = progSlug.trim();
      const body = {
        name: progName.trim(),
        slug: slugTrim === "" ? "" : slugTrim,
        discovery_enabled: progDiscovery,
        approval_mode: progMode,
        tagline: progTagline.trim(),
        description: progDescription.trim(),
        brand_website_url: progBrandUrl.trim(),
        terms_url: progTermsUrl.trim(),
        default_commission_rate: pct / 100,
        attribution_window_days: days,
      };
      const updated = await fetchJson<Campain>(withMerchantCampainQuery("/api/v1/merchant/program", selectedCampainId), {
        method: "PATCH",
        token: bearer,
        body: JSON.stringify(body),
      });
      setProgram((prev) =>
        prev
          ? {
              ...prev,
              campain: updated,
            }
          : null
      );
      setProgSlug(updated.slug ?? "");
      await loadApplications();
      await loadProgram();
      notifyMerchantCampainListChanged();
    } catch (e) {
      setProgramErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingProgram(false);
    }
  }

  async function acceptApp(id: string) {
    if (!bearer) return;
    setAppAction(id);
    try {
      await fetchJson(withMerchantCampainQuery(`/api/v1/merchant/applications/${encodeURIComponent(id)}/accept`, selectedCampainId), {
        method: "POST",
        token: bearer,
      });
      await loadApplications();
      await loadProgram();
      await loadDashboard();
    } catch (e) {
      setProgramErr(e instanceof Error ? e.message : "Accept failed");
    } finally {
      setAppAction(null);
    }
  }

  async function rejectApp(id: string) {
    if (!bearer) return;
    setAppAction(id);
    try {
      await fetchJson(withMerchantCampainQuery(`/api/v1/merchant/applications/${encodeURIComponent(id)}/reject`, selectedCampainId), {
        method: "POST",
        token: bearer,
      });
      await loadApplications();
      await loadProgram();
    } catch (e) {
      setProgramErr(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setAppAction(null);
    }
  }

  async function saveShopify() {
    if (!bearer) return;
    setStoreSaving("shopify");
    setProgramErr(null);
    try {
      await fetchJson(withMerchantCampainQuery("/api/v1/merchant/integrations/shopify", selectedCampainId), {
        method: "POST",
        token: bearer,
        body: JSON.stringify({ shop_domain: shopDomain.trim() }),
      });
      setShopDomain("");
      await loadProgram();
    } catch (e) {
      setProgramErr(e instanceof Error ? e.message : "Shopify link failed");
    } finally {
      setStoreSaving(null);
    }
  }

  async function saveWoo() {
    if (!bearer) return;
    setStoreSaving("woo");
    setProgramErr(null);
    try {
      const res = await fetchJson<WooSaveResponse>(
        withMerchantCampainQuery("/api/v1/merchant/integrations/woocommerce", selectedCampainId),
        {
          method: "POST",
          token: bearer,
          body: JSON.stringify({ site_base_url: wooUrl.trim() }),
        }
      );
      if (res.webhook_signing_secret) {
        setWooSecretFlash(res.webhook_signing_secret);
      }
      setWooUrl("");
      await loadProgram();
    } catch (e) {
      setProgramErr(e instanceof Error ? e.message : "WooCommerce link failed");
    } finally {
      setStoreSaving(null);
    }
  }

  async function rotateWooSecret() {
    if (!bearer) return;
    setStoreSaving("woo_rotate");
    setProgramErr(null);
    try {
      const res = await fetchJson<{ webhook_signing_secret: string; copy_hint?: string }>(
        withMerchantCampainQuery("/api/v1/merchant/integrations/woocommerce/rotate-secret", selectedCampainId),
        { method: "POST", token: bearer }
      );
      setWooSecretFlash(res.webhook_signing_secret);
      await loadProgram();
    } catch (e) {
      setProgramErr(e instanceof Error ? e.message : "Could not rotate secret");
    } finally {
      setStoreSaving(null);
    }
  }

  const pendingTotal =
    (program?.pending_applications_count ?? 0) + (program?.pending_invites_count ?? 0);

  return (
    <div className="space-y-8">
      {programErr ? (
        <p className="text-sm text-destructive whitespace-pre-wrap">{programErr}</p>
      ) : null}

      {!bearer && !authLoading ? (
        <p className="text-sm text-destructive">
          Sign in on the{" "}
          <Link to="/login" className="text-primary underline-offset-4 hover:underline">
            Log in
          </Link>{" "}
          page with a merchant account. On Overview you can paste a dev JWT if needed.
        </p>
      ) : null}

      {!hideActiveCampainBar && bearer ? <MerchantActiveCampainBar /> : null}

      {view === "overview" ? (
        <>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sales, affiliates, and commissions for the active campaign. Use the sidebar for campaigns list &amp;
              settings, partner requests, store integrations, and email invites.
            </p>
          </div>
          {bearer && pendingTotal > 0 ? (
            <div
              className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
              role="status"
            >
              <span className="font-medium">Activity:</span>{" "}
              {program?.pending_applications_count ? (
                <span>
                  {program.pending_applications_count} partner join request
                  {program.pending_applications_count === 1 ? "" : "s"} pending
                </span>
              ) : null}
              {program?.pending_applications_count && program?.pending_invites_count ? " · " : null}
              {program?.pending_invites_count ? (
                <span>
                  {program.pending_invites_count} invite{program.pending_invites_count === 1 ? "" : "s"} waiting for
                  partners to accept
                </span>
              ) : null}
              . (Email alerts are not wired yet — use this dashboard.)
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Button type="button" variant="secondary" onClick={() => void loadDashboard()} disabled={loading}>
              {loading ? "Refreshing…" : "Refresh metrics"}
            </Button>
          </div>

          {err ? <p className="text-sm text-destructive whitespace-pre-wrap">{err}</p> : null}

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
                  <CardDescription>By total commission volume in {data.summary.campain_name}</CardDescription>
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
          ) : !err && bearer ? (
            <p className="text-sm text-muted-foreground">Set a token or sign in to load metrics.</p>
          ) : null}
        </>
      ) : null}

      {view === "program" && bearer ? (
        <>
          {!embeddedProgram ? (
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Affiliate campaign</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Program story, commission defaults for new partners, discovery listing, and join policy.
              </p>
            </div>
          ) : null}
          <Card>
            <CardHeader>
              <CardTitle>Campaign details</CardTitle>
              <CardDescription>
                Shown on the public campaign page when discovery is on. Invite links still use{" "}
                <Link to="/company/invites" className="text-primary underline-offset-4 hover:underline">
                  Email invites
                </Link>
                .
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {programLoading ? (
                <p className="text-sm text-muted-foreground">Loading program…</p>
              ) : program ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pname">Campaign name</Label>
                      <Input id="pname" value={progName} onChange={(e) => setProgName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pslug">Public URL slug (optional)</Label>
                      <Input
                        id="pslug"
                        placeholder="my-brand"
                        value={progSlug}
                        onChange={(e) => setProgSlug(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Shown when discovery is on. Leave empty to hide from slug-based links.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ptag">Tagline (optional)</Label>
                    <Input
                      id="ptag"
                      placeholder="Short pitch for partners"
                      value={progTagline}
                      onChange={(e) => setProgTagline(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pdesc">Description (optional)</Label>
                    <textarea
                      id="pdesc"
                      rows={4}
                      value={progDescription}
                      onChange={(e) => setProgDescription(e.target.value)}
                      placeholder="What you sell, who should promote you, payout expectations…"
                      className={cn(
                        "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      )}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pbrand">Brand website (optional)</Label>
                      <Input
                        id="pbrand"
                        type="url"
                        placeholder="https://yourstore.com"
                        value={progBrandUrl}
                        onChange={(e) => setProgBrandUrl(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pterms">Program terms URL (optional)</Label>
                      <Input
                        id="pterms"
                        type="url"
                        placeholder="https://yourstore.com/affiliate-terms"
                        value={progTermsUrl}
                        onChange={(e) => setProgTermsUrl(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pcom">Default commission for new partners (%)</Label>
                      <Input
                        id="pcom"
                        inputMode="decimal"
                        placeholder="10"
                        value={progCommissionPct}
                        onChange={(e) => setProgCommissionPct(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Applied when you accept join requests, open enrollment, or an invite is accepted.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pattr">Attribution window (days)</Label>
                      <Input
                        id="pattr"
                        inputMode="numeric"
                        placeholder="30"
                        value={progAttrDays}
                        onChange={(e) => setProgAttrDays(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Shown to partners; order matching uses your store setup.</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-input"
                        checked={progDiscovery}
                        onChange={(e) => setProgDiscovery(e.target.checked)}
                      />
                      List on public campaigns page
                    </label>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="pmode" className="text-sm text-muted-foreground">
                        Join policy
                      </Label>
                      <select
                        id="pmode"
                        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                        value={progMode}
                        onChange={(e) => setProgMode(e.target.value)}
                      >
                        <option value="invite_only">Invite only</option>
                        <option value="request_to_join">Request to join (you approve)</option>
                        <option value="open">Open (auto-join if capacity allows)</option>
                      </select>
                    </div>
                  </div>
                  <Button type="button" onClick={() => void saveProgram()} disabled={savingProgram}>
                    {savingProgram ? "Saving…" : "Save campaign"}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Program settings load when your account has a campain.</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}

      {view === "partners" && bearer ? (
        <>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Partner requests</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              When someone applies with &quot;request to join&quot;, approve or reject them here.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Pending requests</CardTitle>
              <CardDescription>Join requests awaiting your decision.</CardDescription>
            </CardHeader>
            <CardContent>
              {appLoading ? (
                <p className="text-sm text-muted-foreground">Loading requests…</p>
              ) : applications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending join requests.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4">Email</th>
                        <th className="pb-2 pr-4">User ID</th>
                        <th className="pb-2 pr-4">Requested</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((a) => (
                        <tr key={a.id} className="border-b border-border/50">
                          <td className="py-2 pr-4">{a.applicant_email ?? "—"}</td>
                          <td className="py-2 pr-4 font-mono text-xs">{a.applicant_user_id ?? "—"}</td>
                          <td className="py-2 pr-4 text-muted-foreground">
                            {new Date(a.created_at).toLocaleString()}
                          </td>
                          <td className="py-2 space-x-2">
                            <Button
                              size="sm"
                              variant="default"
                              disabled={appAction === a.id}
                              onClick={() => void acceptApp(a.id)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={appAction === a.id}
                              onClick={() => void rejectApp(a.id)}
                            >
                              Reject
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}

      {view === "integrations" && bearer ? (
        <>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Store integrations</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Link your Shopify shop and WordPress / WooCommerce site. Each merchant has their own configuration.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Shopify &amp; WooCommerce</CardTitle>
              <CardDescription>
                Follow the steps, copy webhook URLs, then save your domain or site URL. WooCommerce uses a signing
                secret stored only for your program.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {program?.linked_stores ? (
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span>
                    Shopify:{" "}
                    <span className="text-foreground">{program.linked_stores.shopify_domain ?? "Not linked"}</span>
                  </span>
                  <span>
                    WooCommerce:{" "}
                    <span className="text-foreground">{program.linked_stores.woocommerce_site_url ?? "Not linked"}</span>
                  </span>
                  <span>
                    Woo signing secret:{" "}
                    <span className="text-foreground">
                      {program.linked_stores.woocommerce_signing_secret_set ? "Saved" : "Not set yet"}
                    </span>
                  </span>
                </div>
              ) : null}

              <div className="space-y-4 rounded-lg border bg-card/50 p-4">
                <h3 className="text-sm font-semibold text-foreground">Shopify (your shop only)</h3>
                {integrationSetup?.shopify?.steps?.length ? (
                  <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                    {integrationSetup.shopify.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-muted-foreground">Loading steps…</p>
                )}
                {integrationSetup?.shopify?.webhook_delivery_url ? (
                  <CopyField label="Webhook URL" value={integrationSetup.shopify.webhook_delivery_url} />
                ) : null}
                <div className="space-y-2 max-w-md">
                  <Label htmlFor="shop">Your .myshopify.com domain</Label>
                  <Input
                    id="shop"
                    placeholder="your-store.myshopify.com"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={storeSaving === "shopify"}
                    onClick={() => void saveShopify()}
                  >
                    {storeSaving === "shopify" ? "Saving…" : "Save Shopify store"}
                  </Button>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border bg-card/50 p-4">
                <h3 className="text-sm font-semibold text-foreground">WooCommerce (your site only)</h3>
                {integrationSetup?.woocommerce?.steps?.length ? (
                  <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                    {integrationSetup.woocommerce.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-muted-foreground">Loading steps…</p>
                )}
                {integrationSetup?.woocommerce?.webhook_delivery_url ? (
                  <CopyField label="Webhook URL" value={integrationSetup.woocommerce.webhook_delivery_url} />
                ) : null}
                {wooSecretFlash ? (
                  <div className="rounded-md border border-primary/40 bg-primary/5 p-3 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Paste this into WooCommerce → Webhooks → Secret (copy now; it is not shown again after you leave
                      this page).
                    </p>
                    <CopyField label="Signing secret" value={wooSecretFlash} />
                    <Button type="button" size="sm" variant="ghost" onClick={() => setWooSecretFlash(null)}>
                      Dismiss
                    </Button>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={storeSaving === "woo_rotate" || !program?.linked_stores?.woocommerce_site_url}
                    onClick={() => void rotateWooSecret()}
                  >
                    {storeSaving === "woo_rotate" ? "Generating…" : "New WooCommerce signing secret"}
                  </Button>
                </div>
                <div className="space-y-2 max-w-lg">
                  <Label htmlFor="woo">Your WordPress site URL (same as Settings → General)</Label>
                  <Input
                    id="woo"
                    placeholder="https://your-wordpress-site.com"
                    value={wooUrl}
                    onChange={(e) => setWooUrl(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={storeSaving === "woo"}
                    onClick={() => void saveWoo()}
                  >
                    {storeSaving === "woo" ? "Saving…" : "Save WooCommerce site"}
                  </Button>
                </div>
              </div>

              {program?.webhook_note ? <p className="text-xs text-muted-foreground">{program.webhook_note}</p> : null}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
      <p className="text-xs text-muted-foreground shrink-0 pt-2 sm:w-28">{label}</p>
      <code className="min-w-0 flex-1 rounded-md border bg-muted/40 px-2 py-2 text-xs break-all">{value}</code>
      <Button type="button" size="sm" variant="outline" className="shrink-0" onClick={() => void copyToClipboard(value)}>
        Copy
      </Button>
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
