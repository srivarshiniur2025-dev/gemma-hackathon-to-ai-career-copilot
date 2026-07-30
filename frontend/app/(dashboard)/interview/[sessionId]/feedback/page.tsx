"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { FadeIn } from "@/components/motion/FadeIn";
import { GemmaBadge, GemmaBanner } from "@/components/gemma/GemmaBrand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import type { InterviewEvaluation, InterviewSession } from "@/lib/interview-types";

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1 text-3xl font-extrabold text-accent">{value}%</p>
        <Progress value={value} className="mt-3" />
      </CardContent>
    </Card>
  );
}

export default function InterviewFeedbackPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getInterviewSession(sessionId).then((s) => {
      setSession(s);
      if (s.evaluation) {
        setEvaluation(s.evaluation);
        setLoading(false);
      } else {
        api.evaluateInterviewSession(sessionId).then((ev) => {
          setEvaluation(ev);
          setLoading(false);
        }).catch(() => setLoading(false));
      }
    }).catch(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted">Gemma is analyzing your interview...</p>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="text-center py-20">
        <p className="text-muted">Evaluation not available.</p>
        <Link href="/interview/setup"><Button className="mt-4">Try Again</Button></Link>
      </div>
    );
  }

  const radarData = [
    { metric: "Technical", score: evaluation.technical_accuracy },
    { metric: "Communication", score: evaluation.communication },
    { metric: "Confidence", score: evaluation.confidence },
  ];

  const star = evaluation.star_method_feedback;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <FadeIn>
        <Link href="/interview" className="inline-flex items-center gap-1 text-sm text-accent hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Interview
        </Link>
        <GemmaBadge className="mb-3" />
        <h1 className="text-2xl font-extrabold md:text-3xl">Gemma Interview Report</h1>
        <p className="mt-2 text-muted">{evaluation.summary}</p>
        {session && (
          <p className="mt-1 text-sm text-muted">
            Role: <strong>{session.target_role}</strong> · Focus: <strong>{session.focus.replace("_", " ")}</strong>
          </p>
        )}
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card className="card-shadow-lg border-accent/20">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted uppercase tracking-wide">Overall Score</p>
            <p className="mt-2 text-6xl font-extrabold text-accent">{evaluation.overall_score}%</p>
          </CardContent>
        </Card>
      </FadeIn>

      <div className="grid gap-4 sm:grid-cols-3">
        <ScoreCard label="Technical Accuracy" value={evaluation.technical_accuracy} />
        <ScoreCard label="Communication" value={evaluation.communication} />
        <ScoreCard label="Confidence" value={evaluation.confidence} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn delay={0.1}>
          <Card>
            <CardHeader><CardTitle>Performance Radar</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#E4E4E7" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "#71717A", fontSize: 12 }} />
                  <Radar dataKey="score" stroke="#0D9488" fill="#0D9488" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.15}>
          <Card>
            <CardHeader><CardTitle>Stage Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(evaluation.stage_scores).map(([stage, score]) => (
                score !== null && (
                  <div key={stage}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{stage.replace("_", " ")}</span>
                      <span className="font-semibold">{score}%</span>
                    </div>
                    <Progress value={score} />
                  </div>
                )
              ))}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5 text-accent" /> What you got right
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {evaluation.got_right.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-muted">
                  <span className="text-accent">✓</span> {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <XCircle className="h-5 w-5 text-muted-secondary" /> Areas to improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {evaluation.areas_to_improve.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-muted">
                  <span>→</span> {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <FadeIn delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>STAR Method Feedback</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {(["situation", "task", "action", "result"] as const).map((key) => (
              <div key={key} className="rounded-xl bg-background-secondary p-4">
                <Badge variant="secondary" className="mb-2 capitalize">{key}</Badge>
                <p className="text-sm text-muted leading-relaxed">{star[key]}</p>
              </div>
            ))}
            <div className="sm:col-span-2 rounded-[14px] border border-accent/20 bg-accent/5 p-4">
              <p className="text-sm font-semibold text-accent mb-1">Overall STAR Assessment</p>
              <p className="text-sm text-muted leading-relaxed">{star.overall}</p>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {evaluation.missed_topics.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Missed Topics</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {evaluation.missed_topics.map((t) => (
              <Badge key={t} variant="outline">{t}</Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <GemmaBanner />

      <div className="flex gap-3">
        <Link href="/interview/setup"><Button>Practice Again</Button></Link>
        <Link href="/dashboard"><Button variant="secondary">Back to Dashboard</Button></Link>
      </div>
    </div>
  );
}
