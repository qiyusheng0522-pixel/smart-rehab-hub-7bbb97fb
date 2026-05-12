import { ReactNode, useEffect } from "react";
import { ChevronLeft } from "lucide-react";

/**
 * In-phone full-screen secondary page (slides up from bottom).
 * Constrained to the PhoneFrame via absolute positioning.
 */
export const PhoneSheet = ({
  open,
  title,
  onClose,
  children,
  accent = "doctor",
  footer,
  flush = false,
  hideHeader = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  accent?: "doctor" | "therapist" | "nurse" | "ai" | "physio";
  footer?: ReactNode;
  flush?: boolean;
  hideHeader?: boolean;
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const grad = {
    doctor: "gradient-doctor",
    therapist: "gradient-therapist",
    nurse: "gradient-nurse",
    ai: "gradient-ai",
    physio: "gradient-physio",
  }[accent];

  return (
    <div
      className={`absolute inset-0 z-30 flex flex-col bg-background transition-all duration-300 ${
        open ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      {!hideHeader && (
        <div className={`${grad} text-white px-4 pt-3 pb-4 flex items-center gap-2`}>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold">{title}</span>
        </div>
      )}
      {flush ? (
        <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-24">{children}</div>
      )}
      {footer && !flush && (
        <div className="absolute left-0 right-0 bottom-0 bg-card/95 backdrop-blur-xl border-t border-border/60 px-4 py-3 pb-6">
          {footer}
        </div>
      )}
    </div>
  );
};

export const FormRow = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-border/60 last:border-0">
    <div>
      <div className="text-[13px] text-foreground">{label}</div>
      {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
    <div className="text-[13px] text-foreground/80 font-medium">{value}</div>
  </div>
);

export const PrimaryBtn = ({
  children,
  onClick,
  variant = "doctor",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "doctor" | "therapist" | "nurse" | "ai" | "physio";
}) => {
  const grad = {
    doctor: "gradient-doctor",
    therapist: "gradient-therapist",
    nurse: "gradient-nurse",
    ai: "gradient-ai",
    physio: "gradient-physio",
  }[variant];
  return (
    <button
      onClick={onClick}
      className={`w-full ${grad} text-white rounded-2xl py-3 text-sm font-semibold shadow-card`}
    >
      {children}
    </button>
  );
};
