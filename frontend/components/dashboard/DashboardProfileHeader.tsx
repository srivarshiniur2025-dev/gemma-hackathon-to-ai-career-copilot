"use client";

import { ClipboardCheck, FlaskConical, MessageSquare, Mic, Settings } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { experienceForProfile, showsExamMocks, showsMockInterviews } from "@/lib/learner-track";
import { Button } from "@/components/ui/button";

export function DashboardProfileHeader() {
  const { displayName, subtitle, initials, profile } = useCareerProfile();
  const exam = showsExamMocks(profile);
  const interview = showsMockInterviews(profile);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="mx-4 my-4 flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-border bg-white p-5 shadow-[0_2px_8px_rgba(24,24,27,0.04)] sm:mx-6"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-lg font-bold text-white">
          {initials}
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground-heading">{displayName}</h2>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/planner#copilot">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl cursor-pointer">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Ask Gemma</span>
          </Button>
        </Link>
        {exam ? (
          <Link href="/mocks">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl cursor-pointer">
              <FlaskConical className="h-4 w-4" />
              <span className="hidden sm:inline">
                {experienceForProfile(profile) === "school" ? "Practice" : "Mocks"}
              </span>
            </Button>
          </Link>
        ) : (
          <Link href="/assessment">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl cursor-pointer">
              <ClipboardCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Assess</span>
            </Button>
          </Link>
        )}
        {interview ? (
          <Link href="/interview">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl cursor-pointer">
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">Interview</span>
            </Button>
          </Link>
        ) : (
          <Link href="/settings">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl cursor-pointer">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
