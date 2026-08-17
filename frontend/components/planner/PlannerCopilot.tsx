"use client";

import { FormEvent, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { GemmaChatAvatar } from "@/components/gemma/GemmaBrand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { api } from "@/lib/api";
import type { TimelineEvent } from "@/lib/dashboard-data";
import { colorizePlannerEvents } from "@/lib/personalize";

type ChatTurn = { role: "user" | "assistant"; content: string };

type ProposedEvent = {
  title: string;
  startTime: string;
  endTime: string;
  startHour: number;
  durationHours: number;
  why?: string;
};

export function PlannerCopilot() {
  const { career, profile, updatePlanner } = useCareerProfile();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatTurn[]>([
    {
      role: "assistant",
      content:
        "Tell me when you are free this week and what feels difficult. I will draft a plan — it only lands on your calendar if you confirm it.",
    },
  ]);
  const [proposal, setProposal] = useState<{ summary: string; events: ProposedEvent[] } | null>(null);
  const [error, setError] = useState("");

  async function send(message: string) {
    const trimmed = message.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError("");
    setProposal(null);
    const nextHistory = [...history, { role: "user" as const, content: trimmed }];
    setHistory(nextHistory);
    setInput("");
    try {
      const apiHistory = nextHistory
        .slice(1)
        .slice(0, -1)
        .map((m) => ({ role: m.role, content: m.content }));
      const plan = await api.recommendPlanner(trimmed, apiHistory);
      if (plan.needs_more && plan.question) {
        setHistory((h) => [...h, { role: "assistant", content: plan.question || "Can you share a bit more?" }]);
      } else {
        setHistory((h) => [
          ...h,
          {
            role: "assistant",
            content: plan.summary || "Here is a plan that fits what you told me. Confirm to add it to Planner.",
          },
        ]);
        if (plan.events?.length) {
          setProposal({ summary: plan.summary, events: plan.events });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gemma could not build a plan");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  async function confirm() {
    if (!proposal?.events.length) return;
    setLoading(true);
    try {
      const colored = colorizePlannerEvents(proposal.events as TimelineEvent[]);
      await api.confirmPlanner(colored, false);
      updatePlanner([...career.plannerEvents, ...colored]);
      setHistory((h) => [
        ...h,
        { role: "assistant", content: "Added to your planner. You can tweak times anytime on this page." },
      ]);
      setProposal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the plan");
    } finally {
      setLoading(false);
    }
  }

  const hint =
    profile?.onboarding_answers?.free_time || profile?.onboarding_answers?.difficulty
      ? `You told us you are often free ${profile.onboarding_answers.free_time ?? ""} and struggle with ${profile.onboarding_answers.difficulty ?? profile.onboarding_answers.hardest ?? profile.onboarding_answers.weak_subject ?? "consistency"}.`
      : "Example: I am free after 6pm on weekdays, physics is hard, and I have 6 hours this week.";

  return (
    <Card id="copilot" className="border-accent/20 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-accent" />
          Ask Gemma for a planner
        </CardTitle>
        <p className="text-sm text-muted">{hint}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-72 space-y-3 overflow-y-auto rounded-2xl bg-[#FAFAFA] p-4">
          {history.map((turn, i) => (
            <div key={`${turn.role}-${i}`} className={`flex gap-2 ${turn.role === "user" ? "justify-end" : "justify-start"}`}>
              {turn.role === "assistant" && <GemmaChatAvatar className="mt-0.5 h-7 w-7 text-[10px]" />}
              <p
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  turn.role === "user"
                    ? "bg-accent text-white"
                    : "border border-border bg-white text-foreground"
                }`}
              >
                {turn.content}
              </p>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              Gemma is thinking…
            </div>
          )}
        </div>

        {proposal && (
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4">
            <p className="text-sm font-semibold text-foreground-heading">Proposed week</p>
            <ul className="mt-3 space-y-2">
              {proposal.events.map((event) => (
                <li key={`${event.title}-${event.startHour}`} className="rounded-xl bg-white px-3 py-2 text-sm">
                  <span className="font-medium">{event.title}</span>
                  <span className="ml-2 text-muted">
                    {event.startTime} – {event.endTime}
                  </span>
                  {event.why && <p className="mt-1 text-xs text-muted">{event.why}</p>}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="accent" size="sm" disabled={loading} onClick={() => void confirm()}>
                Confirm and add to planner
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setProposal(null)}>
                Not now
              </Button>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-error">{error}</p>}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="I am free evenings, stuck on genetics, 5 hours this week…"
            className="h-11 flex-1 rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-accent"
          />
          <Button type="submit" variant="accent" disabled={loading || !input.trim()} className="h-11 px-4">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
