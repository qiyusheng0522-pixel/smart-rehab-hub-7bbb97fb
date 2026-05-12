import { useState } from "react";
import { Accent, Patient, PATIENTS } from "@/components/app/PatientsModule";
import { SectionTitle, AICard } from "@/components/app/UI";
import { ChevronRight, Target, FileText, Home as HomeIcon, Sparkles } from "lucide-react";

export type PlanStage = "goal" | "plan" | "discharge" | "airx";

const STAGE_LABEL: Record<PlanStage, string> = {
  goal: "康复目标",
  plan: "康复方案",
  airx: "康复处方",
  discharge: "出院方案",
};

const STAGE_DESC: Record<PlanStage, string> = {
  goal: "AI 智能设定 / 手动调整目标",
  plan: "AI 生成 / 团队会议确认方案 · 支持发起在线会议",
  airx: "AI 自动生成康复处方 · 医师确认",
  discharge: "AI 生成院外二级方案 · 需二次确认",
};

const STAGE_ICON: Record<PlanStage, any> = {
  goal: Target,
  plan: FileText,
  airx: Sparkles,
  discharge: HomeIcon,
};

export const REHAB_PLAN_BUCKETS: Record<PlanStage, { patientId: string; status: string; detail: string }[]> = {
  goal: [
    { patientId: "p1", status: "AI 已生成 4 周目标", detail: "待医师确认 · 步行 50m / FMA +8" },
    { patientId: "p4", status: "AI 目标待手动调整", detail: "MMSE 24 → 27" },
    { patientId: "p3", status: "AI 已生成", detail: "ADL Barthel ≥ 85" },
  ],
  plan: [
    { patientId: "p1", status: "AI 方案 V2", detail: "训练强度 +25% · 待团队会议确认" },
    { patientId: "p2", status: "新方案待确认", detail: "新增站立平衡训练" },
    { patientId: "p4", status: "方案微调", detail: "增加 ST 训练 2 次/周" },
  ],
  airx: [
    { patientId: "p1", status: "AI 待医师确认", detail: "PT 5/周 + OT 5/周 + ST 3/周" },
    { patientId: "p2", status: "AI 待医师确认", detail: "新增站立位平衡训练" },
    { patientId: "p3", status: "已签发待治疗师确认", detail: "OT 强度调整建议" },
    { patientId: "p5", status: "AI 待医师确认", detail: "首版 AI 处方建议" },
  ],
  discharge: [
    { patientId: "p3", status: "AI 二级方案已生成", detail: "满足出院条件 · 需 AI 二次确认 · 转社区" },
    { patientId: "p1", status: "出院条件评估中", detail: "Barthel 70 / 75 · 差 5 分" },
  ],
};

