"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Flame, Sparkles, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { useSchoolInsights, type SchoolInsights } from "@/lib/school/insights";
import { SYLLABUS_SESSION, subjectLabel } from "@/lib/school/syllabus";
import { CATALOG_COUNTS } from "@/lib/neet/catalog";
import { loadMockProgress, mockStats } from "@/lib/neet/progress";
import { loadSkillProgress, skillStats } from "@/lib/skills/progress";
import { dashboardHeading, experienceForProfile } from "@/lib/learner-track";
import { Button } from "@/components/ui/button";

function schoolCopy(first: string, s: SchoolInsights | null) {
  const course = s ? `Class ${s.pick.classLevel} ${subjectLabel(s.pick.subject)}` : "your syllabus";
  if (!s || s.quizzesTaken === 0) {
    const ch = s?.nextUp?.chapter;
    return {
      line: `Let's get started, ${first}.`,
      sub: `Your first ${course} test takes about 5 minutes. Your accuracy, streak and weak chapters will appear here once you're done (${SYLLABUS_SESSION} syllabus).`,
      cta: ch ? `Start Ch ${ch.number}: ${ch.name}` : "Open Chapter Practice",
      href: ch ? `/mocks?chapter=${ch.id}` : "/mocks",
    };
  }
  const acc = s.accuracy != null ? `${s.accuracy}% accuracy` : "";
  const progress = `${s.level.name} · ${acc} · ${s.testedCount}/${s.chapters.length} ${course} chapters tested · ~${s.daysToExams} days to exams.`;
  if (s.weakest) {
    const ch = s.weakest.chapter;
    return {
      line: `${s.streak > 1 ? `${s.streak}-day streak, ${first}!` : `Welcome back, ${first}.`} Let's fix Ch ${ch.number}.`,
      sub: `${ch.name} is at ${s.weakest.mastery}%, your weakest chapter. ${progress}`,
      cta: `Retake Ch ${ch.number} test`,
      href: `/mocks?chapter=${ch.id}`,
    };
  }
  if (s.nextUp) {
    const ch = s.nextUp.chapter;
    return {
      line: `Nice work, ${first}. Ch ${ch.number} is next.`,
      sub: `Every chapter you've tested is above 80%. ${progress}`,
      cta: `Start Ch ${ch.number}: ${ch.name}`,
      href: `/mocks?chapter=${ch.id}`,
    };
  }
  return {
    line: `All of ${course} mastered, ${first}!`,
    sub: `${progress} Keep it sharp with a Quiz Blitz or try the other subject.`,
    cta: "Play Quiz Blitz",
    href: "/activities",
  };
}

export function TrackHero() {
  const { displayName, profile, career } = useCareerProfile();
  const { user } = useAuth();
  const exp = experienceForProfile(profile);
  const first = displayName.split(" ")[0];
  const [completed, setCompleted] = useState(0);
  const [pyq, setPyq] = useState(0);
  const [skillCompleted, setSkillCompleted] = useState(0);
  const [skillAvg, setSkillAvg] = useState(0);
  const school = useSchoolInsights(user?.email ?? undefined, profile?.onboarding_answers, exp === "school");

  useEffect(() => {
    if (exp === "school") return;
    if (exp === "developer") {
      const stats = skillStats(loadSkillProgress());
      setSkillCompleted(stats.completed);
      setSkillAvg(stats.avg);
      return;
    }
    const stats = mockStats(loadMockProgress());
    setCompleted(stats.completed);
    setPyq(stats.pyqAccuracy);
  }, [exp, user?.email]);

  const copy =
    exp === "developer"
      ? {
          line: `Ship something today, ${first}.`,
          sub: "Skill tests feed Gemma internship matching — then mock interviews and your resume loop.",
          cta: "Take a skill test",
          href: "/assessment",
        }
      : exp === "school"
        ? schoolCopy(first, school)
        : {
            line: `One mock before you scroll, ${first}.`,
            sub:
              exp === "high_school"
                ? "Board + entrance: chapter tests now, a full paper this week."
                : "NEET grind: NCERT, PYQ-style papers, then a full PCB mock.",
            cta: "Start a PYQ paper",
            href: "/mocks?tab=pyq",
          };

  const pills =
    exp === "developer"
      ? [
          { label: "Skill tests", value: `${skillCompleted}`, icon: Sparkles },
          { label: "Avg score", value: skillAvg ? `${skillAvg}%` : "—", icon: BookOpen },
          { label: "Streak", value: `${career.streak.count}d`, icon: Flame },
        ]
      : exp === "school"
        ? [
            { label: "Points", value: `${school?.points ?? 0}`, icon: Trophy },
            { label: "Mastered", value: `${school?.masteredCount ?? 0}/${school?.chapters.length ?? 0}`, icon: BookOpen },
            { label: "Streak", value: `${school?.streak ?? 0}d`, icon: Flame },
          ]
      : [
          { label: "Mocks", value: `${completed}`, icon: Sparkles },
          { label: "Bank", value: `${CATALOG_COUNTS.neet}+`, icon: BookOpen },
          { label: "PYQ", value: pyq ? `${pyq}%` : "—", icon: Flame },
        ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0F766E] via-[#18181B] to-[#09090B] p-6 text-white sm:p-8"
    >
      <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-accent-light/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            {dashboardHeading(profile)}
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-white sm:text-[2.1rem]">{copy.line}</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/80">{copy.sub}</p>
          <div className="mt-5">
            <Link href={copy.href}>
              <Button variant="white" className="gap-2 rounded-full">
                {copy.cta}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex gap-2">
          {pills.map((stat) => (
            <div
              key={stat.label}
              className="min-w-[88px] rounded-2xl bg-white/15 px-3 py-3 backdrop-blur-md"
            >
              <stat.icon className="mb-1 h-4 w-4 text-white/80" />
              <p className="text-lg font-extrabold">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-wide text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
