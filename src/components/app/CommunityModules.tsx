import { useState } from "react";
import { AICard, SectionTitle } from "@/components/app/UI";
import { PhoneSheet } from "@/components/app/Sheet";
import { PATIENTS } from "@/components/app/PatientsModule";
import { toast } from "sonner";
import {
  BookOpen,
  Send,
  PlayCircle,
  FileText,
  Phone,
  CheckCircle2,
  Clock,
  ChevronRight,
  Users,
  Search,
} from "lucide-react";

/* ===================== 宣教模块 ===================== */

type EduMaterial = {
  id: string;
  title: string;
  type: "视频" | "图文" | "音频";
  tag: string;
  duration: string;
  sent: number;
};

const EDU_LIB: EduMaterial[] = [
  { id: "e1", title: "脑卒中居家康复 · 日常良肢位摆放", type: "视频", tag: "卒中", duration: "6 分钟", sent: 128 },
  { id: "e2", title: "高血压患者饮食指南（低盐 DASH）", type: "图文", tag: "慢病", duration: "5 分钟阅读", sent: 96 },
  { id: "e3", title: "糖尿病足日常自检与护理", type: "图文", tag: "糖尿病", duration: "4 分钟阅读", sent: 74 },
  { id: "e4", title: "髋关节置换术后家庭康复操", type: "视频", tag: "骨科", duration: "8 分钟", sent: 52 },
  { id: "e5", title: "吞咽障碍家庭训练 · 进食安全要点", type: "音频", tag: "卒中", duration: "10 分钟", sent: 40 },
  { id: "e6", title: "COPD 呼吸训练 · 缩唇与腹式呼吸", type: "视频", tag: "心肺", duration: "7 分钟", sent: 33 },
];