export const RehabPlanModule = ({
  accent,
  onPickPlan,
  initialStage = "plan",
  stages = ["goal", "plan", "airx", "discharge"],
  title = "康复方案",
  subtitle = "基于患者状态的处理列表",
}: {
  accent: Accent;
  onPickPlan: (stage: PlanStage, patient: Patient) => void;
  initialStage?: PlanStage;
  stages?: PlanStage[];
  title?: string;
  subtitle?: string;
}) => {
  const safeInitial = stages.includes(initialStage) ? initialStage : stages[0];
  const [stage, setStage] = useState<PlanStage>(safeInitial);
  const accentBg = {
    doctor: "gradient-doctor",
    therapist: "gradient-therapist",
    nurse: "gradient-nurse",
  }[accent];
  const accentText = {
    doctor: "text-role-doctor",
    therapist: "text-role-therapist",
    nurse: "text-role-nurse",
  }[accent];
  const items = REHAB_PLAN_BUCKETS[stage];

  return (
    <div className="pb-4">
      <div className={`${accentBg} px-5 pt-3 pb-6 text-white relative overflow-hidden`}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="text-xs opacity-80">{title}</div>
          <div className="text-[15px] font-semibold mt-0.5">{subtitle}</div>
          {stages.length > 1 && (
            <div className="mt-3 flex gap-1 bg-white/15 backdrop-blur rounded-full p-1">
              {stages.map((s) => {
                const active = stage === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStage(s)}
                    className={`flex-1 text-[11px] py-1.5 rounded-full font-semibold transition-all ${
                      active ? "bg-white text-foreground" : "text-white/90"
                    }`}
                  >
                    {STAGE_LABEL[s]}
                    <span className="ml-0.5 opacity-70">({REHAB_PLAN_BUCKETS[s].length})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        <AICard title={`${STAGE_LABEL[stage]} · ${STAGE_DESC[stage]}`}>
          下方为处于「{STAGE_LABEL[stage]}」环节的患者，点击进入逐位处理。
        </AICard>

        <SectionTitle title={`待处理患者 · ${items.length}`} />
        <div className="space-y-2">
          {items.map(({ patientId, status, detail }) => {
            const p = PATIENTS.find((x) => x.id === patientId);
            if (!p) return null;
            const Icon = STAGE_ICON[stage];
            return (
              <button
                key={patientId}
                onClick={() => onPickPlan(stage, p)}
                className="w-full text-left bg-card rounded-2xl shadow-card p-3.5 flex items-start gap-3 active:scale-[0.99]"
              >
                <div className={`w-10 h-10 rounded-xl ${accentBg} text-white flex items-center justify-center font-bold`}>
                  {p.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground">床 {p.bed}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{p.meta}</div>
                  <div className={`text-[11px] mt-1.5 font-semibold ${accentText} flex items-center gap-1`}>
                    <Icon className="w-3 h-3" />
                    {status}
                  </div>
                  <div className="text-[11px] text-foreground/70 mt-0.5">{detail}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground self-center" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* =============== AI 康复处方模块（独立）保留以兼容 =============== */
export interface AIRxBucket {
  patientId: string;
  status: "AI 待医师确认" | "已签发待治疗师确认" | "执行中" | "已完成";
  detail: string;
}

export const AI_RX_BUCKETS: AIRxBucket[] = [
  { patientId: "p1", status: "AI 待医师确认", detail: "PT 5/周 + OT 5/周 + ST 3/周" },
  { patientId: "p2", status: "AI 待医师确认", detail: "新增站立位平衡训练" },
  { patientId: "p3", status: "已签发待治疗师确认", detail: "OT 强度调整建议" },
  { patientId: "p4", status: "执行中", detail: "ST 30min × 3/周" },
  { patientId: "p5", status: "AI 待医师确认", detail: "首版 AI 处方建议" },
];

export const AIRxModule = ({
  accent,
  onPick,
}: {
  accent: Accent;
  onPick: (b: AIRxBucket, patient: Patient) => void;
}) => {
  const [filter, setFilter] = useState<"all" | "pending">("all");
  const accentBg = {
    doctor: "gradient-doctor",
    therapist: "gradient-therapist",
    nurse: "gradient-nurse",
  }[accent];
  const list = filter === "pending"
    ? AI_RX_BUCKETS.filter((b) => b.status === "AI 待医师确认")
    : AI_RX_BUCKETS;

  return (
    <div className="pb-4">
      <div className={`${accentBg} px-5 pt-3 pb-6 text-white relative overflow-hidden`}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <div className="text-xs opacity-80">AI 康复处方</div>
          </div>
          <div className="text-[15px] font-semibold mt-0.5">基于方案智能生成 · 医师确认</div>
          <div className="mt-3 flex gap-1.5 bg-white/15 backdrop-blur rounded-full p-1 w-fit">
            {(["all", "pending"] as const).map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-[12px] px-3 py-1.5 rounded-full font-semibold transition-all ${
                    active ? "bg-white text-foreground" : "text-white/90"
                  }`}
                >
                  {f === "all" ? "全部" : "待我确认"}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        <AICard title="AI 处方建议引擎">
          基于已确认方案 + 患者评估趋势，AI 自动生成 PT/OT/ST 综合处方建议，请医师审核确认。
        </AICard>

        <SectionTitle title={`处方列表 · ${list.length}`} />
        <div className="space-y-2">
          {list.map((b) => {
            const p = PATIENTS.find((x) => x.id === b.patientId);
            if (!p) return null;
            const statusColor = {
              "AI 待医师确认": "bg-warning/15 text-warning",
              "已签发待治疗师确认": "bg-primary/10 text-primary",
              "执行中": "bg-success-soft text-success",
              "已完成": "bg-muted text-muted-foreground",
            }[b.status];
            return (
              <button
                key={p.id}
                onClick={() => onPick(b, p)}
                className="w-full text-left bg-card rounded-2xl shadow-card p-3.5 flex items-start gap-3 active:scale-[0.99]"
              >
                <div className="w-10 h-10 rounded-xl gradient-ai text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground">床 {p.bed}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${statusColor}`}>{b.status}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{p.meta}</div>
                  <div className="text-[12px] text-foreground/80 mt-1">{b.detail}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground self-center" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
