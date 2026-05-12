import { ReactNode } from "react";
import { Home, UsersRound, FileHeart, Sparkles, User, type LucideIcon } from "lucide-react";

export interface TabBarItem {
  key: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface TabBarProps {
  active: string;
  accent: "doctor" | "therapist" | "nurse" | "physio";
  onChange?: (key: string) => void;
  newPatientCount?: number;
  items?: TabBarItem[];
}

export const DEFAULT_TABS: TabBarItem[] = [
  { key: "home", label: "工作台", icon: Home },
  { key: "patients", label: "患者管理", icon: UsersRound },
  { key: "plan", label: "康复方案", icon: FileHeart },
  { key: "ai", label: "AI康复处方", icon: Sparkles },
  { key: "me", label: "我的", icon: User },
];

export const TabBar = ({ active, accent, onChange, newPatientCount = 0, items }: TabBarProps) => {
  const list = (items ?? DEFAULT_TABS).map((it) =>
    it.key === "patients" ? { ...it, badge: it.badge ?? newPatientCount } : it
  );
  const accentClass = {
    doctor: "text-role-doctor",
    therapist: "text-role-therapist",
    nurse: "text-role-nurse",
    physio: "text-role-physio",
  }[accent];

  return (
    <div className="shrink-0 bg-card/95 backdrop-blur-xl border-t border-border/60 px-1 pt-2 pb-5 z-20">
      <div className="flex items-center justify-around">
        {list.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.key;
          const badge = it.badge;
          return (
            <button
              key={it.key}
              onClick={() => onChange?.(it.key)}
              className="flex flex-col items-center gap-1 px-1.5 py-1 transition-all relative"
            >
              <div className="relative">
                <Icon
                  className={`w-[22px] h-[22px] transition-all ${
                    isActive ? accentClass : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {badge && badge > 0 ? (
                  <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] px-1 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center">
                    {badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[10px] font-medium whitespace-nowrap ${
                  isActive ? accentClass : "text-muted-foreground"
                }`}
              >
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * ScreenShell: phone screen layout — scrollable body + tab bar pinned to phone bottom.
 */
export const ScreenShell = ({
  children,
  tabBar,
}: {
  children: ReactNode;
  tabBar?: ReactNode;
}) => (
  <div className="relative h-full flex flex-col">
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">{children}</div>
    {tabBar}
  </div>
);
