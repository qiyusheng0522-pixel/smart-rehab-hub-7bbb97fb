import { ReactNode, useState } from "react";
import { PhoneSheet, FormRow, PrimaryBtn } from "@/components/app/Sheet";
import { AICard, SectionTitle } from "@/components/app/UI";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import {
  ChevronRight,
  Search,
  Plus,
  Send,
  Sparkles,
  Bell,
  UserPlus,
  Users,
  MessageSquare,
  StickyNote,
  CheckCircle2,
  Trash2,
  Edit3 as Edit3Icon,
  Mic,
  Eraser,
} from "lucide-react";
import { toast } from "sonner";

export type Accent = "doctor" | "therapist" | "nurse";

export type PatientStage = "院前" | "院中" | "待出院" | "院后";

export type PatientFilter =
  | "all"
  | "院前"
  | "院中"
  | "待出院"
  | "院后"
  | "待首次评估";

export type Patient = {
  id: string;
  name: string;
  bed: string;
  meta: string;
  status: "新患者" | "康复中" | "待出院" | "已出院";
  condition: string; // 病症 用于筛选
  admitDays: number; // 入院天数
  needFirstAssess?: boolean; // 是否待首次评估
  needPlanConfirm?: boolean; // 是否待确认康复方案
  needRxConfirm?: boolean; // 是否待确认康复医嘱
  returnedReassess?: boolean; // 治疗师/护士退回，需重新首次评估
  returnReason?: string;
  shared: string[];
  notes: { author: string; time: string; text: string }[];
  isNew?: boolean;
  therapyRecords?: { type: "PT" | "OT" | "ST"; author: string; time: string; text: string }[];
  summaries?: { author: string; time: string; text: string }[];
  medChanges?: { author: string; time: string; text: string }[];
  checkins?: { time: string; task: string; author: string }[];
  currentPlan?: { label: string; value: string; hint?: string }[];
};

export const PATIENTS: Patient[] = [
  { id: "p0", name: "孙德强", bed: "315", meta: "男 60 · 急性缺血性脑卒中 · 今日入院", status: "新患者", condition: "脑卒中", admitDays: 0, needFirstAssess: true, needPlanConfirm: true, needRxConfirm: true, shared: ["李医师", "王治疗师", "赵护士"], notes: [], isNew: true },
  { id: "p9", name: "吴丽君", bed: "316", meta: "女 55 · 脑出血急性期 · 今日入院", status: "新患者", condition: "脑出血", admitDays: 0, needFirstAssess: true, needPlanConfirm: true, needRxConfirm: true, shared: ["李医师"], notes: [], isNew: true },
  { id: "p1", name: "张建国", bed: "303", meta: "男 56 · 脑卒中后偏瘫 · 入院第 12 天", status: "康复中", condition: "脑卒中", admitDays: 12, shared: ["李医师", "王治疗师", "陈治疗师", "赵护士"],
    notes: [
      { author: "李医师", time: "今日 09:20", text: "FMA 提升明显，下周复评后可考虑加强 OT 训练。" },
      { author: "王治疗师", time: "昨日 16:40", text: "步态稳定性进步，建议加入双任务训练。" },
    ],
    therapyRecords: [
      { type: "PT", author: "王治疗师", time: "今日 09:30", text: "步态训练 30min · 患者步频提高 8%，重心转移好。" },
      { type: "OT", author: "陈治疗师", time: "今日 11:00", text: "ADL 穿衣训练 20min · 上肢动作流畅度改善。" },
    ],
    summaries: [
      { author: "王治疗师", time: "昨日 17:30", text: "完成 PT/OT 5/5 项，Borg 9，建议明日加入双任务训练。" },
    ],
    medChanges: [
      { author: "王治疗师", time: "昨日 14:00", text: "建议医师评估巴氯芬剂量：肌张力 MAS 1+ → 1。" },
    ],
    checkins: [
      { time: "今日 09:15", task: "PT 步态训练", author: "系统自动 · 任务执行" },
      { time: "今日 11:00", task: "OT ADL 训练", author: "系统自动 · 任务执行" },
    ],
    currentPlan: [
      { label: "医师 · 总体方案", value: "渐进强化 V2", hint: "李志远 · 第 2 周方案" },
      { label: "PT · 物理治疗", value: "30 min × 5/周", hint: "步态 + 平衡 · 王雅琴（单次≤30min）" },
      { label: "OT · 作业治疗", value: "30 min × 5/周", hint: "ADL + 厨房 · 陈治疗师（单次≤30min）" },
      { label: "ST · 言语治疗", value: "30 min × 3/周", hint: "构音 · 陈思雨（单次≤30min）" },
      { label: "护理 · 康复护理", value: "q4h 体位 + 跌倒预防", hint: "赵静怡" },
    ],
  },
  { id: "p2", name: "王秀英", bed: "305", meta: "女 68 · 脑梗死急性期第 5 天 · 右侧肢体无力", status: "新患者", condition: "脑卒中", admitDays: 5, needFirstAssess: true, needPlanConfirm: true, needRxConfirm: true, shared: ["李医师", "王治疗师", "赵护士"], notes: [
    { author: "赵护士", time: "今日 11:00", text: "夜间言语含糊好转，吞咽训练耐受良好。" },
  ] },
  { id: "p3", name: "李 强", bed: "307", meta: "男 42 · 脑出血恢复期 · 入院第 28 天", status: "待出院", condition: "脑出血", admitDays: 28, shared: ["李医师", "王治疗师", "陈治疗师", "赵护士", "孙博士"],
    notes: [
      { author: "李医师", time: "今日 08:30", text: "Barthel 已达 85，符合出院条件，准备启动院外二级方案。" },
      { author: "王治疗师", time: "昨日 17:00", text: "下肢肌力 IV 级，独立步行 60m，平衡 Berg 48。" },
      { author: "孙博士", time: "前日 16:20", text: "患者出院焦虑下降，家属支持充足。" },
    ],
    therapyRecords: [
      { type: "PT", author: "王治疗师", time: "今日 09:00", text: "步行训练 30min · 独立步行 60m，无跌倒，步频 96 步/分。" },
      { type: "OT", author: "陈治疗师", time: "今日 10:30", text: "厨房 ADL 训练 30min · 可独立完成切配 + 烹饪。" },
      { type: "ST", author: "陈思雨", time: "昨日 15:00", text: "构音清晰度 92%，吞咽 EAT-10：2 分。" },
      { type: "PT", author: "王治疗师", time: "昨日 09:00", text: "上下楼梯训练 20min · 双足交替，扶手辅助。" },
    ],
    summaries: [
      { author: "王治疗师", time: "今日 17:30", text: "本周 PT/OT 完成率 100%，目标基本达成，建议进入出院准备。" },
      { author: "陈治疗师", time: "本周一 17:30", text: "OT 厨房训练顺利，建议加入家属指导课。" },
    ],
    medChanges: [
      { author: "李医师", time: "本周三 10:00", text: "停用巴氯芬，加用维生素 B 族口服。" },
      { author: "李医师", time: "上周一 09:30", text: "降压药调整：氨氯地平 5mg qd → 2.5mg qd。" },
    ],
    checkins: [
      { time: "今日 09:15", task: "PT 步行训练", author: "系统自动 · 任务执行" },
      { time: "今日 10:30", task: "OT 厨房 ADL", author: "系统自动 · 任务执行" },
      { time: "昨日 09:15", task: "PT 上下楼梯", author: "系统自动 · 任务执行" },
      { time: "昨日 14:00", task: "ST 构音训练", author: "系统自动 · 任务执行" },
    ],
    currentPlan: [
      { label: "医师 · 总体方案", value: "出院过渡 · 第 4 周", hint: "李志远" },
      { label: "PT · 物理治疗", value: "30 min × 5/周", hint: "步态 + 楼梯 · 王雅琴（单次≤30min）" },
      { label: "OT · 作业治疗", value: "30 min × 5/周", hint: "ADL + 厨房 · 陈治疗师（单次≤30min）" },
      { label: "ST · 言语治疗", value: "30 min × 3/周", hint: "构音 · 陈思雨（单次≤30min）" },
      { label: "护理 · 康复护理", value: "q6h 体位 + 皮肤护理", hint: "赵静怡" },
      { label: "心理 · 出院适应", value: "家属同伴支持", hint: "孙博士" },
    ],
  },
  { id: "p4", name: "陈丽华", bed: "310", meta: "女 65 · 卒中后认知障碍", status: "康复中", condition: "脑卒中", admitDays: 18, needPlanConfirm: true, shared: ["李医师", "陈治疗师"], notes: [] },
  { id: "p5", name: "周建华", bed: "311", meta: "男 72 · 脑梗死恢复期", status: "新患者", condition: "脑梗死", admitDays: 2, needFirstAssess: true, needPlanConfirm: true, needRxConfirm: true, shared: ["李医师", "王治疗师"], notes: [] },
  { id: "p6", name: "赵子轩", bed: "318", meta: "男 48 · 大面积脑梗死 · 入院第 2 天", status: "新患者", condition: "脑卒中", admitDays: 2, needFirstAssess: true, returnedReassess: true, returnReason: "治疗师反馈：实际触诊肌力与首评 MMT 等级不符，建议复测 NIHSS + Berg。", shared: ["李医师", "王治疗师", "陈治疗师"], notes: [
    { author: "王治疗师", time: "今日 10:20", text: "首评结果不确定 · 建议医师重新组织首次评估。" },
  ] },
  { id: "p7", name: "黄淑芬", bed: "320", meta: "女 70 · 脑出血恢复期 · 入院第 3 天", status: "新患者", condition: "脑出血", admitDays: 3, needFirstAssess: true, returnedReassess: true, returnReason: "护士反馈：夜间意识波动 GCS 13→11，AI 评估结论与床旁观察存在偏差。", shared: ["李医师", "赵护士"], notes: [
    { author: "赵护士", time: "今日 06:50", text: "夜间患者一过性意识模糊，建议医师复评 NIHSS / MMSE。" },
  ] },
];

