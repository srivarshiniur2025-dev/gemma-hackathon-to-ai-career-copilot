"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  AuthFieldError,
  AuthLink,
  AuthPreview,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  GoogleButton,
  Input,
  Label,
} from "@/components/auth/AuthLayout";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { firebaseAuthErrorMessage, useAuth } from "@/contexts/AuthContext";
import { validateEmail, validatePassword } from "@/lib/fake-auth";
import { resolvePostAuthPath } from "@/lib/post-auth";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  terms?: string;
};

export default function SignupPage() {
  const { register, loginWithGoogle, user, loading: authLoading, getIdToken, firebaseEnabled } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (authLoading || !user || redirecting) return;
    setRedirecting(true);
    void resolvePostAuthPath(getIdToken, user.name)
      .then((path) => router.replace(path))
      .catch(() => router.replace("/onboarding"));
  }, [authLoading, user, redirecting, getIdToken, router]);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!form.name.trim()) next.name = "Full name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!validateEmail(form.email)) next.email = "Enter a valid email address";
    if (!form.password) next.password = "Password is required";
    else if (!validatePassword(form.password)) next.password = "Password must be at least 8 characters";
    if (!form.confirm) next.confirm = "Please confirm your password";
    else if (form.password !== form.confirm) next.confirm = "Passwords do not match";
    if (!termsAccepted) next.terms = "You must accept the Terms & Privacy Policy";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      if (!firebaseEnabled) {
        toast("Account created! Please sign in.", "success");
        router.push("/login");
      }
    } catch (err) {
      toast(firebaseAuthErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      toast(firebaseAuthErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background px-4 py-8 lg:px-8"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="border-border card-shadow-lg">
            <CardHeader>
              <Link
                href="/"
                className="mb-2 inline-flex items-center text-sm font-semibold text-muted-secondary transition-colors hover:text-foreground-heading"
              >
                ← AI Career Copilot
              </Link>
              <CardTitle className="text-2xl" style={{ fontFamily: "var(--font-sora, var(--font-sans))" }}>
                Create your account
              </CardTitle>
              <CardDescription>
                {firebaseEnabled
                  ? "Sign up with Firebase. Next, we will build a learning path just for you."
                  : "Demo mode — add Firebase keys to go live."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Jane Doe"
                    className="transition-all duration-200 focus-visible:border-accent focus-visible:ring-accent/20"
                    aria-invalid={Boolean(errors.name)}
                  />
                  <AuthFieldError message={errors.name} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@university.edu"
                    className="transition-all duration-200 focus-visible:border-accent focus-visible:ring-accent/20"
                    aria-invalid={Boolean(errors.email)}
                  />
                  <AuthFieldError message={errors.email} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      className="transition-all duration-200 focus-visible:border-accent focus-visible:ring-accent/20"
                      aria-invalid={Boolean(errors.password)}
                    />
                    <AuthFieldError message={errors.password} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm Password</Label>
                    <Input
                      id="confirm"
                      type="password"
                      value={form.confirm}
                      onChange={(e) => update("confirm", e.target.value)}
                      className="transition-all duration-200 focus-visible:border-accent focus-visible:ring-accent/20"
                      aria-invalid={Boolean(errors.confirm)}
                    />
                    <AuthFieldError message={errors.confirm} />
                  </div>
                </div>

                <Checkbox
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
                  }}
                  label={
                    <>
                      I agree to the{" "}
                      <span className="font-semibold text-accent">Terms & Privacy Policy</span>
                    </>
                  }
                  error={errors.terms}
                />

                <Button
                  type="submit"
                  variant="accent"
                  className="w-full transition-transform duration-200 hover:scale-[1.01]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted">or</span>
                </div>
              </div>

              <GoogleButton
                label="Sign up with Google"
                onClick={() => void handleGoogle()}
                disabled={loading}
              />
              {!firebaseEnabled && (
                <p className="mt-2 text-center text-xs text-muted">
                  Google sign-up needs Firebase keys in <code>frontend/.env.local</code>. Email signup still works in demo mode.
                </p>
              )}

              <p className="mt-6 text-center text-sm text-muted">
                Already have an account? <AuthLink href="/login">Sign in</AuthLink>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <AuthPreview />
      </div>
    </motion.div>
  );
}
