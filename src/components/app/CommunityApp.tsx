import { useState } from "react";
import { Stethoscope, Activity, HeartPulse, Home } from "lucide-react";
import { DoctorApp } from "./DoctorApp";
import { TherapistApp } from "./TherapistApp";
import { NurseApp } from "./NurseApp";

type SubRole = "doctor" | "therapist" | "nurse";

const subRoles: { key: SubRole; label: string; icon: typeof Home; accent: string }[] = [
  { key: "doctor", label: "社区医师", icon: Stethoscope, accent: "from-role-doctor/15 text-role-doctor" },
  { key: "therapist", label: "社区治疗师", icon: Activity, accent: "from-role-therapist/15 text-role-therapist" },
  { key: "nurse", label: "社区护士", icon: HeartPulse, accent: "from-role-nurse/15 text-role-nurse" },
];

/**
 * 社区端 = 康复医师 + 治疗师 + 护士 的集合体。
 * 顶部一个角色切换条，让社区工作人员在同一台手机内切换不同岗位视图。
 */
export const CommunityApp = () => {
  const [sub, setSub] = useState<SubRole>("doctor");

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Community header bar */}
      <div className="shrink-0 px-3 pt-3 pb-2 gradient-community">
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold text-white">社区康复一体化</div>
            <div className="text-[10px] text-white/75">医师 · 治疗师 · 护士 一人多岗</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white/15 backdrop-blur">
          {subRoles.map((r) => {
            const active = sub === r.key;
            return (
              <button
                key={r.key}
                onClick={() => setSub(r.key)}
                className={`flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[11px] font-medium transition-all ${
                  active ? "bg-white text-foreground shadow-sm" : "text-white/85"
                }`}
              >
                <r.icon className="w-3.5 h-3.5" />
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render the selected sub-role app */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {sub === "doctor" && <DoctorApp />}
        {sub === "therapist" && <TherapistApp />}
        {sub === "nurse" && <NurseApp />}
      </div>
    </div>
  );
};
