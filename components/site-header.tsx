"use client";

import Link from "next/link";
import { Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAccessToken } from "@/hooks/use-access-token";

export function SiteHeader() {
  const { token, loading } = useAccessToken();
  const router = useRouter();
  const authed = Boolean(token);

  function signOut() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("affilflow_jwt");
      window.dispatchEvent(new Event("affilflow-token"));
    }
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/75 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Layers className="size-4" aria-hidden />
          </span>
          AffilFlow
        </Link>
        <nav className="hidden items-center gap-1 text-sm text-muted-foreground lg:flex">
          <Link
            href="/#merchants"
            className="rounded-md px-3 py-2 transition-colors hover:bg-muted hover:text-foreground"
          >
            Companies
          </Link>
          <Link
            href="/#affiliates"
            className="rounded-md px-3 py-2 transition-colors hover:bg-muted hover:text-foreground"
          >
            Affiliates
          </Link>
          <Link
            href="/directory"
            className="rounded-md px-3 py-2 transition-colors hover:bg-muted hover:text-foreground"
          >
            Programs
          </Link>
          <Link
            href="/company/dashboard"
            className="rounded-md px-3 py-2 transition-colors hover:bg-muted hover:text-foreground"
          >
            Merchant app
          </Link>
          <Link
            href="/affiliate/dashboard"
            className="rounded-md px-3 py-2 transition-colors hover:bg-muted hover:text-foreground"
          >
            Partner app
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {!loading && authed ? (
            <button
              type="button"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "hidden sm:inline-flex"
              )}
              onClick={() => signOut()}
            >
              Sign out
            </button>
          ) : !loading ? (
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "hidden sm:inline-flex"
              )}
            >
              Log in
            </Link>
          ) : null}
          {!loading && !authed ? (
            <Link href="/register" className={cn(buttonVariants({ size: "sm" }), "rounded-full")}>
              Get started
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
