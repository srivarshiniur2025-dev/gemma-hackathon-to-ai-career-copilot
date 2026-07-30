"use client";

import { MessageSquare, Settings } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { DEMO_DASHBOARD_USER } from "@/lib/dashboard-data";
import { Button } from "@/components/ui/button";

export function DashboardProfileHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="mx-4 my-4 flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-border bg-white p-5 shadow-[0_2px_8px_rgba(24,24,27,0.04)] sm:mx-6"
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white"
          style={{ backgroundColor: DEMO_DASHBOARD_USER.avatarColor }}
        >
          {DEMO_DASHBOARD_USER.initials}
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground-heading">{DEMO_DASHBOARD_USER.name}</h2>
          <p className="text-sm text-muted">{DEMO_DASHBOARD_USER.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2 rounded-xl cursor-pointer">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Messages</span>
        </Button>
        <Link href="/settings">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl cursor-pointer">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
