import { useState } from "react";
import { ScreenShell, TabBar, type TabBarItem } from "@/components/app/TabBar";
import { AICard, SectionTitle } from "@/components/app/UI";
import { PhoneSheet, FormRow, PrimaryBtn } from "@/components/app/Sheet";
import { TodoQueueList, WorkbenchTile, PendingStatRow, PendingTodoGrid, TodoItem } from "@/components/app/TodoQueue";
import {
  PatientsPage,
  PatientDetailSheet,
  PatientActionsBar,
  AddNoteSheet,
  TeamManageSheet,
  PatientChatListSheet,
  PatientChatSheet,
  IMChatSheet,
  TeamMeetingListSheet,
  NewMeetingSheet,
  Patient,
  PATIENTS,
  NEW_PATIENT_COUNT,
  PATIENT_UNREAD,
  DEFAULT_MEETINGS,
  DEFAULT_MEETING_MSGS,
  TeamMeeting,
} from "@/components/app/PatientsModule";
import {
  Home as HomeIcon,
  UsersRound,
  BookOpen,
  MessageCircle,
  User as UserIcon,
  Bell,
  ChevronRight,
  Pill,
  HeartPulse,
  CheckCircle2,
  Syringe,
  Activity,
  ClipboardCheck,
  Users,
  ShieldCheck,
  Stethoscope,
  AlertTriangle,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { MeStats } from "@/components/app/MeStats";

import {
  EvalTabs,
  EvalTabKey,
  ClinicalPanel,
  RehabPanel,
  NumberedGoals,
  ALL_CLINICAL_CONCLUSIONS,
  ALL_REHAB_CONCLUSIONS,
} from "@/components/app/EvalShared";

const NURSE_TABS: TabBarItem[] = [
  { key: "home", label: "工作台", icon: HomeIcon },
  { key: "patients", label: "患者管理", icon: UsersRound },
  { key: "edu", label: "宣教", icon: BookOpen },
  { key: "chat", label: "患者沟通", icon: MessageCircle, badge: PATIENT_UNREAD },
  { key: "me", label: "我的", icon: UserIcon },
];

type SheetKey =
  | null
  | "med"
  | "vitals"
  | "inject"
  | "obs"
  | "execTask"
  | "patientDetail"
  | "addNote"
  | "team"
  | "patientChat"
  | "eduPush"
  | "dailyNote"
  | "confirmAssess"
  | "meetingList"
  | "newMeeting"
  | "meeting"
  | "followUp"
  | "followUpManual"
  | "followUpList";

type QueueKey = "med" | "vitals" | "inject" | "obs" | "execTask" | "confirmAssess";

const QUEUE_TITLE: Record<QueueKey, string> = {
  med: "待执行给药",
  vitals: "待测生命体征",
  inject: "待执行注射",
  obs: "待病情观察",
  execTask: "待执行护理任务",
  confirmAssess: "待评估确认",
};

// 根据康复处方生成的待办（按患者维度）
const QUEUES: Record<QueueKey, TodoItem[]> = {
  med: [
    { id: "m1", patient: "303 张建国", meta: "阿司匹林 100mg · IV", detail: "处方关联：脑卒中后偏瘫", time: "14:00", urgency: "high" },
    { id: "m2", patient: "310 陈丽华", meta: "多奈哌齐 5mg · po", detail: "处方关联：认知障碍", time: "15:30", urgency: "medium" },
    { id: "m3", patient: "305 王秀英", meta: "塞来昔布 200mg · po", detail: "处方关联：髋关节术后", time: "16:00", urgency: "medium" },
    { id: "m4", patient: "307 李 强", meta: "巴氯芬 10mg · po", detail: "处方关联：脊髓损伤", time: "21:00", urgency: "low" },
  ],
  vitals: [
    { id: "v1", patient: "305 王秀英", meta: "血压 + 心率", detail: "VS q4h · 第 3 次", time: "14:30", urgency: "medium" },
    { id: "v2", patient: "303 张建国", meta: "血压 + 心率 + 血氧", detail: "VS q6h", time: "15:00", urgency: "medium" },
  ],
  inject: [
    { id: "in1", patient: "305 王秀英", meta: "低分子肝素 0.4ml ih", detail: "腹部皮下", time: "14:35", urgency: "medium" },
  ],
  obs: [
    { id: "o1", patient: "303 张建国", meta: "夜间血压波动", detail: "AI 提示加强观察", urgency: "high" },
    { id: "o2", patient: "307 李 强", meta: "压疮高风险监测", detail: "Braden 14 分", urgency: "medium" },
  ],
  execTask: [
    { id: "et1", patient: "312 刘伟明", meta: "伤口换药", detail: "术后第 5 天", time: "16:00", urgency: "high" },
    { id: "et2", patient: "303 张建国", meta: "翻身 + 拍背", detail: "q2h", time: "15:00", urgency: "medium" },
    { id: "et3", patient: "307 李 强", meta: "导尿管护理", detail: "每日清洁", time: "17:00", urgency: "medium" },
  ],
  confirmAssess: [
    { id: "ca1", patient: "305 王秀英", meta: "髋关节置换术后", detail: "医师 + 治疗师评估意见 · 待护士确认", urgency: "high" },
    { id: "ca2", patient: "311 周建华", meta: "脑梗死恢复期", detail: "FMA 38 / DVT Wells 2 · 待护士补充观察", urgency: "medium" },
  ],
};

type FollowUpStatus = "pending" | "done" | "needRevisit";
interface FollowUpPatient {
  id: string;
  name: string;
  age: number;
  sex: "男" | "女";
  meta: string;
  postOpDays: number;
  diagnosis: string;
  status: FollowUpStatus;
  conclusion?: string;
  phone?: string;
}
const FOLLOW_UPS: FollowUpPatient[] = [
  { id: "f0", name: "韩启航", age: 24, sex: "男", meta: "术后第 3 天", postOpDays: 3, diagnosis: "髌骨关节疼痛综合征", status: "done", conclusion: "居家维护现状，按现有方案训练" },
  { id: "f1", name: "王晓彤", age: 30, sex: "女", meta: "术后第 4 天", postOpDays: 4, diagnosis: "右肩冲击综合征", status: "pending", phone: "138****4421" },
  { id: "f2", name: "杨成轩", age: 31, sex: "男", meta: "术后第 5 天", postOpDays: 5, diagnosis: "左跟腱缝合术", status: "pending", phone: "138****4421" },
  { id: "f3", name: "胡国玉", age: 25, sex: "女", meta: "术后第 6 天", postOpDays: 6, diagnosis: "右膝 PCL 重建", status: "done", conclusion: "恢复良好，居家维护现状" },
  { id: "f4", name: "何宗兰", age: 34, sex: "女", meta: "术后第 11 天 · 肩外展 90°，恢复良好", postOpDays: 11, diagnosis: "左肩关节镜肩袖修补", status: "done", conclusion: "肩外展 90°，恢复良好，居家训练" },
  { id: "f5", name: "范芳进", age: 22, sex: "女", meta: "术后第 12 天 · 屈膝受限，需加强康复", postOpDays: 12, diagnosis: "右髌骨内侧支持带修补", status: "needRevisit", conclusion: "屈膝受限，建议到省人民康复科复诊" },
];

export const NurseApp = () => {
  const [tab, setTab] = useState("home");
  const [sheet, setSheet] = useState<SheetKey>(null);
  const [queue, setQueue] = useState<QueueKey | null>(null);
  const [activePatient, setActivePatient] = useState<string>("");
  const [pickedPatient, setPickedPatient] = useState<Patient | null>(null);
  const [chatPatient, setChatPatient] = useState<Patient | null>(null);
  const [patientNotes, setPatientNotes] = useState<Record<string, Patient["notes"]>>({});
  const [chatSubTab, setChatSubTab] = useState<"patient" | "team">("patient");
  const [meetings, setMeetings] = useState<TeamMeeting[]>(DEFAULT_MEETINGS);
  const [activeMeeting, setActiveMeeting] = useState<TeamMeeting | null>(null);
  const [activeFollowUp, setActiveFollowUp] = useState<FollowUpPatient | null>(null);
  const [patientsFilter, setPatientsFilter] = useState<import("@/components/app/PatientsModule").PatientFilter>("all");
  const goPatients = (filter: import("@/components/app/PatientsModule").PatientFilter = "all") => {
    setPatientsFilter(filter);
    setTab("patients");
  };

  const open = (k: SheetKey) => setSheet(k);
  const close = () => setSheet(null);
  const openQueue = (k: QueueKey) => setQueue(k);
  const closeQueue = () => setQueue(null);
  const pickFromQueue = (item: TodoItem, sheetKey: SheetKey) => {
    setActivePatient(item.patient);
    setQueue(null);
    setSheet(sheetKey);
  };
  const pickPatient = (p: Patient) => {
    const merged = { ...p, notes: patientNotes[p.id] ?? p.notes };
    setPickedPatient(merged);
    setSheet("patientDetail");
  };

  const queueToSheet: Record<QueueKey, SheetKey> = {
    med: "med",
    vitals: "vitals",
    inject: "inject",
    obs: "obs",
    execTask: "execTask",
    confirmAssess: "confirmAssess",
  };

  return (
    <ScreenShell tabBar={<TabBar active={tab} onChange={setTab} accent="nurse" newPatientCount={NEW_PATIENT_COUNT} items={NURSE_TABS} />}>
      {tab === "home" && (
        <NurseHome
          onOpenQueue={openQueue}
          onGoPatients={goPatients}
          onOpenDailyNote={() => open("dailyNote")}
          onOpenEdu={() => setTab("edu")}
          onOpenChat={() => setTab("chat")}
          onOpenFollowUpList={() => open("followUpList")}
          onOpenFollowUp={(p) => { setActiveFollowUp(p); open("followUp"); }}
        />
      )}
      {tab === "patients" && <PatientsPage accent="nurse" onPick={pickPatient} initialFilter={patientsFilter} />}
      {tab === "edu" && <EduPage onOpenPush={() => open("eduPush")} />}
      {tab === "chat" && (
        <NurseChatHub
          subTab={chatSubTab}
          onChange={setChatSubTab}
          onOpenPatient={(p) => { setChatPatient(p); setSheet("patientChat"); }}
          meetings={meetings}
          onPickMeeting={(m) => { setActiveMeeting(m); setSheet("meeting"); }}
          onCreateMeeting={() => setSheet("newMeeting")}
        />
      )}
      {tab === "me" && <Me onOpenTeam={() => open("team")} />}

      {(["med", "vitals", "inject", "obs", "execTask", "confirmAssess"] as QueueKey[]).map((k) => (
        <PhoneSheet key={k} open={queue === k} onClose={closeQueue} title={QUEUE_TITLE[k]} accent="nurse">
          <TodoQueueList accent="nurse" items={QUEUES[k]} onPick={(item) => pickFromQueue(item, queueToSheet[k])} />
        </PhoneSheet>
      ))}

      <PhoneSheet open={sheet === "confirmAssess"} onClose={close} title={`评估结果确认${activePatient ? " · " + activePatient : ""}`} accent="nurse"
        footer={<div className="flex gap-2">
          <button onClick={() => { toast("已请医师再次评估 · 结果不确定"); close(); }} className="flex-1 border border-border rounded-2xl py-3 text-sm font-semibold">结果不确定</button>
          <button onClick={() => { toast.success("评估已确认 · 已同步医师 / 治疗师"); close(); }} className="flex-1 gradient-nurse text-white rounded-2xl py-3 text-sm font-semibold">确认结果</button>
        </div>}>
        <NurseConfirmAssessSheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "meetingList"} onClose={close} title="团队会议" accent="nurse">
        <TeamMeetingListSheet
          accent="nurse"
          meetings={meetings}
          onPick={(m) => { setActiveMeeting(m); setSheet("meeting"); }}
          onCreate={() => setSheet("newMeeting")}
        />
      </PhoneSheet>
      <PhoneSheet open={sheet === "newMeeting"} onClose={() => setSheet("meetingList")} title="新增团队会议" accent="nurse">
        <NewMeetingSheet accent="nurse" onCreate={(m) => { setMeetings([m, ...meetings]); setActiveMeeting(m); toast.success("会议已创建"); setSheet("meeting"); }} />
      </PhoneSheet>
      <PhoneSheet open={sheet === "meeting"} onClose={() => setSheet("meetingList")} title="团队会议" accent="nurse" flush hideHeader>
        <IMChatSheet
          accent="nurse"
          title={`团队会议 · ${activeMeeting?.patientName ?? "张建国"}`}
          subtitle={activeMeeting?.topic ?? "护理协同"}
          participants={activeMeeting?.participants ?? ["李医师", "王治疗师", "赵护士"]}
          initialMessages={DEFAULT_MEETING_MSGS}
          onAISummary={() => {}}
          enablePatientReminder
          onClose={() => setSheet("meetingList")}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "med"} onClose={close} title={`给药操作${activePatient ? " · " + activePatient : ""}`} accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("给药完成 · 已自动生成执行记录"); close(); }}>确认给药完成</PrimaryBtn>}>
        <MedExecSheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "vitals"} onClose={close} title={`生命体征录入${activePatient ? " · " + activePatient : ""}`} accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("生命体征已保存 · 已同步医师端"); close(); }}>保存</PrimaryBtn>}>
        <VitalsSheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "inject"} onClose={close} title={`注射记录${activePatient ? " · " + activePatient : ""}`} accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("注射记录已保存"); close(); }}>保存记录</PrimaryBtn>}>
        <InjectSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "obs"} onClose={close} title={`病情观察${activePatient ? " · " + activePatient : ""}`} accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("观察记录已上传医师端"); close(); }}>上报观察</PrimaryBtn>}>
        <ObsSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "execTask"} onClose={close} title={`执行护理任务${activePatient ? " · " + activePatient : ""}`} accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("任务已完成 · 已记录"); close(); }}>完成任务</PrimaryBtn>}>
        <ExecTaskSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "dailyNote"} onClose={close} title="每日康复护理备注" accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("护理备注已保存到患者档案"); close(); }}>保存到患者档案</PrimaryBtn>}>
        <DailyNoteSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "eduPush"} onClose={close} title="多患者宣教推送" accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("宣教内容已推送选中患者及家属"); close(); }}>一键推送</PrimaryBtn>}>
        <EduPushSheet />
      </PhoneSheet>

      <PhoneSheet
        open={sheet === "patientDetail"}
        onClose={close}
        title={`患者档案${pickedPatient ? " · " + pickedPatient.name : ""}`}
        accent="nurse"
        footer={
          pickedPatient ? (
            <PatientActionsBar
              accent="nurse"
              actions={[
                { key: "care", label: "护理记录", icon: ClipboardCheck, onClick: () => setSheet("dailyNote") },
                { key: "note", label: "备注", icon: Activity, onClick: () => setSheet("addNote") },
              ]}
            />
          ) : undefined
        }
      >
        <PatientDetailSheet
          patient={pickedPatient}
          accent="nurse"
          onAddNote={() => setSheet("addNote")}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "addNote"} onClose={() => setSheet("patientDetail")} title="添加护理备注" accent="nurse">
        <AddNoteSheet
          patient={pickedPatient}
          accent="nurse"
          onSave={(text) => {
            if (!pickedPatient) return;
            const newNote = { author: "赵护士", time: "刚刚", text };
            const updated = [newNote, ...(patientNotes[pickedPatient.id] ?? pickedPatient.notes)];
            setPatientNotes({ ...patientNotes, [pickedPatient.id]: updated });
            setPickedPatient({ ...pickedPatient, notes: updated });
            toast.success("备注已保存并共享给团队");
            setSheet("patientDetail");
          }}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "team"} onClose={close} title="团队管理" accent="nurse">
        <TeamManageSheet accent="nurse" />
      </PhoneSheet>

      <PhoneSheet open={sheet === "patientChat"} onClose={close} title="患者沟通" accent="nurse" flush hideHeader>
        <PatientChatSheet accent="nurse" patient={chatPatient} onClose={close} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "followUpList"} onClose={close} title="术后随访清单" accent="nurse">
        <FollowUpListView
          patients={FOLLOW_UPS}
          onPick={(p) => { setActiveFollowUp(p); setSheet("followUp"); }}
        />
      </PhoneSheet>

      <PhoneSheet
        open={sheet === "followUp"}
        onClose={() => setSheet("followUpList")}
        title={`AI 随访${activeFollowUp ? " · " + activeFollowUp.name : ""}`}
        accent="nurse"
        flush
        hideHeader
      >
        <FollowUpSheet
          patient={activeFollowUp}
          onManualCall={() => setSheet("followUpManual")}
          onDone={() => { toast.success("随访结论已归档"); setSheet("followUpList"); }}
        />
      </PhoneSheet>

      <PhoneSheet
        open={sheet === "followUpManual"}
        onClose={() => setSheet("followUp")}
        title={`人工外呼录入${activeFollowUp ? " · " + activeFollowUp.name : ""}`}
        accent="nurse"
        flush
      >
        <ManualCallSheet
          patient={activeFollowUp}
          onDone={() => { toast.success("外呼小结已生成并归档"); setSheet("followUpList"); }}
        />
      </PhoneSheet>
    </ScreenShell>
  );
};

