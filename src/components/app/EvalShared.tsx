import { ReactNode, useState } from "react";
import { AICard, SectionTitle } from "@/components/app/UI";
import { FormRow } from "@/components/app/Sheet";
import {
  Sparkles,
  Stethoscope,
  Activity,
  Brain,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  X,
  Plus,
  ChevronDown,
  ChevronRight,
  Users,
  Calendar,
  ChevronLeft,
  Mic,
  ClipboardList,
  Pill,
  ShieldAlert,
  Target,
} from "lucide-react";
import { toast } from "sonner";

/* ==============================================================
 * 语音输入小组件 · 全端复用
 * ============================================================== */
export const VoiceMic = ({
  onTranscript,
  className = "",
  sample = "患者目前情况稳定，建议继续按方案执行。",
}: {
  onTranscript: (text: string) => void;
  className?: string;
  sample?: string;
}) => {
  const [recording, setRecording] = useState(false);
  const click = () => {
    if (recording) return;
    setRecording(true);
    toast("🎙 录音中…");
    setTimeout(() => {
      setRecording(false);
      onTranscript(sample);
      toast.success("语音已转写");
    }, 900);
  };
  return (
    <button
      type="button"
      onClick={click}
      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
        recording ? "bg-destructive/10 text-destructive border-destructive/30 animate-pulse" : "bg-muted text-foreground/70 border-border"
      } ${className}`}
      title="语音输入"
    >
      <Mic className="w-3.5 h-3.5" />
    </button>
  );
};

/* ==============================================================
 * 全端共享 · 三角色评估意见（保证三端互见）
 * ============================================================== */
export const ALL_CLINICAL_CONCLUSIONS = [
  { role: "康复医师 · 李志远", time: "今日 09:30", text: "急性缺血性脑卒中恢复期，BP 仍偏高，房颤未规范抗凝；建议加强血压及抗凝管理。", tone: "doctor" as const },
  { role: "治疗师 · 王雅琴 (PT)", time: "今日 10:15", text: "心率与血氧可耐受 30 分钟训练，建议训练时持续监测。", tone: "therapist" as const },
  { role: "护士 · 赵静怡", time: "今日 10:40", text: "夜间血压波动较大；皮肤完整、骶尾部发红需 q2h 翻身；跌倒/压疮高风险。", tone: "nurse" as const },
];

export const ALL_REHAB_CONCLUSIONS = [
  { role: "康复医师 · 李志远", time: "今日 09:35", text: "神经方向为主：右侧偏瘫 + 轻度认知损害，建议 PT/OT/ST 全套介入。", tone: "doctor" as const },
  { role: "治疗师 · 王雅琴 (PT)", time: "今日 10:20", text: "Berg 32 跌倒高危，先 1 周等长收缩与坐位平衡，第 2 周渐进站立位训练。", tone: "therapist" as const },
  { role: "治疗师 · 陈思雨 (ST)", time: "今日 10:25", text: "EAT-10：4 分，构音清晰度 78%，建议 ST 30 min × 3/周。", tone: "therapist" as const },
  { role: "护士 · 赵静怡", time: "今日 10:45", text: "ADL Barthel 35 分重度依赖，自理训练前先做安全评估与床旁辅助。", tone: "nurse" as const },
];

/* ==============================================================
 * 三段式 Tabs：临床评估 / 康复评估 / 康复目标
 * ============================================================== */
export type EvalTabKey = "clinical" | "rehab" | "goal";

export const EvalTabs = ({
  active,
  onChange,
  accent = "doctor",
  hideClinical = false,
}: {
  active: EvalTabKey;
  onChange: (k: EvalTabKey) => void;
  accent?: "doctor" | "therapist" | "nurse";
  hideClinical?: boolean;
}) => {
  const grad = accent === "therapist" ? "gradient-therapist" : accent === "nurse" ? "gradient-nurse" : "gradient-doctor";
  const items: { k: EvalTabKey; label: string }[] = [
    ...(hideClinical ? [] : [{ k: "clinical" as EvalTabKey, label: "临床评估" }]),
    { k: "rehab", label: "康复评估" },
    { k: "goal", label: "治疗目标" },
  ];
  return (
    <div className="sticky top-0 z-20 -mx-4 px-4 pt-1 pb-2 bg-background/95 backdrop-blur">
      <div className="flex items-center gap-1.5 bg-muted rounded-full p-1">
        {items.map((it) => {
          const isActive = active === it.k;
          return (
            <button
              key={it.k}
              onClick={() => onChange(it.k)}
              className={`flex-1 text-[12px] py-1.5 rounded-full font-semibold transition-all ${
                isActive ? `${grad} text-white shadow-card` : "text-foreground/70"
              }`}
            >
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* 角色 + 时间 · 风琴样式（默认收起） */
type RoleConclusionItem = {
  role: string;
  time: string;
  text: string;
  tone?: "doctor" | "therapist" | "nurse" | "ai";
};

const toneCls = (tone?: RoleConclusionItem["tone"]) =>
  tone === "therapist"
    ? "bg-secondary-soft text-secondary"
    : tone === "nurse"
      ? "bg-rose-50 text-role-nurse"
      : tone === "ai"
        ? "bg-ai/10 text-ai"
        : "bg-primary-soft text-primary";

export const RoleConclusionRow = ({ role, time, text, tone }: RoleConclusionItem) => (
  <div className="px-3 py-2.5 border-b border-border/60 last:border-0">
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${toneCls(tone)}`}>{role}</span>
      <span className="text-[10px] text-muted-foreground">{time}</span>
    </div>
    <div className="text-[12px] text-foreground/85 mt-1.5 leading-relaxed">{text}</div>
  </div>
);

