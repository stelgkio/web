"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const KEY = "affilflow_jwt";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

/** Local dev: paste an AffilFlow JWT for API calls (Authorization: Bearer). */
export function DevTokenBar() {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setValue(getStoredToken() ?? "");
  }, []);

  function save() {
    window.localStorage.setItem(KEY, value.trim());
    setOpen(false);
    window.dispatchEvent(new Event("affilflow-token"));
  }

  function clear() {
    window.localStorage.removeItem(KEY);
    setValue("");
    window.dispatchEvent(new Event("affilflow-token"));
  }

  return (
    <div className="rounded-lg border border-dashed p-3 text-sm bg-muted/40">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">API token (dev)</span>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(!open)}>
          {open ? "Hide" : value ? "Change" : "Set Bearer JWT"}
        </Button>
        {value ? (
          <Button type="button" variant="ghost" size="sm" onClick={clear}>
            Clear
          </Button>
        ) : null}
      </div>
      {open ? (
        <div className="mt-3 space-y-2 max-w-lg">
          <Label htmlFor="jwt">Paste access token</Label>
          <Input
            id="jwt"
            type="password"
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="eyJhbG..."
          />
          <Button type="button" size="sm" onClick={save}>
            Save to browser
          </Button>
        </div>
      ) : (
        <p className="mt-1 text-muted-foreground">
          {value
            ? "Manual token saved — it overrides the token from OAuth sign-in for API calls."
            : "Sign in with Google/Facebook or set a token to call authenticated routes."}
        </p>
      )}
    </div>
  );
}
