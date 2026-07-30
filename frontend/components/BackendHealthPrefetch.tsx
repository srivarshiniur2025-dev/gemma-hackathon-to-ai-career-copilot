"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import { setCachedHealth } from "@/lib/health-cache";

/** Prefetch backend health on app load so dashboard routes connect faster. */
export function BackendHealthPrefetch() {
  useEffect(() => {
    api.health().then(setCachedHealth).catch(() => {});
  }, []);
  return null;
}
