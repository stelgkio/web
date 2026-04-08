"use client";

import { useState } from "react";
import { fetchJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStoredToken } from "@/components/dev-token";

type CreateInviteResponse = {
  invite_id: string;
  invite_url: string;
  email_queued: boolean;
};

export function InviteForm() {
  const [orgId, setOrgId] = useState("");
  const [email, setEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function createInvite() {
    const token = getStoredToken();
    if (!token) {
      setErr("Set an API token first.");
      return;
    }
    const id = orgId.trim();
    if (!id) {
      setErr("Organization UUID is required.");
      return;
    }
    setLoading(true);
    setErr(null);
    setInviteUrl(null);
    try {
      const body: { email?: string } = {};
      if (email.trim()) body.email = email.trim();
      const res = await fetchJson<CreateInviteResponse>(
        `/api/v1/organizations/${encodeURIComponent(id)}/invites`,
        {
          method: "POST",
          token,
          body: JSON.stringify(body),
        }
      );
      setInviteUrl(res.invite_url);
      setOpen(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
  }

  return (
    <div className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="org">Organization ID</Label>
        <Input
          id="org"
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
          placeholder="00000000-0000-0000-0000-000000000000"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="em">Invitee email (optional)</Label>
        <Input
          id="em"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="creator@instagram.com"
        />
      </div>
      <Button disabled={loading} onClick={createInvite}>
        {loading ? "Creating…" : "Create invite"}
      </Button>
      {err ? <p className="text-sm text-destructive">{err}</p> : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite link</DialogTitle>
            <DialogDescription>
              Copy this link and send it in Instagram DM, WhatsApp, or email.
            </DialogDescription>
          </DialogHeader>
          {inviteUrl ? (
            <div className="space-y-3">
              <Input readOnly value={inviteUrl} className="font-mono text-xs" />
              <Button type="button" onClick={copyLink}>
                Copy link
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {inviteUrl && !open ? (
        <div className="rounded-md border p-3 space-y-2">
          <p className="text-sm font-medium">Shareable link</p>
          <p className="font-mono text-xs break-all">{inviteUrl}</p>
          <Button type="button" variant="secondary" size="sm" onClick={copyLink}>
            Copy link
          </Button>
        </div>
      ) : null}
    </div>
  );
}
