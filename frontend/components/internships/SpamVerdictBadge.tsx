import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SpamVerdict } from "@/lib/types";
import { cn } from "@/lib/utils";

const verdictConfig: Record<
  SpamVerdict,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  legitimate: {
    label: "Legitimate",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  suspicious: {
    label: "Suspicious",
    className: "bg-amber-50 text-amber-800 border-amber-200",
    icon: AlertTriangle,
  },
  scam: {
    label: "Likely Scam",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: ShieldAlert,
  },
};

type SpamVerdictBadgeProps = {
  verdict: SpamVerdict;
  score?: number;
  trustScore?: number;
  verified?: boolean;
  className?: string;
};

export function SpamVerdictBadge({
  verdict,
  score,
  trustScore,
  verified,
  className,
}: SpamVerdictBadgeProps) {
  const config = verified
    ? {
        label: "Verified & Safe",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
      }
    : verdictConfig[verdict] ?? verdictConfig.suspicious;
  const Icon = config.icon;
  const displayScore = trustScore ?? score;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 border font-semibold", config.className, className)}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
      {typeof displayScore === "number" && (
        <span className="ml-0.5 text-[10px] opacity-75">
          ({verified ? `${displayScore}% trust` : displayScore})
        </span>
      )}
    </Badge>
  );
}
