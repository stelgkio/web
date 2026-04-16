"use client";

import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Briefcase, LayoutDashboard, Layers, Plug, UserPlus, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useAccessToken } from "@/hooks/use-access-token";

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
    isActive
      ? "bg-primary/15 text-primary"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  );

export function MerchantAppShell() {
  const navigate = useNavigate();
  const { token, loading } = useAccessToken();

  function signOut() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("affilflow_jwt");
      window.dispatchEvent(new Event("affilflow-token"));
    }
    navigate("/", { replace: true });
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <Link
          to="/company/overview"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Layers className="size-4" aria-hidden />
          </span>
          <span className="hidden sm:inline">
            AffilFlow <span className="text-muted-foreground font-normal">Merchant</span>
          </span>
        </Link>
        <div className="flex-1" />
        <Link
          to="/"
          className="hidden text-sm text-muted-foreground hover:text-foreground md:inline-block"
        >
          Marketing site
        </Link>
        <ThemeToggle />
        {!loading && token ? (
          <button
            type="button"
            onClick={() => signOut()}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground")}
          >
            Sign out
          </button>
        ) : !loading ? (
          <Link to="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Log in
          </Link>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="shrink-0 border-b bg-muted/20 md:w-56 md:border-b-0 md:border-r">
          <nav
            className="flex gap-1 overflow-x-auto p-2 md:flex-col md:overflow-x-visible"
            aria-label="Merchant app"
          >
            <NavLink to="/company/overview" className={navClass} end>
              <LayoutDashboard className="size-4 shrink-0 opacity-80" aria-hidden />
              Overview
            </NavLink>
            <NavLink to="/company/campains" className={navClass}>
              <Briefcase className="size-4 shrink-0 opacity-80" aria-hidden />
              Campaigns
            </NavLink>
            <NavLink to="/company/partners" className={navClass}>
              <Users className="size-4 shrink-0 opacity-80" aria-hidden />
              Partner requests
            </NavLink>
            <NavLink to="/company/integrations" className={navClass}>
              <Plug className="size-4 shrink-0 opacity-80" aria-hidden />
              Store integrations
            </NavLink>
            <NavLink to="/company/invites" className={navClass}>
              <UserPlus className="size-4 shrink-0 opacity-80" aria-hidden />
              Email invites
            </NavLink>
          </nav>
        </aside>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
