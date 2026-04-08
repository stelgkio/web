import { Suspense } from "react";
import { CampaignDetailClient } from "./campaign-detail-client";

export default function CampaignDetailPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <CampaignDetailClient />
      </Suspense>
    </div>
  );
}
