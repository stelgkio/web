import { Link } from "react-router-dom";
import { DevTokenBar } from "@/components/dev-token";
import { InviteForm } from "./invite-form";

export default function AdminInvitePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Home
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invite affiliate</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Requires the <code className="text-xs">admin</code> realm role. Paste a JWT, enter your organization
          UUID, then create a shareable link for Instagram DMs and similar.
        </p>
      </div>
      <DevTokenBar />
      <InviteForm />
    </div>
  );
}