/** 各角色评估结论 · 风琴折叠（默认收起）+ AI 分歧团队会议提示 */
export const RoleConclusionAccordion = ({
  title = "各角色首次评估结论",
  items,
  hasDivergence = false,
  onLaunchMeeting,
}: {
  title?: string;
  items: RoleConclusionItem[];
  hasDivergence?: boolean;
  onLaunchMeeting?: () => void;
}) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  if (!items?.length) return null;
  return (
    <div className="space-y-2">
      <H1 icon={Users}>{title}</H1>
      <div className="bg-card rounded-2xl shadow-card overflow-hidden divide-y divide-border/60">
        {items.map((c, i) => {
          const open = openIdx === i;
          return (
            <div key={i}>
              <button
                onClick={() => setOpenIdx(open ? null : i)}
                className="w-full px-3 py-2.5 flex items-center gap-2"
              >
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${toneCls(c.tone)}`}>{c.role}</span>
                <span className="text-[10px] text-muted-foreground flex-1 text-left">{c.time}</span>
                {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              </button>
              {open && (
                <div className="px-3 pb-3 text-[12px] text-foreground/85 leading-relaxed">{c.text}</div>
              )}
            </div>
          );
        })}
      </div>
      {hasDivergence && onLaunchMeeting && (
        <button
          onClick={onLaunchMeeting}
          className="w-full bg-gradient-to-r from-warning/15 to-ai/15 border border-warning/30 rounded-2xl p-3 flex items-center gap-3 active:scale-[0.99]"
        >
          <div className="w-9 h-9 rounded-xl bg-ai text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-[12px] font-bold text-warning flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> AI 检测到各角色结论存在较大分歧
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">点击进入团队会议 · AI 将先发送分歧点</div>
          </div>
          <span className="text-[11px] font-semibold text-warning px-2 py-1 rounded-full bg-warning/10 border border-warning/30 shrink-0">进入团队会议</span>
        </button>
      )}
    </div>
  );
};

/* H1 / H2 / item 三级层次 */
export const H1 = ({ children, icon: Icon }: { children: ReactNode; icon?: any }) => (
  <div className="flex items-center gap-2 mt-3 mb-1.5 px-1">
    {Icon && <Icon className="w-4 h-4 text-primary" />}
    <span className="text-[13px] font-bold text-foreground">{children}</span>
  </div>
);

export const H2 = ({ children, extra }: { children: ReactNode; extra?: ReactNode }) => (
  <div className="flex items-center justify-between mt-1.5 mb-1 px-1">
    <span className="text-[11px] font-semibold text-muted-foreground tracking-wide">{children}</span>
    {extra}
  </div>
);

/* ==============================================================
 * 临床评估面板（卡片折叠 · 默认全部展开 · 与康复方向卡片一致）
 * ============================================================== */
type ClinicalSectionKey = "vitals" | "lab" | "history" | "nursing";
const CLINICAL_META: Record<ClinicalSectionKey, { label: string; icon: any; cls: string }> = {
  vitals: { label: "生命体征", icon: HeartPulse, cls: "bg-rose-50 text-role-nurse" },
  lab: { label: "生化与影像结果", icon: Activity, cls: "bg-primary-soft text-primary" },
  history: { label: "既往史与用药史", icon: Pill, cls: "bg-secondary-soft text-secondary" },
  nursing: { label: "护理首评要点", icon: ShieldAlert, cls: "bg-warning-soft text-warning" },
};

const ClinicalCard = ({
  k,
  defaultOpen = true,
  children,
}: {
  k: ClinicalSectionKey;
  defaultOpen?: boolean;
  children: ReactNode;
}) => {
  const meta = CLINICAL_META[k];
  const [open, setOpen] = useState(defaultOpen);
  const Icon = meta.icon;
  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full px-3.5 py-2.5 flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg ${meta.cls} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[13px] font-semibold text-foreground flex-1 text-left">{meta.label}</span>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );
};

export const ClinicalPanel = ({
  showNursing = false,
  conclusions,
  hasDivergence = false,
  onLaunchMeeting,
  aiBottom,
}: {
  showNursing?: boolean;
  conclusions?: RoleConclusionItem[];
  hasDivergence?: boolean;
  onLaunchMeeting?: () => void;
  /** AI 临床评估辅助结论 · 渲染在面板最底部 */
  aiBottom?: ReactNode;
}) => (
  <div className="space-y-2">
    <ClinicalCard k="vitals">
      <H2>(1) 当前生命体征</H2>
      <div className="bg-muted/40 rounded-xl divide-y divide-border/60">
        <FormRow label="血压 BP" value="142 / 88 mmHg" hint="入院偏高" />
        <FormRow label="心率 HR" value="78 bpm · 律齐" />
        <FormRow label="呼吸 RR" value="18 /min" />
        <FormRow label="血氧 SpO₂" value="97 %" />
        <FormRow label="体温 T" value="36.7 ℃" />
      </div>
    </ClinicalCard>

    <ClinicalCard k="lab">
      <H2>(1) 血液生化</H2>
      <div className="bg-muted/40 rounded-xl divide-y divide-border/60">
        <FormRow label="血常规" value="WBC 7.2 · Hb 132" />
        <FormRow label="肝肾功能" value="ALT 28 · Cr 86 μmol/L" />
        <FormRow label="电解质" value="K 4.1 · Na 138" />
        <FormRow label="血脂 / 血糖" value="LDL 3.6 · 空腹 6.2" hint="LDL 偏高" />
        <FormRow label="凝血功能" value="INR 1.0 · D-D 1.8" hint="D-二聚体偏高" />
      </div>
      <H2>(2) 影像学</H2>
      <div className="bg-muted/40 rounded-xl divide-y divide-border/60">
        <FormRow label="头颅 MRI" value="左基底节区急性梗死" hint="2026-05-07" />
        <FormRow label="颈动脉超声" value="右颈内动脉 50% 狭窄" />
      </div>
    </ClinicalCard>

    <ClinicalCard k="history">
      <H2>(1) 既往疾病</H2>
      <div className="bg-muted/40 rounded-xl divide-y divide-border/60">
        <FormRow label="高血压" value="10 年" hint="氨氯地平 5mg qd" />
        <FormRow label="糖尿病" value="无" />
        <FormRow label="房颤" value="3 年" hint="未规范抗凝" />
        <FormRow label="过敏史" value="无" />
      </div>
      <H2>(2) 既往用药</H2>
      <div className="bg-muted/40 rounded-xl divide-y divide-border/60">
        <FormRow label="降压" value="氨氯地平 5mg qd" />
        <FormRow label="抗血小板" value="阿司匹林 100mg qd" />
      </div>
    </ClinicalCard>

    {showNursing && (
      <ClinicalCard k="nursing">
        <H2>(1) 一般情况</H2>
        <div className="bg-muted/40 rounded-xl divide-y divide-border/60">
          <FormRow label="意识 GCS" value="13 分 · 嗜睡" />
          <FormRow label="皮肤情况" value="完整 · 骶尾部发红" />
        </div>
        <H2>(2) 风险评估</H2>
        <div className="bg-muted/40 rounded-xl divide-y divide-border/60">
          <FormRow label="跌倒 Morse" value="55 · 高危" />
          <FormRow label="压疮 Braden" value="14 · 高危" />
          <FormRow label="VTE Caprini" value="5 · 高危" />
        </div>
        <H2>(3) 管路 / 自理</H2>
        <div className="bg-muted/40 rounded-xl divide-y divide-border/60">
          <FormRow label="管路" value="导尿管 · PICC" />
          <FormRow label="ADL Barthel" value="35 · 重度依赖" />
        </div>
        <H2>(4) 心理 / 营养</H2>
        <div className="bg-muted/40 rounded-xl divide-y divide-border/60">
          <FormRow label="疼痛 NRS" value="3 · 轻度" />
          <FormRow label="HAMD 简版" value="9 · 轻度抑郁倾向" />
          <FormRow label="营养 NRS-2002" value="3 · 有风险" />
        </div>
      </ClinicalCard>
    )}

    {conclusions && conclusions.length > 0 && (
      <RoleConclusionAccordion
        title="各角色临床评估结论"
        items={conclusions}
        hasDivergence={hasDivergence}
        onLaunchMeeting={onLaunchMeeting}
      />
    )}

    {aiBottom}
  </div>
);

/* ==============================================================
 * 康复评估面板：心肺 / 神经 / 骨科 三方向折叠
 * ============================================================== */
export type RehabDirection = "cardiopulmonary" | "neuro" | "ortho";
const DIRECTION_META: Record<RehabDirection, { label: string; icon: any; cls: string }> = {
  cardiopulmonary: { label: "心肺方向", icon: HeartPulse, cls: "bg-rose-50 text-role-nurse" },
  neuro: { label: "神经方向", icon: Brain, cls: "bg-primary-soft text-primary" },
  ortho: { label: "骨科方向", icon: Activity, cls: "bg-secondary-soft text-secondary" },
};

export const RehabPanel = ({
  defaultOpenAll = true,
  scaleSlot,
  conclusions,
  hasDivergence = false,
  onLaunchMeeting,
  aiBottom,
  hideDirections = false,
}: {
  defaultOpenAll?: boolean;
  scaleSlot?: ReactNode;
  conclusions?: RoleConclusionItem[];
  hasDivergence?: boolean;
  onLaunchMeeting?: () => void;
  /** AI 康复评估辅助结论 · 渲染在面板最底部 */
  aiBottom?: ReactNode;
  /** 隐藏「心肺 / 神经 / 骨科」三方向卡片（如护士端只展示护理内容） */
  hideDirections?: boolean;
}) => {
  return (
    <div className="space-y-2">
      {/* 心肺 / 神经 / 骨科 三方向已下沉至量表库的方向标签，不再单独展示 */}


      {scaleSlot && (
        <>
          <H1>评估量表</H1>
          {scaleSlot}
        </>
      )}

      {conclusions && conclusions.length > 0 && (
        <RoleConclusionAccordion
          title="各角色康复评估结论"
          items={conclusions}
          hasDivergence={hasDivergence}
          onLaunchMeeting={onLaunchMeeting}
        />
      )}

      {aiBottom}
    </div>
  );
};

/* ==============================================================
 * 康复目标 · 编号清晰版
 * ============================================================== */
export type NumberedGoal = {
  id: string;
  dim: "function" | "activity" | "participation";
  period: "1 周" | "2 周" | "4 周" | "8 周";
  source: "AI" | "医师" | "治疗师";
  text: string;
  measure?: string;
  /** 二级子目标 · 有则默认展开，无则默认收起 */
  subGoals?: { id: string; text: string; period?: string }[];
};

const DIM_META: Record<NumberedGoal["dim"], { label: string; cls: string }> = {
  function: { label: "身体功能", cls: "bg-primary-soft text-primary" },
  activity: { label: "活动", cls: "bg-secondary-soft text-secondary" },
  participation: { label: "参与", cls: "bg-warning-soft text-warning" },
};

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const DEFAULT_NUMBERED_GOALS: NumberedGoal[] = [
  {
    id: "g1", dim: "function", period: "4 周", source: "AI",
    text: "右上下肢肌力由 2 级提升至 3+ 级",
    measure: "MMT ≥ 3+ · MAS ≤ 1+",
    subGoals: [
      { id: "g1-1", text: "右上肢 MMT 由 2 级 → 3 级", period: "2 周" },
      { id: "g1-2", text: "右下肢 MMT 由 2 级 → 3+ 级", period: "4 周" },
      { id: "g1-3", text: "踝跖屈 MAS ≤ 1+", period: "4 周" },
    ],
  },
  { id: "g2", dim: "function", period: "4 周", source: "AI", text: "认知与忽略明显改善", measure: "MoCA ≥ 24" },
  {
    id: "g3", dim: "activity", period: "2 周", source: "AI",
    text: "床椅独立转移 + 助行器辅助步行 30m",
    measure: "Berg ≥ 40",
    subGoals: [
      { id: "g3-1", text: "床椅转移由 2 级辅助 → 监督独立", period: "1 周" },
      { id: "g3-2", text: "助行器辅助下步行 ≥ 30m", period: "2 周" },
    ],
  },
  { id: "g4", dim: "activity", period: "4 周", source: "AI", text: "独立步行 ≥ 50m", measure: "FAC ≥ 3 · Barthel ≥ 75" },
  { id: "g5", dim: "participation", period: "8 周", source: "AI", text: "回归家庭生活", measure: "独立完成 ADL 6 项" },
];

export const NumberedGoals = ({
  accent = "doctor",
  initial = DEFAULT_NUMBERED_GOALS,
  readOnly = false,
  coarse = false,
}: {
  accent?: "doctor" | "therapist" | "nurse";
  initial?: NumberedGoal[];
  /** 只读模式 · 隐藏新增 / 编辑 / 删除按钮（如护士端） */
  readOnly?: boolean;
  /** 粗目标模式 · 医师端使用：仅 ICF 维度 + 大目标文本，隐藏周期/衡量指标/子目标 */
  coarse?: boolean;
}) => {
  const grad = accent === "therapist" ? "gradient-therapist" : accent === "nurse" ? "gradient-nurse" : "gradient-doctor";
  const accentText = accent === "therapist" ? "text-secondary" : accent === "nurse" ? "text-role-nurse" : "text-primary";
  const [goals, setGoals] = useState<NumberedGoal[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [draftDim, setDraftDim] = useState<NumberedGoal["dim"]>("activity");
  const [draftPeriod, setDraftPeriod] = useState<NumberedGoal["period"]>("4 周");
  const [draftMeasure, setDraftMeasure] = useState("");
  const [adding, setAdding] = useState(false);
  const [newDraft, setNewDraft] = useState("");
  const [newDim, setNewDim] = useState<NumberedGoal["dim"]>("activity");
  const [newPeriod, setNewPeriod] = useState<NumberedGoal["period"]>("4 周");
  const [newMeasure, setNewMeasure] = useState("");
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initial.map(g => [g.id, !!(g.subGoals && g.subGoals.length)]))
  );
  const toggle = (id: string) => setOpenMap(m => ({ ...m, [id]: !(m[id] ?? false) }));

  const PERIODS: NumberedGoal["period"][] = ["1 周", "2 周", "4 周", "8 周"];
  const DIMS: NumberedGoal["dim"][] = ["function", "activity", "participation"];

  const remove = (id: string) => { setGoals(goals.filter(g => g.id !== id)); toast.success("目标已删除"); };
  const startEdit = (g: NumberedGoal) => {
    setEditingId(g.id);
    setDraft(g.text);
    setDraftDim(g.dim);
    setDraftPeriod(g.period);
    setDraftMeasure(g.measure || "");
  };
  const saveEdit = () => {
    if (!editingId) return;
    setGoals(goals.map(g => g.id === editingId ? {
      ...g,
      text: draft.trim() || g.text,
      dim: draftDim,
      period: draftPeriod,
      measure: draftMeasure.trim() || undefined,
    } : g));
    setEditingId(null);
    toast.success("目标已更新");
  };
  const addGoal = () => {
    if (!newDraft.trim()) return;
    const id = `ng${Date.now()}`;
    setGoals([...goals, {
      id, dim: newDim, period: newPeriod, source: "医师",
      text: newDraft.trim(),
      measure: newMeasure.trim() || undefined,
    }]);
    setOpenMap(m => ({ ...m, [id]: false }));
    setNewDraft(""); setNewMeasure(""); setNewDim("activity"); setNewPeriod("4 周"); setAdding(false);
    toast.success("已新增目标");
  };

  return (
    <div className="space-y-2">
      {!readOnly && (
        <button
          onClick={() => setAdding(true)}
          className={`w-full ${grad} text-white rounded-2xl py-2.5 text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-card active:scale-[0.98]`}
        >
          <Plus className="w-4 h-4" />新增治疗目标
        </button>
      )}

      {adding && !readOnly && (
        <div className="bg-card rounded-2xl shadow-card p-3 space-y-2">
          <div className="flex gap-2 items-start">
            <textarea
              value={newDraft}
              onChange={(e) => setNewDraft(e.target.value)}
              placeholder="新增治疗目标（可语音输入）"
              className="flex-1 text-[12px] bg-muted rounded-lg p-2 min-h-[60px]"
              autoFocus
            />
            <VoiceMic onTranscript={(t) => setNewDraft((v) => (v ? v + " " : "") + t)} sample="改善左下肢平衡能力，2 周内 Berg ≥ 40。" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] text-muted-foreground self-center">ICF 维度：</span>
            {DIMS.map(d => (
              <button key={d} onClick={() => setNewDim(d)} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${newDim === d ? DIM_META[d].cls + " border-transparent" : "bg-card text-muted-foreground border-border"}`}>{DIM_META[d].label}</button>
            ))}
          </div>
          {!coarse && (
            <>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] text-muted-foreground self-center">周期：</span>
                {PERIODS.map(p => (
                  <button key={p} onClick={() => setNewPeriod(p)} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${newPeriod === p ? `${grad} text-white border-transparent` : "bg-card text-muted-foreground border-border"}`}>{p}</button>
                ))}
              </div>
              <input value={newMeasure} onChange={(e) => setNewMeasure(e.target.value)} placeholder="衡量指标（选填，如 Berg ≥ 40）" className="w-full text-[12px] bg-muted rounded-lg p-2" />
            </>
          )}
          <div className="flex gap-2">
            <button onClick={() => { setAdding(false); setNewDraft(""); setNewMeasure(""); }} className="flex-1 text-[11px] border border-border rounded-lg py-1.5">取消</button>
            <button onClick={addGoal} className={`flex-1 text-[11px] ${grad} text-white rounded-lg py-1.5 font-semibold`}>保存</button>
          </div>
        </div>
      )}


      {goals.map((g, idx) => {
        const dimMeta = DIM_META[g.dim];
        const isEditing = editingId === g.id;
        const hasSub = !!(g.subGoals && g.subGoals.length);
        const open = openMap[g.id] ?? hasSub;
        return (
          <div key={g.id} className="bg-card rounded-2xl shadow-card overflow-hidden">
            <button onClick={() => toggle(g.id)} className="w-full p-3.5 flex gap-3 items-start text-left">
              <div className={`relative w-9 h-9 rounded-xl ${grad} text-white flex items-center justify-center shrink-0 shadow-card`}>
                <Target className="w-5 h-5" strokeWidth={2.4} />
                <span className="absolute -bottom-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-background text-[9px] font-bold text-foreground border border-border flex items-center justify-center">
                  {pad2(idx + 1)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${dimMeta.cls}`}>{dimMeta.label}</span>
                  {!coarse && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground/70 font-semibold">{g.period}</span>}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${g.source === "AI" ? "bg-ai/10 text-ai" : "bg-primary-soft text-primary"}`}>{g.source}</span>
                  {coarse && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground/60 font-semibold">粗目标</span>}
                  {!coarse && hasSub && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning-soft text-warning font-semibold">含 {g.subGoals!.length} 项子目标</span>
                  )}
                </div>
                <div className="text-[13px] text-foreground font-semibold mt-1.5 leading-relaxed">{g.text}</div>
              </div>
              {open ? <ChevronDown className="w-4 h-4 text-muted-foreground mt-1" /> : <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />}
            </button>

            {open && (
              <div className="px-3.5 pb-3.5 -mt-1 space-y-2">
                {!coarse && g.measure && (
                  <div className="text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">衡量指标：{g.measure}</div>
                )}
                {!coarse && hasSub && (
                  <div className="bg-muted/30 rounded-xl divide-y divide-border/60">
                    {g.subGoals!.map((sg, j) => (
                      <div key={sg.id} className="flex items-start gap-2 px-3 py-2">
                        <span className="text-[11px] font-bold text-foreground/70 shrink-0 w-7">{idx + 1}.{j + 1}</span>
                        <div className="flex-1 text-[12px] text-foreground/90 leading-relaxed">{sg.text}</div>
                        {sg.period && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-card text-muted-foreground shrink-0">{sg.period}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!readOnly && (
                  isEditing ? (
                    <div className="space-y-2">
                      <div className="flex gap-2 items-start">
                        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="flex-1 text-[12px] bg-muted rounded-lg p-2 min-h-[60px]" autoFocus />
                        <VoiceMic onTranscript={(t) => setDraft((v) => (v ? v + " " : "") + t)} sample="将训练时间调整为每日 30 分钟。" />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[10px] text-muted-foreground self-center">ICF 维度：</span>
                        {DIMS.map(d => (
                          <button key={d} onClick={() => setDraftDim(d)} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${draftDim === d ? DIM_META[d].cls + " border-transparent" : "bg-card text-muted-foreground border-border"}`}>{DIM_META[d].label}</button>
                        ))}
                      </div>
                      {!coarse && (
                        <>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-[10px] text-muted-foreground self-center">周期：</span>
                            {PERIODS.map(p => (
                              <button key={p} onClick={() => setDraftPeriod(p)} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${draftPeriod === p ? `${grad} text-white border-transparent` : "bg-card text-muted-foreground border-border"}`}>{p}</button>
                            ))}
                          </div>
                          <input value={draftMeasure} onChange={(e) => setDraftMeasure(e.target.value)} placeholder="衡量指标（选填）" className="w-full text-[12px] bg-muted rounded-lg p-2" />
                        </>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => setEditingId(null)} className="flex-1 text-[11px] border border-border rounded-lg py-1.5">取消</button>
                        <button onClick={saveEdit} className={`flex-1 text-[11px] ${grad} text-white rounded-lg py-1.5 font-semibold`}>保存</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={(e) => { e.stopPropagation(); startEdit(g); }} className={`text-[11px] ${accentText} font-semibold flex items-center gap-0.5`}><Edit2 className="w-3 h-3" />编辑</button>
                      <button onClick={(e) => { e.stopPropagation(); remove(g.id); }} className="text-[11px] text-destructive font-semibold flex items-center gap-0.5"><X className="w-3 h-3" />删除</button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ==============================================================
 * 团队会议 · 分歧自动发起
 * ============================================================== */
export type DisputeItem = {
  id: string;
  topic: string;
  doctor: string;
  therapist: string;
  nurse: string;
};

const DEFAULT_DISPUTES: DisputeItem[] = [
  {
    id: "d1",
    topic: "下肢负重时机",
    doctor: "建议术后第 5 天起渐进负重 25%。",
    therapist: "实际触诊疼痛 VAS 7，建议先 1 周等长收缩，第 7 天再负重。",
    nurse: "夜间疼痛仍较重，倾向延后 2 天。",
  },
  {
    id: "d2",
    topic: "OT 训练强度",
    doctor: "OT 厨房训练 25min × 5/周。",
    therapist: "患者认知耐受不足，建议 15min × 5/周起步。",
    nurse: "建议增加陪护配合度宣教。",
  },
];

export const TeamMeetingBanner = ({
  count = 2,
  onOpen,
}: {
  count?: number;
  onOpen: () => void;
}) => (
  <button
    onClick={onOpen}
    className="w-full bg-gradient-to-r from-warning/15 to-ai/15 border border-warning/30 rounded-2xl p-3 flex items-center gap-3 active:scale-[0.99]"
  >
    <div className="w-9 h-9 rounded-xl bg-ai text-white flex items-center justify-center shrink-0">
      <Sparkles className="w-4 h-4" />
    </div>
    <div className="flex-1 text-left">
      <div className="text-[12px] font-bold text-warning flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5" /> AI 检测到 {count} 项评估分歧 · 已发起团队会议
      </div>
      <div className="text-[10px] text-muted-foreground mt-0.5">医师 / 治疗师 / 护士 进入讨论 → 同步至评估 / 方案 / 医嘱</div>
    </div>
    <ChevronRight className="w-4 h-4 text-warning" />
  </button>
);

export const TeamMeetingDisputeSheet = ({
  onClose,
  disputes = DEFAULT_DISPUTES,
}: {
  onClose: () => void;
  disputes?: DisputeItem[];
}) => {
  const [syncTargets, setSyncTargets] = useState<Record<string, boolean>>({
    eval: true,
    plan: true,
    rx: false,
  });
  
  const toggle = (k: string) => setSyncTargets({ ...syncTargets, [k]: !syncTargets[k] });
  const finish = () => {
    const labels = [
      syncTargets.eval && "康复评估",
      syncTargets.plan && "康复方案",
      syncTargets.rx && "康复医嘱",
    ].filter(Boolean).join(" / ");
    toast.success(`会议结论已同步至 ${labels || "档案"}`);
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="bg-warning/10 border-b border-warning/20 px-4 py-3 flex items-center gap-2">
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-card flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold text-warning flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> AI 团队会议 · 分歧讨论
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">共 {disputes.length} 项分歧 · 医师 / 治疗师 / 护士 在线</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AICard title="AI 自动整理的分歧条目">
          系统检测到三方评估在以下条目存在分歧，已自动召集相关角色进入会议讨论。
        </AICard>

        {disputes.map((d, i) => (
          <div key={d.id} className="bg-card rounded-2xl shadow-card overflow-hidden">
            <div className="px-3 py-2 bg-warning/10 border-b border-warning/20 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-warning text-white flex items-center justify-center text-[11px] font-bold">{i + 1}</span>
              <span className="text-[13px] font-bold">{d.topic}</span>
            </div>
            <RoleConclusionRow role="医师 · 李志远" time="今日 09:30" text={d.doctor} tone="doctor" />
            <RoleConclusionRow role="治疗师 · 王雅琴" time="今日 10:10" text={d.therapist} tone="therapist" />
            <RoleConclusionRow role="护士 · 赵静怡" time="今日 10:25" text={d.nurse} tone="nurse" />
          </div>
        ))}

        <H1>讨论区</H1>
        <div className="bg-card rounded-2xl shadow-card p-3 space-y-2 text-[12px]">
          <div className="flex gap-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-soft text-primary font-semibold shrink-0">医师</span>
            <span>同意先 1 周等长收缩，第 7 天复评后再决定负重。</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary-soft text-secondary font-semibold shrink-0">治疗师</span>
            <span>OT 强度调整为 15min × 5/周，2 周后再加量。</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-role-nurse font-semibold shrink-0">护士</span>
            <span>夜间疼痛干预方案同步增加镇痛护理。</span>
          </div>
        </div>

        <H1>会议结论 · 同步范围</H1>
        <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
          {[
            { k: "eval", label: "同步至 · 康复评估" },
            { k: "plan", label: "同步至 · 康复方案" },
            { k: "rx", label: "同步至 · 康复医嘱" },
          ].map(it => (
            <button key={it.k} onClick={() => toggle(it.k)} className="w-full px-3 py-3 flex items-center justify-between">
              <span className="text-[13px]">{it.label}</span>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${syncTargets[it.k] ? "bg-primary border-primary text-white" : "border-border"}`}>
                {syncTargets[it.k] && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border/60 bg-card/95 backdrop-blur-xl px-4 py-3 pb-5 space-y-2">
        <button onClick={finish} className="w-full gradient-ai text-white rounded-2xl py-3 text-sm font-semibold shadow-card flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" /> 生成会议结论并同步
        </button>
      </div>

    </div>
  );
};

/* ==============================================================
 * AI 自动排班
 * ============================================================== */
type SlotCell = { therapist: string; patient: string; room: string; type: "PT" | "OT" | "ST" } | null;

const SLOTS_AM = ["08:00", "09:00", "10:00", "11:00"];
const SLOTS_PM = ["14:00", "15:00", "16:00", "17:00"];
const ROOMS = ["A-301", "A-303", "B-201", "B-205"];
const THERAPISTS = ["王雅琴(PT)", "陈治疗师(OT)", "陈思雨(ST)", "李建华(PT)"];

const generateAutoSchedule = (): SlotCell[][] => {
  const allSlots = [...SLOTS_AM, ...SLOTS_PM];
  const patients = ["张建国 303", "王秀英 305", "李 强 307", "陈丽华 310", "刘伟明 312", "周建华 311"];
  return allSlots.map((_, si) =>
    THERAPISTS.map((t, ti) => {
      // 简单避冲突：每 2 个时段空 1 格
      if ((si + ti) % 3 === 2) return null;
      const type: "PT" | "OT" | "ST" = t.includes("PT") ? "PT" : t.includes("OT") ? "OT" : "ST";
      return {
        therapist: t.split("(")[0],
        patient: patients[(si + ti) % patients.length],
        room: ROOMS[(si + ti) % ROOMS.length],
        type,
      };
    })
  );
};

export const AutoScheduleSheet = ({ onClose }: { onClose: () => void }) => {
  const [grid, setGrid] = useState<SlotCell[][]>(generateAutoSchedule());
  const allSlots = [...SLOTS_AM, ...SLOTS_PM];
  const used = grid.flat().filter(Boolean).length;
  const total = grid.length * THERAPISTS.length;
  const utilization = Math.round((used / total) * 100);

  const regenerate = () => {
    setGrid(generateAutoSchedule());
    toast.success("AI 已重新排班 · 已避开冲突");
  };

  const typeColor = (t: "PT" | "OT" | "ST") =>
    t === "PT" ? "bg-primary/15 text-primary" : t === "OT" ? "bg-secondary-soft text-secondary" : "bg-success-soft text-success";

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="bg-card border-b border-border/60 px-4 py-3 flex items-center gap-2">
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-ai" /> AI 自动排班
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">综合：设备 / 治疗师 / 患者空闲 · 排课模式（上午 4 段 / 下午 4 段）</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        <AICard title="AI 排班说明">
          已综合「设备空闲 + 治疗师空闲 + 患者空闲」生成无冲突排班，最大化设备 / 人力利用率。
          <div className="mt-2 text-[11px] flex gap-3 text-muted-foreground">
            <span>设备利用率 <span className="text-foreground font-bold">{utilization}%</span></span>
            <span>已排 <span className="text-foreground font-bold">{used}</span> / {total}</span>
          </div>
        </AICard>

        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="text-[10px] min-w-full border-collapse">
              <thead>
                <tr className="bg-muted/60">
                  <th className="sticky left-0 z-10 bg-muted/60 px-2 py-2 text-left border-r border-border/60 w-[64px]">时段</th>
                  {THERAPISTS.map((t) => (
                    <th key={t} className="px-1.5 py-2 font-semibold text-foreground border-r border-border/60 last:border-0 w-[80px]">{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allSlots.map((slot, si) => {
                  const isPM = si >= SLOTS_AM.length;
                  return (
                    <tr key={slot} className={`border-t border-border/60 ${isPM ? "bg-warning/5" : ""}`}>
                      <td className="sticky left-0 z-10 bg-card px-2 py-1.5 border-r border-border/60 font-bold">
                        {slot}
                        <div className="text-[8px] text-muted-foreground">{isPM ? "下午" : "上午"}</div>
                      </td>
                      {grid[si].map((cell, ti) => (
                        <td key={ti} className="px-1 py-1 border-r border-border/60 last:border-0">
                          {cell ? (
                            <div className={`rounded-md px-1.5 py-1 ${typeColor(cell.type)}`}>
                              <div className="font-bold leading-tight">{cell.type}</div>
                              <div className="leading-tight truncate">{cell.patient}</div>
                              <div className="text-[9px] opacity-75 leading-tight">{cell.room}</div>
                            </div>
                          ) : (
                            <div className="h-12 rounded-md border border-dashed border-border/50 flex items-center justify-center text-muted-foreground">空闲</div>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 bg-card/95 backdrop-blur-xl px-4 py-3 pb-5 flex gap-2">
        <button onClick={regenerate} className="flex-1 border border-ai/30 text-ai rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4" /> AI 重新排班
        </button>
        <button onClick={() => { toast.success("排班已发布给治疗师 / 患者"); onClose(); }} className="flex-1 gradient-ai text-white rounded-2xl py-3 text-sm font-semibold">
          发布排班
        </button>
      </div>
    </div>
  );
};

/* ==============================================================
 * 首程记录 · 团队会议一键生成
 * ============================================================== */
export const FirstNoteSheet = ({ onClose }: { onClose: () => void }) => {
  const [sections, setSections] = useState({
    chief: "患者主诉右侧肢体无力 5 天,伴言语含糊,生活不能自理。",
    history: "5 天前晨起活动时突发右侧肢体乏力,持物不稳,行走偏斜,送至急诊查头颅 MRI 提示左侧基底节区脑梗死,经神经内科溶栓 + 抗血小板治疗病情稳定,现转入康复科继续治疗。",
    exam: "神清,构音障碍,右侧鼻唇沟变浅,伸舌右偏;右上肢肌力 3 级、右下肢肌力 3+ 级,腱反射稍亢进,Babinski 征 (+);Brunnstrom 上肢 III 期、手 III 期、下肢 IV 期。",
    diagnosis: "1) 脑梗死恢复期(左侧基底节区)\n2) 右侧偏瘫\n3) 构音障碍\n4) 高血压病 2 级 高危",
    plan: "辅助检查:复查头颅 MRI+MRA、颈动脉超声、24h 动态血压、凝血四项、同型半胱氨酸、心脏彩超。\n治疗方案:抗血小板 + 他汀稳定斑块;PT 偏瘫肢体综合训练 + 平衡训练 40min/日;OT 手功能 + ADL 训练 30min/日;ST 构音 + 吞咽训练 20min/日;针灸 / 经颅磁刺激辅助。",
    risk: "存在跌倒(Morse 65 分,高风险)、误吸、压疮、深静脉血栓、二次卒中复发等风险,已告知家属并签署知情同意书,夜间需专人陪护。",
  });
  const fields: { key: keyof typeof sections; label: string; hint: string }[] = [
    { key: "chief", label: "主诉 · 哪里不舒服", hint: "病人主要不适及持续时间" },
    { key: "history", label: "现病史 · 发病过程", hint: "起病-就诊-治疗-转入经过" },
    { key: "exam", label: "查体情况", hint: "专科查体 + 阳性体征" },
    { key: "diagnosis", label: "初步诊断", hint: "主诊断 / 次诊断 / 合并症" },
    { key: "plan", label: "下一步诊疗计划", hint: "检查 + 治疗方案" },
    { key: "risk", label: "风险告知", hint: "潜在风险 + 沟通签字情况" },
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col animate-in slide-in-from-bottom-4">
      <div className="bg-gradient-to-r from-ai/15 to-primary/10 border-b border-border/60 px-4 py-3 flex items-center gap-2">
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-card flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-ai" /> 生成首程
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">AI 已根据团队会议讨论与三方评估自动生成</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AICard title="AI 首程模板">
          已整合医师 / 治疗师 / 护士首次评估结论与会议讨论,按规范模板生成首程记录,可编辑后保存。
        </AICard>
        {fields.map((f, i) => (
          <div key={f.key} className="bg-card rounded-2xl shadow-card overflow-hidden">
            <div className="px-3 py-2 bg-muted/60 border-b border-border/60 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-ai/15 text-ai flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
              <span className="text-[12px] font-bold">{f.label}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{f.hint}</span>
            </div>
            <textarea
              value={sections[f.key]}
              onChange={e => setSections({ ...sections, [f.key]: e.target.value })}
              className="w-full text-[12px] leading-relaxed p-3 bg-transparent outline-none resize-none min-h-[72px]"
              rows={f.key === "plan" || f.key === "diagnosis" ? 4 : 3}
            />
          </div>
        ))}
      </div>

      <div className="border-t border-border/60 bg-card/95 backdrop-blur-xl px-4 py-3 pb-5 flex gap-2">
        <button onClick={onClose} className="flex-1 border border-border rounded-2xl py-3 text-sm font-semibold text-foreground/70">
          取消
        </button>
        <button
          onClick={() => { toast.success("首程已保存至病历档案"); onClose(); }}
          className="flex-1 gradient-ai text-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" /> 保存首程
        </button>
      </div>
    </div>
  );
};
