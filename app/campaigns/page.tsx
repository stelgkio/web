import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "@/lib/api";

type Campaign = {
  id: string;
  name: string;
  slug: string | null;
  approval_mode: "open" | "request_to_join" | "invite_only";
  discovery_enabled: boolean;
};

async function loadCampaigns(): Promise<Campaign[]> {
  try {
    const res = await fetch(apiUrl("/api/v1/campaigns"));
    if (!res.ok) {
      return [];
    }
    const data: unknown = await res.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return data as Campaign[];
  } catch {
    return [];
  }
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    let mounted = true;
    void loadCampaigns().then((data) => {
      if (mounted) setCampaigns(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="space-y-2">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">
          ← Home
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Public campaigns</h1>
        <p className="text-muted-foreground text-sm">
          Current campaigns that are visible to everyone.
        </p>
      </div>
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No public campaigns yet — start the API or seed discoverable organizations.
          </p>
        ) : (
          campaigns.map((campaign) => {
            const to = campaign.slug ? `/campaigns/${campaign.slug}` : `/campaigns/${campaign.id}`;
            return (
              <Link
                key={campaign.id}
                to={to}
                className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <h2 className="text-lg font-medium">{campaign.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Slug: {campaign.slug ?? "n/a"} | Approval: {campaign.approval_mode.replace(/_/g, " ")}
                </p>
                <p className="mt-2 text-sm">
                  Visibility: {campaign.discovery_enabled ? "public" : "private"}
                </p>
                <p className="mt-3 text-sm font-medium text-primary">View campaign →</p>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