export const EducationModule = () => {
  const [picked, setPicked] = useState<EduMaterial | null>(null);
  const [kw, setKw] = useState("");
  const list = EDU_LIB.filter(e => !kw || e.title.includes(kw) || e.tag.includes(kw));
  return (
    <div className="px-4 pt-4 pb-4 space-y-4">
      <AICard title="AI 宣教推荐">
        本周共 18 位院外患者待发送宣教，AI 已根据病种与近期评估自动匹配资料，可一键群发。
      </AICard>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "今日已发送", value: 12, sub: "条" },
          { label: "本月覆盖", value: 86, sub: "位患者" },
          { label: "已阅读率", value: "72%", sub: "近 7 天" },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl p-3 shadow-card">
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
            <div className="text-lg font-bold text-foreground mt-1">{s.value}</div>
            <div className="text-[10px] text-muted-foreground">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={kw}
          onChange={e => setKw(e.target.value)}
          placeholder="搜索宣教资料 · 病种 / 关键词"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-muted text-sm outline-none"
        />
      </div>

      <div>
        <SectionTitle title={`宣教资料库 · ${list.length}`} extra={<button onClick={() => toast.success("已打开自定义资料上传")} className="text-xs text-primary font-medium">+ 上传</button>} />
        <div className="space-y-2">
          {list.map(e => {
            const Icon = e.type === "视频" ? PlayCircle : e.type === "音频" ? PlayCircle : FileText;
            return (
              <button key={e.id} onClick={() => setPicked(e)} className="w-full text-left bg-card rounded-2xl shadow-card p-3.5 active:scale-[0.99] transition-transform">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-foreground line-clamp-1">{e.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-muted">{e.type}</span>
                      <span>· {e.tag}</span>
                      <span>· {e.duration}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">已发送 {e.sent} 次</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-2" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <PhoneSheet
        open={!!picked}
        onClose={() => setPicked(null)}
        title={picked?.title ?? ""}
        accent="doctor"
        footer={
          <button
            onClick={() => { toast.success(`已群发给 ${PATIENTS.length} 位适配患者`); setPicked(null); }}
            className="w-full gradient-doctor text-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> 一键群发给适配患者
          </button>
        }
      >
        {picked && (
          <div className="p-4 space-y-3">
            <div className="aspect-video rounded-xl bg-muted flex items-center justify-center">
              <PlayCircle className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="text-sm font-semibold">{picked.title}</div>
            <div className="text-xs text-muted-foreground">
              {picked.type} · {picked.tag} · {picked.duration} · 已发送 {picked.sent} 次
            </div>
            <AICard title="AI 适配建议">
              当前 {PATIENTS.length} 位院外患者中，建议向其中病种匹配的 12 位发送本资料；预计阅读率 70%+。
            </AICard>
            <div>
              <div className="text-xs text-muted-foreground mb-2">资料概述</div>
              <div className="text-[13px] leading-relaxed text-foreground/80 bg-muted/50 rounded-xl p-3">
                本资料围绕「{picked.tag}」患者的居家康复要点展开，包含图文/视频演示及常见错误提醒，便于家属一同学习并执行。
              </div>
            </div>
          </div>
        )}
      </PhoneSheet>
    </div>
  );
};

/* ===================== 随访模块 ===================== */

type FollowupItem = {
  id: string;
  patient: string;
  bed?: string;
  condition: string;
  type: "电话随访" | "上门随访" | "线上问诊";
  due: string;
  status: "待随访" | "进行中" | "已完成";
  note?: string;
  urgency: "high" | "medium" | "low";
};

const FOLLOWUPS: FollowupItem[] = [
  { id: "f1", patient: "王秀英", condition: "脑卒中 · 院外 3 个月", type: "电话随访", due: "今日", status: "待随访", note: "复评 NIHSS / mRS · 用药依从性", urgency: "high" },
  { id: "f2", patient: "陈建国", condition: "髋关节置换 · 院外 6 周", type: "上门随访", due: "今日", status: "待随访", note: "评估步态与切口愈合", urgency: "high" },
  { id: "f3", patient: "刘大山", condition: "糖尿病足 · 慢病管理", type: "电话随访", due: "明日", status: "待随访", note: "确认血糖记录与换药", urgency: "medium" },
  { id: "f4", patient: "赵桂芬", condition: "COPD · 慢病管理", type: "线上问诊", due: "本周", status: "进行中", note: "呼吸训练打卡查看", urgency: "medium" },
  { id: "f5", patient: "孙立军", condition: "高血压 · 慢病管理", type: "电话随访", due: "已完成", status: "已完成", note: "血压平稳，2 周后再随访", urgency: "low" },
];

export const FollowupModule = () => {
  const [filter, setFilter] = useState<"全部" | "待随访" | "进行中" | "已完成">("待随访");
  const [active, setActive] = useState<FollowupItem | null>(null);
  const counts = {
    全部: FOLLOWUPS.length,
    待随访: FOLLOWUPS.filter(f => f.status === "待随访").length,
    进行中: FOLLOWUPS.filter(f => f.status === "进行中").length,
    已完成: FOLLOWUPS.filter(f => f.status === "已完成").length,
  };
  const list = filter === "全部" ? FOLLOWUPS : FOLLOWUPS.filter(f => f.status === filter);

  const urgencyMap = {
    high: "bg-destructive/10 text-destructive",
    medium: "bg-warning/15 text-warning",
    low: "bg-primary/10 text-primary",
  };
  const typeIcon = (t: FollowupItem["type"]) => t === "上门随访" ? Users : t === "线上问诊" ? FileText : Phone;

  return (
    <div className="px-4 pt-4 pb-4 space-y-4">
      <AICard title="AI 随访提醒">
        本周共 {counts.待随访} 位患者待随访，其中 2 位为高优先级（康复阶段关键节点）。建议优先处理。
      </AICard>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-0.5 px-0.5">
        {(["全部", "待随访", "进行中", "已完成"] as const).map(c => {
          const active = filter === c;
          return (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                active ? "gradient-doctor text-white shadow-card" : "bg-muted text-foreground/70"
              }`}
            >
              {c} <span className={active ? "opacity-80" : "text-muted-foreground"}>({counts[c]})</span>
            </button>
          );
        })}
      </div>

      <div>
        <SectionTitle title={`随访列表 · ${list.length}`} extra={<button onClick={() => toast.success("已打开新建随访任务")} className="text-xs text-primary font-medium">+ 新建</button>} />
        {list.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center text-xs text-muted-foreground">无对应随访任务</div>
        ) : (
          <div className="space-y-2">
            {list.map(f => {
              const Icon = typeIcon(f.type);
              return (
                <button key={f.id} onClick={() => setActive(f)} className="w-full text-left bg-card rounded-2xl shadow-card p-3.5 active:scale-[0.99] transition-transform">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-foreground">{f.patient}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{f.condition}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${urgencyMap[f.urgency]}`}>{f.status}</span>
                  </div>
                  <div className="text-[12px] text-foreground/80 leading-relaxed">{f.note}</div>
                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border/60">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Icon className="w-3 h-3" /> {f.type}</span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {f.due}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <PhoneSheet
        open={!!active}
        onClose={() => setActive(null)}
        title={active ? `随访 · ${active.patient}` : ""}
        accent="doctor"
        footer={
          active?.status !== "已完成" ? (
            <div className="flex gap-2">
              <button onClick={() => { toast("已稍后提醒"); setActive(null); }} className="flex-1 border border-primary/30 text-primary rounded-2xl py-3 text-sm font-semibold">稍后提醒</button>
              <button onClick={() => { toast.success("已记录本次随访结果"); setActive(null); }} className="flex-1 gradient-doctor text-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-1.5"><CheckCircle2 className="w-4 h-4" />完成随访</button>
            </div>
          ) : undefined
        }
      >
        {active && (
          <div className="p-4 space-y-3">
            <div className="bg-muted/50 rounded-xl p-3 space-y-1">
              <div className="text-sm font-semibold">{active.patient}</div>
              <div className="text-xs text-muted-foreground">{active.condition}</div>
              <div className="text-xs text-muted-foreground">随访方式：{active.type} · {active.due}</div>
            </div>
            <AICard title="AI 随访要点">
              {active.note}。建议确认用药依从性、康复训练打卡、近期不适主诉，并视情况发送配套宣教资料。
            </AICard>
            <div>
              <div className="text-xs text-muted-foreground mb-2">随访记录</div>
              <textarea
                placeholder="记录本次随访的关键内容、患者反馈与下一步计划…"
                className="w-full min-h-[120px] rounded-xl bg-muted p-3 text-sm outline-none resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => toast.success("已发送配套宣教")} className="rounded-xl bg-primary-soft text-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />发送宣教</button>
              <button onClick={() => toast.success("已预约下次随访")} className="rounded-xl bg-primary-soft text-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5"><Clock className="w-3.5 h-3.5" />预约下次</button>
            </div>
          </div>
        )}
      </PhoneSheet>
    </div>
  );
};
