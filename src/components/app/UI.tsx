import { Sparkles } from "lucide-react";
import { forwardRef, ReactNode } from "react";

export const AICard = ({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) => (
  <div className="relative overflow-hidden rounded-2xl p-4 bg-ai-soft border border-ai/20">
    <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full gradient-ai opacity-20 blur-2xl" />
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg gradient-ai flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-ai-foreground" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-ai/10 text-ai font-semibold">
          AI 智能
        </span>
      </div>
      <div className="text-sm text-foreground/80 leading-relaxed">{children}</div>
      {action && <div className="mt-3">{action}</div>}
    </div>
  </div>
);

export const SectionTitle = ({
  title,
  extra,
}: {
  title: string;
  extra?: ReactNode;
}) => (
  <div className="flex items-center justify-between mb-3 px-1">
    <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
    {extra}
  </div>
);

interface StatChipProps {
  label: string;
  value: string | number;
  accent?: "primary" | "success" | "warning" | "ai";
}

export const StatChip = forwardRef<HTMLDivElement, StatChipProps>(
  ({ label, value, accent = "primary" }, ref) => {
    const colorMap = {
      primary: "text-primary bg-primary-soft",
      success: "text-success bg-success-soft",
      warning: "text-warning bg-warning-soft",
      ai: "text-ai bg-ai-soft",
    };
    return (
      <div ref={ref} className={`flex-1 rounded-xl p-3 ${colorMap[accent]}`}>
        <div className="text-[11px] font-medium opacity-80">{label}</div>
        <div className="text-xl font-bold mt-0.5">{value}</div>
      </div>
    );
  }
);
StatChip.displayName = "StatChip";
