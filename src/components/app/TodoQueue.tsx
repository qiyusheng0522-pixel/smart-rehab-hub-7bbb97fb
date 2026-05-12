import { ReactNode } from "react";
import { ChevronRight, Clock, AlertCircle, type LucideIcon } from "lucide-react";

export interface PendingTodoTile {
  label: string;
  count: number;
  icon: LucideIcon;
  /** tailwind classes for the icon tile bg + text color, e.g. "bg-warning text-white" */
  iconClass: string;
  onClick?: () => void;
}

/**
 * Card-grid style pending todo list (2 columns) used on the workbench home.
 * Matches the reference design: rounded icon top-left, label bottom-left,
 * large count on the right, plus a "查看全部" tile at the end.
 */
export const PendingTodoGrid = ({
  items,
  onViewAll,
  viewAllLabel = "查看全部",
}: {
  items: PendingTodoTile[];
  onViewAll?: () => void;
  viewAllLabel?: string;
}) => {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <button
            key={it.label}
            onClick={it.onClick}
            className="bg-card rounded-2xl shadow-card border border-border/40 p-3.5 text-left active:scale-[0.98] transition-transform flex items-center justify-between gap-2 min-h-[88px]"
          >
            <div className="flex flex-col justify-between h-full min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${it.iconClass}`}>
                <Icon className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div className="text-[12px] text-muted-foreground mt-2 whitespace-nowrap">{it.label}</div>
            </div>
            <div className="text-2xl font-extrabold text-foreground leading-none shrink-0">
              {it.count}
            </div>
          </button>
        );
      })}
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-3.5 flex flex-col items-start justify-between min-h-[88px] active:scale-[0.98] transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-card shadow-card flex items-center justify-center text-primary">
            <ChevronRight className="w-5 h-5" />
          </div>
          <div className="text-[12px] text-primary font-medium mt-2">{viewAllLabel}</div>
        </button>
      )}
    </div>
  );
};

export interface TodoItem {
  id: string;
  patient: string;
  meta: string;
  detail: string;
  time?: string;
  urgency?: "high" | "medium" | "low";
}

/**
 * Queue list rendered inside a PhoneSheet. Tapping a row opens the
 * single-patient confirmation sheet.
 */
export const TodoQueueList = ({
  items,
  onPick,
  accent = "doctor",
  emptyHint = "暂无待办",
}: {
  items: TodoItem[];
  onPick: (item: TodoItem) => void;
  accent?: "doctor" | "therapist" | "nurse";
  emptyHint?: string;
}) => {
  const grad = {
    doctor: "gradient-doctor",
    therapist: "gradient-therapist",
    nurse: "gradient-nurse",
  }[accent];

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">{emptyHint}</div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-[11px] text-muted-foreground">共 {items.length} 项 · 按优先级排序</span>
        <span className="text-[11px] text-muted-foreground">逐项确认</span>
      </div>
      {items.map((it, idx) => {
        const u = it.urgency ?? "medium";
        const uColor =
          u === "high"
            ? "bg-destructive/10 text-destructive"
            : u === "medium"
              ? "bg-warning/15 text-warning"
              : "bg-primary/10 text-primary";
        const uLabel = u === "high" ? "紧急" : u === "medium" ? "重要" : "常规";
        return (
          <button
            key={it.id}
            onClick={() => onPick(it)}
            className="w-full text-left bg-card rounded-2xl shadow-card p-3.5 active:scale-[0.99] transition-transform flex items-start gap-3"
          >
            <div className={`w-9 h-9 rounded-xl ${grad} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold truncate">{it.patient}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${uColor}`}>{uLabel}</span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{it.meta}</div>
              <div className="text-[12px] text-foreground/80 mt-1 line-clamp-2">{it.detail}</div>
              {it.time && (
                <div className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {it.time}
                </div>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
          </button>
        );
      })}
    </div>
  );
};

/**
 * Workbench grid item with badge count. Tapping opens the queue list sheet.
 */
export const WorkbenchTile = ({
  icon: Icon,
  label,
  color,
  count,
  onClick,
}: {
  icon: any;
  label: string;
  color: string;
  count?: number;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="relative flex flex-col items-center gap-1.5 py-3 bg-card rounded-2xl shadow-card active:scale-95 transition-transform"
  >
    <div className={`relative w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>
      <Icon className="w-[18px] h-[18px]" strokeWidth={2.2} />
      {count !== undefined && count > 0 && (
        <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center border-2 border-card">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </div>
    <span className="text-[11px] text-foreground font-medium">{label}</span>
  </button>
);

export const PendingStatRow = ({
  items,
  variant = "glass",
  accent = "doctor",
}: {
  items: { label: string; count: number; onClick?: () => void }[];
  variant?: "glass" | "card";
  accent?: "doctor" | "therapist" | "nurse";
}) => {
  const cols =
    items.length >= 5 ? "grid-cols-5" :
    items.length === 4 ? "grid-cols-4" :
    items.length === 2 ? "grid-cols-2" : "grid-cols-3";
  const dense = items.length >= 5;
  const isCard = variant === "card";
  const numColor = isCard
    ? accent === "therapist"
      ? "text-secondary"
      : accent === "nurse"
        ? "text-success"
        : "text-primary"
    : "text-white";
  const itemBg = isCard
    ? "bg-card shadow-card border border-border/40"
    : "bg-white/15 backdrop-blur";
  const labelColor = isCard ? "text-muted-foreground" : "opacity-90";
  return (
    <div className={`relative grid ${cols} gap-1.5`}>
      {items.map((it) => (
        <button
          key={it.label}
          onClick={it.onClick}
          className={`${itemBg} rounded-xl ${dense ? "px-1.5 py-2" : "p-2.5"} text-left active:scale-95 transition-transform relative min-w-0 flex flex-col justify-between min-h-[64px]`}
        >
          <div className={`text-[10px] ${labelColor} leading-[1.2] whitespace-nowrap overflow-visible`}>{it.label}</div>
          <div className={`${dense ? "text-xl" : "text-2xl"} font-extrabold mt-1 flex items-baseline gap-0.5 leading-none ${numColor}`}>
            {it.count}
            <ChevronRight className={`w-3 h-3 ${isCard ? "text-muted-foreground" : "opacity-70"}`} />
          </div>
        </button>
      ))}
    </div>
  );
};
