import { InviteForm } from "@/app/admin/invite/invite-form";

export default function CompanyInvitesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Email invites</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a shareable link partners can open after they sign in to join your program.
        </p>
      </div>
      <InviteForm />
    </div>
  );
}
