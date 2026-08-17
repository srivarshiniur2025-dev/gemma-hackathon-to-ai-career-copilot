"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Code2, Dna, GraduationCap, Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { LEARNER_TRACKS, fallbackRoadmap, getTrack, type LearnerTrack } from "@/lib/onboarding-tracks";
import { seedPlannerEvents } from "@/lib/personalize";
import { syncSession } from "@/lib/post-auth";
import { cn } from "@/lib/utils";

const TRACK_ICONS = {
  bio: Dna,
  high_school: GraduationCap,
  grade_9_10: BookOpen,
  developer: Code2,
} as const;

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingFlow />
    </ProtectedRoute>
  );
}

function OnboardingFlow() {
  const router = useRouter();
  const { user, getIdToken } = useAuth();
  const [trackId, setTrackId] = useState<LearnerTrack | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const track = trackId ? getTrack(trackId) : null;
  const question = track?.questions[step];
  const total = track?.questions.length ?? 0;
  const currentValue = question ? answers[question.id] ?? "" : "";
  const canContinue = Boolean(currentValue.trim());

  useEffect(() => {
    if (!user) return;
    void (async () => {
      try {
        const profile = await syncSession(getIdToken, user.name);
        if (profile?.onboarding_complete) router.replace("/dashboard");
      } catch {
        /* first-time user — stay on onboarding */
      }
    })();
  }, [user, getIdToken, router]);

  const progress = useMemo(() => {
    if (!track) return 8;
    return Math.round(((step + 1) / (total + 1)) * 100);
  }, [track, step, total]);

  function selectTrack(id: LearnerTrack) {
    setTrackId(id);
    setStep(0);
    setAnswers({});
    setError("");
  }

  function goNext() {
    if (!track || !canContinue) return;
    if (step < total - 1) {
      setStep((s) => s + 1);
      return;
    }
    void finish();
  }

  async function finish() {
    if (!track || !user) return;
    setSaving(true);
    setError("");
    try {
      await syncSession(getIdToken, user.name);
      const skills =
        answers.known
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) ?? [];
      const plannerEvents = seedPlannerEvents(track.id, answers);

      await api.updateMe({
        name: user.name,
        learner_track: track.id,
        onboarding_answers: answers,
        onboarding_complete: true,
        target_role: track.targetRole,
        skills,
        interests: [track.title, answers.focus, answers.stack, answers.curiosity, answers.hardest, answers.weak_subject]
          .filter(Boolean) as string[],
        degree: answers.level || answers.grade || answers.stream || track.title,
        planner_events: plannerEvents,
      });

      try {
        await api.generateRoadmap();
      } catch {
        await api.updateMe({ roadmap: fallbackRoadmap(track, answers) });
      }

      router.push("/roadmap");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your plan");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium text-accent">Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</p>
        <h1
          className="mt-2 text-3xl font-extrabold tracking-tight text-foreground-heading"
          style={{ fontFamily: "var(--font-sora, var(--font-sans))" }}
        >
          {track ? "A few questions to shape your roadmap" : "What are you learning toward?"}
        </h1>
        <p className="mt-2 max-w-xl text-muted">
          {track
            ? `Track: ${track.title}. About ${total} questions — Gemma uses every answer for your roadmap, dashboard, and planner.`
            : "Pick the path that fits you today. We will ask a short set of questions, then generate a personalized learning roadmap."}
        </p>

        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-[#F4F4F5]">
          <motion.div
            className="h-full rounded-full bg-accent"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <AnimatePresence mode="wait">
          {!track && (
            <motion.div
              key="tracks"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-10 grid gap-4 sm:grid-cols-2"
            >
              {LEARNER_TRACKS.map((item) => {
                const Icon = TRACK_ICONS[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectTrack(item.id)}
                    className="cursor-pointer rounded-[18px] border border-border bg-white p-6 text-left shadow-[0_1px_3px_rgba(24,24,27,0.04)] transition-all duration-200 hover:border-accent hover:shadow-[0_8px_24px_rgba(24,24,27,0.06)]"
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h2 className="mt-4 text-lg font-bold text-foreground-heading">{item.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{item.subtitle}</p>
                  </button>
                );
              })}
            </motion.div>
          )}

          {track && question && !saving && (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-10 rounded-[18px] border border-border bg-white p-6 shadow-[0_4px_16px_rgba(24,24,27,0.04)] sm:p-8"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Question {step + 1} of {total}
              </p>
              <h2 className="mt-2 text-xl font-bold text-foreground-heading">{question.prompt}</h2>
              {question.hint && <p className="mt-1 text-sm text-muted">{question.hint}</p>}

              {question.type === "choice" && (
                <div className="mt-6 grid gap-3">
                  {question.options?.map((option) => {
                    const selected = currentValue === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.value }))}
                        className={cn(
                          "cursor-pointer rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors duration-200",
                          selected
                            ? "border-accent bg-accent/10 text-foreground-heading"
                            : "border-border text-muted-secondary hover:border-accent/40 hover:bg-[#FAFAFA]"
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {question.type === "text" && (
                <Input
                  className="mt-6"
                  value={currentValue}
                  placeholder={question.placeholder}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") goNext();
                  }}
                />
              )}

              {error && <p className="mt-4 text-sm text-error">{error}</p>}

              <div className="mt-8 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (step === 0) {
                      setTrackId(null);
                      return;
                    }
                    setStep((s) => s - 1);
                  }}
                >
                  Back
                </Button>
                <Button type="button" variant="accent" disabled={!canContinue} onClick={goNext}>
                  {step === total - 1 ? "Build my roadmap" : "Continue"}
                </Button>
              </div>
            </motion.div>
          )}

          {saving && (
            <motion.div
              key="saving"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-16 flex flex-col items-center gap-4 text-center"
            >
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="font-semibold text-foreground-heading">Building your customized roadmap…</p>
              <p className="max-w-sm text-sm text-muted">
                Gemma is turning your answers into weekly milestones, resources, and a first project.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
