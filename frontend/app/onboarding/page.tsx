"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { FadeIn } from "@/components/motion/FadeIn";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

const ROLES = ["Software Engineer", "AI/ML Engineer", "Frontend Developer", "Full Stack Developer", "Data Analyst"];

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const prefill = sessionStorage.getItem("onboarding_prefill");
    if (prefill) {
      const data = JSON.parse(prefill);
      Object.entries(data).forEach(([k, v]) => {
        const el = document.querySelector(`[name="${k}"]`) as HTMLInputElement;
        if (el && v) el.value = String(v);
      });
    }
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const split = (key: string) =>
      String(form.get(key) ?? "").split(",").map((s) => s.trim()).filter(Boolean);

    try {
      await api.updateMe({
        degree: `${form.get("degree")} · ${form.get("branch")} · ${form.get("year")} · CGPA: ${form.get("cgpa")}`,
        target_role: String(form.get("target_role") ?? "Software Engineer"),
        interests: split("interests"),
        skills: [...split("skills"), ...split("languages")],
        projects: split("projects"),
        certifications: split("certifications"),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background px-4 py-10 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <FadeIn>
            <Card className="card-shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Complete your profile</CardTitle>
                <CardDescription>Help Gemma personalize your career journey.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
                  <Field label="College" name="college" placeholder="IIT Delhi" />
                  <Field label="Branch" name="branch" placeholder="Computer Science" />
                  <Field label="Degree" name="degree" placeholder="B.Tech" />
                  <Field label="Year" name="year" placeholder="3rd Year" />
                  <Field label="CGPA" name="cgpa" placeholder="8.5" />
                  <div>
                    <Label htmlFor="target_role">Preferred Role</Label>
                    <select id="target_role" name="target_role" className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm" defaultValue={ROLES[0]}>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <Field label="Career Goal" name="career_goal" placeholder="Land AI internship" className="sm:col-span-2" />
                  <Field label="Skills (comma-separated)" name="skills" placeholder="Python, React, DSA" className="sm:col-span-2" />
                  <Field label="Languages (comma-separated)" name="languages" placeholder="English, Hindi" />
                  <Field label="Interests (comma-separated)" name="interests" placeholder="AI, open source" />
                  <Field label="Projects (comma-separated)" name="projects" placeholder="Career Copilot, Todo API" className="sm:col-span-2" />
                  <Field label="Certifications" name="certifications" placeholder="AWS CP, Google ML" className="sm:col-span-2" />
                  <Field label="GitHub" name="github" placeholder="github.com/username" />
                  <Field label="LinkedIn" name="linkedin" placeholder="linkedin.com/in/username" />
                  <div className="sm:col-span-2">
                    <Label htmlFor="resume">Resume Upload</Label>
                    <Input id="resume" name="resume" type="file" accept=".pdf,.doc,.docx" className="mt-1" />
                  </div>
                  {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
                  <Button type="submit" className="sm:col-span-2" disabled={loading}>
                    {loading ? "Saving..." : "Continue to Dashboard"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function Field({ label, name, placeholder, className }: { label: string; name: string; placeholder?: string; className?: string }) {
  return (
    <div className={className}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} placeholder={placeholder} className="mt-1" />
    </div>
  );
}
