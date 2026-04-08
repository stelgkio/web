"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
function AuthCallbackInner() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    const token = sp.get("token");
    if (token && typeof window !== "undefined") {
      window.localStorage.setItem("affilflow_jwt", token);
      window.dispatchEvent(new Event("affilflow-token"));
    }
    router.replace("/");
  }, [router, sp]);

  return (
    <main className="mx-auto max-w-lg flex-1 px-4 py-16">
      <p className="text-sm text-muted-foreground">Finishing sign-in…</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted-foreground">Loading…</p>}>
      <AuthCallbackInner />
    </Suspense>
  );
}
