import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { AuroraBackground } from "@/components/AuroraBackground";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — AI VISUALIZER" },
      {
        name: "description",
        content: "Create a free AI VISUALIZER account and start trying on fashion with AI in seconds.",
      },
      { property: "og:title", content: "Create your account — AI VISUALIZER" },
      { property: "og:description", content: "Join AI VISUALIZER and try on any outfit with AI." },
    ],
  }),
  component: RegisterPage,
});

const strengthLabels = ["Too short", "Weak", "Fair", "Strong", "Excellent"];

function scorePassword(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return password.length === 0 ? 0 : score;
}

function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const score = useMemo(() => scorePassword(password), [password]);
  const mismatch = confirm.length > 0 && confirm !== password;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (mismatch) {
      toast.error("Passwords do not match.");
      return;
    }
    if (score < 2) {
      toast.error("Please choose a stronger password.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. Welcome to AI VISUALIZER!");
    void navigate({ to: "/dashboard" });
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <AuroraBackground />
      <div className="grid w-full max-w-4xl items-center gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:block"
        >
          <div className="glass animate-float rounded-[2rem] p-8 shadow-elegant">
            <h2 className="font-display text-3xl font-bold leading-tight">
              Your wardrobe,
              <br />
              <span className="text-gradient-brand">rendered on you.</span>
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              One photo unlocks thousands of outfits. Our AI keeps your face, hair, skin tone, pose and
              background untouched — only the fashion changes.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {["Photoreal try-on in seconds", "Wishlist and history saved", "Works on any device"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="gradient-brand size-2 rounded-full" />
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-[2rem] p-8 shadow-elegant"
        >
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <Logo />
            <h1 className="font-display text-2xl font-bold">Create your account</h1>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Vishali R"
                  className="h-11 rounded-xl pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-11 rounded-xl pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="h-11 rounded-xl pl-9"
                />
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((index) => (
                  <span
                    key={index}
                    className={`h-1.5 flex-1 rounded-full ${
                      index < score ? "gradient-brand" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{strengthLabels[score]}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder="Repeat your password"
                className={`h-11 rounded-xl ${mismatch ? "border-destructive" : ""}`}
              />
              {mismatch && <p className="text-xs text-destructive">Passwords do not match.</p>}
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <Button
            variant="glass"
            size="lg"
            className="mt-3 w-full"
            onClick={async () => {
              const result = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin,
              });
              if (result.error) toast.error("Google sign-up failed. Please try again.");
            }}
          >
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}