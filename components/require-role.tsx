"use client";

import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAccessToken } from "@/hooks/use-access-token";
import { useAuthRoles } from "@/hooks/use-auth-roles";

type RequireRoleProps = {
  anyOf: string[];
  children: ReactNode;
};

/**
 * Client-side route guard: requires a stored JWT and at least one allowed role.
 */
export function RequireRole({ anyOf, children }: RequireRoleProps) {
  const { token, loading: tokenLoading } = useAccessToken();
  const { roles, loading: rolesLoading } = useAuthRoles(token, tokenLoading);
  const location = useLocation();

  if (tokenLoading || rolesLoading) {
    return <div className="mx-auto max-w-3xl p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!token) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  const ok = anyOf.some((r) => roles.includes(r));
  if (!ok) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
