import Link from "next/link";
import { apiUrl } from "@/lib/api";
import type { Organization } from "@/lib/types";
import { DevTokenBar } from "@/components/dev-token";
import { DirectoryApply } from "./directory-apply";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function loadPrograms(): Promise<Organization[]> {
  try {
    const res = await fetch(apiUrl("/api/v1/directory/programs"), {
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      return [];
    }
    const data: unknown = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function DirectoryPage() {
  const programs = await loadPrograms();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="space-y-2">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          ← Home
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Program directory</h1>
        <p className="text-muted-foreground text-sm">
          Organizations that opted into public discovery. Apply requires a logged-in Keycloak user token
          (paste JWT below for local dev).
        </p>
      </div>
      <DevTokenBar />
      <div className="space-y-4">
        {programs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No programs listed — start the API or enable discovery on an organization.
          </p>
        ) : (
          programs.map((o) => (
            <Card key={o.id}>
              <CardHeader>
                <CardTitle>{o.name}</CardTitle>
                <CardDescription>
                  Approval: {o.approval_mode.replace(/_/g, " ")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DirectoryApply org={o} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
