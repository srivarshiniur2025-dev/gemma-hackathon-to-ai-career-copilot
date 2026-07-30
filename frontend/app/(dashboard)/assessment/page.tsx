"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, User } from "lucide-react";
import { GemmaBadge, GemmaChatAvatar, GemmaModelTag } from "@/components/gemma/GemmaBrand";
import { FadeIn } from "@/components/motion/FadeIn";
import { SkillRadarChart } from "@/components/charts/DashboardCharts";
import { ProgressBarChart } from "@/components/charts/DashboardCharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  mockAssessmentMessages,
  mockRadarData,
  mockSkillScores,
  skillDomains,
} from "@/lib/mock-data";

export default function AssessmentPage() {
  const [messages, setMessages] = useState(mockAssessmentMessages);
  const [input, setInput] = useState("");
  const [questionNum, setQuestionNum] = useState(2);
  const [completed, setCompleted] = useState(false);
  const totalQuestions = 6;

  function sendMessage() {
    if (!input.trim()) return;
    setMessages((m) => [...m, { role: "user" as const, content: input }]);
    setInput("");
    setTimeout(() => {
      if (questionNum >= totalQuestions) {
        setCompleted(true);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant" as const, content: "Great answer! Let's go deeper — explain time complexity of your approach and suggest an optimization." },
        ]);
        setQuestionNum((n) => n + 1);
      }
    }, 800);
  }

  if (completed) {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <FadeIn>
          <h1 className="text-2xl font-extrabold">Assessment Complete</h1>
          <p className="text-muted">Here&apos;s your comprehensive skill report.</p>
        </FadeIn>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>Skill Radar</CardTitle></CardHeader><CardContent><SkillRadarChart data={mockRadarData} /></CardContent></Card>
          <Card>
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-primary">Strengths</p>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  <li>• Strong Python fundamentals</li>
                  <li>• Good web development knowledge</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-accent">Areas to improve</p>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  <li>• Cyber Security basics</li>
                  <li>• Cloud deployment</li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge>Difficulty: Intermediate</Badge>
                <Badge variant="secondary">Internship Readiness: 72%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <FadeIn className="mb-6">
        <h1 className="text-2xl font-extrabold">Gemma Skill Assessment</h1>
        <p className="text-muted">Gemma 4 asks adaptive technical questions and estimates your real proficiency.</p>
        <div className="mt-2 flex items-center gap-2">
          <GemmaBadge size="sm" />
          <GemmaModelTag />
        </div>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left panel */}
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle className="text-base">Progress</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Question</span>
                <span className="font-semibold">{questionNum} / {totalQuestions}</span>
              </div>
              <Progress value={(questionNum / totalQuestions) * 100} className="mt-2" />
            </div>
            <div>
              <p className="text-sm text-muted">Estimated Level</p>
              <p className="text-lg font-bold text-primary">Intermediate</p>
            </div>
            <div>
              <p className="text-sm text-muted">Current Domain</p>
              <Badge className="mt-1">Python</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Center chat */}
        <Card className="flex flex-col lg:col-span-6 min-h-[520px]">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-base">
              <GemmaChatAvatar /> Gemma is assessing you
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col p-0">
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <AnimatePresence>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.role === "assistant" ? "" : "bg-background-secondary"}`}>
                      {m.role === "assistant" ? <GemmaChatAvatar /> : <User className="h-4 w-4 text-primary mx-auto" />}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "assistant" ? "bg-background-secondary" : "bg-primary text-white"}`}>
                      {m.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your answer..."
                  className="flex-1 rounded-xl border border-border bg-background-secondary px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <Button variant="secondary" size="icon" aria-label="Voice input"><Mic className="h-4 w-4" /></Button>
                <Button size="icon" onClick={sendMessage} aria-label="Send"><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right panel */}
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle className="text-base">Skill Domains</CardTitle></CardHeader>
          <CardContent>
            <ProgressBarChart data={mockSkillScores} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
