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
import { DEMO_USER, seedDemoUser, validateEmail } from "@/lib/fake-auth";
import { resolvePostAuthPath } from "@/lib/post-auth";

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const { login, loginWithGoogle, resetPassword, user, loading: authLoading, getIdToken, firebaseEnabled } =
    useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
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

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!email.trim()) next.email = "Email is required";
    else if (!validateEmail(email)) next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function performLogin(loginEmail: string, loginPassword: string, remember: boolean) {
    setLoading(true);
    try {
      await login({ email: loginEmail, password: loginPassword, rememberMe: remember });
    } catch (err) {
      toast(firebaseAuthErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await performLogin(email, password, rememberMe);
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

  async function handleForgot() {
    if (!email.trim() || !validateEmail(email)) {
      setErrors((prev) => ({ ...prev, email: "Enter your email to reset the password" }));
      return;
    }
    try {
      await resetPassword(email);
      toast("Password reset email sent", "success");
    } catch (err) {
      toast(firebaseAuthErrorMessage(err), "error");
    }
  }

  async function handleDemoLogin() {
    seedDemoUser(true);
    setEmail(DEMO_USER.email);
    setPassword(DEMO_USER.password);
    setRememberMe(true);
    await performLogin(DEMO_USER.email, DEMO_USER.password, true);
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
            <CardHeader className="space-y-1">
              <Link
                href="/"
                className="mb-2 inline-flex items-center text-sm font-semibold text-muted-secondary transition-colors hover:text-foreground-heading"
              >
                ← AI Career Copilot
              </Link>
              <CardTitle className="text-2xl" style={{ fontFamily: "var(--font-sora, var(--font-sans))" }}>
                Welcome Back
              </CardTitle>
              <CardDescription>
                {firebaseEnabled
                  ? "Sign in with Firebase to continue your career journey."
                  : "Demo mode — add Firebase keys to go live. You can still sign in locally."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="you@university.edu"
                    className="transition-all duration-200 focus-visible:border-accent focus-visible:ring-accent/20"
                    aria-invalid={Boolean(errors.email)}
                  />
                  <AuthFieldError message={errors.email} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="cursor-pointer text-xs text-accent transition-colors hover:underline"
                      onClick={() => void handleForgot()}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    className="transition-all duration-200 focus-visible:border-accent focus-visible:ring-accent/20"
                    aria-invalid={Boolean(errors.password)}
                  />
                  <AuthFieldError message={errors.password} />
                </div>

                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  label="Remember me"
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
                      Signing in...
                    </>
                  ) : (
                    "Login"
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
                label="Sign in with Google"
                onClick={() => void handleGoogle()}
                disabled={loading}
              />
              {!firebaseEnabled && (
                <p className="mt-2 text-center text-xs text-muted">
                  Google sign-in needs Firebase keys in <code>frontend/.env.local</code>.
                </p>
              )}

              {!firebaseEnabled && (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 w-full transition-transform duration-200 hover:scale-[1.01]"
                  disabled={loading}
                  onClick={handleDemoLogin}
                >
                  Use demo account
                </Button>
              )}

              <p className="mt-6 text-center text-sm text-muted">
                Don&apos;t have an account? <AuthLink href="/signup">Register</AuthLink>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <AuthPreview />
      </div>
    </motion.div>
  );
}
