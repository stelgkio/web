"use client";

import { useState } from "react";
import { fetchJson } from "@/lib/api";
import type { Organization } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { getStoredToken } from "@/components/dev-token";

export function DirectoryApply({ org }: { org: Organization }) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function apply() {
    const token = getStoredToken();
    if (!token) {
      setStatus("Set an API token above first.");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      await fetchJson(`/api/v1/directory/programs/${org.id}/apply`, {
        method: "POST",
        token,
        body: JSON.stringify({}),
      });
      setStatus("Application submitted.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Button size="sm" disabled={loading} onClick={apply}>
        {loading ? "Applying…" : "Apply"}
      </Button>
      {status ? <span className="text-sm text-muted-foreground">{status}</span> : null}
    </div>
  );
}
