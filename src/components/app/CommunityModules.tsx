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

/* ===================== 随访模块（与护士端保持一致） ===================== */

import {
  FOLLOW_UPS,
  FollowUpPatient,
  FollowUpListView,
  FollowUpSheet,
  ManualCallSheet,
} from "@/components/app/NurseApp";

export const FollowupModule = () => {
  const [active, setActive] = useState<FollowUpPatient | null>(null);
  const [sheet, setSheet] = useState<null | "ai" | "manual">(null);

  return (
    <div className="pb-4">
      <FollowUpListView
        patients={FOLLOW_UPS}
        onPick={(p) => { setActive(p); setSheet("ai"); }}
      />

      <PhoneSheet
        open={sheet === "ai"}
        onClose={() => setSheet(null)}
        title={`AI 随访${active ? " · " + active.name : ""}`}
        accent="nurse"
        flush
        hideHeader
      >
        <FollowUpSheet
          patient={active}
          onManualCall={() => setSheet("manual")}
          onDone={() => { toast.success("随访结论已归档"); setSheet(null); }}
        />
      </PhoneSheet>

      <PhoneSheet
        open={sheet === "manual"}
        onClose={() => setSheet("ai")}
        title={`人工外呼录入${active ? " · " + active.name : ""}`}
        accent="nurse"
        flush
      >
        <ManualCallSheet
          patient={active}
          onDone={() => { toast.success("外呼小结已生成并归档"); setSheet(null); }}
        />
      </PhoneSheet>
    </div>
  );
};
