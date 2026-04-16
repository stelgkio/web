"use client";

import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAccessToken } from "@/hooks/use-access-token";
import { useMerchantCampainId } from "@/hooks/use-merchant-campain-id";
import { fetchJson } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const MERCHANT_CAMPAIN_LIST_CHANGED = "affilflow-merchant-campains-changed";

export function notifyMerchantCampainListChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MERCHANT_CAMPAIN_LIST_CHANGED));
  }
}

type CampainOption = { id: string; name: string };

export function MerchantActiveCampainBar() {
  const { pathname } = useLocation();
  const { token: bearer, loading: authLoading } = useAccessToken();
  const { campainId: selectedCampainId, setCampainId } = useMerchantCampainId();
  const [campainOptions, setCampainOptions] = useState<CampainOption[]>([]);
  const onCampainsPage = pathname.endsWith("/campains") || pathname.endsWith("/company/campains");

  const loadCampainOptions = useCallback(async () => {
    if (authLoading || !bearer) {
      setCampainOptions([]);
      return;
    }
    try {
      const res = await fetchJson<{ campains: CampainOption[] }>("/api/v1/merchant/campains", {
        method: "GET",
        token: bearer,
      });
      setCampainOptions(Array.isArray(res.campains) ? res.campains : []);
    } catch {
      setCampainOptions([]);
    }
  }, [bearer, authLoading]);

  useEffect(() => {
    void loadCampainOptions();
  }, [loadCampainOptions]);

  useEffect(() => {
    const on = () => void loadCampainOptions();
    window.addEventListener(MERCHANT_CAMPAIN_LIST_CHANGED, on);
    return () => window.removeEventListener(MERCHANT_CAMPAIN_LIST_CHANGED, on);
  }, [loadCampainOptions]);

  if (!bearer) return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 px-4 py-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 max-w-md flex-1 space-y-2">
        <Label htmlFor="merchant-campain-pick">Active campaign</Label>
        <select
          id="merchant-campain-pick"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          value={selectedCampainId}
          onChange={(e) => setCampainId(e.target.value)}
        >
          <option value="">Account default</option>
          {campainOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Metrics, partner requests, and integrations use this campaign until you clear the selection.
        </p>
      </div>
      {onCampainsPage ? (
        <a
          href="#merchant-campaign-list"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex w-full shrink-0 justify-center sm:w-auto")}
        >
          Jump to list
        </a>
      ) : (
        <Link
          to="/company/campains#merchant-campaign-list"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex w-full shrink-0 justify-center sm:w-auto")}
        >
          Manage campaigns
        </Link>
      )}
    </div>
  );
}
