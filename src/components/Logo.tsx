import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <span className="gradient-brand flex size-9 items-center justify-center rounded-xl shadow-elegant">
        <Sparkles className="size-5 text-primary-foreground" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        AI <span className="text-gradient-brand">VISUALIZER</span>
      </span>
    </Link>
  );
}