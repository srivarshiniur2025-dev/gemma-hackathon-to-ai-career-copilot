"use client";

import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <FadeIn>
        <h1 className="text-2xl font-extrabold">Settings</h1>
        <p className="text-muted">Manage your profile and preferences.</p>
      </FadeIn>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Name</Label><Input defaultValue={user?.displayName ?? ""} className="mt-1" /></div>
          <div><Label>Email</Label><Input defaultValue={user?.email ?? ""} disabled className="mt-1" /></div>
          <Button>Save changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {["Assessment reminders", "New internship matches", "Weekly progress report"].map((n) => (
            <label key={n} className="flex cursor-pointer items-center justify-between rounded-xl border border-border p-4">
              <span className="text-sm font-medium">{n}</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Privacy</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted mb-4">Your profile is stored with Firebase Auth and the Career Copilot backend.</p>
          <Button variant="destructive">Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  );
}
