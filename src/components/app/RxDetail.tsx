import { useState } from "react";
import { SectionTitle, AICard, StatChip } from "@/components/app/UI";
import { FormRow } from "@/components/app/Sheet";
import { Edit3, FileText, Activity, Wrench, Pill, Home as HomeIcon, CalendarClock, ClipboardList, Plus, Sparkles, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export type RxAccent = "doctor" | "therapist";

/**
 * 康复医嘱（康复处方整体计划）详情组件
 * 包含 8 个标准结构：
 * 1 基本信息 / 2 评估数据 / 3 治疗项目 / 4 辅具设备 / 5 用药 / 6 居家指导 / 7 复诊随访 / 8 状态与执行
 */
export const RxDetail = ({
  patient,
  accent = "doctor",
}: {
  patient?: string;
  accent?: RxAccent;
}) => {
  const name = patient ? patient.split(" ")[0] : "张建国";
  const grad = accent === "doctor" ? "gradient-doctor" : "gradient-therapist";
  const accentText = accent === "doctor" ? "text-role-doctor" : "text-role-therapist";
  const accentSoft = accent === "doctor" ? "bg-primary-soft text-primary" : "bg-secondary-soft text-secondary";
  const accentBadge = accent === "doctor" ? "bg-primary-soft text-primary" : "bg-secondary-soft text-secondary";

  return (
    <div className="p-4 space-y-3">
      {/* 患者卡 */}
      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl ${grad} text-white flex items-center justify-center font-bold text-lg`}>
            {name[0]}
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold">{patient || "张建国 · 男 56 岁"}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">脑卒中后偏瘫 · 入院第 12 天 · 床 A-301</div>
          </div>
          <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${accentBadge}`}>待确认医嘱</span>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          <StatChip label="FMA" value="42" accent="primary" />
          <StatChip label="Barthel" value="55" accent="warning" />
          <StatChip label="Berg" value="36" accent="success" />
          <StatChip label="VAS" value="3" accent="warning" />
        </div>
      </div>

      <AICard title="康复医嘱 · 康复整体计划">
        由康复治疗师做的「全套训练 + 流程安排」，包含院内处方项目并新增日常居家训练，请{accent === "doctor" ? "医师" : "治疗师"}逐项核对后确认。
      </AICard>

      {/* 1. 基本信息 */}
      <SectionTitle title="① 处方基本信息" extra={<span className="text-[10px] text-muted-foreground">编号 / 患者 / 医师</span>} />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="处方编号" value="RX-2026-0507-0031" />
        <FormRow label="患者" value={`${patient?.split("·")[0]?.trim() || "张建国"} · 56 岁 · 男`} />
        <FormRow label="主治医师" value="李志远 主任医师" hint="康复医学科" />
        <FormRow label="责任治疗师" value="王雅琴 (PT) / 陈思雨 (OT/ST)" />
        <FormRow label="诊断" value="脑梗死恢复期" hint="左侧偏瘫 · ASIA D" />
        <FormRow label="开方日期" value="2026-05-06" />
        <FormRow label="治疗周期" value="4 周" hint="2026-05-06 → 2026-06-02" />
      </div>

      {/* 2. 康复评估数据 */}
      <SectionTitle title="② 康复评估数据" extra={<span className="text-[10px] text-muted-foreground">治疗前基线</span>} />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="生活能力 (Barthel)" value="55 / 100" hint="进食 5 · 转移 10 · 步行 5" />
        <FormRow label="运动功能 (FMA)" value="上肢 22 / 下肢 20" hint="共计 42 / 100" />
        <FormRow label="肌力 (MMT)" value="左下肢 3 / 左上肢 2+" hint="右侧 5 级" />
        <FormRow label="平衡 (Berg)" value="36 / 56" hint="跌倒中风险" />
        <FormRow label="疼痛 (VAS)" value="3 / 10" hint="左肩 · 活动诱发" />
        <FormRow label="言语 (构音)" value="清晰度 78%" hint="EAT-10：4" />
      </div>

      {/* 3. 康复治疗项目 */}
      <SectionTitle title="③ 康复治疗项目" extra={<span className="text-[10px] text-muted-foreground">院内执行</span>} />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        {[
          { type: "PT", name: "下肢力量训练", set: "3 组 × 10 次", freq: "每日" },
          { type: "PT", name: "平衡板训练", set: "15 分钟", freq: "每日" },
          { type: "PT", name: "步态训练", set: "30 分钟", freq: "5 次/周" },
          { type: "OT", name: "穿衣 ADL", set: "20 分钟", freq: "每日" },
          { type: "OT", name: "厨房活动", set: "25 分钟", freq: "3 次/周" },
          { type: "ST", name: "构音训练", set: "30 分钟", freq: "3 次/周" },
          { type: "物理因子", name: "低频电刺激", set: "20 分钟", freq: "5 次/周" },
        ].map((r) => (
          <div key={r.name} className="flex items-center gap-3 py-2.5 px-3">
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${accentSoft}`}>{r.type}</span>
            <div className="flex-1">
              <div className="text-[12px] font-semibold">{r.name}</div>
              <div className="text-[10px] text-muted-foreground">{r.set} · {r.freq}</div>
            </div>
            <button className={accentText}><Edit3 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>

      {/* 4. 康复辅具/设备处方 */}
      <SectionTitle title="④ 康复辅具 / 设备处方" extra={<span className="text-[10px] text-muted-foreground">配备清单</span>} />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="踝足矫形器 (AFO)" value="左侧 1 副" hint="日间步行佩戴" />
        <FormRow label="四脚拐" value="1 支" hint="过渡期辅助" />
        <FormRow label="平衡训练垫" value="病房使用" hint="每日早晚 10 min" />
        <FormRow label="家用握力球" value="1 组 (软/中)" hint="居家手功能训练" />
      </div>

      {/* 5. 用药处方（AI 建议 + 手动调整） */}
      <SectionTitle title="⑤ 用药处方" extra={<span className="text-[10px] text-muted-foreground">AI 建议 · 可手动调整</span>} />
      <MedsEditor accent={accent} />

      {/* 6. 居家康复指导 */}
      <SectionTitle title="⑥ 居家康复指导" extra={<span className="text-[10px] text-muted-foreground">家庭自训</span>} />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        {[
          { name: "床边坐起 + 静态平衡", set: "10 分钟", freq: "每日早" },
          { name: "踝泵 + 股四头肌等长收缩", set: "30 次 × 3", freq: "每日 3 次" },
          { name: "扶椅站立 → 扶墙行走", set: "15 分钟", freq: "每日晚" },
          { name: "家属辅助转移 + 跌倒预防", set: "—", freq: "随时" },
        ].map((r) => (
          <div key={r.name} className="flex items-center gap-3 py-2.5 px-3">
            <span className="text-[10px] px-2 py-0.5 rounded bg-success-soft text-success font-bold">居家</span>
            <div className="flex-1">
              <div className="text-[12px] font-semibold">{r.name}</div>
              <div className="text-[10px] text-muted-foreground">{r.set} · {r.freq}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 7. 复诊与随访 */}
      <SectionTitle title="⑦ 复诊与随访计划" />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="下次复诊" value="2026-05-20 上午" hint="康复门诊 · 李志远" />
        <FormRow label="复查项目" value="FMA / Barthel / Berg" hint="同步颅脑 MRI 评估" />
        <FormRow label="远程随访" value="每周 1 次" hint="视频回访 + 量表" />
        <FormRow label="紧急联系人" value="家属 张女士 138****8821" />
        <FormRow label="紧急预警" value="跌倒 / 疼痛突增" hint="自动通知医师 + 家属" />
      </div>

      {/* 8. 状态与执行记录 */}
      <SectionTitle title="⑧ 处方状态与执行记录" />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="当前状态" value={<span className="text-[11px] text-warning font-semibold">待确认</span>} hint="AI 已生成 · 等待签发" />
        <FormRow label="执行进度" value="0 / 28 天" hint="待医师确认后启动" />
        <FormRow label="依从性 (近 7 日)" value="—" hint="确认后开始统计" />
        <FormRow label="进展记录" value="本周 FMA +3 / Barthel +5" hint="较上周改善" />
        <FormRow label="结局评估" value="预计 4 周达 Barthel 75" hint="AI 预测置信度 82%" />
      </div>
    </div>
  );
};

type Med = { name: string; dose: string; hint: string; ai?: boolean };

const AI_MEDS: Med[] = [
  { name: "阿司匹林肠溶片", dose: "100 mg qd", hint: "抗凝 · 早餐后", ai: true },
  { name: "阿托伐他汀钙", dose: "20 mg qn", hint: "调脂 · 睡前", ai: true },
  { name: "甲钴胺胶囊", dose: "0.5 mg tid", hint: "营养神经", ai: true },
  { name: "巴氯芬片", dose: "10 mg bid", hint: "缓解痉挛 · 按需", ai: true },
];

const MedsEditor = ({ accent }: { accent: RxAccent }) => {
  const [meds, setMeds] = useState<Med[]>(AI_MEDS);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Med>({ name: "", dose: "", hint: "" });
  const accentText = accent === "doctor" ? "text-role-doctor" : "text-role-therapist";
  const accentBtn = accent === "doctor" ? "gradient-doctor" : "gradient-therapist";

  const update = (i: number, m: Med) => setMeds(meds.map((x, idx) => (idx === i ? m : x)));
  const remove = (i: number) => { setMeds(meds.filter((_, idx) => idx !== i)); setEditIdx(null); toast("已移除该药品"); };
  const regen = () => { setMeds(AI_MEDS); toast.success("AI 已重新生成用药建议"); };

  return (
    <>
      <div className="bg-ai/5 border border-ai/20 rounded-2xl p-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-ai" />
        <div className="flex-1 text-[11px] text-foreground/80">AI 已基于诊断、既往史与合并用药生成建议，请医师核对后调整。</div>
        <button onClick={regen} className="text-[11px] text-ai font-semibold flex items-center gap-1"><RefreshCw className="w-3 h-3" />重新生成</button>
      </div>

      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        {meds.map((m, i) => (
          <div key={i} className="px-3 py-2.5">
            {editIdx === i ? (
              <div className="space-y-2">
                <input value={m.name} onChange={(e) => update(i, { ...m, name: e.target.value })} className="w-full bg-muted rounded px-2 py-1.5 text-[12px]" placeholder="药品名称" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={m.dose} onChange={(e) => update(i, { ...m, dose: e.target.value })} className="bg-muted rounded px-2 py-1.5 text-[12px]" placeholder="剂量 · 频次" />
                  <input value={m.hint} onChange={(e) => update(i, { ...m, hint: e.target.value })} className="bg-muted rounded px-2 py-1.5 text-[12px]" placeholder="说明" />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => remove(i)} className="text-[11px] text-destructive flex items-center gap-1"><Trash2 className="w-3 h-3" />删除</button>
                  <button onClick={() => { setEditIdx(null); toast.success("已保存修改"); }} className={`text-[11px] px-3 py-1 rounded-full text-white ${accentBtn}`}>完成</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Pill className={`w-3.5 h-3.5 ${accentText}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[12px] font-semibold">{m.name}</span>
                    {m.ai && <span className="text-[9px] px-1.5 py-0.5 rounded bg-ai/10 text-ai font-bold">AI</span>}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{m.dose} · {m.hint}</div>
                </div>
                <button onClick={() => setEditIdx(i)} className={accentText}><Edit3 className="w-3.5 h-3.5" /></button>
              </div>
            )}
          </div>
        ))}
      </div>

      {adding ? (
        <div className="bg-card rounded-2xl shadow-card p-3 space-y-2 border border-dashed border-border">
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-full bg-muted rounded px-2 py-1.5 text-[12px]" placeholder="新药品名称" />
          <div className="grid grid-cols-2 gap-2">
            <input value={draft.dose} onChange={(e) => setDraft({ ...draft, dose: e.target.value })} className="bg-muted rounded px-2 py-1.5 text-[12px]" placeholder="剂量 · 频次（如 5mg bid）" />
            <input value={draft.hint} onChange={(e) => setDraft({ ...draft, hint: e.target.value })} className="bg-muted rounded px-2 py-1.5 text-[12px]" placeholder="说明" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => { setAdding(false); setDraft({ name: "", dose: "", hint: "" }); }} className="text-[11px] text-muted-foreground">取消</button>
            <button onClick={() => { if (!draft.name) return; setMeds([...meds, draft]); setAdding(false); setDraft({ name: "", dose: "", hint: "" }); toast.success("已新增药品"); }} className={`text-[11px] px-3 py-1 rounded-full text-white ${accentBtn}`}>新增</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className={`w-full flex items-center justify-center gap-1 text-xs ${accentText} font-semibold py-2`}>
          <Plus className="w-3.5 h-3.5" /> 手动新增药品
        </button>
      )}
    </>
  );
};
