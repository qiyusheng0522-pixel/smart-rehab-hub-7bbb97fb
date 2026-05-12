import { useState } from "react";
import {
  Stethoscope,
  Activity,
  HeartPulse,
  Sparkles,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

type RoleKey = "doctor" | "therapist" | "nurse" | "ai" | "system";

interface Step {
  id: string;
  phase: string;
  title: string;
  desc: string;
  roles: RoleKey[];
  decision?: { yes: string; no: string };
}

const phases = [
  { key: "intake", label: "入院评估", color: "from-emerald-500 to-teal-500" },
  { key: "assess", label: "首次康复评估", color: "from-blue-500 to-cyan-500" },
  { key: "plan", label: "目标 & 方案", color: "from-violet-500 to-purple-500" },
  { key: "exec", label: "处方执行", color: "from-cyan-500 to-sky-500" },
  { key: "discharge", label: "出院 & 转介", color: "from-rose-500 to-pink-500" },
];

const steps: Step[] = [
  { id: "01", phase: "intake", title: "患者入院 · 风险及病史评估", desc: "采集基础信息，AI 智能分析风险等级并同步医生", roles: ["system", "ai"] },
  { id: "02", phase: "intake", title: "医生制定临床诊疗模式", desc: "根据 AI 风险分析报告，确立初步诊疗方向", roles: ["doctor"] },
  { id: "03", phase: "assess", title: "团队线上首次康复评估", desc: "康复医师组织团队线上协同评估患者状态", roles: ["doctor"] },
  { id: "04", phase: "assess", title: "AI 智能分析评估结果", desc: "对评估数据进行结构化分析与建议", roles: ["ai"] },
  { id: "05", phase: "assess", title: "治疗师判断评估结果", desc: "确认无误转入治疗；不确定则重新组织评估", roles: ["therapist"], decision: { yes: "进入目标设定", no: "返回首次评估" } },
  { id: "06", phase: "plan", title: "AI 智能设定康复目标", desc: "医师可手动调整目标，治疗师可自定义微调", roles: ["ai", "doctor", "therapist"] },
  { id: "07", phase: "plan", title: "AI 生成 / 更新康复方案", desc: "基于评估与目标动态生成个性化康复方案", roles: ["ai", "doctor"] },
  { id: "08", phase: "plan", title: "团队会议确认康复方案", desc: "线上会议讨论并锁定本周期康复方案", roles: ["doctor", "therapist"] },
  { id: "09", phase: "exec", title: "AI 生成康复处方 + 资源排班", desc: "处方下发治疗师；资源平台 AI 自动排班，治疗师可手工调整", roles: ["ai", "system", "therapist"] },
  { id: "10", phase: "exec", title: "治疗师确认 / 调整处方 → 医师确认", desc: "处方双向确认后，AI 智能推送康复任务", roles: ["therapist", "doctor", "ai"] },
  { id: "11", phase: "exec", title: "执行康复处方 PT / OT / ST", desc: "治疗师执行 + 每日小结/打卡/治疗记录/药物变动", roles: ["therapist"] },
  { id: "12", phase: "exec", title: "护士执行护理 + 宣教", desc: "AI 推送护理任务，含给药、康复护理与宣教", roles: ["nurse", "ai"] },
  { id: "13", phase: "discharge", title: "康复医师持续评估", desc: "全程跟踪评估，判定是否满足出院条件", roles: ["doctor"], decision: { yes: "生成二级方案", no: "继续执行处方" } },
  { id: "14", phase: "discharge", title: "AI 生成二级方案（院外康复）", desc: "调整确认院外康复方案，转交社区", roles: ["ai", "doctor"] },
  { id: "15", phase: "discharge", title: "出院 / 转介 · 闭环完成", desc: "患者出院或转社区，形成院内康复诊疗闭环", roles: ["system"] },
];

const roleConfig: Record<RoleKey, { label: string; icon: any; class: string; chip: string }> = {
  doctor: { label: "医师", icon: Stethoscope, class: "gradient-doctor", chip: "bg-primary-soft text-role-doctor" },
  therapist: { label: "治疗师", icon: Activity, class: "gradient-therapist", chip: "bg-secondary-soft text-role-therapist" },
  nurse: { label: "护士", icon: HeartPulse, class: "gradient-nurse", chip: "bg-rose-50 text-role-nurse" },
  ai: { label: "AI", icon: Sparkles, class: "gradient-ai", chip: "bg-ai-soft text-ai" },
  system: { label: "系统", icon: CheckCircle2, class: "gradient-primary", chip: "bg-muted text-foreground/70" },
};

export const WorkflowSection = () => {
  const [activePhase, setActivePhase] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>("01");

  const filtered = activePhase === "all" ? steps : steps.filter((s) => s.phase === activePhase);

  return (
    <section className="bg-card rounded-3xl shadow-card border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-border/60 bg-gradient-to-br from-primary-soft via-card to-ai-soft">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg gradient-ai flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-semibold text-ai uppercase tracking-wider">AI 全流程闭环</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">院内康复诊疗业务流程</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          15 步完整业务流程 · 跨越 5 大阶段 · 医师 / 治疗师 / 护士 / AI 协同闭环
        </p>

        {/* Phase tabs */}
        <div className="flex gap-2 mt-6 overflow-x-auto scrollbar-hide pb-1">
          <PhaseTab active={activePhase === "all"} onClick={() => setActivePhase("all")} label="全部阶段" />
          {phases.map((p) => (
            <PhaseTab
              key={p.key}
              active={activePhase === p.key}
              onClick={() => setActivePhase(p.key)}
              label={p.label}
            />
          ))}
        </div>
      </div>

      {/* Phase strip */}
      <div className="p-6 sm:p-8 border-b border-border/60">
        <div className="grid grid-cols-5 gap-2">
          {phases.map((p, i) => (
            <div key={p.key} className="relative">
              <div className={`h-1.5 rounded-full bg-gradient-to-r ${p.color}`} />
              <div className="mt-2 text-[11px] font-semibold text-foreground">{p.label}</div>
              <div className="text-[10px] text-muted-foreground">阶段 {i + 1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="p-4 sm:p-6 space-y-2">
        {filtered.map((s, idx) => {
          const isOpen = expanded === s.id;
          return (
            <div
              key={s.id}
              className={`rounded-2xl border transition-all ${
                isOpen ? "border-primary/30 bg-primary-soft/30 shadow-card" : "border-border/60 bg-card hover:border-border"
              }`}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : s.id)}
                className="w-full p-4 flex items-start gap-4 text-left"
              >
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                    isOpen ? "gradient-primary text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {s.id}
                  </div>
                  {idx < filtered.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-2" style={{ minHeight: 12 }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-sm sm:text-base font-semibold text-foreground">{s.title}</h3>
                    {s.decision && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning-soft text-warning font-semibold">
                        判定节点
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    {s.roles.map((r) => {
                      const cfg = roleConfig[r];
                      const Icon = cfg.icon;
                      return (
                        <span
                          key={r}
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${cfg.chip}`}
                        >
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground shrink-0 mt-3 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && s.decision && (
                <div className="px-4 pb-4 pl-[72px] grid grid-cols-2 gap-2">
                  <div className="rounded-xl p-3 bg-success-soft border border-success/20">
                    <div className="text-[10px] text-success font-bold mb-1">✓ 通过</div>
                    <div className="text-xs text-foreground">{s.decision.yes}</div>
                  </div>
                  <div className="rounded-xl p-3 bg-warning-soft border border-warning/20">
                    <div className="text-[10px] text-warning font-bold mb-1">↻ 不通过</div>
                    <div className="text-xs text-foreground">{s.decision.no}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Loop indicator */}
      <div className="p-6 sm:p-8 border-t border-border/60 bg-muted/30">
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <div className="w-8 h-px bg-border" />
          <span className="flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-foreground">闭环</span>
            <span>·</span>
            <span>出院后通过远程随访可重新触发康复评估</span>
          </span>
          <div className="w-8 h-px bg-border" />
        </div>
      </div>
    </section>
  );
};

const PhaseTab = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
  <button
    onClick={onClick}
    className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
      active
        ? "bg-foreground text-background shadow-md"
        : "bg-card text-muted-foreground hover:text-foreground border border-border"
    }`}
  >
    {label}
  </button>
);
