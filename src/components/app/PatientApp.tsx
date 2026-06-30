import { useState } from "react";
import { ScreenShell, TabBar, type TabBarItem } from "@/components/app/TabBar";
import { AICard, SectionTitle } from "@/components/app/UI";
import { PhoneSheet, PrimaryBtn } from "@/components/app/Sheet";
import {
  Home as HomeIcon,
  ClipboardList,
  CheckCircle2,
  Circle,
  Sparkles,
  User as UserIcon,
  Activity,
  Dumbbell,
  Brain,
  MessageSquare,
  Camera,
  ChevronRight,
  Target,
  Flame,
  Trophy,
  Calendar,
  Bell,
  Heart,
  Smile,
  Frown,
  Meh,
  PlayCircle,
  BookOpen,
  HeartPulse,
  Stethoscope,
  Award,
  TrendingUp,
  Mic,
  Image as ImageIcon,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";

/* =========================================================
 * 患者端（康复用户端）
 *  · 主题色：physio（橙）— 与三端区分
 *  · 模块：工作台 / 康复评估（量表）/ 康复打卡 / 我的方案 / 我的
 * =======================================================*/

const TABS: TabBarItem[] = [
  { key: "home", label: "首页", icon: HomeIcon },
  { key: "assess", label: "康复评估", icon: ClipboardList },
  { key: "checkin", label: "康复打卡", icon: CheckCircle2 },
  { key: "plan", label: "我的方案", icon: Sparkles },
  { key: "me", label: "我的", icon: UserIcon },
];

/* ===================== 康复量表库（患者自评版） ===================== */
type QOption = { label: string; value: number; hint?: string };
type QItem = { id: string; q: string; options: QOption[] };
type Questionnaire = {
  key: string;
  name: string;
  short: string;
  tag: string;
  desc: string;
  icon: any;
  duration: string;
  items: QItem[];
  bands: { min: number; max: number; level: string; tip: string; tone: "good" | "warn" | "bad" }[];
};

const QUESTIONNAIRES: Questionnaire[] = [
  {
    key: "vas",
    name: "VAS 疼痛自评",
    short: "VAS",
    tag: "每日推荐",
    desc: "0–10 直观评分，记录当下疼痛强度",
    icon: Activity,
    duration: "约 30 秒",
    items: [
      {
        id: "vas",
        q: "请选择当前的疼痛程度",
        options: [
          { label: "0 · 无痛", value: 0 },
          { label: "1-3 · 轻度", value: 2, hint: "不影响日常活动" },
          { label: "4-6 · 中度", value: 5, hint: "影响活动 / 注意力" },
          { label: "7-9 · 重度", value: 8, hint: "明显影响睡眠" },
          { label: "10 · 剧痛", value: 10, hint: "无法忍受" },
        ],
      },
    ],
    bands: [
      { min: 0, max: 3, level: "轻度", tip: "保持当前训练强度，关注训练后变化", tone: "good" },
      { min: 4, max: 6, level: "中度", tip: "建议适当减量并联系主管治疗师", tone: "warn" },
      { min: 7, max: 10, level: "重度", tip: "建议暂停训练并尽快联系医师", tone: "bad" },
    ],
  },
  {
    key: "mbi",
    name: "Barthel 日常生活活动 (MBI)",
    short: "MBI",
    tag: "每周推荐",
    desc: "评估进食、穿衣、转移等 10 项日常能力",
    icon: HeartPulse,
    duration: "约 3 分钟",
    items: [
      { id: "eat", q: "进食是否需要帮助？", options: [{ label: "完全独立", value: 10 }, { label: "需少量帮助", value: 5 }, { label: "完全依赖", value: 0 }] },
      { id: "bath", q: "洗澡能否独立完成？", options: [{ label: "可独立", value: 5 }, { label: "需帮助", value: 0 }] },
      { id: "groom", q: "修饰（刷牙/梳头）", options: [{ label: "独立", value: 5 }, { label: "需帮助", value: 0 }] },
      { id: "dress", q: "穿脱衣物", options: [{ label: "独立", value: 10 }, { label: "需部分帮助", value: 5 }, { label: "完全依赖", value: 0 }] },
      { id: "bowel", q: "排便控制", options: [{ label: "可控", value: 10 }, { label: "偶有失禁", value: 5 }, { label: "失禁", value: 0 }] },
      { id: "bladder", q: "排尿控制", options: [{ label: "可控", value: 10 }, { label: "偶有失禁", value: 5 }, { label: "失禁", value: 0 }] },
      { id: "toilet", q: "如厕动作", options: [{ label: "独立", value: 10 }, { label: "需帮助", value: 5 }, { label: "依赖", value: 0 }] },
      { id: "transfer", q: "床椅转移", options: [{ label: "独立", value: 15 }, { label: "需 1 人协助", value: 10 }, { label: "需 2 人协助", value: 5 }, { label: "完全依赖", value: 0 }] },
      { id: "walk", q: "平地行走 45 米", options: [{ label: "独立", value: 15 }, { label: "需扶持", value: 10 }, { label: "轮椅可独立", value: 5 }, { label: "无法移动", value: 0 }] },
      { id: "stairs", q: "上下楼梯", options: [{ label: "独立", value: 10 }, { label: "需帮助", value: 5 }, { label: "无法完成", value: 0 }] },
    ],
    bands: [
      { min: 0, max: 40, level: "重度依赖", tip: "需 24h 看护，建议增加护理介入", tone: "bad" },
      { min: 41, max: 60, level: "中度依赖", tip: "建议加强转移与步行训练", tone: "warn" },
      { min: 61, max: 99, level: "轻度依赖", tip: "继续巩固 ADL 训练，迈向独立", tone: "warn" },
      { min: 100, max: 100, level: "完全独立", tip: "保持现有功能，注意防跌倒", tone: "good" },
    ],
  },
  {
    key: "phq2",
    name: "情绪 PHQ-2 快速筛查",
    short: "PHQ-2",
    tag: "心理健康",
    desc: "评估近 2 周的兴趣与情绪状态",
    icon: Smile,
    duration: "约 1 分钟",
    items: [
      { id: "p1", q: "做事情时提不起劲或没有兴趣", options: [{ label: "没有", value: 0 }, { label: "几天", value: 1 }, { label: "一半以上", value: 2 }, { label: "几乎每天", value: 3 }] },
      { id: "p2", q: "感觉心情低落、沮丧或绝望", options: [{ label: "没有", value: 0 }, { label: "几天", value: 1 }, { label: "一半以上", value: 2 }, { label: "几乎每天", value: 3 }] },
    ],
    bands: [
      { min: 0, max: 2, level: "情绪平稳", tip: "状态良好，保持规律作息", tone: "good" },
      { min: 3, max: 6, level: "需关注", tip: "建议进一步完成 PHQ-9 并联系医师", tone: "warn" },
    ],
  },
  {
    key: "fall",
    name: "Morse 跌倒风险自评",
    short: "Morse",
    tag: "安全评估",
    desc: "评估近期跌倒风险，指导居家防护",
    icon: Activity,
    duration: "约 2 分钟",
    items: [
      { id: "hist", q: "近 3 个月是否跌倒过？", options: [{ label: "否", value: 0 }, { label: "是", value: 25 }] },
      { id: "diag", q: "是否有 1 种以上慢病？", options: [{ label: "否", value: 0 }, { label: "是", value: 15 }] },
      { id: "aid", q: "行走辅助情况", options: [{ label: "无 / 家具支撑", value: 0 }, { label: "拐杖 / 助行器", value: 15 }, { label: "需扶家具", value: 30 }] },
      { id: "iv", q: "是否使用静脉输液", options: [{ label: "否", value: 0 }, { label: "是", value: 20 }] },
      { id: "gait", q: "步态", options: [{ label: "正常", value: 0 }, { label: "虚弱", value: 10 }, { label: "受损", value: 20 }] },
      { id: "mental", q: "认知状态", options: [{ label: "了解自身能力", value: 0 }, { label: "高估自身能力", value: 15 }] },
    ],
    bands: [
      { min: 0, max: 24, level: "低风险", tip: "保持环境整洁，地面防滑", tone: "good" },
      { min: 25, max: 44, level: "中风险", tip: "起身/下床注意慢动作，配备扶手", tone: "warn" },
      { min: 45, max: 200, level: "高风险", tip: "建议陪护协助、夜间留灯", tone: "bad" },
    ],
  },
  {
    key: "sleep",
    name: "睡眠质量自评 (PSQI 简版)",
    short: "PSQI",
    tag: "生活方式",
    desc: "近 1 周睡眠状况快速评估",
    icon: Brain,
    duration: "约 1 分钟",
    items: [
      { id: "fall", q: "入睡需要多久？", options: [{ label: "<15 分钟", value: 0 }, { label: "15-30 分钟", value: 1 }, { label: "30-60 分钟", value: 2 }, { label: ">60 分钟", value: 3 }] },
      { id: "hours", q: "实际睡眠时长", options: [{ label: ">7h", value: 0 }, { label: "6-7h", value: 1 }, { label: "5-6h", value: 2 }, { label: "<5h", value: 3 }] },
      { id: "wake", q: "夜间觉醒次数", options: [{ label: "0 次", value: 0 }, { label: "1 次", value: 1 }, { label: "2 次", value: 2 }, { label: "≥3 次", value: 3 }] },
      { id: "feel", q: "醒后是否疲乏", options: [{ label: "不", value: 0 }, { label: "轻微", value: 1 }, { label: "中等", value: 2 }, { label: "明显", value: 3 }] },
    ],
    bands: [
      { min: 0, max: 4, level: "睡眠良好", tip: "保持作息节律", tone: "good" },
      { min: 5, max: 8, level: "一般", tip: "注意睡前减少电子设备", tone: "warn" },
      { min: 9, max: 12, level: "较差", tip: "建议联系医师评估，避免训练过量", tone: "bad" },
    ],
  },
];

/* ===================== 顶部 AI 主管医生卡片 ===================== */
const HeroCard = ({ name }: { name: string }) => (
  <section className="relative overflow-hidden gradient-physio px-4 pb-5 pt-5 text-white">
    <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
    <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
    <div className="relative flex gap-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
        <HeartPulse className="h-7 w-7" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-[11px] text-white/85">
          <Sparkles className="h-3 w-3" /> 康复管家 · 您的 AI 主管医生
        </div>
        <h1 className="mt-1 text-[15px] font-bold leading-tight">{name}，今日康复完成度 60%👋</h1>
        <p className="mt-1 text-[11px] leading-relaxed text-white/90">
          疼痛 VAS <b>3</b>，较昨日下降；下肢肌力训练已完成 2 / 3 组，建议下午继续完成站立平衡训练。
        </p>
      </div>
    </div>
    <div className="relative mt-3 flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 ring-1 ring-white/25 backdrop-blur-md">
      <MessageSquare className="h-3.5 w-3.5 text-white/90" />
      <span className="flex-1 text-[11px] text-white/85">向 AI 康复管家提问…</span>
      <button className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-role-physio">问诊</button>
    </div>
    <div className="relative mt-2 flex flex-wrap gap-1.5">
      {["训练后疼痛", "如何练平衡", "热敷可以吗", "复诊预约"].map((t) => (
        <span key={t} className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-white/90 ring-1 ring-white/20">
          {t}
        </span>
      ))}
    </div>
  </section>
);

/* ===================== 首页 ===================== */
const PatientHome = ({ go }: { go: (k: string) => void }) => {
  const todayDone = 2;
  const todayTotal = 4;
  const pct = Math.round((todayDone / todayTotal) * 100);
  return (
    <div className="space-y-3 pb-4">
      <HeroCard name="孙德强" />

      {/* 实时指标 */}
      <section className="px-4">
        <div className="grid grid-cols-3 gap-2">
          <Metric icon={Activity} label="今日 VAS" value="3" unit="/10" foot="↘ 平稳" />
          <Metric icon={Flame} label="连续打卡" value="12" unit="天" foot="本周达成 5/7" />
          <Metric icon={TrendingUp} label="Barthel" value="65" unit="分" foot="↗ +5" />
        </div>
      </section>

      {/* 快捷入口 */}
      <section className="px-4">
        <div className="grid grid-cols-4 gap-2">
          <Quick onClick={() => go("assess")} icon={ClipboardList} label="康复评估" />
          <Quick onClick={() => go("checkin")} icon={CheckCircle2} label="训练打卡" />
          <Quick onClick={() => go("plan")} icon={Sparkles} label="我的方案" />
          <Quick onClick={() => toast("已为您提交复诊申请")} icon={Calendar} label="复诊预约" />
        </div>
      </section>

      {/* 今日康复进度 */}
      <section className="px-4">
        <div className="rounded-3xl bg-card shadow-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-role-physio" />
              <span className="text-sm font-semibold">今日康复进度</span>
            </div>
            <span className="text-[11px] text-muted-foreground">{todayDone}/{todayTotal} 已完成</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full gradient-physio rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <button onClick={() => go("checkin")} className="mt-3 inline-flex items-center gap-1 rounded-full gradient-physio px-3 py-1 text-[11px] font-semibold text-white">
            继续打卡 <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </section>

      {/* 评估中心入口 */}
      <section className="px-4">
        <SectionTitle title="评估中心" extra={<button onClick={() => go("assess")} className="text-[11px] text-role-physio font-semibold">全部 {QUESTIONNAIRES.length} 项</button>} />
        <div className="space-y-2">
          {QUESTIONNAIRES.slice(0, 3).map((q) => (
            <button key={q.key} onClick={() => go("assess")} className="w-full rounded-2xl bg-card shadow-card p-3 flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-role-physio flex items-center justify-center shrink-0">
                <q.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[13px] font-semibold truncate">{q.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-50 text-role-physio font-semibold shrink-0">{q.tag}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{q.items.length} 题 · {q.duration}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>

      {/* 康复百科 */}
      <section className="px-4">
        <SectionTitle title="康复百科" extra={<span className="text-[11px] text-muted-foreground">看完得积分</span>} />
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
          {[
            { tag: "视频", icon: PlayCircle, title: "脑卒中后上肢功能训练 5 步", meta: "李主任 · 5 分钟 · +50 积分" },
            { tag: "图文", icon: BookOpen, title: "髋关节置换术后 6 周训练指南", meta: "PT 王治疗师 · +30 积分" },
            { tag: "直播", icon: PlayCircle, title: "周四 20:00 · 居家康复答疑", meta: "主任医师直播 · +80 积分" },
          ].map((c) => (
            <div key={c.title} className="w-[200px] shrink-0 overflow-hidden rounded-2xl bg-card shadow-card">
              <div className="relative flex h-24 items-center justify-center gradient-physio text-white">
                <c.icon className="h-9 w-9 opacity-90" />
                <span className="absolute left-2 top-2 rounded-full bg-black/30 px-2 py-0.5 text-[10px] backdrop-blur">{c.tag}</span>
              </div>
              <div className="p-3">
                <div className="line-clamp-2 text-[12px] font-semibold leading-snug">{c.title}</div>
                <div className="mt-1 text-[10px] text-muted-foreground">{c.meta}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="px-4 text-center text-[10px] text-muted-foreground">本应用建议仅供康复训练参考，不能替代医生诊疗</p>
    </div>
  );
};

const Metric = ({ icon: Icon, label, value, unit, foot }: { icon: any; label: string; value: string; unit: string; foot: string }) => (
  <div className="rounded-2xl bg-card p-3 shadow-card">
    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
      <span>{label}</span>
      <Icon className="h-3.5 w-3.5 text-role-physio" />
    </div>
    <div className="mt-1.5 flex items-baseline gap-1">
      <span className="text-lg font-bold text-foreground leading-none">{value}</span>
      <span className="text-[10px] text-muted-foreground">{unit}</span>
    </div>
    <div className="mt-1 text-[10px] text-muted-foreground">{foot}</div>
  </div>
);

const Quick = ({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) => (
  <button onClick={onClick} className="rounded-2xl bg-card shadow-card py-2.5 flex flex-col items-center gap-1">
    <div className="w-9 h-9 rounded-xl bg-orange-50 text-role-physio flex items-center justify-center">
      <Icon className="h-4 w-4" />
    </div>
    <span className="text-[10px] font-medium text-foreground">{label}</span>
  </button>
);

/* ===================== 康复评估（量表列表 + 填写） ===================== */
const AssessPage = ({ records, onSubmit }: { records: Record<string, { score: number; date: string }>; onSubmit: (key: string, score: number) => void }) => {
  const [activeQ, setActiveQ] = useState<Questionnaire | null>(null);

  return (
    <div className="space-y-3 pb-4">
      {/* 头部说明 */}
      <section className="gradient-physio px-4 pt-5 pb-4 text-white">
        <div className="text-[11px] text-white/85 flex items-center gap-1"><ClipboardList className="h-3 w-3" /> 康复评估中心</div>
        <h1 className="text-[16px] font-bold mt-1">每日 / 每周自评，让主管团队同步你的状态</h1>
        <p className="text-[11px] text-white/85 mt-1 leading-relaxed">完成后将自动同步至医师 / 治疗师工作台，作为方案调整依据。</p>
      </section>

      <section className="px-4 space-y-2">
        {QUESTIONNAIRES.map((q) => {
          const rec = records[q.key];
          return (
            <button key={q.key} onClick={() => setActiveQ(q)} className="w-full rounded-2xl bg-card shadow-card p-3 flex items-center gap-3 text-left">
              <div className="w-11 h-11 rounded-xl bg-orange-50 text-role-physio flex items-center justify-center shrink-0">
                <q.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[13px] font-semibold truncate">{q.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-50 text-role-physio font-semibold shrink-0">{q.tag}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{q.items.length} 题 · {q.duration}</div>
                {rec && (
                  <div className="text-[10px] text-role-physio mt-1">最近：{rec.date} · {rec.score} 分</div>
                )}
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full gradient-physio text-white font-semibold shrink-0">
                {rec ? "再次评估" : "开始"}
              </span>
            </button>
          );
        })}
      </section>

      <PhoneSheet
        open={!!activeQ}
        title={activeQ?.name ?? ""}
        onClose={() => setActiveQ(null)}
        accent="physio"
      >
        {activeQ && <QuestionnaireRunner q={activeQ} onDone={(score) => { onSubmit(activeQ.key, score); setActiveQ(null); }} />}
      </PhoneSheet>
    </div>
  );
};

const QuestionnaireRunner = ({ q, onDone }: { q: Questionnaire; onDone: (score: number) => void }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const total = Object.values(answers).reduce((s, v) => s + v, 0);
  const allAnswered = q.items.every((it) => it.id in answers);
  const band = q.bands.find((b) => total >= b.min && total <= b.max) ?? q.bands[0];
  const toneClass = { good: "bg-success-soft text-success", warn: "bg-warning-soft text-warning", bad: "bg-destructive/10 text-destructive" }[band.tone];

  if (submitted) {
    return (
      <div className="p-4 space-y-3">
        <div className="rounded-3xl gradient-physio text-white p-5 text-center">
          <Award className="w-10 h-10 mx-auto opacity-90" />
          <div className="text-[11px] text-white/85 mt-2">评估完成 · 已同步至主管团队</div>
          <div className="text-3xl font-bold mt-1">{total}<span className="text-sm font-medium ml-1">分</span></div>
          <div className="text-[12px] text-white/90 mt-1">{q.name}</div>
        </div>
        <div className={`rounded-2xl p-4 ${toneClass}`}>
          <div className="text-[11px] font-semibold opacity-80">结果分级</div>
          <div className="text-lg font-bold mt-0.5">{band.level}</div>
          <div className="text-[12px] mt-1 opacity-90 leading-relaxed">{band.tip}</div>
        </div>
        <AICard title="AI 康复管家建议">
          <div className="text-[12px] leading-relaxed">
            本次{q.short}评分 <b>{total}</b>。{band.tip}
            <br />已为你同步至主管医师 / 治疗师，可在「我的方案」中查看是否调整。
          </div>
        </AICard>
        <PrimaryBtn onClick={() => onDone(total)}>完成</PrimaryBtn>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="rounded-2xl bg-orange-50 p-3">
        <div className="text-[11px] text-role-physio flex items-center gap-1"><Sparkles className="h-3 w-3" /> {q.tag} · {q.duration}</div>
        <div className="text-[12px] text-foreground/80 mt-1">{q.desc}</div>
      </div>

      {q.items.map((it, idx) => (
        <div key={it.id} className="rounded-2xl bg-card shadow-card p-3">
          <div className="text-[12px] font-semibold text-foreground">
            <span className="text-role-physio mr-1">Q{idx + 1}.</span>
            {it.q}
          </div>
          <div className="mt-2 grid grid-cols-1 gap-1.5">
            {it.options.map((op) => {
              const active = answers[it.id] === op.value;
              return (
                <button
                  key={op.label}
                  onClick={() => setAnswers((a) => ({ ...a, [it.id]: op.value }))}
                  className={`text-left px-3 py-2 rounded-xl border text-[12px] transition-all flex items-center justify-between gap-2 ${
                    active ? "gradient-physio text-white border-transparent shadow-card" : "bg-muted/40 border-border/60 text-foreground"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{op.label}</div>
                    {op.hint && <div className={`text-[10px] mt-0.5 ${active ? "text-white/80" : "text-muted-foreground"}`}>{op.hint}</div>}
                  </div>
                  {active ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-background/95 backdrop-blur border-t border-border/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-muted-foreground">已完成 {Object.keys(answers).length} / {q.items.length} 题</span>
          {allAnswered && <span className="text-[11px] font-semibold text-role-physio">当前合计：{total} 分</span>}
        </div>
        <PrimaryBtn disabled={!allAnswered} onClick={() => setSubmitted(true)}>提交评估</PrimaryBtn>
      </div>
    </div>
  );
};

/* ===================== 康复打卡 ===================== */
type CheckinTask = {
  id: string;
  title: string;
  sub: string;
  icon: any;
  type: "train" | "med" | "vital" | "diet";
  target: string;
};
const TASKS: CheckinTask[] = [
  { id: "ankle", title: "踝泵运动 · 3 组 × 20 次", sub: "晨起 / 下午 / 睡前各一组", icon: Dumbbell, type: "train", target: "60 次" },
  { id: "stand", title: "床边站立平衡 5 分钟", sub: "需家属/陪护在旁保护", icon: Activity, type: "train", target: "5 分钟" },
  { id: "speech", title: "言语练习 · 数字 1-20", sub: "ST 张治疗师推送", icon: Brain, type: "train", target: "2 组" },
  { id: "vas", title: "记录今日疼痛 VAS", sub: "每日一次，用于团队会议", icon: Activity, type: "vital", target: "1 次" },
  { id: "med", title: "阿托伐他汀 20mg", sub: "20:00 · 睡前服用", icon: Heart, type: "med", target: "1 次" },
  { id: "diet", title: "晚餐饮食打卡", sub: "拍照识别 · 一键完成", icon: Camera, type: "diet", target: "1 次" },
];

const CheckinPage = ({
  done,
  onToggle,
  mood,
  setMood,
  diary,
  setDiary,
}: {
  done: Record<string, boolean>;
  onToggle: (id: string) => void;
  mood: "good" | "ok" | "bad" | null;
  setMood: (m: "good" | "ok" | "bad") => void;
  diary: string;
  setDiary: (v: string) => void;
}) => {
  const doneCount = Object.values(done).filter(Boolean).length;
  const pct = Math.round((doneCount / TASKS.length) * 100);
  const streak = 12;

  return (
    <div className="space-y-3 pb-6">
      {/* 头部进度 */}
      <section className="gradient-physio px-4 pt-5 pb-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] text-white/85 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> 今日康复打卡</div>
            <div className="text-[20px] font-bold mt-1">{doneCount} / {TASKS.length} 项已完成</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/85">连续打卡</div>
            <div className="text-2xl font-bold flex items-center gap-1"><Flame className="h-5 w-5" />{streak}<span className="text-xs font-medium ml-0.5">天</span></div>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/25 overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          {[Trophy, Award, Flame, Calendar, Bell].map((Ic, i) => (
            <div key={i} className={`w-7 h-7 rounded-full bg-white/15 flex items-center justify-center ring-1 ring-white/25 ${i < 3 ? "" : "opacity-50"}`}>
              <Ic className="h-3.5 w-3.5" />
            </div>
          ))}
          <span className="text-[10px] text-white/85 ml-auto">本周徽章 3/5</span>
        </div>
      </section>

      {/* 任务列表 */}
      <section className="px-4">
        <SectionTitle title="今日任务" extra={<span className="text-[11px] text-muted-foreground">由主管治疗师推送</span>} />
        <div className="space-y-2">
          {TASKS.map((t) => {
            const isDone = !!done[t.id];
            return (
              <button
                key={t.id}
                onClick={() => onToggle(t.id)}
                className={`w-full rounded-2xl shadow-card p-3 flex items-center gap-3 text-left transition-all ${
                  isDone ? "bg-success-soft" : "bg-card"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isDone ? "bg-success text-white" : "bg-orange-50 text-role-physio"
                }`}>
                  {isDone ? <CheckCircle2 className="h-5 w-5" /> : <t.icon className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-[13px] font-semibold truncate ${isDone ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{t.sub}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                  isDone ? "bg-success text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {isDone ? "已完成" : t.target}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 今日心情 */}
      <section className="px-4">
        <SectionTitle title="今日心情" />
        <div className="rounded-2xl bg-card shadow-card p-3">
          <div className="flex items-center justify-around">
            {([
              { k: "good", icon: Smile, label: "不错" },
              { k: "ok", icon: Meh, label: "一般" },
              { k: "bad", icon: Frown, label: "较差" },
            ] as const).map(({ k, icon: Ic, label }) => {
              const active = mood === k;
              return (
                <button
                  key={k}
                  onClick={() => setMood(k)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${active ? "gradient-physio text-white" : "text-muted-foreground"}`}
                >
                  <Ic className="h-6 w-6" />
                  <span className="text-[11px] font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 训练日记 */}
      <section className="px-4">
        <SectionTitle title="训练日记" extra={<span className="text-[10px] text-muted-foreground">支持语音 / 拍照</span>} />
        <div className="rounded-2xl bg-card shadow-card p-3">
          <textarea
            value={diary}
            onChange={(e) => setDiary(e.target.value)}
            placeholder="记录今天的训练感受、疼痛部位、家属协助情况..."
            className="w-full bg-muted/50 rounded-xl p-3 text-[12px] h-24 outline-none resize-none"
          />
          <div className="mt-2 flex items-center gap-2">
            <button onClick={() => toast("已开始语音录入（演示）")} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted text-[11px] font-medium text-foreground">
              <Mic className="h-3.5 w-3.5" /> 语音
            </button>
            <button onClick={() => toast("已附加图片（演示）")} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted text-[11px] font-medium text-foreground">
              <ImageIcon className="h-3.5 w-3.5" /> 拍照
            </button>
            <button
              onClick={() => toast.success("日记已同步至主管治疗师")}
              className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-full gradient-physio text-white text-[11px] font-semibold"
            >
              提交
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ===================== 我的方案 ===================== */
const PlanPage = () => (
  <div className="space-y-3 pb-4">
    <section className="gradient-physio px-4 pt-5 pb-5 text-white">
      <div className="text-[11px] text-white/85 flex items-center gap-1"><Sparkles className="h-3 w-3" /> 你的康复方案 · v2.4</div>
      <h1 className="text-[16px] font-bold mt-1">急性脑卒中 · 神经康复方向</h1>
      <p className="text-[11px] text-white/85 mt-1 leading-relaxed">主管医师 李志远 · PT 王雅琴 · ST 张敏</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { label: "已执行", value: "12 天" },
          { label: "完成度", value: "60%" },
          { label: "下次评估", value: "3 天后" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white/15 p-2 backdrop-blur ring-1 ring-white/20">
            <div className="text-[10px] text-white/80">{s.label}</div>
            <div className="text-[14px] font-bold mt-0.5">{s.value}</div>
          </div>
        ))}
      </div>
    </section>

    <section className="px-4">
      <SectionTitle title="本周康复目标" />
      <div className="space-y-2">
        {[
          { t: "下肢肌力提升至 3 级", sub: "MMT 评估 · 当前 2 级", pct: 60 },
          { t: "Berg 平衡 ≥ 40", sub: "当前 32 · 目标 +8", pct: 45 },
          { t: "VAS ≤ 3", sub: "当前平均 3.2", pct: 80 },
        ].map((g) => (
          <div key={g.t} className="rounded-2xl bg-card shadow-card p-3">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-semibold">{g.t}</div>
              <span className="text-[11px] font-bold text-role-physio">{g.pct}%</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{g.sub}</div>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full gradient-physio rounded-full" style={{ width: `${g.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>

    <section className="px-4">
      <SectionTitle title="主管团队" />
      <div className="rounded-2xl bg-card shadow-card divide-y divide-border/60">
        {[
          { role: "主管医师", name: "李志远", desc: "副主任医师 · 神经康复", icon: Stethoscope },
          { role: "PT 治疗师", name: "王雅琴", desc: "下肢运动 / 平衡训练", icon: Activity },
          { role: "ST 治疗师", name: "张敏", desc: "言语 / 吞咽训练", icon: Brain },
        ].map((m) => (
          <div key={m.name} className="flex items-center gap-3 p-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-role-physio flex items-center justify-center shrink-0">
              <m.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] text-muted-foreground">{m.role}</div>
              <div className="text-[13px] font-semibold">{m.name} · {m.desc}</div>
            </div>
            <button onClick={() => toast(`已发送消息给 ${m.name}`)} className="text-[11px] px-2.5 py-1 rounded-full bg-orange-50 text-role-physio font-semibold">
              联系
            </button>
          </div>
        ))}
      </div>
    </section>

    <AICard title="AI 方案解读">
      <div className="text-[12px] leading-relaxed">
        基于你近 7 日的打卡与评估：下肢肌力 ↑，平衡尚不稳。建议本周减少独立行走练习，增加坐位 → 站位转移练习 (3 组 × 8 次)。下肢肌张力如继续偏高，可联系主治医师调整用药。
      </div>
    </AICard>
  </div>
);

/* ===================== 我的 ===================== */
const MePage = () => (
  <div className="space-y-3 pb-4">
    <section className="gradient-physio px-4 pt-6 pb-5 text-white">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-white/20 ring-1 ring-white/30 flex items-center justify-center text-xl font-bold">孙</div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold">孙德强 · 男 60</div>
          <div className="text-[11px] text-white/85 mt-0.5">床号 315 · 急性脑卒中 · 入院第 12 天</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="累计打卡" value="42" />
        <Stat label="评估次数" value="8" />
        <Stat label="康复积分" value="1280" />
      </div>
    </section>

    <section className="px-4">
      <SectionTitle title="服务与设置" />
      <div className="rounded-2xl bg-card shadow-card divide-y divide-border/60">
        {[
          { icon: Calendar, label: "复诊与预约" },
          { icon: Bell, label: "提醒设置" },
          { icon: Heart, label: "家属同步" },
          { icon: ClipboardList, label: "历史评估记录" },
          { icon: Trophy, label: "我的积分与徽章" },
        ].map((it) => (
          <button key={it.label} className="flex items-center gap-3 p-3 w-full text-left">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-role-physio flex items-center justify-center">
              <it.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 text-[13px] font-medium">{it.label}</div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </section>

    <p className="px-4 text-center text-[10px] text-muted-foreground">© 省人康复科 · 康复管家</p>
  </div>
);
const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-white/15 p-2 backdrop-blur ring-1 ring-white/20">
    <div className="text-[10px] text-white/80">{label}</div>
    <div className="text-[14px] font-bold mt-0.5">{value}</div>
  </div>
);

/* ===================== 主应用 ===================== */
export const PatientApp = () => {
  const [tab, setTab] = useState("home");
  const [records, setRecords] = useState<Record<string, { score: number; date: string }>>({
    vas: { score: 3, date: "今天" },
    mbi: { score: 65, date: "2026/06/28" },
  });
  const [done, setDone] = useState<Record<string, boolean>>({ ankle: true, vas: true });
  const [mood, setMood] = useState<"good" | "ok" | "bad" | null>("good");
  const [diary, setDiary] = useState("");

  const toggleTask = (id: string) =>
    setDone((d) => {
      const next = { ...d, [id]: !d[id] };
      if (!d[id]) toast.success("打卡成功 · 已同步治疗师");
      return next;
    });

  const submitQ = (key: string, score: number) => {
    const today = (() => { const n = new Date(); const p = (x: number) => String(x).padStart(2, "0"); return `${n.getFullYear()}/${p(n.getMonth() + 1)}/${p(n.getDate())}`; })();
    setRecords((r) => ({ ...r, [key]: { score, date: today } }));
    toast.success("评估结果已同步主管团队");
  };

  return (
    <ScreenShell tabBar={<TabBar active={tab} accent="physio" onChange={setTab} items={TABS} />}>
      {tab === "home" && <PatientHome go={setTab} />}
      {tab === "assess" && <AssessPage records={records} onSubmit={submitQ} />}
      {tab === "checkin" && (
        <CheckinPage done={done} onToggle={toggleTask} mood={mood} setMood={setMood} diary={diary} setDiary={setDiary} />
      )}
      {tab === "plan" && <PlanPage />}
      {tab === "me" && <MePage />}
    </ScreenShell>
  );
};
