"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function BackendStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");
  const [model, setModel] = useState("");
  const [version, setVersion] = useState("Gemma 4");

  useEffect(() => {
    api.health()
      .then((res) => {
        setStatus("online");
        setModel(res.model);
        if (res.version) setVersion(res.version);
      })
      .catch(() => setStatus("offline"));
  }, []);

  if (status === "checking") return <span className="text-xs text-muted">Connecting...</span>;
  if (status === "offline") return <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">Backend offline</span>;
  return (
    <span className="rounded-full border border-border bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
      Online · {version} · {model}
    </span>
  );
}
