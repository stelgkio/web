import { Suspense } from "react";
import { Link, useParams } from "react-router-dom";
import { JoinInviteClient } from "./join-client";

export default function JoinPage() {
  const { token } = useParams();
  const inviteToken = token ?? "";

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-16">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Home
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Campaign invite</h1>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        Sign in with Google or Facebook, then you&apos;ll join this program automatically.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
          <JoinInviteClient token={inviteToken} />
        </Suspense>
      </div>
    </main>
  );
}
