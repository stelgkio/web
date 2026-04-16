"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchJson } from "@/lib/api";
import { parseAffilflowJwtRoles } from "@/lib/jwt-roles";

type MeResponse = {
  user_id: string;
  roles: string[];
};

/**
 * Reads roles from the JWT payload (fast, UI-only). Falls back to GET /api/v1/auth/me
 * if the token cannot be parsed locally.
 */
export function useAuthRoles(token: string | null, tokenLoading: boolean) {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (tokenLoading) return;
    if (!token) {
      setRoles([]);
      setLoading(false);
      return;
    }
    const parsed = parseAffilflowJwtRoles(token);
    if (parsed !== null) {
      setRoles(parsed);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const me = await fetchJson<MeResponse>("/api/v1/auth/me", { method: "GET", token });
      setRoles(Array.isArray(me.roles) ? me.roles : []);
    } catch {
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [token, tokenLoading]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    function onToken() {
      void load();
    }
    window.addEventListener("affilflow-token", onToken);
    window.addEventListener("storage", onToken);
    return () => {
      window.removeEventListener("affilflow-token", onToken);
      window.removeEventListener("storage", onToken);
    };
  }, [load]);

  return { roles, loading: tokenLoading || loading, reload: load };
}
