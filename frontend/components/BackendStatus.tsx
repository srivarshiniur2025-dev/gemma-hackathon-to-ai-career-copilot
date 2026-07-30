"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getCachedHealth, setCachedHealth } from "@/lib/health-cache";

export default function BackendStatus() {
  const cached = getCachedHealth();
  const [status, setStatus] = useState<"checking" | "online" | "offline">(
    cached ? "online" : "checking"
  );
  const [model, setModel] = useState(cached?.model ?? "");
  const [version, setVersion] = useState(cached?.version ?? "Gemma 4");

  useEffect(() => {
    const initial = getCachedHealth();
    if (initial) {
      setStatus("online");
      setModel(initial.model);
      if (initial.version) setVersion(initial.version);
    }

    api
      .health()
      .then((res) => {
        setCachedHealth(res);
        setStatus("online");
        setModel(res.model);
        if (res.version) setVersion(res.version);
      })
      .catch(() => {
        if (!initial) setStatus("offline");
      });
  }, []);

  if (status === "checking") return <span className="text-xs text-muted">Connecting...</span>;
  if (status === "offline") {
    return (
      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
        Backend offline
      </span>
    );
  }
  return (
    <span className="rounded-full border border-border bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
      Online · {version} · {model}
    </span>
  );
}
