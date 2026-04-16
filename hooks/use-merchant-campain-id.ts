"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "affilflow_merchant_campain_id";
const CHANGE_EVENT = "affilflow-merchant-campain";

export function useMerchantCampainId() {
  const [campainId, setCampainIdState] = useState("");

  useEffect(() => {
    const read = () => {
      if (typeof window === "undefined") return;
      setCampainIdState(window.localStorage.getItem(STORAGE_KEY) ?? "");
    };
    read();
    window.addEventListener(CHANGE_EVENT, read);
    return () => window.removeEventListener(CHANGE_EVENT, read);
  }, []);

  const setCampainId = useCallback((id: string) => {
    const t = id.trim();
    if (typeof window !== "undefined") {
      if (t) window.localStorage.setItem(STORAGE_KEY, t);
      else window.localStorage.removeItem(STORAGE_KEY);
      setCampainIdState(t);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    }
  }, []);

  return { campainId, setCampainId };
}

/** Append `campain_id` when a program is selected in the merchant UI (local override). */
export function withMerchantCampainQuery(path: string, campainId: string): string {
  const t = campainId.trim();
  if (!t) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}campain_id=${encodeURIComponent(t)}`;
}