export const NEW_PATIENT_COUNT = PATIENTS.filter(p => p.isNew).length;
export const FIRST_ASSESS_COUNT = PATIENTS.filter(p => p.needFirstAssess).length;
export const RETURNED_REASSESS_COUNT = PATIENTS.filter(p => p.returnedReassess).length;
export const ALL_CONDITIONS = Array.from(new Set(PATIENTS.map(p => p.condition)));

/** 根据状态推导患者所处阶段 */
export const getPatientStage = (p: Patient): PatientStage => {
  if (p.status === "已出院") return "院后";
  if (p.status === "待出院") return "待出院";
  if (p.needFirstAssess || p.returnedReassess || p.needPlanConfirm || p.needRxConfirm) return "院前";
  return "院中";
};

const accentBg: Record<Accent, string> = {
  doctor: "gradient-doctor",
  therapist: "gradient-therapist",
  nurse: "gradient-nurse",
};
const accentText: Record<Accent, string> = {
  doctor: "text-role-doctor",
  therapist: "text-role-therapist",
  nurse: "text-role-nurse",
};

/* ============== 患者管理主页 ============== */
export type PatientPendingKey = "assess" | "plan" | "rx";

export const PatientsPage = ({
  accent,
  onPick,
  onSummary,
  onAction,
  initialFilter = "all",
}: {
  accent: Accent;
  onPick: (p: Patient) => void;
  onSummary?: (p: Patient) => void;
  onAction?: (key: PatientPendingKey, p: Patient) => void;
  initialFilter?: PatientFilter;
}) => {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<PatientFilter>(initialFilter);
  const [condition, setCondition] = useState<string>("");
  const [admitRange, setAdmitRange] = useState<"all" | "0-3" | "4-14" | "15+">("all");
  const [assessLevel, setAssessLevel] = useState<"" | "A" | "B" | "C">("");
  const [therapyType, setTherapyType] = useState<"" | "PT" | "OT" | "ST">("");
  const [direction, setDirection] = useState<"" | "心肺" | "神经" | "骨科">("");

  // 基于患者 id 派生评估等级 / 治疗方向（mock）
  const derive = (p: Patient) => {
    const levels: ("A" | "B" | "C")[] = ["A", "B", "C"];
    const dirs: ("心肺" | "神经" | "骨科")[] = ["神经", "心肺", "骨科"];
    const seed = p.id.charCodeAt(p.id.length - 1);
    const level = levels[seed % 3];
    const dir: ("心肺" | "神经" | "骨科") =
      p.condition.includes("脑") ? "神经" : p.condition.includes("骨") || p.condition.includes("关节") ? "骨科" : dirs[seed % 3];
    const types: ("PT" | "OT" | "ST")[] =
      dir === "神经" ? ["PT", "OT", "ST"] : dir === "心肺" ? ["PT"] : ["PT", "OT"];
    return { level, dir, types };
  };

  const matchStatus = (p: Patient) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "待首次评估") return !!p.needFirstAssess;
    return getPatientStage(p) === statusFilter;
  };
  const matchAdmit = (p: Patient) => {
    if (admitRange === "all") return true;
    if (admitRange === "0-3") return p.admitDays <= 3;
    if (admitRange === "4-14") return p.admitDays >= 4 && p.admitDays <= 14;
    return p.admitDays >= 15;
  };
  const list = PATIENTS.filter(p => {
    const d = derive(p);
    return (
      (p.name.includes(q) || p.bed.includes(q)) &&
      matchStatus(p) &&
      (!condition || p.condition === condition) &&
      matchAdmit(p) &&
      (!assessLevel || d.level === assessLevel) &&
      (!therapyType || d.types.includes(therapyType)) &&
      (!direction || d.dir === direction)
    );
  });


  const stageCount = (s: PatientStage) => PATIENTS.filter(p => getPatientStage(p) === s).length;
  const filterChips: { key: PatientFilter; label: string; count: number }[] = [
    { key: "all", label: "全部", count: PATIENTS.length },
    { key: "院前", label: "院前", count: stageCount("院前") },
    { key: "院中", label: "院中", count: stageCount("院中") },
    { key: "待出院", label: "待出院", count: stageCount("待出院") },
    { key: "院后", label: "院后", count: stageCount("院后") },
  ];

  return (
    <div className="pb-4">
      <div className={`${accentBg[accent]} px-5 pt-4 pb-10 text-white relative overflow-hidden`}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs opacity-80">患者管理</div>
              <div className="text-lg font-semibold mt-0.5">共 {PATIENTS.length} 位 · 新 {NEW_PATIENT_COUNT}</div>
            </div>
            <button onClick={() => toast("已邀请新患者")} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-3 py-2">
            <Search className="w-4 h-4 opacity-90" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="搜索姓名 / 床号" className="flex-1 bg-transparent text-sm placeholder:text-white/70 outline-none" />
          </div>
        </div>
      </div>

      <div className="px-4 -mt-5 space-y-3 relative">
        {/* 筛选卡片：横向滑动 · 支持组合查询 */}
        <div className="bg-card rounded-2xl shadow-card p-3 space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <div className="text-[11px] font-semibold text-foreground/80">筛选条件 · 可组合</div>
            {(condition || admitRange !== "all" || assessLevel || therapyType || direction || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setStatusFilter("all"); setCondition(""); setAdmitRange("all");
                  setAssessLevel(""); setTherapyType(""); setDirection("");
                }}
                className="text-[10px] text-muted-foreground"
              >
                清空
              </button>
            )}
          </div>
          {/* 状态 chips · 横向滑动 */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-0.5 px-0.5 pb-0.5">
            {filterChips.map(c => {
              const active = statusFilter === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setStatusFilter(c.key)}
                  className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full font-semibold transition-all ${
                    active ? `${accentBg[accent]} text-white shadow-card` : "bg-muted text-foreground/70"
                  }`}
                >
                  {c.label} <span className={active ? "opacity-80" : "text-muted-foreground"}>({c.count})</span>
                </button>
              );
            })}
          </div>
          {/* 多维度 select · 横向滑动 */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-0.5 px-0.5 text-[11px]">
            {[
              { label: "病症", value: condition, on: setCondition, placeholder: "全部病症", opts: ALL_CONDITIONS.map(c => ({ v: c, t: c })) },
              { label: "入院", value: admitRange, on: (v: string) => setAdmitRange(v as any), placeholder: "全部时间", opts: [{ v: "all", t: "全部" }, { v: "0-3", t: "0-3 天" }, { v: "4-14", t: "4-14 天" }, { v: "15+", t: "15 天以上" }], allValue: "all" },
              { label: "评估等级", value: assessLevel, on: (v: string) => setAssessLevel(v as any), placeholder: "全部等级", opts: [{ v: "A", t: "A 级 · 重症" }, { v: "B", t: "B 级 · 中度" }, { v: "C", t: "C 级 · 轻症" }] },
              { label: "治疗类型", value: therapyType, on: (v: string) => setTherapyType(v as any), placeholder: "PT/OT/ST", opts: [{ v: "PT", t: "PT 物理治疗" }, { v: "OT", t: "OT 作业治疗" }, { v: "ST", t: "ST 言语/吞咽" }] },
              { label: "康复方向", value: direction, on: (v: string) => setDirection(v as any), placeholder: "全部方向", opts: [{ v: "心肺", t: "心肺方向" }, { v: "神经", t: "神经方向" }, { v: "骨科", t: "骨科方向" }] },
            ].map(f => {
              const allValue = (f as any).allValue ?? "";
              const isActive = f.value !== allValue && f.value !== "";
              return (
                <div key={f.label} className="shrink-0 relative">
                  <select
                    value={f.value}
                    onChange={e => f.on(e.target.value)}
                    className={`appearance-none pl-3 pr-7 py-1.5 rounded-full border outline-none transition-colors ${
                      isActive
                        ? `${accentBg[accent]} text-white border-transparent font-semibold`
                        : "bg-muted border-border text-foreground/80"
                    }`}
                  >
                    <option value={allValue}>{f.label}：{f.placeholder}</option>
                    {f.opts.filter(o => o.v !== allValue).map(o => (
                      <option key={o.v} value={o.v}>{f.label}：{o.t}</option>
                    ))}
                  </select>
                  <ChevronRight className={`w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none ${isActive ? "text-white/80" : "text-muted-foreground"}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* 待首次评估提示已合并至筛选筹码与列表标签，无需额外横幅 */}

        <div>
          <SectionTitle title={`患者列表 · ${list.length}`} />
          {list.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center text-xs text-muted-foreground">无匹配患者</div>
          ) : (
            <div className="space-y-2">
              {list.map(p => <PatientCard key={p.id} p={p} accent={accent} onClick={() => onPick(p)} onSummary={onSummary ? () => onSummary(p) : undefined} onAction={onAction ? (k) => onAction(k, p) : undefined} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PatientCard = ({ p, accent, onClick, onSummary, onAction }: { p: Patient; accent: Accent; onClick: () => void; onSummary?: () => void; onAction?: (key: PatientPendingKey) => void }) => {
  const stage = getPatientStage(p);
  const stageMap: Record<PatientStage, string> = {
    "院前": "bg-warning/15 text-warning",
    "院中": "bg-primary/10 text-primary",
    "待出院": "bg-success-soft text-success",
    "院后": "bg-muted text-muted-foreground",
  };
  const pending: { key: PatientPendingKey; label: string; show: boolean }[] = [
    { key: "assess", label: "开始评估", show: !!p.needFirstAssess },
    { key: "plan", label: "待确认方案", show: !p.needFirstAssess && !!p.needPlanConfirm },
    { key: "rx", label: "待确认医嘱", show: !p.needFirstAssess && !p.needPlanConfirm && !!p.needRxConfirm },
  ];
  // 仅当父级提供 onAction 时展示，且同一患者最多只展示一个待办按钮（首评 > 方案 > 医嘱）
  const pendingVisible = onAction ? pending.filter(x => x.show).slice(0, 1) : [];
  return (
    <div className="w-full bg-card rounded-2xl shadow-card p-3.5 active:scale-[0.99]">
      <button onClick={onClick} className="w-full text-left flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl ${accentBg[accent]} text-white flex items-center justify-center font-bold`}>{p.name[0]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-[13px] font-semibold">{p.name}</div>
            <span className="text-[10px] text-muted-foreground">床 {p.bed}</span>
            {p.isNew && <span className="text-[9px] px-1.5 py-0.5 rounded bg-warning text-white font-bold">NEW</span>}
            
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{p.meta}</div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${stageMap[stage]}`}>{stage}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground/70">{p.condition}</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{p.shared.length}</span>
            {p.notes.length > 0 && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><StickyNote className="w-3 h-3" />{p.notes.length}</span>}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground self-center" />
      </button>
      {(pendingVisible.length > 0 || onSummary) && (
        <div className="mt-2.5 pt-2.5 border-t border-border/60 flex flex-wrap items-center gap-1.5">
          {pendingVisible.map((b) => (
            <button
              key={b.key}
              onClick={(e) => { e.stopPropagation(); onAction?.(b.key); }}
              disabled={!onAction}
              className={`text-[12px] px-3.5 py-1.5 rounded-full font-bold ${accentBg[accent]} text-white shadow-card flex items-center gap-1 active:scale-95 disabled:opacity-60 ring-2 ring-current/20`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
              {b.label}
            </button>
          ))}
          {onSummary && (
            <button
              onClick={(e) => { e.stopPropagation(); onSummary(); }}
              className={`ml-auto text-[11px] px-3 py-1 rounded-full font-semibold ${accentBg[accent]} text-white shadow-card`}
            >
              每日小结
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ============== 患者详情 Sheet ============== */
export type PatientDetailAction = { key: string; label: string; icon?: any; onClick: () => void };

export const PatientDetailSheet = ({ patient, accent, onAddNote, onShare, actions }: {
  patient: Patient | null;
  accent: Accent;
  onAddNote: () => void;
  onShare?: () => void;
  actions?: PatientDetailAction[];
}) => {
  if (!patient) return null;
  return (
    <div className="p-4 space-y-3">
      <div className={`rounded-2xl ${accentBg[accent]} p-5 text-white`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-lg font-bold">{patient.name[0]}</div>
          <div className="flex-1">
            <div className="text-base font-bold">{patient.name} · 床 {patient.bed}</div>
            <div className="text-[11px] opacity-90 mt-0.5">{patient.meta}</div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur font-semibold">{getPatientStage(patient)}</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/15 backdrop-blur rounded-xl py-1.5"><div className="text-[9px] opacity-80">入院天数</div><div className="text-[12px] font-semibold mt-0.5">{patient.admitDays} 天</div></div>
          <div className="bg-white/15 backdrop-blur rounded-xl py-1.5"><div className="text-[9px] opacity-80">病症</div><div className="text-[12px] font-semibold mt-0.5">{patient.condition}</div></div>
          <div className="bg-white/15 backdrop-blur rounded-xl py-1.5"><div className="text-[9px] opacity-80">协作成员</div><div className="text-[12px] font-semibold mt-0.5">{patient.shared.length} 人</div></div>
        </div>
      </div>

      {/* 退回重评提示已移除 */}

      {/* 操作按钮已迁移至 PhoneSheet 底部 footer（PatientActionsBar），保持冻结于底部 */}

      <SectionTitle title="档案 / 就诊信息" />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="主诉 / 病症" value={patient.condition} hint={patient.meta} />
        <FormRow label="入院时间" value={`${patient.admitDays} 天前`} />
        <FormRow label="当前状态" value={getPatientStage(patient)} />
        <FormRow label="主管医师" value="李志远 主任医师" hint="神经康复科" />
        <FormRow label="既往史" value="高血压 8 年 · 糖尿病 5 年" />
        <FormRow label="手术史" value="2026-04-23 关节置换 / 减压内固定" />
        <FormRow label="过敏 / 医保" value="无 · 城镇职工" />
        <FormRow label="并发症风险" value="DVT 中 · 跌倒高" />
      </div>

      <SectionTitle title="评估关键指标" />
      <div className="bg-card rounded-2xl shadow-card p-3 grid grid-cols-4 gap-2">
        <div className="bg-muted rounded-xl py-2 text-center"><div className="text-[9px] text-muted-foreground">FMA</div><div className="text-[12px] font-bold mt-0.5">42</div></div>
        <div className="bg-muted rounded-xl py-2 text-center"><div className="text-[9px] text-muted-foreground">Barthel</div><div className="text-[12px] font-bold mt-0.5">70</div></div>
        <div className="bg-muted rounded-xl py-2 text-center"><div className="text-[9px] text-muted-foreground">Berg</div><div className="text-[12px] font-bold mt-0.5">36</div></div>
        <div className="bg-muted rounded-xl py-2 text-center"><div className="text-[9px] text-muted-foreground">VAS</div><div className="text-[12px] font-bold mt-0.5">3</div></div>
      </div>

      {patient.currentPlan && patient.currentPlan.length > 0 && (
        <>
          <SectionTitle title="当前康复方案 · 多角色" extra={<span className="text-[10px] text-muted-foreground">医师 / PT / OT / ST / 护理</span>} />
          <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
            {patient.currentPlan.map((row, i) => (
              <FormRow key={i} label={row.label} value={row.value} hint={row.hint} />
            ))}
          </div>
        </>
      )}

      {patient.currentPlan && patient.currentPlan.length > 0 && accent === "doctor" && (
        <button
          onClick={() => toast.success("已进入康复方案修改 · 修改完成后请重新推送")}
          className="w-full border border-primary/30 text-primary bg-primary/5 rounded-2xl py-2.5 text-[12px] font-semibold flex items-center justify-center gap-1.5"
        >
          <Edit3Icon className="w-3.5 h-3.5" /> 修改当前康复方案
        </button>
      )}

      {/* 医嘱：分「临床医嘱」与「康复医嘱」两类 · 医师 / 治疗师视角一致 */}
      {(accent === "doctor" || accent === "therapist") && (
        <>
          <SectionTitle title="医嘱 · 临床医嘱" extra={<span className="text-[10px] text-muted-foreground">主管医师签发</span>} />
          <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
            <FormRow label="阿司匹林肠溶片" value="100 mg qd" hint="二级预防 · 早餐后" />
            <FormRow label="阿托伐他汀钙" value="20 mg qn" hint="调脂 · 睡前" />
            <FormRow label="苯磺酸氨氯地平" value="5 mg qd" hint="降压 · 晨服" />
            <FormRow label="低分子肝素钙" value="4100 IU q12h" hint="DVT 预防 · 7 天" />
            <FormRow label="护理级别" value="一级护理 · 跌倒 / 压疮预警" />
          </div>

          <SectionTitle title="医嘱 · 康复医嘱" extra={<span className="text-[10px] text-muted-foreground">康复医学科签发</span>} />
          <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
            <FormRow label="PT 物理治疗" value="30 min × 5/周" hint="步态 + 平衡 + 力量（单次≤30min）" />
            <FormRow label="OT 作业治疗" value="30 min × 5/周" hint="ADL + 厨房（单次≤30min）" />
            <FormRow label="ST 言语治疗" value="30 min × 3/周" hint="构音 + 吞咽（单次≤30min）" />
            <FormRow label="物理因子" value="低频电刺激 20 min × 5/周" hint="左下肢" />
            <FormRow label="辅具" value="AFO 1 副 · 四脚拐 1 支" hint="日间步行佩戴" />
            <FormRow label="居家自训" value="床边坐起 + 踝泵 + 站立训练" hint="每日 30 min" />
          </div>
        </>
      )}

      {/* 治疗师档案：PT/OT/ST 治疗记录（默认仅展示最新一条，历史可展开） */}
      {patient.therapyRecords && patient.therapyRecords.length > 0 && (
        <CollapsibleRecords
          title={`治疗记录 · ${patient.therapyRecords.length}`}
          extra={<span className="text-[10px] text-muted-foreground">PT / OT / ST · 医师可查看</span>}
          items={patient.therapyRecords}
          renderItem={(r, i) => {
            const tagColor = { PT: "bg-secondary-soft text-secondary", OT: "bg-primary-soft text-primary", ST: "bg-ai-soft text-ai" }[r.type];
            return (
              <div key={i} className="p-3.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${tagColor}`}>{r.type}</span>
                  <span className="text-[12px] font-semibold">{r.author}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{r.time}</span>
                </div>
                <div className="text-[12px] text-foreground/80 mt-1 leading-relaxed">{r.text}</div>
              </div>
            );
          }}
        />
      )}

      {patient.summaries && patient.summaries.length > 0 && (
        <CollapsibleRecords
          title={`工作小结 · ${patient.summaries.length}`}
          items={patient.summaries}
          renderItem={(s, i) => (
            <div key={i} className="p-3.5">
              <div className="flex items-center justify-between">
                <div className="text-[12px] font-semibold">{s.author}</div>
                <div className="text-[10px] text-muted-foreground">{s.time}</div>
              </div>
              <div className="text-[12px] text-foreground/80 mt-1 leading-relaxed">{s.text}</div>
            </div>
          )}
        />
      )}

      {patient.medChanges && patient.medChanges.length > 0 && (
        <>
          <SectionTitle title={`药物变动记录 · ${patient.medChanges.length}`} />
          <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
            {patient.medChanges.map((m, i) => (
              <div key={i} className="p-3.5">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-semibold">{m.author}</div>
                  <div className="text-[10px] text-muted-foreground">{m.time}</div>
                </div>
                <div className="text-[12px] text-foreground/80 mt-1 leading-relaxed">{m.text}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {patient.checkins && patient.checkins.length > 0 && (
        <>
          <SectionTitle title={`任务执行打卡 · ${patient.checkins.length}`} extra={<span className="text-[10px] text-muted-foreground">系统自动记录</span>} />
          <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
            {patient.checkins.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <div className="flex-1">
                  <div className="text-[12px] font-semibold">{c.task}</div>
                  <div className="text-[10px] text-muted-foreground">{c.author}</div>
                </div>
                <div className="text-[10px] text-muted-foreground">{c.time}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 首评核心评分：未评估患者展示「待评估」入口；已完成评估患者也保持与首评一致的展示 */}
      {getPatientStage(patient) !== "待出院" && (
        <>
          <SectionTitle title="首次评估 · 核心评分" extra={<span className="text-[10px] text-muted-foreground">AI 辅助生成</span>} />
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-card rounded-2xl shadow-card p-3">
              <div className="text-[10px] text-muted-foreground">NIHSS</div>
              <div className="text-2xl font-bold text-primary mt-1">14<span className="text-xs text-muted-foreground ml-1">分</span></div>
              <div className="text-[10px] text-warning font-semibold mt-1">中度卒中</div>
            </div>
            <div className="bg-card rounded-2xl shadow-card p-3">
              <div className="text-[10px] text-muted-foreground">mRS</div>
              <div className="text-2xl font-bold text-primary mt-1">4<span className="text-xs text-muted-foreground ml-1">级</span></div>
              <div className="text-[10px] text-warning font-semibold mt-1">中重度残疾</div>
            </div>
          </div>

          <SectionTitle title="并发症 / 营养 / 认知" />
          <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
            <FormRow label="跌倒 · Morse" value={<span className="text-destructive font-semibold">高 55</span>} />
            <FormRow label="压疮 · Braden" value={<span className="text-warning font-semibold">中 16</span>} />
            <FormRow label="吞咽 · 洼田" value={<span className="text-warning font-semibold">3 级</span>} />
            <FormRow label="DVT · Caprini" value={<span className="text-destructive font-semibold">高 5</span>} />
            <FormRow label="营养 · NRS2002" value={<span className="text-warning font-semibold">3 分</span>} />
            <FormRow label="认知 · MoCA" value={<span className="text-warning font-semibold">18/30</span>} />
          </div>

          <AICard title="AI 首次评估辅助结论">
            <div className="whitespace-pre-line text-[12px] leading-relaxed">
              {`综合判定：急性缺血性卒中后右侧偏瘫，NIHSS 14 分（中度），mRS 4 级（中重度残疾）。
当前主要功能障碍：右上下肢运动重度受损（肌力 2 级）、轻度表达性失语、左侧空间忽略、吞咽可疑异常。
合并高跌倒/DVT/压疮风险与营养及认知风险，整体康复潜力中等。
建议方向：① 床旁早期 PT；② OT 介入 ADL + 视空间忽略训练；③ ST 吞咽与构音训练；④ 护理重点跌倒/压疮/DVT 预防 + 营养支持；⑤ 7 天后复评。`}
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground">点击下方"确认首次评估"可进入完整评估表编辑 / 重新生成 AI 结论</div>
          </AICard>
        </>
      )}

      {/* 康复中 / 待出院 患者：AI 基于当前状态给出方案 / 出院建议 */}
      {(getPatientStage(patient) === "院中" || getPatientStage(patient) === "待出院") && (
        <AICard title={getPatientStage(patient) === "待出院" ? "AI 出院建议" : "AI 方案调整建议"}>
          {getPatientStage(patient) === "待出院" ? (
            <div className="text-[12px] leading-relaxed">
              基于近 7 日康复执行（PT/OT 完成率 100%）、Barthel 已达 85、Berg 48、独立步行 60m，已满足出院标准。
              建议：① 启动院外二级方案二次确认；② 完成家属跌倒预防与转移培训；③ 对接社区康复站每周 2 次随访。
            </div>
          ) : (
            <div className="text-[12px] leading-relaxed">
              基于本周评估趋势（FMA +6、Borg 9、跌倒 0 次），患者耐受良好。
              建议：① PT 强度上调 15-20% 并加入双任务训练；② 暂不调整 ST；③ 7 天后复评 FMA / Berg，若进步 ≥ 10% 可启动出院评估。
            </div>
          )}
          <div className="mt-2 text-[10px] text-muted-foreground">AI 仅供辅助，最终由康复医师决策。</div>
        </AICard>
      )}

      {/* 协作备注 · 始终置于详情最底部 */}
      <SectionTitle title={`协作备注 · ${patient.notes.length}`} extra={<button onClick={onAddNote} className={`text-[11px] font-semibold ${accentText[accent]} flex items-center gap-1`}><Plus className="w-3 h-3" />添加备注</button>} />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        {patient.notes.length === 0 ? (
          <div className="p-4 text-[11px] text-muted-foreground text-center">暂无备注，点击右上角添加</div>
        ) : patient.notes.map((n, i) => (
          <div key={i} className="p-3.5">
            <div className="flex items-center justify-between">
              <div className="text-[12px] font-semibold">{n.author}</div>
              <div className="text-[10px] text-muted-foreground">{n.time}</div>
            </div>
            <div className="text-[12px] text-foreground/80 mt-1 leading-relaxed">{n.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============== 患者详情底部操作按钮（冻结在 PhoneSheet footer 区域） ============== */
export const PatientActionsBar = ({
  accent,
  actions,
}: {
  accent: Accent;
  actions: PatientDetailAction[];
}) => {
  if (!actions || actions.length === 0) return null;
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.key}
            onClick={a.onClick}
            className={`shrink-0 flex-1 min-w-[88px] ${accentBg[accent]} text-white rounded-2xl py-2.5 px-3 flex items-center justify-center gap-1.5 text-[12px] font-semibold shadow-card active:scale-[0.98]`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span className="whitespace-nowrap">{a.label}</span>
          </button>
        );
      })}
    </div>
  );
};

/* 折叠历史记录组件：默认仅显示最新一条，多于一条时可展开 */
function CollapsibleRecords<T>({
  title,
  extra,
  items,
  renderItem,
}: {
  title: string;
  extra?: ReactNode;
  items: T[];
  renderItem: (item: T, i: number) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const hasHistory = items.length > 1;
  const visible = open || !hasHistory ? items : items.slice(0, 1);
  return (
    <>
      <SectionTitle
        title={title}
        extra={
          <div className="flex items-center gap-2">
            {extra}
            {hasHistory && (
              <button
                onClick={() => setOpen((v) => !v)}
                className="text-[11px] text-primary font-semibold"
              >
                {open ? "收起历史" : `展开历史 (+${items.length - 1})`}
              </button>
            )}
          </div>
        }
      />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        {visible.map((it, i) => renderItem(it, i))}
      </div>
    </>
  );
}

/* ============== 添加备注 Sheet ============== */
export const AddNoteSheet = ({ patient, accent, onSave }: { patient: Patient | null; accent: Accent; onSave: (text: string) => void }) => {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  if (!patient) return null;
  const startVoice = () => {
    setRecording(true);
    toast("🎤 正在听写…");
    setTimeout(() => {
      setText(t => (t ? t + " " : "") + "患者今日精神状态良好，建议明日加强平衡训练。");
      setRecording(false);
      toast.success("语音已转写");
    }, 1200);
  };
  return (
    <div className="p-4 space-y-3">
      <div className="bg-card rounded-2xl shadow-card p-3">
        <div className="text-[12px] font-semibold">{patient.name} · 床 {patient.bed}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">备注将共享给所有协作成员</div>
      </div>
      <div className="relative">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="输入对该患者的观察、提醒或交接内容..."
          className="w-full bg-card border border-border rounded-2xl p-3 pb-12 text-sm h-40 outline-none"
        />
        <div className="absolute bottom-2 right-2 flex gap-1.5">
          <button
            onClick={() => { setText(""); toast("已清除"); }}
            disabled={!text}
            className="text-[11px] px-2.5 py-1.5 rounded-full bg-muted text-foreground/70 disabled:opacity-40 flex items-center gap-1"
          >
            <Eraser className="w-3 h-3" />一键清除
          </button>
          <button
            onClick={startVoice}
            className={`text-[11px] px-2.5 py-1.5 rounded-full flex items-center gap-1 font-semibold ${recording ? "bg-destructive text-white animate-pulse" : `${accentBg[accent]} text-white`}`}
          >
            <Mic className="w-3 h-3" />{recording ? "听写中" : "语音输入"}
          </button>
        </div>
      </div>
      <button
        onClick={() => { if (text.trim()) { onSave(text); setText(""); } }}
        className={`w-full ${accentBg[accent]} text-white rounded-2xl py-3 text-sm font-semibold`}
      >
        保存并共享给团队
      </button>
    </div>
  );
};

/* ============== 团队管理（我的内）============== */
export type TeamMember = { id: string; name: string; role: string; dept: string };

export const DEFAULT_TEAM: TeamMember[] = [
  { id: "t1", name: "李志远", role: "康复主任医师", dept: "神经康复科" },
  { id: "t2", name: "王雅琴", role: "PT/OT 治疗师", dept: "康复治疗部" },
  { id: "t3", name: "陈思雨", role: "ST 治疗师", dept: "康复治疗部" },
  { id: "t4", name: "赵静怡", role: "主管护师", dept: "康复护理组" },
  { id: "t5", name: "孙博士", role: "心理治疗师", dept: "心理康复" },
];

export const TeamManageSheet = ({ accent }: { accent: Accent }) => {
  const [members, setMembers] = useState<TeamMember[]>(DEFAULT_TEAM);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  return (
    <div className="p-4 space-y-3">
      <AICard title="团队成员共享患者">添加的成员将自动加入您所有患者的协作组，可查看评估、方案与备注。</AICard>
      <SectionTitle title={`当前团队 · ${members.length} 人`} />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        {members.map(m => (
          <div key={m.id} className="flex items-center gap-3 p-3.5">
            <div className={`w-9 h-9 rounded-full ${accentBg[accent]} text-white flex items-center justify-center text-sm font-bold`}>{m.name[0]}</div>
            <div className="flex-1">
              <div className="text-[12px] font-semibold">{m.name}</div>
              <div className="text-[10px] text-muted-foreground">{m.role} · {m.dept}</div>
            </div>
            <button onClick={() => setMembers(members.filter(x => x.id !== m.id))} className="text-muted-foreground">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <SectionTitle title="新增成员" />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="姓名" value={<input value={name} onChange={e => setName(e.target.value)} placeholder="请输入" className="w-32 text-right bg-muted rounded px-2 py-1 text-xs" />} />
        <FormRow label="角色" value={<input value={role} onChange={e => setRole(e.target.value)} placeholder="如 PT 治疗师" className="w-32 text-right bg-muted rounded px-2 py-1 text-xs" />} />
      </div>
      <button
        onClick={() => {
          if (!name.trim() || !role.trim()) { toast("请填写姓名和角色"); return; }
          setMembers([...members, { id: Date.now().toString(), name, role, dept: "新成员" }]);
          setName(""); setRole("");
          toast.success("成员已添加，已自动共享所有患者");
        }}
        className={`w-full ${accentBg[accent]} text-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-1`}
      >
        <UserPlus className="w-4 h-4" /> 添加并共享患者
      </button>
    </div>
  );
};

/* ============== IM 聊天（团队会议 / 线上会诊 / 患者沟通）============== */
export type ChatMessage = { id: string; author: string; role?: string; text: string; time: string; isAI?: boolean; isMe?: boolean };

export const IMChatSheet = ({
  accent,
  title,
  subtitle,
  participants,
  initialMessages,
  onAISummary,
  enablePatientReminder,
  enablePlanConfirm,
  onClose,
}: {
  accent: Accent;
  title: string;
  subtitle: string;
  participants: string[];
  initialMessages: ChatMessage[];
  onAISummary: (summary: string) => void;
  enablePatientReminder?: boolean;
  enablePlanConfirm?: boolean;
  onClose?: () => void;
}) => {
  const [msgs, setMsgs] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [reminderSent, setReminderSent] = useState(false);
  const [planConfirmed, setPlanConfirmed] = useState(false);
  const [pendingSummary, setPendingSummary] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const send = () => {
    if (!input.trim()) return;
    setMsgs([...msgs, { id: Date.now().toString(), author: "我", text: input, time: "刚刚", isMe: true }]);
    setInput("");
  };

  const generateSummary = () => {
    const s = "📋 AI 会议纪要：\n1. 患者 FMA 提升 8 分，整体康复进度符合预期；\n2. 一致同意将 PT 训练强度上调 20%，新增 OT 厨房训练；\n3. ST 维持原计划，下周复评后再决定是否调整；\n4. 出院评估：再观察 1 周，待 Barthel ≥ 75 启动二级方案。";
    setPendingSummary(s);
    setConfirmOpen(true);
  };

  const confirmAndApply = () => {
    if (!pendingSummary) return;
    setSummary(pendingSummary);
    setMsgs([...msgs, { id: "ai-" + Date.now(), author: "AI 助手", text: pendingSummary, time: "刚刚", isAI: true }]);
    onAISummary(pendingSummary);
    toast.success("康复医生已确认 · 纪要已同步至首次评估、康复方案、康复医嘱");
    setConfirmOpen(false);
    setPendingSummary(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className={`${accentBg[accent]} text-white px-4 py-3`}>
        <div className="flex items-center gap-2">
          {onClose && (
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center -ml-1">
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          )}
          <div className="flex-1">
            <div className="text-sm font-bold">{title}</div>
            <div className="text-[11px] opacity-90 mt-0.5">{subtitle} · {participants.length} 人在线</div>
          </div>
        </div>
        <div className="flex gap-1 mt-2 overflow-x-auto scrollbar-hide">
          {participants.map(p => (
            <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur whitespace-nowrap">{p}</span>
          ))}
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-muted/30">
        {msgs.map(m => (
          <div key={m.id} className={`flex gap-2 ${m.isMe ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white ${m.isAI ? "gradient-ai" : m.isMe ? accentBg[accent] : "bg-muted-foreground"}`}>
              {m.isAI ? <Sparkles className="w-3.5 h-3.5" /> : m.author[0]}
            </div>
            <div className={`max-w-[78%] ${m.isMe ? "items-end" : ""} flex flex-col gap-1`}>
              <div className="text-[10px] text-muted-foreground px-1">{m.author}{m.role ? ` · ${m.role}` : ""} · {m.time}</div>
              <div className={`text-[12px] leading-relaxed px-3 py-2 rounded-2xl whitespace-pre-line ${
                m.isAI ? "bg-ai-soft border border-ai/20 text-foreground rounded-tl-sm" :
                m.isMe ? `${accentBg[accent]} text-white rounded-tr-sm` :
                "bg-card shadow-card rounded-tl-sm"
              }`}>
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {summary && (
          <div className="bg-success-soft border border-success/30 rounded-2xl p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
            <div className="text-[11px] text-success">纪要已自动同步到患者首次评估 & 康复方案</div>
          </div>
        )}
      </div>

      {/* AI / patient reminder / plan confirm bar */}
      <div className="px-3 py-2 bg-card border-t border-border/60 flex gap-2 flex-wrap">
        <button onClick={generateSummary} className="flex-1 min-w-[110px] gradient-ai text-white text-[11px] font-semibold py-2 rounded-xl flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> AI 总结并更新档案
        </button>
        {enablePatientReminder && (
          <button
            onClick={() => { setReminderSent(true); toast.success("已发送沟通提醒到患者及家属"); }}
            className={`flex-1 min-w-[100px] text-[11px] font-semibold py-2 rounded-xl flex items-center justify-center gap-1 ${reminderSent ? "bg-success-soft text-success" : "border border-border"}`}
          >
            <Bell className="w-3.5 h-3.5" /> {reminderSent ? "已提醒患者" : "患者沟通提醒"}
          </button>
        )}
        {enablePlanConfirm && (
          <button
            onClick={() => { setPlanConfirmed(true); toast.success("会议中已确认康复方案 · 已推送治疗师"); }}
            className={`flex-1 min-w-[110px] text-[11px] font-semibold py-2 rounded-xl flex items-center justify-center gap-1 ${planConfirmed ? "bg-success-soft text-success" : `${accentBg[accent]} text-white`}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> {planConfirmed ? "方案已确认" : "确认康复方案"}
          </button>
        )}
      </div>

      {/* input */}
      <div className="px-3 py-2 bg-card border-t border-border/60 flex items-center gap-2">
        <button
          onClick={() => {
            toast("🎤 正在听写…");
            setTimeout(() => { setInput(v => (v ? v + " " : "") + "我已记录您的反馈，会与团队同步。"); toast.success("语音已转写"); }, 900);
          }}
          className="w-9 h-9 rounded-full bg-muted text-foreground/70 flex items-center justify-center"
          aria-label="语音输入"
        >
          <Mic className="w-4 h-4" />
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") send(); }}
          placeholder="输入消息 / 按🎤语音输入..."
          className="flex-1 bg-muted rounded-full px-4 py-2 text-xs outline-none"
        />
        <button onClick={send} className={`w-9 h-9 rounded-full ${accentBg[accent]} text-white flex items-center justify-center`}>
          <Send className="w-4 h-4" />
        </button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-[360px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-[15px]">
              <Sparkles className="w-4 h-4 text-ai" /> 康复医生确认会议结论
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[12px]">
              以下为 AI 自动生成的会议纪要，确认后将同步至 <b>首次评估 / 康复方案 / 康复医嘱</b>。请康复医生审核：
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-ai-soft border border-ai/20 rounded-xl p-3 text-[12px] whitespace-pre-line max-h-[200px] overflow-y-auto">
            {pendingSummary}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-[12px]">暂不更新</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAndApply} className="text-[12px] gradient-ai text-white">
              康复医生确认 · 更新档案
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export const DEFAULT_MEETING_MSGS: ChatMessage[] = [
  { id: "1", author: "李志远", role: "康复医师", text: "各位老师下午好，我们来确认一下张建国的 V2 方案。本周 FMA 提升 8 分。", time: "10:31" },
  { id: "2", author: "王雅琴", role: "PT 治疗师", text: "下肢力量训练完成度很好，建议把 PT 频次从 4 次/周 → 5 次/周（单次仍 30 分钟）。", time: "10:32" },
  { id: "3", author: "陈思雨", role: "ST 治疗师", text: "构音训练保持原节奏，吞咽功能稳定，暂不调整。", time: "10:33" },
  { id: "4", author: "赵静怡", role: "护理", text: "夜间血压偶有波动，建议加强观察 q4h。", time: "10:34" },
  { id: "5", author: "孙博士", role: "心理", text: "情绪稳定，配合度高，可继续家属同伴支持模式。", time: "10:35" },
];

export const DEFAULT_VIDEO_MSGS: ChatMessage[] = [
  { id: "1", author: "李志远", role: "康复医师", text: "邀请各位会诊王秀英病例，髋关节术后第 5 天。", time: "14:02" },
  { id: "2", author: "王雅琴", role: "PT 治疗师", text: "Berg 32 分，需重点关注负重训练耐受。", time: "14:03" },
  { id: "3", author: "赵静怡", role: "护理", text: "VAS 由 6 → 3，疼痛控制理想。", time: "14:04" },
];

/* ============== 团队会议列表 + 新增 ============== */
export interface TeamMeeting {
  id: string;
  patientId?: string;
  patientName?: string;
  topic: string;
  time: string;
  status: "进行中" | "待开始" | "已结束";
  participants: string[];
}

export const DEFAULT_MEETINGS: TeamMeeting[] = [
  { id: "tm1", patientId: "p1", patientName: "张建国", topic: "V2 方案确认", time: "今日 10:30", status: "进行中", participants: ["李医师", "王治疗师", "陈治疗师", "赵护士", "孙博士"] },
  { id: "tm2", patientId: "p2", patientName: "王秀英", topic: "首次评估复议", time: "今日 16:00", status: "待开始", participants: ["李医师", "王治疗师", "赵护士"] },
  { id: "tm3", patientId: "p3", patientName: "李 强", topic: "出院条件评估", time: "明日 09:00", status: "待开始", participants: ["李医师", "王治疗师", "赵护士"] },
];

export const TeamMeetingListSheet = ({
  accent,
  meetings,
  onPick,
  onCreate,
}: {
  accent: Accent;
  meetings: TeamMeeting[];
  onPick: (m: TeamMeeting) => void;
  onCreate: () => void;
}) => (
  <div className="p-4 space-y-3">
    <button
      onClick={onCreate}
      className={`w-full ${accentBg[accent]} text-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-card`}
    >
      <Plus className="w-4 h-4" /> 新增团队会议（针对单个患者）
    </button>
    <SectionTitle title={`会议列表 · ${meetings.length}`} />
    <div className="space-y-2">
      {meetings.map(m => {
        const sc = {
          "进行中": "bg-success-soft text-success",
          "待开始": "bg-warning/15 text-warning",
          "已结束": "bg-muted text-muted-foreground",
        }[m.status];
        return (
          <button
            key={m.id}
            onClick={() => onPick(m)}
            className="w-full text-left bg-card rounded-2xl shadow-card p-3.5 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className={`w-4 h-4 ${accentText[accent]}`} />
                <span className="text-[13px] font-semibold">{m.patientName ? `${m.patientName} · ${m.topic}` : m.topic}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${sc}`}>{m.status}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">{m.time} · {m.participants.length} 人</div>
            <div className="text-[10px] text-muted-foreground mt-1 truncate">{m.participants.join(" · ")}</div>
          </button>
        );
      })}
    </div>
  </div>
);

/* ============== 患者沟通：会话列表 + 单会话 ============== */
export interface PatientChatThread {
  patientId: string;
  lastMsg: string;
  time: string;
  unread: number;
}

export const DEFAULT_PATIENT_THREADS: PatientChatThread[] = [
  { patientId: "p1", lastMsg: "医生今晚我可以下床走几步吗？", time: "14:32", unread: 2 },
  { patientId: "p2", lastMsg: "夜间疼痛比昨天好多了，谢谢", time: "12:08", unread: 0 },
  { patientId: "p3", lastMsg: "出院后社区怎么衔接？", time: "昨日", unread: 1 },
  { patientId: "p5", lastMsg: "首次评估什么时候安排？", time: "昨日", unread: 3 },
];

export const PatientChatListSheet = ({
  accent,
  onPick,
}: {
  accent: Accent;
  onPick: (p: Patient) => void;
}) => {
  const totalUnread = DEFAULT_PATIENT_THREADS.reduce((s, t) => s + t.unread, 0);
  return (
    <div className="p-4 space-y-3">
      <AICard title={`患者沟通 · 未读 ${totalUnread}`}>
        AI 已对所有患者会话进行情绪与紧急度分析，标红为需优先回复。
      </AICard>
      <SectionTitle title={`会话列表 · ${DEFAULT_PATIENT_THREADS.length}`} />
      <div className="space-y-2">
        {DEFAULT_PATIENT_THREADS.map(t => {
          const p = PATIENTS.find(x => x.id === t.patientId);
          if (!p) return null;
          return (
            <button
              key={t.patientId}
              onClick={() => onPick(p)}
              className="w-full text-left bg-card rounded-2xl shadow-card p-3.5 flex items-center gap-3 active:scale-[0.99]"
            >
              <div className={`w-11 h-11 rounded-xl ${accentBg[accent]} text-white flex items-center justify-center font-bold relative`}>
                {p.name[0]}
                {t.unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
                    {t.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold">{p.name} · 床{p.bed}</span>
                  <span className="text-[10px] text-muted-foreground">{t.time}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{t.lastMsg}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const PatientChatSheet = ({
  accent,
  patient,
  onClose,
  showProfile = true,
}: {
  accent: Accent;
  patient: Patient | null;
  onClose: () => void;
  showProfile?: boolean;
}) => {
  const [msgs, setMsgs] = useState<ChatMessage[]>([
    { id: "p1", author: patient?.name || "患者", text: "医生您好，请问今晚我可以下床走几步吗？", time: "14:30" },
    { id: "p2", author: "我", isMe: true, text: "可以，请使用助行器，先在床边站立 1 分钟，无头晕再尝试走 3-5 步。", time: "14:31" },
    { id: "p3", author: patient?.name || "患者", text: "好的，请问需要家属陪同吗？", time: "14:32" },
  ]);
  const [input, setInput] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  if (!patient) return null;

  const aiSuggestions = [
    "建议有家属或护士陪同，避免跌倒。如出现头晕、心慌请立即坐下并呼叫护士。",
    "可以下床但需循序渐进，从床边坐立 → 站立 → 短距离行走，每次不超过 5 分钟。",
    "今日 VAS 已降至 3，可以适度活动，注意患肢负重不超过 30%。",
  ];

  const send = (text?: string) => {
    const v = (text ?? input).trim();
    if (!v) return;
    setMsgs([...msgs, { id: Date.now().toString(), author: "我", isMe: true, text: v, time: "刚刚" }]);
    setInput("");
    setShowAI(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`${accentBg[accent]} text-white px-4 py-3 flex items-center gap-2`}>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center -ml-1">
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate">{patient.name} · 床{patient.bed}</div>
          <div className="text-[11px] opacity-90 truncate">{patient.condition} · {patient.meta}</div>
        </div>
        {showProfile && (
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="text-[11px] px-2 py-1 rounded-full bg-white/20 backdrop-blur"
          >
            {profileOpen ? "收起档案" : "查看档案"}
          </button>
        )}
      </div>

      {profileOpen && (
        <div className="bg-card border-b border-border/60 px-4 py-3 text-[11px] space-y-1.5 max-h-[180px] overflow-y-auto">
          <div className="flex justify-between"><span className="text-muted-foreground">主诊断</span><span className="font-semibold">{patient.condition}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">入院</span><span>第 {patient.admitDays} 天</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">主管团队</span><span>{patient.shared.slice(0, 3).join(" / ")}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">最近备注</span><span className="text-right">{patient.notes[0]?.text?.slice(0, 18) || "无"}</span></div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-muted/30">
        {msgs.map(m => (
          <div key={m.id} className={`flex gap-2 ${m.isMe ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white ${m.isMe ? accentBg[accent] : "bg-muted-foreground"}`}>
              {m.author[0]}
            </div>
            <div className={`max-w-[78%] flex flex-col gap-1`}>
              <div className="text-[10px] text-muted-foreground px-1">{m.author} · {m.time}</div>
              <div className={`text-[12px] leading-relaxed px-3 py-2 rounded-2xl whitespace-pre-line ${
                m.isMe ? `${accentBg[accent]} text-white rounded-tr-sm` : "bg-card shadow-card rounded-tl-sm"
              }`}>{m.text}</div>
            </div>
          </div>
        ))}
      </div>

      {showAI && (
        <div className="bg-ai-soft border-t border-ai/20 px-3 py-2 space-y-1.5">
          <div className="text-[10px] text-ai font-semibold flex items-center gap-1"><Sparkles className="w-3 h-3" />AI 自动回复建议 · 点击引用</div>
          {aiSuggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => send(s)}
              className="w-full text-left bg-card rounded-xl px-3 py-2 text-[11px] leading-relaxed border border-ai/15 active:scale-[0.99]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="px-3 py-2 bg-card border-t border-border/60 flex items-center gap-2">
        <button
          onClick={() => setShowAI(!showAI)}
          className={`w-9 h-9 rounded-full flex items-center justify-center ${showAI ? "gradient-ai text-white" : "bg-muted text-foreground/70"}`}
          aria-label="AI 建议"
        >
          <Sparkles className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            toast("🎤 正在听写…");
            setTimeout(() => { setInput(v => (v ? v + " " : "") + "请按医嘱循序渐进，注意安全。"); toast.success("语音已转写"); }, 900);
          }}
          className="w-9 h-9 rounded-full bg-muted text-foreground/70 flex items-center justify-center"
          aria-label="语音输入"
        >
          <Mic className="w-4 h-4" />
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") send(); }}
          placeholder="输入消息 / 按🎤语音输入..."
          className="flex-1 bg-muted rounded-full px-4 py-2 text-xs outline-none"
        />
        <button onClick={() => send()} className={`w-9 h-9 rounded-full ${accentBg[accent]} text-white flex items-center justify-center`}>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const PATIENT_UNREAD = DEFAULT_PATIENT_THREADS.reduce((s, t) => s + t.unread, 0);

export const NewMeetingSheet = ({
  accent,
  onCreate,
}: {
  accent: Accent;
  onCreate: (m: TeamMeeting) => void;
}) => {
  const [patientId, setPatientId] = useState<string>(PATIENTS[0].id);
  const [topic, setTopic] = useState("");
  const [time, setTime] = useState("今日 16:30");
  return (
    <div className="p-4 space-y-3">
      <AICard title="新增团队会议">
        会议将基于选中患者发起，AI 会自动生成纪要并同步到患者评估 / 方案中。
      </AICard>
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <div className="flex items-center justify-between py-3 px-3">
          <span className="text-[13px]">选择患者</span>
          <select value={patientId} onChange={e => setPatientId(e.target.value)} className="text-[12px] bg-muted rounded-lg px-2 py-1 outline-none">
            {PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name} · 床{p.bed}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between py-3 px-3">
          <span className="text-[13px]">议题</span>
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="如 V2 方案确认" className="w-40 text-right text-[12px] bg-muted rounded-lg px-2 py-1 outline-none" />
        </div>
        <div className="flex items-center justify-between py-3 px-3">
          <span className="text-[13px]">时间</span>
          <input value={time} onChange={e => setTime(e.target.value)} className="w-40 text-right text-[12px] bg-muted rounded-lg px-2 py-1 outline-none" />
        </div>
      </div>
      <button
        onClick={() => {
          if (!topic.trim()) { toast("请填写议题"); return; }
          const p = PATIENTS.find(x => x.id === patientId)!;
          onCreate({
            id: "tm" + Date.now(),
            patientId: p.id,
            patientName: p.name,
            topic,
            time,
            status: "待开始",
            participants: ["李医师", "王治疗师", "赵护士"],
          });
        }}
        className={`w-full ${accentBg[accent]} text-white rounded-2xl py-3 text-sm font-semibold`}
      >
        创建会议
      </button>
    </div>
  );
};
