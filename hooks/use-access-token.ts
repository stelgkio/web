"use client";

import { useEffect, useState } from "react";
import { getStoredToken } from "@/components/dev-token";

/**
 * Bearer JWT for the AffilFlow API (stored after OAuth callback or manual dev paste).
 */
export function useAccessToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function read() {
      setToken(getStoredToken());
      setLoading(false);
    }
    read();
    window.addEventListener("storage", read);
    window.addEventListener("affilflow-token", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("affilflow-token", read);
    };
  }, []);

  return { token, loading };
}