/* ============== 工作台首页：根据康复处方生成的不同患者待办列 ============== */
const NurseHome = ({
  onOpenQueue,
  onGoPatients,
  onOpenDailyNote,
  onOpenEdu,
  onOpenChat,
  onOpenFollowUpList,
  onOpenFollowUp,
}: {
  onOpenQueue: (k: QueueKey) => void;
  onGoPatients: (filter?: import("@/components/app/PatientsModule").PatientFilter) => void;
  onOpenDailyNote: () => void;
  onOpenEdu: () => void;
  onOpenChat: () => void;
  onOpenFollowUpList: () => void;
  onOpenFollowUp: (p: FollowUpPatient) => void;
}) => {
  const totalTodo = QUEUES.med.length + QUEUES.vitals.length + QUEUES.inject.length + QUEUES.obs.length + QUEUES.execTask.length;
  const allTodos: { patient: string; meta: string; time?: string; urgency: "high" | "medium" | "low"; k: QueueKey }[] = [
    ...QUEUES.med.map(t => ({ patient: t.patient, meta: t.meta, time: t.time, urgency: t.urgency, k: "med" as QueueKey })),
    ...QUEUES.execTask.map(t => ({ patient: t.patient, meta: t.meta, time: t.time, urgency: t.urgency, k: "execTask" as QueueKey })),
    ...QUEUES.vitals.map(t => ({ patient: t.patient, meta: t.meta, time: t.time, urgency: t.urgency, k: "vitals" as QueueKey })),
    ...QUEUES.obs.map(t => ({ patient: t.patient, meta: t.meta, time: t.time, urgency: t.urgency, k: "obs" as QueueKey })),
  ].sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.urgency] - { high: 0, medium: 1, low: 2 }[b.urgency]));

  return (
    <div className="pb-4">
      <div className="bg-background px-5 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">您好</div>
            <div className="text-xl font-bold mt-0.5 text-foreground">赵护士 👋</div>
            <div className="text-[11px] text-muted-foreground mt-1">今日共 {totalTodo} 项护理待办（来自康复处方）</div>
          </div>
          <button onClick={() => toast("您有 4 条新任务")} className="w-9 h-9 rounded-full bg-rose-50 text-role-nurse flex items-center justify-center relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full" />
          </button>
        </div>
      </div>

      <div className="px-4 mt-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[13px] font-bold text-foreground">今日待处理</span>
        </div>
        <PendingTodoGrid
          items={[
            { label: "待护理", count: QUEUES.execTask.length, icon: HeartPulse, iconClass: "bg-success text-white", onClick: () => onOpenQueue("execTask") },
            { label: "待记录", count: QUEUES.vitals.length, icon: Activity, iconClass: "bg-primary text-white", onClick: () => onOpenQueue("vitals") },
            { label: "待宣教", count: 3, icon: BookOpen, iconClass: "bg-warning text-white", onClick: onOpenEdu },
            { label: "待回复消息", count: PATIENT_UNREAD, icon: MessageCircle, iconClass: "bg-secondary text-white", onClick: onOpenChat },
            { label: "待随访", count: FOLLOW_UPS.filter(f => f.status === "pending").length, icon: Stethoscope, iconClass: "bg-role-nurse text-white", onClick: onOpenFollowUpList },
          ]}
        />
      </div>

      {/* 随访模块 */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[13px] font-bold text-foreground">随访</span>
          <button onClick={onOpenFollowUpList} className="text-[11px] text-role-nurse font-semibold">查看全部 ({FOLLOW_UPS.length})</button>
        </div>
        <div className="bg-card rounded-2xl shadow-card border border-border/40 p-3 space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-ai" /> AI 智能随访 · 多轮问答后自动生成随访建议
          </div>
          {FOLLOW_UPS.slice(0, 3).map((p) => (
            <button
              key={p.id}
              onClick={() => onOpenFollowUp(p)}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-xl active:bg-muted/40"
            >
              <div className="w-8 h-8 rounded-lg gradient-nurse text-white flex items-center justify-center text-xs font-bold">{p.name[0]}</div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-[12px] font-semibold truncate">{p.name} · {p.diagnosis}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{p.meta}</div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-rose-50 text-role-nurse font-semibold shrink-0">发起随访</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[13px] font-bold text-foreground">今日待办清单</span>
          <span className="text-[11px] text-muted-foreground">共 {allTodos.length} 项 · 按优先级</span>
        </div>
        <div className="bg-card rounded-2xl shadow-card border border-border/40 divide-y divide-border/60 overflow-hidden">
          {allTodos.map((t, idx) => {
            const tag = QUEUE_TITLE[t.k].replace("待执行", "").replace("待", "");
            const tagColor =
              t.k === "med" ? "bg-primary/10 text-primary" :
              t.k === "execTask" ? "bg-success/10 text-success" :
              t.k === "vitals" ? "bg-secondary/10 text-secondary" :
              "bg-warning/15 text-warning";
            const uColor =
              t.urgency === "high" ? "bg-destructive/10 text-destructive" :
              t.urgency === "medium" ? "bg-warning/15 text-warning" :
              "bg-muted text-muted-foreground";
            const uLabel = t.urgency === "high" ? "紧急" : t.urgency === "medium" ? "重要" : "常规";
            return (
              <button
                key={`${t.k}-${idx}`}
                onClick={() => onOpenQueue(t.k)}
                className="w-full text-left px-3 py-2.5 flex items-center gap-2 active:bg-muted/40"
              >
                <div className="w-7 h-7 rounded-lg bg-muted text-foreground/70 flex items-center justify-center text-[11px] font-bold shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${tagColor}`}>{tag}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${uColor}`}>{uLabel}</span>
                    <span className="text-[12px] font-semibold truncate">{t.patient}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {t.meta}{t.time ? ` · ${t.time}` : ""}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ============== 宣教中心页 ============== */
const EduPage = ({ onOpenPush }: { onOpenPush: () => void }) => (
  <div className="pb-4">
    <div className="gradient-nurse px-5 pt-6 pb-6 text-white">
      <div className="text-xs opacity-80">康复宣教中心</div>
      <div className="text-[15px] font-semibold mt-0.5">按康复阶段推送 · 单 / 多患者</div>
    </div>
    <div className="px-4 pt-4 space-y-3">
      <button onClick={onOpenPush} className="w-full gradient-nurse text-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-card">
        <Send className="w-4 h-4" /> 多患者宣教推送
      </button>
      <AICard title="AI 智能推荐宣教内容">基于患者康复阶段（术后早期 / 中期 / 出院前）自动匹配最适合的宣教素材。</AICard>
      <SectionTitle title="按阶段分类" />
      <div className="grid grid-cols-2 gap-2">
        {[
          { title: "术后早期", desc: "0-7 天", count: 8 },
          { title: "康复中期", desc: "8-21 天", count: 14 },
          { title: "出院前", desc: "22+ 天", count: 9 },
          { title: "家属篇", desc: "全阶段", count: 6 },
        ].map(c => (
          <button key={c.title} onClick={onOpenPush} className="bg-card rounded-2xl shadow-card p-4 text-left active:scale-[0.99]">
            <div className="text-sm font-bold">{c.title}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{c.desc} · {c.count} 个素材</div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const EduPushSheet = () => {
  const [selected, setSelected] = useState<string[]>([PATIENTS[2].id, PATIENTS[3].id]);
  const toggle = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  return (
    <div className="p-4 space-y-3">
      <AICard title="AI 推荐推送对象">
        系统已根据康复阶段自动勾选 2 位最适合接收「术后家庭防护」宣教的患者，可手动调整。
      </AICard>
      <SectionTitle title="选择宣教素材" />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="素材" value={<select className="bg-muted rounded px-2 py-1 text-xs"><option>术后家庭防护</option><option>吞咽训练</option><option>用药安全</option></select>} />
        <FormRow label="格式" value={<span className="text-[11px]">视频 + 图文 + 测验</span>} />
      </div>
      <SectionTitle title={`选择推送患者 · 已选 ${selected.length}`} extra={<button onClick={() => setSelected(PATIENTS.map(p => p.id))} className="text-[11px] text-role-nurse font-semibold">全选</button>} />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        {PATIENTS.map(p => (
          <button key={p.id} onClick={() => toggle(p.id)} className="w-full flex items-center justify-between px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-nurse text-white flex items-center justify-center text-xs font-bold">{p.name[0]}</div>
              <div className="text-left">
                <div className="text-[12px] font-semibold">{p.name} · 床{p.bed}</div>
                <div className="text-[10px] text-muted-foreground">{p.condition} · 入院 {p.admitDays} 天</div>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${selected.includes(p.id) ? "bg-role-nurse border-role-nurse text-white" : "border-border"}`}>
              {selected.includes(p.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const DailyNoteSheet = () => (
  <div className="p-4 space-y-3">
    <AICard title="每日康复护理备注">
      记录今日护理观察、给药执行、患者反馈等，提交后写入对应患者档案。
    </AICard>
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="患者" value={<select className="bg-muted rounded px-2 py-1 text-xs">{PATIENTS.map(p => <option key={p.id}>{p.name} · 床{p.bed}</option>)}</select>} />
      <FormRow label="班次" value={<select className="bg-muted rounded px-2 py-1 text-xs"><option>白班</option><option>夜班</option></select>} />
    </div>
    <textarea
      defaultValue="患者今日精神可，配合度高；伤口干洁；夜间睡眠 6h，无诉不适。给药全部执行到位。"
      className="w-full bg-card border border-border rounded-2xl p-3 text-xs h-32 outline-none"
    />
  </div>
);

/* ===================== Sheets ===================== */

const MedExecSheet = ({ patient }: { patient?: string }) => (
  <div className="p-4 space-y-3">
    <div className="rounded-2xl gradient-nurse text-white p-5">
      <div className="text-xs opacity-80">给药任务</div>
      <div className="text-xl font-bold mt-1">{patient || "303 床 · 张建国"}</div>
      <div className="text-xs opacity-90 mt-2">阿司匹林 100mg · 静脉注射 · 14:00</div>
    </div>
    <AICard title="AI 用药安全核对">未检测到药物相互作用风险。患者无 NSAIDs 过敏史。</AICard>
    <SectionTitle title="三查七对" />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      {["患者姓名 · 张建国", "床号 · 303", "药物 · 阿司匹林 100mg", "剂量 · 100mg", "给药时间 · 14:00", "给药途径 · IV", "有效期 · 2026-12"].map((c) => (
        <div key={c} className="flex items-center justify-between py-3">
          <span className="text-[12px]">{c}</span>
          <CheckCircle2 className="w-4 h-4 text-success" />
        </div>
      ))}
    </div>
    <div className="bg-warning-soft text-warning rounded-2xl p-3 text-xs flex items-center gap-2">
      <ShieldCheck className="w-4 h-4" /> 需双人核对，请同事扫码确认
    </div>
  </div>
);

const VitalsSheet = ({ patient }: { patient?: string }) => (
  <div className="p-4 space-y-3">
    <div className="bg-card rounded-2xl shadow-card p-4">
      <div className="text-sm font-semibold">{patient || "305 床 · 王秀英"}</div>
      <div className="text-[11px] text-muted-foreground">14:30 测量</div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {[
        { l: "体温 ℃", d: "36.7" }, { l: "脉搏 bpm", d: "78" }, { l: "呼吸 /min", d: "18" },
        { l: "血压 mmHg", d: "128/82" }, { l: "血氧 %", d: "98" }, { l: "疼痛 VAS", d: "3" },
      ].map((v) => (
        <div key={v.l} className="bg-card rounded-2xl shadow-card p-3">
          <div className="text-[10px] text-muted-foreground">{v.l}</div>
          <input defaultValue={v.d} className="w-full mt-1 bg-transparent text-lg font-bold outline-none" />
        </div>
      ))}
    </div>
    <AICard title="AI 异常筛查">所有指标在正常范围内。</AICard>
  </div>
);

const InjectSheet = () => (
  <div className="p-4 space-y-3">
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="患者" value="305 王秀英 ▾" />
      <FormRow label="药物" value="低分子肝素 ▾" />
      <FormRow label="部位" value="腹部皮下 ▾" />
      <FormRow label="剂量" value={<input defaultValue="0.4ml" className="w-20 bg-muted rounded px-2 py-1 text-xs text-right" />} />
      <FormRow label="时间" value="14:35" />
    </div>
  </div>
);

const ObsSheet = () => (
  <div className="p-4 space-y-3">
    <AICard title="AI 异常监测提示">检测到患者夜间血压波动较大，建议加强观察。</AICard>
    <div className="bg-card rounded-2xl shadow-card p-4 space-y-2">
      <div className="text-[11px] text-muted-foreground">观察记录</div>
      <textarea defaultValue="患者意识清楚，对答切题。下肢肌力 III 级，无新发疼痛。皮肤完好，无压疮。" className="w-full bg-muted rounded-xl p-3 text-xs h-32 outline-none" />
    </div>
    <SectionTitle title="风险评估" />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="跌倒风险" value="中 ▾" />
      <FormRow label="压疮风险" value="低 ▾" />
      <FormRow label="DVT 风险" value="中 ▾" />
    </div>
  </div>
);

const ExecTaskSheet = () => (
  <div className="p-4 space-y-3">
    <div className="bg-card rounded-2xl shadow-card p-4">
      <div className="text-sm font-semibold">312 床 · 刘伟明</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">伤口换药 · 术后第 5 天</div>
    </div>
    <SectionTitle title="操作步骤" />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      {["手卫生 + 戴手套", "评估伤口情况", "去除旧敷料", "消毒伤口", "更换敷料", "记录伤口情况"].map((s, i) => (
        <FormRow key={s} label={`${i + 1}. ${s}`} value={<input type="checkbox" className="w-4 h-4 accent-pink-500" />} />
      ))}
    </div>
  </div>
);

const Me = ({ onOpenTeam }: { onOpenTeam: () => void }) => (
  <div className="px-4 pt-4 pb-4 space-y-4">
    <div className="bg-card rounded-2xl shadow-card p-5 flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl gradient-nurse flex items-center justify-center text-white text-xl font-bold">赵</div>
      <div>
        <div className="text-base font-bold">赵静怡 主管护师</div>
        <div className="text-xs text-muted-foreground mt-0.5">康复护理组 · 12 年</div>
      </div>
    </div>

    <MeStats
      accent="nurse"
      tiles={[
        { label: "本月护理", value: 412, sub: "次" },
        { label: "给药执行", value: 286, sub: "项" },
        { label: "宣教推送", value: 64, sub: "次" },
      ]}
      trend={[
        { day: "一", value: 18 }, { day: "二", value: 22 }, { day: "三", value: 17 },
        { day: "四", value: 25 }, { day: "五", value: 21 }, { day: "六", value: 12 }, { day: "日", value: 9 },
      ]}
    />

    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <button onClick={onOpenTeam} className="w-full flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-role-nurse" />
          <span className="text-sm">团队管理</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-soft text-primary">配置成员 · 共享患者</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
      {[
        { label: "护理记录", info: "本月护理记录 412 条已同步患者档案" },
        { label: "给药历史", info: "本月给药 286 项，AI 三查七对零差错" },
        { label: "宣教记录", info: "本月推送 64 次宣教，平均阅读率 86%" },
        { label: "排班", info: "本周白班 5 / 夜班 2，已与组长确认" },
        { label: "设置", info: "夜间免打扰：22:00-06:00 · 紧急任务直达" },
      ].map((it) => (
        <button key={it.label} onClick={() => toast.success(it.info)} className="w-full flex items-center justify-between px-4 py-3.5">
          <span className="text-sm">{it.label}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  </div>
);

/* ============== 沟通 Hub：患者沟通 + 团队会议 ============== */
const NurseChatHub = ({
  subTab,
  onChange,
  onOpenPatient,
  meetings,
  onPickMeeting,
  onCreateMeeting,
}: {
  subTab: "patient" | "team";
  onChange: (k: "patient" | "team") => void;
  onOpenPatient: (p: Patient) => void;
  meetings: TeamMeeting[];
  onPickMeeting: (m: TeamMeeting) => void;
  onCreateMeeting: () => void;
}) => (
  <div className="pb-4">
    <div className="gradient-nurse px-5 pt-6 pb-6 text-white">
      <div className="text-xs opacity-80">沟通中心</div>
      <div className="text-[15px] font-semibold mt-0.5">患者沟通 + 团队会议</div>
      <div className="mt-3 flex gap-1.5 bg-white/15 backdrop-blur rounded-full p-1">
        {(["patient", "team"] as const).map((k) => {
          const active = subTab === k;
          return (
            <button
              key={k}
              onClick={() => onChange(k)}
              className={`flex-1 text-[12px] py-1.5 rounded-full font-semibold transition-all ${active ? "bg-white text-foreground" : "text-white/90"}`}
            >
              {k === "patient" ? `患者沟通 · ${PATIENT_UNREAD}` : `团队会议 · ${meetings.length}`}
            </button>
          );
        })}
      </div>
    </div>
    {subTab === "patient" ? (
      <PatientChatListSheet accent="nurse" onPick={onOpenPatient} />
    ) : (
      <TeamMeetingListSheet
        accent="nurse"
        meetings={meetings}
        onPick={onPickMeeting}
        onCreate={onCreateMeeting}
      />
    )}
  </div>
);

/* ============== 评估结果确认（护士视角） ============== */
const NurseConfirmAssessSheet = ({ patient }: { patient?: string }) => {
  const name = patient ? patient.split(" ").slice(-1)[0] : "王秀英";
  const [supplement, setSupplement] = useState(
    "夜间巡视 q2h：意识清楚，伤口干洁；3:00 一过性 BP 152/90 已记录，VAS 由 6 降至 3；尚需观察 24h 跌倒倾向。"
  );
  return (
    <div className="p-4 space-y-3">
      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-nurse text-white flex items-center justify-center font-bold text-lg">{name[0]}</div>
          <div className="flex-1">
            <div className="text-sm font-bold">{patient || "305 王秀英 · 女 68 岁"}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">髋关节置换术后 · 入院第 5 天</div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-rose-50 text-role-nurse font-semibold">评估确认</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted rounded-xl py-2"><div className="text-[9px] text-muted-foreground">BP</div><div className="text-[12px] font-semibold mt-0.5">128/82</div></div>
          <div className="bg-muted rounded-xl py-2"><div className="text-[9px] text-muted-foreground">VAS</div><div className="text-[12px] font-semibold mt-0.5">6 → 3</div></div>
          <div className="bg-muted rounded-xl py-2"><div className="text-[9px] text-muted-foreground">DVT 风险</div><div className="text-[12px] font-semibold mt-0.5">中</div></div>
        </div>
      </div>

      <SectionTitle title="康复医师评估意见" extra={<span className="text-[10px] text-muted-foreground">李志远 · 主任医师</span>} />
      <div className="bg-card rounded-2xl shadow-card p-3 text-[12px] text-foreground/85 leading-relaxed">
        Harris 65 / Berg 32 / VAS 6。综合判定：术后早期，疼痛是主要限制因素，康复潜力良好。
        建议先 1 周疼痛干预 + 渐进负重 + 平衡训练；DVT 中风险，请加强皮下注射依从性与下肢观察。
      </div>

      <SectionTitle title="治疗师评估意见" extra={<span className="text-[10px] text-muted-foreground">王雅琴 · PT/OT</span>} />
      <div className="bg-card rounded-2xl shadow-card p-3 text-[12px] text-foreground/85 leading-relaxed">
        实测 ROM 屈曲 60°、外展 25°，主动活动 VAS 7；床椅转移需中等辅助。
        建议先 1 周等长收缩 + 疼痛干预，再渐进负重；夜间疼痛与睡眠请护理协助监测。
      </div>

      <AICard title="AI 多角色对比">
        医师与治疗师结论一致：术后早期 · 疼痛主导 · 康复潜力良好。
        请护士结合床旁观察补充意见，确认后将作为康复方案启动依据。
      </AICard>

      <SectionTitle title="护士补充意见（必填）" extra={<span className="text-[10px] text-muted-foreground">床旁观察 · 用药依从 · 风险</span>} />
      <div className="bg-card rounded-2xl shadow-card p-3">
        <textarea
          value={supplement}
          onChange={(e) => setSupplement(e.target.value)}
          placeholder="补充夜间观察、疼痛变化、用药执行、跌倒/压疮风险……"
          className="w-full bg-muted rounded-xl p-3 text-xs h-28 outline-none"
        />
        <div className="flex justify-end mt-2">
          <button onClick={() => setSupplement("")} className="text-[11px] text-muted-foreground">一键清空</button>
        </div>
      </div>

      <SectionTitle title="逐项核对" />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="疼痛 VAS 趋势" value="6 → 3 ✓" hint="夜间用药后下降" />
        <FormRow label="DVT 预防执行" value="低分子肝素 0.4ml ih ✓" />
        <FormRow label="跌倒预防" value="床栏 + 呼叫器 ✓" />
        <FormRow label="伤口情况" value="干洁 ✓" />
      </div>
    </div>
  );
};

/* ============== 随访清单 ============== */
const STATUS_TONE: Record<FollowUpStatus, { label: string; cls: string }> = {
  done: { label: "已完成", cls: "bg-success/15 text-success" },
  pending: { label: "待随访", cls: "bg-primary/15 text-primary" },
  needRevisit: { label: "需复访", cls: "bg-warning/20 text-warning" },
};

const FollowUpListView = ({
  patients,
  onPick,
}: {
  patients: FollowUpPatient[];
  onPick: (p: FollowUpPatient) => void;
}) => {
  const pendingCount = patients.filter(p => p.status === "pending").length;
  return (
    <div className="p-4 pb-6 space-y-2.5">
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-[11px] text-muted-foreground">共 {patients.length} 项 · 待随访 {pendingCount}</span>
        <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> AI 多轮托管
        </span>
      </div>
      {patients.map((p) => {
        const tone = STATUS_TONE[p.status];
        const isDone = p.status === "done";
        return (
          <div key={p.id} className="bg-card rounded-2xl shadow-card border border-border/40 p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14px] font-bold text-foreground">{p.name}</span>
                  <span className="text-[11px] text-muted-foreground">{p.sex}·{p.age}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${tone.cls}`}>{tone.label}</span>
                </div>
                <div className="text-[12px] text-foreground/80 mt-1.5">{p.diagnosis}</div>
                <div className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                  <Stethoscope className="w-3 h-3" /> {p.meta}
                </div>
                {p.conclusion && (
                  <div className="text-[11px] text-foreground/70 mt-1.5 leading-relaxed border-l-2 border-success/40 pl-2">
                    结论：{p.conclusion}
                  </div>
                )}
              </div>
              {isDone ? (
                <div className="w-8 h-8 rounded-full border-2 border-success text-success flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : (
                <button
                  onClick={() => onPick(p)}
                  className="gradient-nurse text-white rounded-full px-3.5 py-2 text-[12px] font-semibold flex items-center gap-1 shadow-card shrink-0 active:scale-95 transition-transform"
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI 随访
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ============== AI 随访对话 Sheet ============== */
interface FollowUpTurn { role: "nurse" | "patient" | "system"; text: string; time?: string }

const FOLLOW_UP_SCRIPT: { q: string; a: string }[] = [
  { q: "您好，我是您的术后智能随访助手🤖\n请问您术后伤口疼痛评分（VAS 0-10）是多少？", a: "VAS 大概 3 分，夜间稍有酸胀。" },
  { q: "请问伤口处有无红肿、渗液或敷料潮湿的情况？", a: "敷料干燥，无明显红肿。" },
  { q: "目前关节活动度（ROM）大约能达到多少？是否扶拐／支具行走？", a: "屈曲 60° 左右，扶拐下地。" },
  { q: "用药、饮食、睡眠是否正常？还有其他不适或想咨询的吗？", a: "用药按时，睡眠一般，无其他特殊不适。" },
];

type FollowUpAdvice = "revisit" | "outpatient" | "home";
const ADVICE_OPTIONS: { key: FollowUpAdvice; label: string; desc: string; tone: string }[] = [
  { key: "revisit", label: "建议到省人民康复科复诊", desc: "症状或指标提示需进一步评估，安排门诊复诊。", tone: "bg-destructive/10 text-destructive" },
  { key: "outpatient", label: "建议到省人民康复科看诊", desc: "可在 1-2 周内门诊就诊，调整康复处方。", tone: "bg-warning/15 text-warning" },
  { key: "home", label: "居家维护现状", desc: "恢复良好，按现有方案继续居家训练。", tone: "bg-success/10 text-success" },
];

const FollowUpSheet = ({
  patient,
  onManualCall,
  onDone,
}: {
  patient: FollowUpPatient | null;
  onManualCall: () => void;
  onDone: () => void;
}) => {
  const greet = patient ? `${patient.name}您好，我是您的术后智能随访助手🤖\n` : "";
  const [turns, setTurns] = useState<FollowUpTurn[]>([
    { role: "nurse", text: greet + FOLLOW_UP_SCRIPT[0].q, time: "12:11" },
  ]);
  const [step, setStep] = useState(0);
  const [noReply, setNoReply] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [advice, setAdvice] = useState<FollowUpAdvice>("home");
  const [draft, setDraft] = useState("");

  const total = FOLLOW_UP_SCRIPT.length;
  const canGenerate = step >= total;

  const ts = (i: number) => `12:${String(11 + i).padStart(2, "0")}`;

  const pushPatient = (text: string) => {
    if (!text.trim()) return;
    const idx = turns.length;
    const next: FollowUpTurn[] = [...turns, { role: "patient", text: text.trim(), time: ts(idx) }];
    const ns = step + 1;
    if (ns < total) {
      next.push({ role: "nurse", text: FOLLOW_UP_SCRIPT[ns].q, time: ts(idx + 1) });
    } else if (step >= total) {
      // 自由轮：AI 追问
      next.push({
        role: "nurse",
        text: "收到，我已记录。是否还有其他不适需要补充？没有的话我将为您生成本次随访结论。",
        time: ts(idx + 1),
      });
    }
    setTurns(next);
    setStep(ns);
    setNoReply(false);
  };

  const simulate = () => {
    if (canGenerate) {
      pushPatient("没有其他不适，伤口恢复中，谢谢。");
      return;
    }
    pushPatient(FOLLOW_UP_SCRIPT[step].a);
  };

  const sendDraft = () => {
    if (!draft.trim()) return;
    pushPatient(draft);
    setDraft("");
  };

  const markNoReply = () => {
    if (noReply) return;
    setNoReply(true);
    setTurns([
      ...turns,
      { role: "system", text: "患者长时间未回复（>30 分钟），建议人工外呼介入。" },
    ]);
  };

  const generate = () => {
    const text = turns.filter(t => t.role === "patient").map(t => t.text).join(" ");
    let pick: FollowUpAdvice = "home";
    if (/出血|加重|不能|发热|红肿明显|渗液/.test(text)) pick = "revisit";
    else if (/酸胀|受限|偷懒|担心|不稳|没力气/.test(text)) pick = "outpatient";
    setAdvice(pick);
    setGenerated(true);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 pt-3 pb-3 border-b border-border/60 bg-card shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={onDone} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <ChevronRight className="w-4 h-4 rotate-180 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-ai" />
              AI 随访 · {patient?.name ?? "患者"}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{patient?.diagnosis}</div>
          </div>
        </div>
        <div className="mt-2 rounded-xl bg-primary/8 border border-primary/15 px-3 py-1.5 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] text-primary font-semibold">
            AI 多轮随访{canGenerate ? "已完成预设问答" : "进行中"} · 已问 {Math.min(step + 1, total)} / {total}
          </span>
        </div>
      </div>

      {/* Chat (滚动区) */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide">
        {turns.map((t, i) => {
          if (t.role === "system") {
            return (
              <div key={i} className="rounded-xl bg-warning/10 border border-warning/20 px-3 py-2 text-[11px] text-warning flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> {t.text}
              </div>
            );
          }
          const isAi = t.role === "nurse";
          return (
            <div key={i} className={`flex ${isAi ? "justify-start" : "justify-end"} gap-2`}>
              {isAi && (
                <div className="w-7 h-7 rounded-full gradient-ai text-white flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}
              <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-[12.5px] leading-relaxed whitespace-pre-line border ${
                isAi ? "bg-primary/5 border-primary/15 text-foreground" : "gradient-nurse text-white border-transparent"
              }`}>
                {t.text}
                <div className={`text-[9px] mt-1 ${isAi ? "text-muted-foreground" : "text-white/80"}`}>
                  {isAi ? "AI" : "患者"} · {t.time}
                </div>
              </div>
            </div>
          );
        })}

        {generated && (
          <div className="space-y-2 pt-2">
            <SectionTitle title="AI 随访建议" extra={<span className="text-[10px] text-ai">基于 {turns.filter(t => t.role === "patient").length} 轮回答</span>} />
            <div className="bg-card rounded-2xl shadow-card p-3 space-y-2 border border-border/40">
              {ADVICE_OPTIONS.map(opt => {
                const active = advice === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setAdvice(opt.key)}
                    className={`w-full text-left rounded-xl p-3 border transition-all ${
                      active ? "border-role-nurse bg-rose-50/60" : "border-border/60 bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${opt.tone}`}>
                        {active ? "AI 推荐" : "可选"}
                      </span>
                      <span className="text-[13px] font-semibold">{opt.label}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 底部吸附输入区 */}
      <div className="shrink-0 border-t border-border/60 bg-card/95 backdrop-blur-xl px-3 pt-2 pb-[max(env(safe-area-inset-bottom),12px)] space-y-2">
        {/* 快捷操作行 */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          <button
            onClick={simulate}
            className="shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium flex items-center gap-1 active:scale-[0.98]"
          >
            <MessageCircle className="w-3 h-3" /> 模拟患者回复
          </button>
          <button
            onClick={markNoReply}
            className="shrink-0 rounded-full border border-warning/40 bg-warning/5 text-warning px-2.5 py-1 text-[11px] font-medium flex items-center gap-1 active:scale-[0.98]"
          >
            <AlertTriangle className="w-3 h-3" /> 未回复
          </button>
          <button
            onClick={onManualCall}
            className="shrink-0 rounded-full border border-role-nurse/40 text-role-nurse px-2.5 py-1 text-[11px] font-medium flex items-center gap-1 active:scale-[0.98]"
          >
            <Stethoscope className="w-3 h-3" /> 人工外呼
          </button>
          {!canGenerate && (
            <button
              onClick={() => setStep(total)}
              className="shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium flex items-center gap-1 active:scale-[0.98]"
            >
              <CheckCircle2 className="w-3 h-3" /> 提前结束
            </button>
          )}
          <button
            onClick={generate}
            disabled={turns.filter(t => t.role === "patient").length === 0}
            className="shrink-0 rounded-full gradient-ai text-white px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1 active:scale-[0.98] disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3" /> 生成结论
          </button>
          {generated && (
            <button
              onClick={onDone}
              className="shrink-0 rounded-full gradient-nurse text-white px-3 py-1 text-[11px] font-semibold active:scale-[0.98]"
            >
              归档
            </button>
          )}
        </div>

        {/* 输入框 */}
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendDraft();
              }
            }}
            rows={1}
            placeholder={canGenerate ? "继续追问或补充…" : "代患者输入回复…"}
            className="flex-1 resize-none rounded-2xl border border-border bg-muted/40 px-3 py-2 text-[12.5px] leading-relaxed focus:outline-none focus:border-primary/50 max-h-24"
          />
          <button
            onClick={sendDraft}
            disabled={!draft.trim()}
            className="shrink-0 w-10 h-10 rounded-full gradient-nurse text-white flex items-center justify-center shadow-card disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============== 人工外呼录入 Sheet ============== */
const ManualCallSheet = ({
  patient,
  onDone,
}: {
  patient: FollowUpPatient | null;
  onDone: () => void;
}) => {
  const [vas, setVas] = useState("");
  const [swelling, setSwelling] = useState("");
  const [rom, setRom] = useState("");
  const [other, setOther] = useState("");

  const Field = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) => (
    <div className="space-y-1.5">
      <div className="text-[12px] font-semibold text-foreground">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-card border border-border rounded-xl p-3 text-[12px] outline-none resize-none h-16 focus:border-primary"
      />
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-4 pt-3 pb-3 border-b border-border/60 bg-card">
        <div className="flex items-center gap-2">
          <button onClick={onDone} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <ChevronRight className="w-4 h-4 rotate-180 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold">人工外呼录入 · {patient?.name ?? "患者"}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{patient?.diagnosis}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        <div className="rounded-xl bg-primary/8 border border-primary/15 px-3 py-2.5 flex items-center gap-2 text-[12px] text-primary">
          <Stethoscope className="w-4 h-4" />
          <span>正在拨打 {patient?.phone ?? "138****0000"}…请将通话内容录入下方</span>
        </div>

        <Field label="疼痛 / VAS" value={vas} onChange={setVas} placeholder="例：VAS 4 分，夜间略加重" />
        <Field label="红肿 / 渗液" value={swelling} onChange={setSwelling} placeholder="例：无红肿，敷料干燥" />
        <Field label="ROM / 活动" value={rom} onChange={setRom} placeholder="例：屈膝 60°，扶拐下地" />
        <Field label="其他" value={other} onChange={setOther} placeholder="服药 / 饮食 / 主诉" />
      </div>

      <div className="border-t border-border/60 bg-card/95 backdrop-blur-xl px-4 py-3 pb-5">
        <button
          onClick={onDone}
          className="w-full gradient-nurse text-white rounded-2xl py-3 text-sm font-semibold shadow-card"
        >
          完成外呼并生成小结
        </button>
      </div>
    </div>
  );
};
