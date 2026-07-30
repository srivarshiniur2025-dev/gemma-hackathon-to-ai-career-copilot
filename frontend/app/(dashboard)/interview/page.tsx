"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { GemmaBadge } from "@/components/gemma/GemmaBrand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InterviewHubPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <FadeIn>
        <GemmaBadge className="mb-4" />
        <h1 className="text-2xl font-extrabold md:text-3xl">Gemma Mock Interview</h1>
        <p className="mt-2 text-muted">
          Practice with Gemma&apos;s advanced multi-stage interview simulation — real-time WebSocket,
          adaptive difficulty, and detailed analytics.
        </p>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card className="card-shadow-lg border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Advanced Interview Simulation
            </CardTitle>
            <CardDescription>
              3 stages: Fundamentals → System Design → Behavioral (STAR). Powered by Gemma 4 via WebSocket.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted mb-6">
              <li>• Real-time bi-directional chat with Gemma</li>
              <li>• LangChain memory across the session</li>
              <li>• Post-interview JSON evaluation report</li>
              <li>• Technical, Communication & Confidence scores</li>
            </ul>
            <Link href="/interview/setup">
              <Button size="lg" className="gap-2">
                Configure & Start <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
