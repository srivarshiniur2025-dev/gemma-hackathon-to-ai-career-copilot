"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  Mic,
  PhoneOff,
  Send,
  Video,
  Wifi,
  WifiOff,
} from "lucide-react";
import { GemmaBadge, GemmaChatAvatar, GemmaModelTag } from "@/components/gemma/GemmaBrand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useInterviewWebSocket } from "@/hooks/useInterviewWebSocket";
import { api } from "@/lib/api";
import type { QuestionType } from "@/lib/interview-types";

const STAGE_LABELS: Record<string, string> = {
  fundamentals: "Stage 1 · Fundamentals",
  system_design: "Stage 2 · System Design",
  behavioral: "Stage 3 · Behavioral (STAR)",
};

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  introductory: "Intro",
  technical: "Technical",
  "project-based": "Project-based",
  behavioral: "Behavioral",
};

export default function InterviewRoomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { user, getIdToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [ending, setEnding] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getIdToken().then(setToken);
  }, [getIdToken, user]);

  const {
    connected,
    connecting,
    messages,
    currentQuestion,
    currentStage,
    questionNumber,
    totalQuestions,
    questionType,
    answerHints,
    completed,
    error,
    sendAnswer,
    disconnect,
  } = useInterviewWebSocket(sessionId, token);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function endInterview() {
    setEnding(true);
    disconnect();
    if (sessionId.startsWith("demo-")) {
      router.push(`/interview/${sessionId}/feedback`);
      return;
    }
    try {
      await api.evaluateInterviewSession(sessionId);
      router.push(`/interview/${sessionId}/feedback`);
    } catch (err) {
      router.push(`/interview/${sessionId}/feedback`);
    } finally {
      setEnding(false);
    }
  }

  function handleSend() {
    if (!answer.trim()) return;
    sendAnswer(answer.trim());
    setAnswer("");
  }

  const progress = totalQuestions > 0
    ? Math.min((questionNumber / totalQuestions) * 100, 100)
    : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <GemmaBadge size="sm" />
          <GemmaModelTag />
          <Badge variant="secondary">{STAGE_LABELS[currentStage] ?? currentStage}</Badge>
          {questionType && (
            <Badge variant="accent">{QUESTION_TYPE_LABELS[questionType] ?? questionType}</Badge>
          )}
          {questionNumber > 0 && (
            <span className="text-xs text-muted">
              Question {questionNumber} of {totalQuestions}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          {connected ? (
            <span className="flex items-center gap-1 text-accent"><Wifi className="h-4 w-4" /> Live with Gemma 4</span>
          ) : connecting ? (
            <span className="flex items-center gap-1 text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Connecting...</span>
          ) : (
            <span className="flex items-center gap-1 text-red-600"><WifiOff className="h-4 w-4" /> Disconnected</span>
          )}
        </div>
      </div>

      <Progress value={progress} className="h-1.5" />

      <div className="grid gap-6 lg:grid-cols-2 min-h-[600px]">
        <Card className="flex flex-col card-shadow-lg">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-base">
              <GemmaChatAvatar /> Gemma 4 Interviewer
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4 p-6">
            <div className="flex aspect-video items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background-secondary">
              <div className="text-center">
                <Video className="mx-auto h-10 w-10 text-muted" />
                <p className="mt-2 text-sm text-muted">Webcam placeholder</p>
                <p className="text-xs text-muted">Video integration coming soon</p>
              </div>
            </div>

            <div className="rounded-[18px] bg-accent/5 border border-accent/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent mb-2">Current Question</p>
              <p className="text-sm leading-relaxed">
                {currentQuestion || (connecting ? "Gemma 4 is preparing your first question..." : "Waiting for connection...")}
              </p>
            </div>

            {answerHints.length > 0 && (
              <div className="rounded-[14px] border border-border bg-background-secondary p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-secondary mb-2">
                  What a strong answer includes
                </p>
                <ul className="space-y-1.5">
                  {answerHints.map((hint) => (
                    <li key={hint} className="flex gap-2 text-sm text-muted">
                      <span className="text-accent">•</span>
                      {hint}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              variant="destructive"
              className="mt-auto gap-2"
              onClick={endInterview}
              disabled={ending || messages.length === 0}
            >
              {ending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneOff className="h-4 w-4" />}
              {ending ? "Evaluating with Gemma 4..." : "End Interview & Get Feedback"}
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col card-shadow-lg">
          <CardHeader className="border-b border-border py-4">
            <CardTitle className="text-base">Interview Transcript</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col p-0">
            <div className="flex-1 space-y-3 overflow-y-auto p-4 max-h-[420px]">
              {messages.length === 0 && (
                <p className="text-center text-sm text-muted py-12">Gemma 4 will start the interview momentarily...</p>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {m.role === "assistant" && <GemmaChatAvatar className="h-7 w-7 text-[10px]" />}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-white"
                        : m.role === "system"
                          ? "bg-background-secondary text-muted italic text-center w-full max-w-full"
                          : "bg-background-secondary"
                    }`}
                  >
                    {m.role === "assistant" && m.question_type && (
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-accent">
                        {QUESTION_TYPE_LABELS[m.question_type] ?? m.question_type}
                      </p>
                    )}
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {error && (
              <p className="px-4 py-2 text-xs text-red-600 bg-red-50">{error}</p>
            )}

            {completed && (
              <div className="px-4 py-3 bg-accent/5 text-sm text-accent font-medium">
                Interview complete! Click &ldquo;End Interview&rdquo; for Gemma 4&apos;s evaluation report.
              </div>
            )}

            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                  rows={2}
                  disabled={completed || !connected}
                  placeholder="Type your answer to Gemma 4..."
                  className="flex-1 resize-none rounded-xl border border-border bg-background-secondary px-4 py-3 text-sm outline-none focus:border-border-focus focus:ring-[3px] focus:ring-accent/18 disabled:opacity-50"
                />
                <Button variant="secondary" size="icon" disabled aria-label="Voice input">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button size="icon" onClick={handleSend} disabled={!answer.trim() || completed || !connected}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
