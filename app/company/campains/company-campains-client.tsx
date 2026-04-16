"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccessToken } from "@/hooks/use-access-token";
import { useMerchantCampainId } from "@/hooks/use-merchant-campain-id";
import { fetchJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { notifyMerchantCampainListChanged } from "@/components/merchant-app/merchant-active-campain-bar";

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

type CampainsListResponse = {
  campains: Campain[];
  default_campain_id: string | null;
};

export function CompanyCampainsClient() {
  const { token: bearer, loading: authLoading } = useAccessToken();
  const { campainId: uiSelection, setCampainId } = useMerchantCampainId();
  const [list, setList] = useState<Campain[]>([]);
  const [defaultId, setDefaultId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newTagline, setNewTagline] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newBrandUrl, setNewBrandUrl] = useState("");
  const [newTermsUrl, setNewTermsUrl] = useState("");
  const [newCommissionPct, setNewCommissionPct] = useState("10");
  const [newAttrDays, setNewAttrDays] = useState("30");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (authLoading || !bearer) {
      setList([]);
      setDefaultId(null);
      return;
    }
    setErr(null);
    try {
      const res = await fetchJson<CampainsListResponse>("/api/v1/merchant/campains", {
        method: "GET",
        token: bearer,
      });
      setList(Array.isArray(res.campains) ? res.campains : []);
      setDefaultId(res.default_campain_id ?? null);
    } catch (e) {
      setList([]);
      setDefaultId(null);
      setErr(e instanceof Error ? e.message : "Failed to load programs");
    }
  }, [bearer, authLoading]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createCampain() {
    if (!bearer) return;
    const name = newName.trim();
    if (!name) {
      setErr("Enter a campaign name.");
      return;
    }
    const pct = parseFloat(newCommissionPct.replace(",", "."));
    if (Number.isNaN(pct) || pct <= 0 || pct > 100) {
      setErr("Default commission must be a percent between 0 and 100.");
      return;
    }
    const days = parseInt(newAttrDays, 10);
    if (Number.isNaN(days) || days < 1 || days > 365) {
      setErr("Attribution window must be between 1 and 365 days.");
      return;
    }
    setBusy("create");
    setErr(null);
    try {
      await fetchJson<Campain>("/api/v1/merchant/campains", {
        method: "POST",
        token: bearer,
        body: JSON.stringify({
          name,
          tagline: newTagline.trim() || undefined,
          description: newDescription.trim() || undefined,
          brand_website_url: newBrandUrl.trim() || undefined,
          terms_url: newTermsUrl.trim() || undefined,
          default_commission_rate: pct / 100,
          attribution_window_days: days,
        }),
      });
      setNewName("");
      setNewTagline("");
      setNewDescription("");
      setNewBrandUrl("");
      setNewTermsUrl("");
      setNewCommissionPct("10");
      setNewAttrDays("30");
      await load();
      notifyMerchantCampainListChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(null);
    }
  }

  async function setDefault(id: string) {
    if (!bearer) return;
    setBusy(`default:${id}`);
    setErr(null);
    try {
      await fetchJson(`/api/v1/merchant/campains/${encodeURIComponent(id)}/set-default`, {
        method: "POST",
        token: bearer,
      });
      await load();
      notifyMerchantCampainListChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not set default");
    } finally {
      setBusy(null);
    }
  }

  async function removeCampain(id: string) {
    if (!bearer) return;
    const row = list.find((c) => c.id === id);
    const label = row?.name ?? id;
    if (
      !window.confirm(
        `Delete program “${label}”? This removes its affiliates, applications, invites, and store links for that program.`
      )
    ) {
      return;
    }
    setBusy(`del:${id}`);
    setErr(null);
    try {
      await fetchJson(`/api/v1/merchant/campains/${encodeURIComponent(id)}`, {
        method: "DELETE",
        token: bearer,
      });
      if (uiSelection === id) setCampainId("");
      await load();
      notifyMerchantCampainListChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div id="merchant-campaign-list" className="space-y-8 scroll-mt-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your campaigns</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a campaign below, then edit its details in the next section. Use &quot;Use in dashboard&quot; to focus
          a row, or the active campaign bar at the top of the page.
        </p>
      </div>

      {err ? <p className="text-sm text-destructive whitespace-pre-wrap">{err}</p> : null}

      {!bearer && !authLoading ? (
        <p className="text-sm text-muted-foreground">Sign in to manage campaigns.</p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>New affiliate campaign</CardTitle>
          <CardDescription>
            Affiliates, store links, and billing are scoped per campaign. You can edit discovery and join rules after
            create.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="new-name">Campaign name</Label>
              <Input
                id="new-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. EU spring launch"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="new-tag">Tagline (optional)</Label>
              <Input
                id="new-tag"
                value={newTagline}
                onChange={(e) => setNewTagline(e.target.value)}
                placeholder="One line for the public directory"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="new-desc">Description (optional)</Label>
              <textarea
                id="new-desc"
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="What partners promote, payout cadence, audience fit…"
                className={cn(
                  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-brand">Brand website (optional)</Label>
              <Input
                id="new-brand"
                type="url"
                value={newBrandUrl}
                onChange={(e) => setNewBrandUrl(e.target.value)}
                placeholder="https://"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-terms">Terms URL (optional)</Label>
              <Input
                id="new-terms"
                type="url"
                value={newTermsUrl}
                onChange={(e) => setNewTermsUrl(e.target.value)}
                placeholder="https://"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-com">Default commission (%)</Label>
              <Input
                id="new-com"
                inputMode="decimal"
                value={newCommissionPct}
                onChange={(e) => setNewCommissionPct(e.target.value)}
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-attr">Attribution window (days)</Label>
              <Input
                id="new-attr"
                inputMode="numeric"
                value={newAttrDays}
                onChange={(e) => setNewAttrDays(e.target.value)}
                placeholder="30"
              />
            </div>
          </div>
          <Button type="button" onClick={() => void createCampain()} disabled={!!busy || !bearer}>
            {busy === "create" ? "Creating…" : "Create campaign"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your campaigns</CardTitle>
          <CardDescription>
            The account default is used until you pick another campaign in the merchant header strip.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {list.length === 0 && bearer ? (
            <p className="text-sm text-muted-foreground">No campaigns yet — create one above.</p>
          ) : null}
          {list.length > 0 ? (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">Default %</th>
                    <th className="p-3 font-medium">Slug</th>
                    <th className="p-3 font-medium">ID</th>
                    <th className="p-3 font-medium w-[1%] whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((c) => {
                    const isDefault = defaultId === c.id;
                    return (
                      <tr key={c.id} className="border-b border-border/60 last:border-0">
                        <td className="p-3">
                          <span className="font-medium">{c.name}</span>
                          {isDefault ? (
                            <span className="ml-2 rounded bg-primary/15 px-1.5 py-0.5 text-xs text-primary">
                              default
                            </span>
                          ) : null}
                        </td>
                        <td className="p-3 tabular-nums text-muted-foreground">
                          {typeof c.default_commission_rate === "number"
                            ? `${Math.round(c.default_commission_rate * 10000) / 100}%`
                            : "—"}
                        </td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{c.slug ?? "—"}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{c.id}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            {!isDefault ? (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled={!!busy}
                                onClick={() => void setDefault(c.id)}
                              >
                                {busy === `default:${c.id}` ? "…" : "Set default"}
                              </Button>
                            ) : null}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={!!busy}
                              onClick={() => {
                                setCampainId(c.id);
                              }}
                            >
                              Use in dashboard
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              disabled={!!busy}
                              onClick={() => void removeCampain(c.id)}
                            >
                              {busy === `del:${c.id}` ? "…" : "Delete"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
