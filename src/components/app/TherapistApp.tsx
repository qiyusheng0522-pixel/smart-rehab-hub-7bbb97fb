import { useState } from "react";
import { ScreenShell, TabBar, type TabBarItem } from "@/components/app/TabBar";
import { AICard, SectionTitle, StatChip } from "@/components/app/UI";
import { PhoneSheet, FormRow, PrimaryBtn } from "@/components/app/Sheet";
import { TodoQueueList, WorkbenchTile, PendingStatRow, PendingTodoGrid, TodoItem } from "@/components/app/TodoQueue";
import { RxDetail } from "@/components/app/RxDetail";
import { InlineGoals } from "@/components/app/DoctorApp";
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
  PatientFilter,
  PATIENTS,
  NEW_PATIENT_COUNT,
  PATIENT_UNREAD,
  DEFAULT_MEETINGS,
  DEFAULT_MEETING_MSGS,
  TeamMeeting,
  getPatientStage,
} from "@/components/app/PatientsModule";
import { RehabPlanModule, PlanStage } from "@/components/app/RehabPlanModule";
import { MeStats } from "@/components/app/MeStats";
import { EvalTabs, EvalTabKey, ClinicalPanel, RehabPanel, NumberedGoals } from "@/components/app/EvalShared";
import {
  UsersRound,
  FileHeart,
  MessageCircle,
  User as UserIcon,
  Bell,
  ChevronRight,
  ClipboardList,
  ClipboardCheck,
  Activity,
  Calendar,
  CheckCircle2,
  Dumbbell,
  Brain,
  MessageSquare,
  Pill,
  Edit3,
  Users,
  AlertTriangle,
  Sparkles,
  Plus,
  Stethoscope,
  Target,
  FileText,
  LogOut,
  Home as HomeIcon,
} from "lucide-react";
import { toast } from "sonner";

const THERAPIST_TABS: TabBarItem[] = [
  { key: "home", label: "工作台", icon: ClipboardList },
  { key: "patients", label: "患者管理", icon: UsersRound },
  { key: "rx", label: "康复方案", icon: FileHeart },
  { key: "chat", label: "沟通", icon: MessageCircle, badge: PATIENT_UNREAD },
  { key: "me", label: "我的", icon: UserIcon },
];

type SheetKey =
  | null
  | "confirmAssess"
  | "goal"
  | "schedule"
  | "rx"
  | "exec"
  | "summary"
  | "med"
  | "patientDetail"
  | "addNote"
  | "team"
  | "patientChat"
  | "meetingList"
  | "newMeeting"
  | "meeting"
  | "uploadDaily"
  | "firstAssess";

type TherapistType = "PT" | "OT" | "ST";

type QueueKey = "confirmAssess" | "goal" | "rx" | "exec";

const QUEUE_TITLE: Record<QueueKey, string> = {
  confirmAssess: "待确认评估结果",
  goal: "待生成 / 调整治疗目标",
  rx: "待确认 AI 康复方案 / 处方",
  exec: "待执行康复处方",
};

const QUEUES: Record<QueueKey, TodoItem[]> = {
  confirmAssess: [
    { id: "ca1", patient: "王秀英 · 女 68", meta: "髋关节置换术后", detail: "AI 评估意见 + 待治疗师补充", urgency: "high" },
    { id: "ca2", patient: "周建华 · 男 72", meta: "脑梗死恢复期", detail: "FMA 38 · 待补充意见", urgency: "medium" },
  ],
  goal: [
    { id: "go1", patient: "李 强 · 男 42", meta: "脊髓损伤", detail: "医师已确认目标 · 待生成治疗目标", urgency: "high" },
    { id: "go2", patient: "张建国 · 男 56", meta: "脑卒中后偏瘫", detail: "医师已确认 · 待治疗师细化", urgency: "medium" },
  ],
  rx: [
    { id: "rx1", patient: "张建国 · 男 56", meta: "脑卒中后偏瘫", detail: "AI 康复方案 + 处方 · 待确认", urgency: "high" },
    { id: "rx2", patient: "王秀英 · 女 68", meta: "髋关节术后", detail: "新增站立平衡训练", urgency: "medium" },
  ],
  exec: [
    { id: "e1", patient: "李 强 · 男 42", meta: "OT · ADL 训练", detail: "厨房活动训练 25min · B-201", time: "14:00", urgency: "high" },
    { id: "e2", patient: "陈丽华 · 女 65", meta: "ST · 吞咽训练", detail: "B-205 · 30 min", time: "15:30", urgency: "medium" },
    { id: "e3", patient: "刘伟明 · 男 38", meta: "PT · 平衡训练", detail: "A-301 · 30 min", time: "16:30", urgency: "medium" },
  ],
};

export const TherapistApp = () => {
  const [tab, setTab] = useState("home");
  const [sheet, setSheet] = useState<SheetKey>(null);
  const [queue, setQueue] = useState<QueueKey | null>(null);
  const [activePatient, setActivePatient] = useState<string>("");
  const [pickedPatient, setPickedPatient] = useState<Patient | null>(null);
  const [chatPatient, setChatPatient] = useState<Patient | null>(null);
  const [patientNotes, setPatientNotes] = useState<Record<string, Patient["notes"]>>({});
  const [planStage, setPlanStage] = useState<PlanStage>("goal");
  const [meetings, setMeetings] = useState<TeamMeeting[]>(DEFAULT_MEETINGS);
  const [activeMeeting, setActiveMeeting] = useState<TeamMeeting | null>(null);
  const [chatSubTab, setChatSubTab] = useState<"patient" | "team">("patient");
  const [role, setRole] = useState<"therapist" | "lead">("therapist");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [therapistType, setTherapistType] = useState<TherapistType>("PT");
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
  const pickPlanPatient = (stage: PlanStage, p: Patient) => {
    setActivePatient(`${p.name} · 床${p.bed}`);
    if (stage === "goal") setSheet("goal");
    else setSheet("rx");
  };

  return (
    <ScreenShell tabBar={<TabBar active={tab} onChange={setTab} accent="therapist" newPatientCount={NEW_PATIENT_COUNT} items={THERAPIST_TABS} />}>
      <RoleSwitch role={role} onChange={setRole} />
      {tab === "home" && (
        <TherapistHome
          role={role}
          onOpenQueue={openQueue}
          onGoPatients={goPatients}
          onGoRx={() => setTab("rx")}
          onUploadDaily={() => open("uploadDaily")}
          onOpenMed={() => open("med")}
          onOpenSchedule={() => setScheduleOpen(true)}
        />
      )}
      {tab === "patients" && (
        <TherapistPatients
          onPickPatient={pickPatient}
          onOpenQueue={openQueue}
          onUploadDaily={() => open("uploadDaily")}
          initialFilter={patientsFilter}
          onAction={(key, p) => {
            setActivePatient(`${p.name} · 床${p.bed}`);
            if (key === "assess") setSheet("firstAssess");
            else if (key === "plan") setSheet("goal");
            else setSheet("rx");
          }}
          onSummaryPatient={(p) => {
            setActivePatient(`${p.name} · 床${p.bed}`);
            setSheet("summary");
          }}
        />
      )}
      {tab === "plan" && (
        <RehabPlanModule
          accent="therapist"
          initialStage={planStage}
          stages={["goal", "airx"]}
          onPickPlan={pickPlanPatient}
          title="康复方案"
          subtitle="治疗目标 + 康复处方确认"
        />
      )}
      {tab === "rx" && (
        <RxTab onPick={(item) => { setActivePatient(item.patient); setSheet("rx"); }} />
      )}
      {tab === "chat" && (
        <ChatHub
          subTab={chatSubTab}
          onChange={setChatSubTab}
          onOpenPatient={(p) => { setChatPatient(p); setSheet("patientChat"); }}
          meetings={meetings}
          onPickMeeting={(m) => { setActiveMeeting(m); setSheet("meeting"); }}
          onCreateMeeting={() => setSheet("newMeeting")}
        />
      )}
      {tab === "me" && <Me onOpenTeam={() => open("team")} />}

      {(["confirmAssess", "goal", "rx", "exec"] as QueueKey[]).map((k) => (
        <PhoneSheet key={k} open={queue === k} onClose={closeQueue} title={QUEUE_TITLE[k]} accent="therapist">
          <TodoQueueList
            accent="therapist"
            items={QUEUES[k]}
            onPick={(item) => pickFromQueue(item, k === "confirmAssess" ? "confirmAssess" : k === "goal" ? "goal" : k === "rx" ? "rx" : "exec")}
          />
        </PhoneSheet>
      ))}

      <PhoneSheet open={sheet === "firstAssess"} onClose={close} title={`首次评估${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="therapist"
        footer={<div className="flex gap-2">
          <button onClick={() => { setActiveMeeting(null); setSheet("meeting"); toast("已发起团队会议评估"); }} className="flex-1 border border-secondary/30 text-secondary rounded-2xl py-3 text-sm font-semibold">团队会议评估</button>
          <button onClick={() => { toast.success(`首次评估已确认 · ${therapistType} 结果已同步医师`); close(); }} className="flex-1 gradient-therapist text-white rounded-2xl py-3 text-sm font-semibold">确定</button>
        </div>}>
        <FirstAssessSheet patient={activePatient} type={therapistType} onChangeType={setTherapistType} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "confirmAssess"} onClose={close} title={`评估结果确认${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="therapist"
        footer={<div className="flex gap-2">
          <button onClick={() => { toast("已请医师再次评估"); close(); }} className="flex-1 border border-border rounded-2xl py-3 text-sm font-semibold">结果不确定</button>
          <button onClick={() => { toast.success("评估已确认 · 进入目标生成"); close(); }} className="flex-1 gradient-therapist text-white rounded-2xl py-3 text-sm font-semibold">确认结果</button>
        </div>}>
        <ConfirmAssessSheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "goal"} onClose={close} title={`治疗目标${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="therapist"
        footer={
          <button onClick={() => { toast.success("治疗目标已生成并回传医师"); close(); }} className="w-full gradient-therapist text-white rounded-2xl py-3 text-sm font-semibold">生成治疗目标</button>
        }>
        <GoalAdjustSheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "rx"} onClose={close} title={`AI 康复方案 / 处方${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="therapist"
        footer={<div className="flex gap-2">
          <button onClick={() => open("schedule")} className="flex-1 border border-border rounded-2xl py-3 text-sm font-semibold">调整排班</button>
          <button onClick={() => { toast.success("已确认并推送至康复医师签发"); close(); }} className="flex-1 gradient-therapist text-white rounded-2xl py-3 text-sm font-semibold">确认 · 推送医师</button>
        </div>}>
        <RxAdjustSheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "schedule"} onClose={close} title="智能排班 · 手动调整" accent="ai"
        footer={<PrimaryBtn variant="ai" onClick={() => { toast.success("排班已保存"); close(); }}>保存排班</PrimaryBtn>}>
        <ScheduleSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "exec"} onClose={close} title={`处方执行${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="therapist"
        footer={<PrimaryBtn variant="therapist" onClick={() => { open("summary"); }}>完成 · 写工作小结</PrimaryBtn>}>
        <ExecSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "summary"} onClose={close} title={`每日小结${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="therapist"
        footer={<PrimaryBtn variant="therapist" onClick={() => { toast.success("小结已写入该患者档案"); close(); }}>提交小结</PrimaryBtn>}>
        <SummarySheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "uploadDaily"} onClose={close} title="上传每日治疗情况" accent="therapist"
        footer={<PrimaryBtn variant="therapist" onClick={() => { toast.success("每日治疗情况已上传至患者档案"); close(); }}>上传到患者档案</PrimaryBtn>}>
        <UploadDailySheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "med"} onClose={close} title={`药物变动记录${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="therapist"
        footer={<PrimaryBtn variant="therapist" onClick={() => { toast.success("药物变动已记录"); close(); }}>保存记录</PrimaryBtn>}>
        <MedSheet />
      </PhoneSheet>

      <PhoneSheet
        open={sheet === "patientDetail"}
        onClose={close}
        title={`患者档案${pickedPatient ? " · " + pickedPatient.name : ""}`}
        accent="therapist"
        footer={
          pickedPatient ? (
            <PatientActionsBar
              accent="therapist"
              actions={
                getPatientStage(pickedPatient) === "待出院"
                  ? [
                      { key: "discharge", label: "确认出院", icon: LogOut, onClick: () => { toast.success(`已确认「${pickedPatient.name}」出院`); close(); } },
                      { key: "transfer", label: "转社区", icon: HomeIcon, onClick: () => { toast.success(`已将「${pickedPatient.name}」转至社区康复`); close(); } },
                      { key: "note", label: "备注", icon: Edit3, onClick: () => setSheet("addNote") },
                    ]
                  : pickedPatient.needFirstAssess
                  ? [
                      { key: "assess", label: "开始评估", icon: ClipboardList, onClick: () => setSheet("firstAssess") },
                      { key: "note", label: "备注", icon: Edit3, onClick: () => setSheet("addNote") },
                    ]
                  : [
                      { key: "summary", label: "每日小结", icon: ClipboardList, onClick: () => { setActivePatient(pickedPatient ? `${pickedPatient.name} · 床${pickedPatient.bed}` : ""); setSheet("summary"); } },
                      { key: "note", label: "备注", icon: Edit3, onClick: () => setSheet("addNote") },
                    ]
              }
            />
          ) : undefined
        }
      >
        <PatientDetailSheet
          patient={pickedPatient}
          accent="therapist"
          onAddNote={() => setSheet("addNote")}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "addNote"} onClose={() => setSheet("patientDetail")} title="添加患者备注" accent="therapist">
        <AddNoteSheet
          patient={pickedPatient}
          accent="therapist"
          onSave={(text) => {
            if (!pickedPatient) return;
            const newNote = { author: "王治疗师", time: "刚刚", text };
            const updated = [newNote, ...(patientNotes[pickedPatient.id] ?? pickedPatient.notes)];
            setPatientNotes({ ...patientNotes, [pickedPatient.id]: updated });
            setPickedPatient({ ...pickedPatient, notes: updated });
            toast.success("备注已保存并共享给团队");
            setSheet("patientDetail");
          }}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "team"} onClose={close} title="团队管理" accent="therapist">
        <TeamManageSheet accent="therapist" />
      </PhoneSheet>

      <PhoneSheet open={sheet === "patientChat"} onClose={close} title="患者沟通" accent="therapist" flush hideHeader>
        <PatientChatSheet accent="therapist" patient={chatPatient} onClose={close} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "meetingList"} onClose={close} title="团队会议" accent="therapist">
        <TeamMeetingListSheet
          accent="therapist"
          meetings={meetings}
          onPick={(m) => { setActiveMeeting(m); setSheet("meeting"); }}
          onCreate={() => setSheet("newMeeting")}
        />
      </PhoneSheet>
      <PhoneSheet open={sheet === "newMeeting"} onClose={() => setSheet("meetingList")} title="新增团队会议" accent="therapist">
        <NewMeetingSheet accent="therapist" onCreate={(m) => { setMeetings([m, ...meetings]); setActiveMeeting(m); toast.success("会议已创建"); setSheet("meeting"); }} />
      </PhoneSheet>
      <PhoneSheet open={sheet === "meeting"} onClose={() => setSheet("meetingList")} title="团队会议" accent="therapist" flush hideHeader>
        <IMChatSheet
          accent="therapist"
          title={`团队会议 · ${activeMeeting?.patientName ?? "张建国"}`}
          subtitle={activeMeeting?.topic ?? "V2 方案确认"}
          participants={activeMeeting?.participants ?? ["李医师", "王治疗师", "陈治疗师", "赵护士"]}
          initialMessages={DEFAULT_MEETING_MSGS}
          onAISummary={() => {}}
          enablePatientReminder
          onClose={() => setSheet("meetingList")}
        />
      </PhoneSheet>

      <PhoneSheet open={scheduleOpen} onClose={() => setScheduleOpen(false)} title={role === "lead" ? "全治疗师排班 · 治疗师长视图" : "我的排班 · 今日"} accent="therapist">
        <ScheduleView role={role} />
      </PhoneSheet>
    </ScreenShell>
  );
};

/* ============== 治疗师首页 ============== */
const TherapistHome = ({
  role,
  onOpenQueue,
  onGoPatients,
  onGoRx,
  onUploadDaily,
  onOpenMed,
  onOpenSchedule,
}: {
  role: "therapist" | "lead";
  onOpenQueue: (k: QueueKey) => void;
  onGoPatients: (filter?: import("@/components/app/PatientsModule").PatientFilter) => void;
  onGoRx: () => void;
  onUploadDaily: () => void;
  onOpenMed: () => void;
  onOpenSchedule: () => void;
}) => {
  const allTodos: { patient: string; meta: string; time?: string; urgency: "high" | "medium" | "low"; k: QueueKey }[] = [
    ...QUEUES.confirmAssess.map(t => ({ patient: t.patient, meta: t.meta, time: t.time, urgency: t.urgency ?? "medium", k: "confirmAssess" as QueueKey })),
    ...QUEUES.goal.map(t => ({ patient: t.patient, meta: t.meta, time: t.time, urgency: t.urgency ?? "medium", k: "goal" as QueueKey })),
    ...QUEUES.rx.map(t => ({ patient: t.patient, meta: t.meta, time: t.time, urgency: t.urgency ?? "medium", k: "rx" as QueueKey })),
    ...QUEUES.exec.map(t => ({ patient: t.patient, meta: t.meta, time: t.time, urgency: t.urgency ?? "medium", k: "exec" as QueueKey })),
  ].sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.urgency] - { high: 0, medium: 1, low: 2 }[b.urgency]));
  const tagShort: Record<QueueKey, string> = { confirmAssess: "评估", goal: "目标", rx: "医嘱", exec: "执行" };
  return (
    <div className="pb-4">
      <div className="bg-background px-5 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">下午好</div>
            <div className="text-xl font-bold mt-0.5 text-foreground">{role === "lead" ? "王治疗师长 👋" : "王治疗师 👋"}</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {role === "lead" ? "PT/OT 治疗师长 · 管理 6 位治疗师" : `PT/OT 治疗师 · 共 ${PATIENTS.length} 位患者`}
            </div>
          </div>
          <button onClick={() => toast("您有 2 条新任务")} className="w-9 h-9 rounded-full bg-secondary-soft text-secondary flex items-center justify-center relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full" />
          </button>
        </div>
        <button onClick={onOpenSchedule} className="mt-3 w-full bg-secondary-soft border border-secondary/20 rounded-2xl p-3 flex items-center gap-3 active:scale-[0.99]">
          <div className="w-9 h-9 rounded-xl gradient-therapist text-white flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-[12px] font-semibold text-secondary">{role === "lead" ? "查看全治疗师排班" : "我今日的治疗排班"}</div>
            <div className="text-[10px] text-muted-foreground">
              {role === "lead" ? "6 位治疗师 · 32 项排班 · AI 已优化" : "5 项治疗 · 09:00 - 16:30"}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-secondary" />
        </button>
      </div>

      <div className="px-4 mt-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[13px] font-bold text-foreground">今日待处理</span>
        </div>
        <PendingTodoGrid
          items={[
            { label: "待首次评估", count: QUEUES.confirmAssess.length, icon: ClipboardCheck, iconClass: "bg-warning text-white", onClick: () => onGoPatients("待首次评估") },
            { label: "待确认方案", count: QUEUES.rx.length, icon: FileText, iconClass: "bg-secondary text-white", onClick: onGoRx },
            { label: "待出院评估", count: PATIENTS.filter(p => getPatientStage(p) === "待出院").length, icon: LogOut, iconClass: "bg-destructive text-white", onClick: () => onGoPatients("待出院") },
          ]}
        />
      </div>

      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[13px] font-bold text-foreground">今日待办清单</span>
          <span className="text-[11px] text-muted-foreground">共 {allTodos.length} 项 · 按优先级</span>
        </div>
        <div className="bg-card rounded-2xl shadow-card border border-border/40 divide-y divide-border/60 overflow-hidden">
          {allTodos.map((t, idx) => {
            const tagColor =
              t.k === "confirmAssess" ? "bg-warning/15 text-warning" :
              t.k === "goal" ? "bg-primary/10 text-primary" :
              t.k === "rx" ? "bg-secondary/10 text-secondary" :
              "bg-success/10 text-success";
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
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${tagColor}`}>{tagShort[t.k]}</span>
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

/* ============== 患者管理（治疗师视角） ============== */
const TherapistPatients = ({
  onPickPatient,
  onSummaryPatient,
  initialFilter,
  onAction,
}: {
  onPickPatient: (p: Patient) => void;
  onOpenQueue?: (k: QueueKey) => void;
  onUploadDaily?: () => void;
  onSummaryPatient?: (p: Patient) => void;
  initialFilter?: import("@/components/app/PatientsModule").PatientFilter;
  onAction?: (key: import("@/components/app/PatientsModule").PatientPendingKey, p: Patient) => void;
}) => {
  return (
    <div className="pb-4">
      <PatientsPage accent="therapist" onPick={onPickPatient} onSummary={onSummaryPatient} initialFilter={initialFilter} onAction={onAction} />
    </div>
  );
};

/* ============== 沟通 Hub：患者沟通 + 团队会议 ============== */
const ChatHub = ({
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
    <div className="gradient-therapist px-5 pt-6 pb-6 text-white">
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
      <PatientChatListSheet accent="therapist" onPick={onOpenPatient} />
    ) : (
      <TeamMeetingListSheet
        accent="therapist"
        meetings={meetings}
        onPick={onPickMeeting}
        onCreate={onCreateMeeting}
      />
    )}
  </div>
);

const Me = ({ onOpenTeam }: { onOpenTeam: () => void }) => (
  <div className="px-4 pt-4 pb-4 space-y-4">
    <div className="bg-card rounded-2xl shadow-card p-5 flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl gradient-therapist flex items-center justify-center text-white text-xl font-bold">王</div>
      <div>
        <div className="text-base font-bold">王雅琴 治疗师</div>
        <div className="text-xs text-muted-foreground mt-0.5">PT/OT 双证 · 8 年</div>
      </div>
    </div>

    <MeStats
      accent="therapist"
      tiles={[
        { label: "本月治疗", value: 248, sub: "次" },
        { label: "患者好评", value: "98%", sub: "满意度" },
        { label: "平均时长", value: "42m", sub: "/次" },
      ]}
      trend={[
        { day: "一", value: 9 }, { day: "二", value: 12 }, { day: "三", value: 11 },
        { day: "四", value: 14 }, { day: "五", value: 13 }, { day: "六", value: 5 }, { day: "日", value: 3 },
      ]}
    />

    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <button onClick={onOpenTeam} className="w-full flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-role-therapist" />
          <span className="text-sm">团队管理</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary-soft text-secondary">配置成员 · 共享患者</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
      {[
        { label: "我的患者", info: `当前共 ${PATIENTS.length} 位患者，本周新增 2 位` },
        { label: "治疗记录", info: "本月共 248 次治疗记录已自动归档至患者档案" },
        { label: "排班管理", info: "本周排班 32 项 · AI 已优化训练室占用率" },
        { label: "知识库", info: "已收藏 18 篇 PT/OT 实训手册，可在患者档案中调阅" },
        { label: "设置", info: "默认手势：双指上滑发起团队会议；震动提醒：开" },
      ].map((it) => (
        <button key={it.label} onClick={() => toast.success(it.info)} className="w-full flex items-center justify-between px-4 py-3.5">
          <span className="text-sm">{it.label}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  </div>
);

/* ===================== Sheets ===================== */

/* ============== 治疗师首次评估（按 PT/OT/ST 类型） ============== */
type ScaleItem = { label: string; value: string; hint?: string };
type ScaleDir = "心肺" | "神经" | "骨科";
const SCALE_LIB: Record<TherapistType, { name: string; desc: string; items: ScaleItem[]; direction?: ScaleDir }[]> = {
  PT: [
    { name: "Fugl-Meyer 下肢 (FMA-LE)", desc: "下肢运动功能 · 满分 34", direction: "神经", items: [
      { label: "髋屈曲（仰卧）", value: "1" },
      { label: "膝屈曲（坐位）", value: "1" },
      { label: "踝背屈（坐位）", value: "0" },
      { label: "协同运动 / 反射", value: "1" },
      { label: "总分", value: "18 / 34", hint: "中度功能障碍" },
    ]},
    { name: "Berg 平衡量表 (BBS)", desc: "动静态平衡 · 满分 56", direction: "神经", items: [
      { label: "由坐到站", value: "3" },
      { label: "无支撑站立 2 min", value: "2" },
      { label: "闭眼站立", value: "2" },
      { label: "转身 360°", value: "2" },
      { label: "总分", value: "32 / 56", hint: "跌倒风险中-高" },
    ]},
    { name: "FAC 步行能力分级", desc: "0-5 级", direction: "神经", items: [
      { label: "分级", value: "2 级", hint: "需治疗师持续接触辅助" },
    ]},
    { name: "改良 Ashworth (MAS)", desc: "肌张力 · 0-4", direction: "神经", items: [
      { label: "膝伸肌", value: "1+" },
      { label: "踝跖屈肌", value: "2", hint: "明显增高" },
    ]},
    { name: "6 分钟步行距离 (6MWT)", desc: "心肺耐力", direction: "心肺", items: [
      { label: "距离", value: "120 m", hint: "受力弱限制" },
      { label: "Borg 主观疲劳", value: "13" },
    ]},
    { name: "徒手肌力 MMT", desc: "0–5 级肌力", direction: "骨科", items: [
      { label: "右下肢", value: "2 级" },
      { label: "右上肢", value: "2 级" },
    ]},
  ],
  OT: [
    { name: "Fugl-Meyer 上肢 (FMA-UE)", desc: "上肢运动功能 · 满分 66", direction: "神经", items: [
      { label: "肩 / 肘 / 前臂", value: "12" },
      { label: "腕", value: "4" },
      { label: "手", value: "6" },
      { label: "协调与速度", value: "2" },
      { label: "总分", value: "24 / 66", hint: "重度上肢障碍" },
    ]},
    { name: "改良 Barthel 指数 (MBI)", desc: "ADL · 满分 100", direction: "神经", items: [
      { label: "进食", value: "5" },
      { label: "穿衣", value: "5" },
      { label: "如厕", value: "5" },
      { label: "转移", value: "8" },
      { label: "总分", value: "45 / 100", hint: "中度依赖" },
    ]},
    { name: "ARAT 上肢动作研究", desc: "抓握 / 捏 / 粗大动作", direction: "神经", items: [
      { label: "抓握", value: "8" },
      { label: "握持", value: "5" },
      { label: "捏", value: "4" },
      { label: "粗大运动", value: "6" },
      { label: "总分", value: "23 / 57" },
    ]},
    { name: "MoCA 蒙特利尔认知", desc: "认知筛查 · 满分 30", direction: "神经", items: [
      { label: "总分", value: "21 / 30", hint: "轻度认知障碍" },
    ]},
    { name: "Lindmark 精细动作", desc: "手部精细", direction: "骨科", items: [
      { label: "九孔插板用时", value: "62 s（患侧）" },
    ]},
  ],
  ST: [
    { name: "WAB 失语症", desc: "西方失语症成套测验", direction: "神经", items: [
      { label: "自发言语", value: "12 / 20" },
      { label: "听理解", value: "6.5 / 10" },
      { label: "复述", value: "5 / 10" },
      { label: "命名", value: "6 / 10" },
      { label: "失语商 AQ", value: "59.0", hint: "中度运动性失语" },
    ]},
    { name: "洼田饮水试验", desc: "1-5 级", direction: "神经", items: [
      { label: "分级", value: "3 级", hint: "可疑误吸 · 建议 VFSS" },
    ]},
    { name: "标准吞咽功能 (SSA)", desc: "床旁筛查", direction: "神经", items: [
      { label: "意识 / 头控制", value: "正常" },
      { label: "饮水反应", value: "呛咳 1 次" },
      { label: "总分", value: "28 / 46", hint: "异常" },
    ]},
    { name: "构音障碍 Frenchay", desc: "构音器官检查", direction: "神经", items: [
      { label: "唇 / 舌 / 软腭", value: "中度异常" },
      { label: "言语清晰度", value: "60%" },
    ]},
    { name: "MMSE 简易精神状态", desc: "认知 · 满分 30", direction: "神经", items: [
      { label: "总分", value: "23 / 30", hint: "轻度认知下降" },
    ]},
  ],
};


const TH_CLINICAL_CONCLUSIONS = [
  { role: "医师 · 李志远", time: "今日 09:30", text: "急性缺血性脑卒中，BP 偏高 / LDL 偏高 / 阵发性房颤，需启动二级预防 + 抗凝评估。", tone: "doctor" as const },
  { role: "护士 · 赵静怡", time: "今日 10:15", text: "意识嗜睡、骶尾发红，跌倒 / 压疮 / VTE 均高危，已启动三大风险护理预案。", tone: "nurse" as const },
];
const TH_REHAB_CONCLUSIONS = [
  { role: "医师 · 李志远", time: "今日 09:35", text: "神经方向为主、心肺方向为辅；NIHSS 14 / mRS 4，建议床边 + Bobath 起步。", tone: "doctor" as const },
  { role: "PT 治疗师 · 王雅琴", time: "今日 10:40", text: "Berg 32、FAC 2 级、6MWT 120m；先 1 周等长收缩，再渐进负重转移。", tone: "therapist" as const },
];

const FirstAssessSheet = ({ patient, type, onChangeType }: { patient?: string; type: TherapistType; onChangeType: (t: TherapistType) => void }) => {
  const name = patient ? patient.split(" ")[0] : "孙德强";
  const scales = SCALE_LIB[type];
  const [data, setData] = useState(scales);
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [tab, setTab] = useState<EvalTabKey>("rehab");
  const switchType = (t: TherapistType) => { onChangeType(t); setData(SCALE_LIB[t]); };
  const update = (si: number, ii: number, v: string) => {
    setData(prev => prev.map((s, i) => i !== si ? s : { ...s, items: s.items.map((it, j) => j !== ii ? it : { ...it, value: v }) }));
  };

  const scalesBlock = (
    <>
      <div>
        <div className="text-[11px] text-muted-foreground mb-1.5 px-1">当前治疗师类型 · 决定评估量表组</div>
        <div className="flex items-center gap-1.5 bg-muted rounded-full p-1">
          {(["PT", "OT", "ST"] as TherapistType[]).map((t) => {
            const active = type === t;
            const label = t === "PT" ? "PT 物理治疗" : t === "OT" ? "OT 作业治疗" : "ST 言语 / 吞咽";
            return (
              <button key={t} onClick={() => switchType(t)} className={`flex-1 text-[11px] py-1.5 rounded-full font-semibold transition-all ${active ? "gradient-therapist text-white shadow-card" : "text-foreground/70"}`}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <SectionTitle title={`${type} 评估量表 · ${data.length} 项`} extra={<button onClick={() => toast("已添加自定义量表")} className="text-[11px] text-secondary font-semibold flex items-center gap-1"><Plus className="w-3 h-3" />补充量表</button>} />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        {data.map((s, si) => {
          const open = expanded === si;
          return (
            <div key={s.name} className="px-3 py-2.5">
              <button onClick={() => setExpanded(open ? null : si)} className="w-full flex items-center gap-2 text-left">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[12px] font-semibold truncate">{s.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary-soft text-secondary font-semibold shrink-0">
                      {type}{s.direction ? `-${s.direction}方向` : ""}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{s.desc}</div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded bg-ai/10 text-ai font-semibold flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" />AI 预填</span>
                <span className="text-[11px] text-secondary font-semibold ml-1">{open ? "收起" : "查看 / 修改"}</span>
                <button onClick={(e) => { e.stopPropagation(); setData(data.filter((_, i) => i !== si)); toast.success(`已删除「${s.name}」`); }} className="text-[10px] text-destructive ml-1 px-1.5 py-0.5 rounded border border-destructive/30">删除</button>
              </button>
              {open && (
                <div className="mt-2 divide-y divide-border/60 bg-muted/30 rounded-xl">
                  {s.items.map((it, ii) => (
                    <div key={ii} className="flex items-center justify-between px-3 py-2">
                      <div>
                        <div className="text-[12px] text-foreground">{it.label}</div>
                        {it.hint && <div className="text-[10px] text-muted-foreground mt-0.5">{it.hint}</div>}
                      </div>
                      <input value={it.value} onChange={(e) => update(si, ii, e.target.value)} className="w-28 text-right bg-card rounded px-2 py-1 text-xs" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SectionTitle title="治疗师补充备注" />
      <div className="bg-card rounded-2xl shadow-card p-3">
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="临床触诊 / 患者主诉 / 评估过程中的偏差..." className="w-full bg-muted rounded-xl p-3 text-xs h-24 outline-none" />
      </div>
    </>
  );

  return (
    <div className="p-4 space-y-3">
      {/* 患者信息 */}
      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-therapist text-white flex items-center justify-center font-bold text-lg">{name[0]}</div>
          <div className="flex-1">
            <div className="text-sm font-bold">{patient || "孙德强 · 男 60 · 床315"}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">急性缺血性脑卒中 · 入院第 1 天 · 主管医师：李志远</div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-secondary-soft text-secondary font-semibold">首次评估</span>
        </div>
      </div>

      <EvalTabs active={tab} onChange={setTab} accent="therapist" hideClinical />

      {tab === "rehab" && (
        <RehabPanel
          scaleSlot={scalesBlock}
          conclusions={TH_REHAB_CONCLUSIONS}
          aiBottom={
            <AICard title="AI 康复评估辅助结论">
              <div className="text-[12px] leading-relaxed whitespace-pre-line">
                {`基于 ${type} 量表 + 医师诊断综合分析：
1. 重点障碍：${type === "PT" ? "平衡 Berg 32 / FAC 2 级 / 6MWT 120m" : type === "OT" ? "FMA-UE 24 / MBI 45 / 患手任务表现差" : "EAT-10 4 分 / 构音 78% / 进食呛咳"}。
2. 训练建议：先 1 周等长收缩 + 床旁起步，第 2 周渐进负重转移，强度按 RPE 12-14。
3. 风险提示：跌倒高危，下地训练需双人保护并监测血压心率。`}
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground">AI · 基于 {type} 量表与患者档案综合生成</div>
            </AICard>
          }
        />
      )}
      {tab === "goal" && (
        <div className="space-y-3">
          <AICard title="治疗目标 · 基于 ICF + SMART 原则">
            治疗师目标基于 <b>ICF</b>（身体功能 / 活动 / 参与）三个维度自动展开，并遵循 <b>SMART</b> 原则：
            <span className="text-foreground/80">具体（Specific）· 可衡量（Measurable）· 可达成（Achievable）· 相关（Relevant）· 有时限（Time-bound）</span>。
            每条目标含「衡量指标 + 周期」，可编辑、删除或新增。
          </AICard>
          <NumberedGoals accent="therapist" />
        </div>
      )}
    </div>
  );
};

const ConfirmAssessSheet = ({ patient }: { patient?: string }) => {
  const name = patient ? patient.split(" ")[0] : "王秀英";
  return (
    <div className="p-4 space-y-3">
      {/* 患者档案概要 - 与医师端一致 */}
      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-therapist text-white flex items-center justify-center font-bold text-lg">{name[0]}</div>
          <div className="flex-1">
            <div className="text-sm font-bold">{patient || "王秀英 · 女 68 岁"}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">床号 305 · 入院第 5 天 · 髋关节置换术后</div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-secondary-soft text-secondary font-semibold">评估确认</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <StatChip label="Harris" value="65" accent="primary" />
          <StatChip label="Berg" value="32" accent="warning" />
          <StatChip label="VAS" value="6" accent="warning" />
        </div>
      </div>

      <SectionTitle title="档案信息（医师同步）" />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="主诉" value="右髋疼痛伴活动受限 3 个月" />
        <FormRow label="既往史" value="高血压 8 年 · 糖尿病 5 年" />
        <FormRow label="手术史" value="2026-04-23 右髋关节置换术" />
        <FormRow label="并发症风险" value="DVT 中 · 跌倒高" />
      </div>

      <AICard title="AI 康复评估意见（医师推送）">
        Harris 65 / Berg 32 / VAS 6。综合判定：术后早期，疼痛是主要限制因素；康复潜力良好。
        建议进入「目标设定 → 方案制定」，重点：疼痛干预 + 渐进负重 + 平衡训练。
      </AICard>

      <SectionTitle title="治疗师补充意见（必填）" extra={<span className="text-[10px] text-muted-foreground">将与 AI 意见一同呈现给医师</span>} />
      <div className="bg-card rounded-2xl shadow-card p-3">
        <textarea
          defaultValue="实际触诊：右髋屈曲 60°、外展 25°，主动活动时 VAS 7；床椅转移需中等辅助。建议先 1 周疼痛干预 + 等长收缩，再渐进负重。"
          placeholder="补充观察、ROM 实测、患者主诉……"
          className="w-full bg-muted rounded-xl p-3 text-xs h-28 outline-none"
        />
      </div>

      <SectionTitle title="逐项确认" />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="Harris 髋关节" value="65 ✓" />
        <FormRow label="Berg 平衡" value="32 ✓" />
        <FormRow label="VAS 疼痛" value="6 ⚠️" hint="较高，建议先疼痛干预" />
        <FormRow label="ROM 屈曲（实测）" value="60° / 100°" />
      </div>
    </div>
  );
};

/* ============== ICF + SMART 治疗目标（治疗师端，含可衡量指标与子目标） ============== */
type ICFDim = "function" | "activity" | "participation";
type Goal = {
  id: string;
  dim: ICFDim;
  text: string;
  period: "1 周" | "2 周" | "4 周" | "8 周";
  source: "AI" | "医师" | "治疗师";
  measure?: string;
  subs: { id: string; text: string; by: string }[];
};

const ICF_DIM: Record<ICFDim, { label: string; desc: string; cls: string }> = {
  function: { label: "身体功能与结构", desc: "Body Functions · 损伤层面：肌力 / 张力 / 感觉 / 认知", cls: "bg-primary-soft text-primary" },
  activity: { label: "活动", desc: "Activity · 个体执行任务的能力：转移 / 步行 / ADL", cls: "bg-secondary-soft text-secondary" },
  participation: { label: "参与", desc: "Participation · 投入生活情境：家庭 / 社交 / 工作", cls: "bg-warning-soft text-warning" },
};

const DEFAULT_GOALS: Goal[] = [
  { id: "g1", dim: "function", period: "4 周", source: "医师", text: "右上下肢肌力由 2 级提升至 3+ 级，痉挛 MAS ≤ 1+", measure: "MMT ≥ 3+ · MAS ≤ 1+", subs: [
    { id: "g1s1", text: "PT：右下肢直腿抬高 ×10/组 ×3 组，渐进抗阻", by: "PT 王雅琴" },
    { id: "g1s2", text: "PT：腘绳肌牵伸 30s ×3，每日 2 次", by: "PT 王雅琴" },
    { id: "g1s3", text: "OT：右上肢 Bobath 抑制性手法 + 主动伸展训练", by: "OT 林思" },
  ] },
  { id: "g2", dim: "function", period: "4 周", source: "AI", text: "MoCA 由 18 提升至 ≥ 24，左侧空间忽略明显改善", measure: "MoCA ≥ 24", subs: [
    { id: "g2s1", text: "ST：左侧视觉扫描训练 15min/次 ×2/日", by: "ST 周敏" },
    { id: "g2s2", text: "OT：分类卡片 + 数字消除任务（含左侧目标）", by: "OT 林思" },
  ] },
  { id: "g3", dim: "activity", period: "2 周", source: "医师", text: "床椅转移独立完成，助行器辅助步行 30m", measure: "Berg ≥ 40 · 步行 ≥ 30m", subs: [
    { id: "g3s1", text: "PT：坐站转换连续 5 次 / 不借助上肢", by: "PT 王雅琴" },
    { id: "g3s2", text: "PT：平行杠内步行 20m ×2 组，步态对称性 ≥ 80%", by: "PT 王雅琴" },
    { id: "g3s3", text: "OT：床→轮椅独立转移成功率 ≥ 90%", by: "OT 林思" },
  ] },
  { id: "g4", dim: "activity", period: "4 周", source: "AI", text: "独立步行 ≥ 50m（FAC ≥ 3），Barthel ≥ 75", measure: "FAC ≥ 3 · Barthel ≥ 75", subs: [
    { id: "g4s1", text: "PT：助行器步行 50m，休息 ≤ 1 次", by: "PT 王雅琴" },
    { id: "g4s2", text: "OT：穿衣 / 进食独立完成（Barthel 单项 ≥ 8）", by: "OT 林思" },
  ] },
  { id: "g5", dim: "participation", period: "8 周", source: "AI", text: "回归家庭：可独立完成进食、如厕、穿衣，参与家庭对话", measure: "独立完成 ADL 6 项", subs: [
    { id: "g5s1", text: "ST：日常对话 5 轮以上，言语清晰度 ≥ 80%", by: "ST 周敏" },
    { id: "g5s2", text: "OT：模拟厨房活动 25min（取物 / 倒水 / 整理）", by: "OT 林思" },
  ] },
];

const GoalAdjustSheet = ({ patient }: { patient?: string }) => {
  const name = patient ? patient.split(" ")[0] : "李 强";
  const [goals, setGoals] = useState<Goal[]>(DEFAULT_GOALS);
  const [adding, setAdding] = useState<ICFDim | null>(null);
  const [draft, setDraft] = useState("");
  const [subFor, setSubFor] = useState<string | null>(null);
  const [subDraft, setSubDraft] = useState("");

  const addGoal = (dim: ICFDim) => {
    if (!draft.trim()) return;
    setGoals([...goals, { id: `g${Date.now()}`, dim, period: "4 周", source: "治疗师", text: draft.trim(), subs: [] }]);
    setDraft(""); setAdding(null);
    toast.success("已新增大目标");
  };
  const addSub = (goalId: string) => {
    if (!subDraft.trim()) return;
    setGoals(goals.map((g) => g.id === goalId ? { ...g, subs: [...g.subs, { id: `s${Date.now()}`, text: subDraft.trim(), by: "治疗师 王雅琴" }] } : g));
    setSubDraft(""); setSubFor(null);
    toast.success("已新增子目标");
  };

  return (
    <div className="p-4 space-y-3">
      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-therapist text-white flex items-center justify-center font-bold text-lg">{name[0]}</div>
          <div className="flex-1">
            <div className="text-sm font-bold">{patient || "李 强 · 男 42 · 床307"}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">脊髓损伤 · 入院第 28 天 · 主管医师：李志远</div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-secondary-soft text-secondary font-semibold">ICF + SMART</span>
        </div>
      </div>

      <AICard title="治疗目标 · 基于 ICF + SMART 原则">
        承接医师的 ICF 粗目标，按 <b>SMART</b>（具体 / 可衡量 / 可达成 / 相关 / 有时限）原则细化为治疗目标——每条含「衡量指标 + 周期 + 子目标」，可编辑或新增并回传医师。
      </AICard>

      {(Object.keys(ICF_DIM) as ICFDim[]).map((dim) => {
        const list = goals.filter((g) => g.dim === dim);
        const meta = ICF_DIM[dim];
        return (
          <div key={dim} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${meta.cls}`}>{meta.label}</span>
                  <span className="text-[10px] text-muted-foreground">{list.length} 项</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{meta.desc}</div>
              </div>
              <button
                onClick={() => { setAdding(dim); setDraft(""); }}
                className="text-[11px] font-semibold text-secondary flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />添加目标
              </button>
            </div>

            <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
              {list.map((g) => (
                <div key={g.id} className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground/70 font-semibold">{g.period}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${g.source === "AI" ? "bg-ai/10 text-ai" : g.source === "医师" ? "bg-primary-soft text-primary" : "bg-secondary-soft text-secondary"}`}>
                          {g.source}
                        </span>
                      </div>
                      <div className="text-[12px] text-foreground/90 mt-1 leading-relaxed">{g.text}</div>
                      {g.measure && (
                        <div className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] bg-secondary-soft text-secondary px-2 py-0.5 rounded font-semibold">
                          <span className="opacity-70">衡量指标</span>· {g.measure}
                        </div>
                      )}
                    </div>
                  </div>

                  {g.subs.length > 0 && (
                    <div className="mt-2 pl-3 border-l-2 border-border space-y-1.5">
                      {g.subs.map((s) => (
                        <div key={s.id} className="text-[11px] text-foreground/75 leading-relaxed">
                          <span className="text-muted-foreground">└ </span>{s.text}
                          <span className="text-[10px] text-muted-foreground ml-1.5">· {s.by}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {subFor === g.id ? (
                    <div className="mt-2 flex gap-2">
                      <input
                        value={subDraft}
                        onChange={(e) => setSubDraft(e.target.value)}
                        placeholder="输入子目标，例如：PT 坐站转换 ×5/组"
                        className="flex-1 text-[11px] bg-background border border-border rounded-lg px-2 py-1.5"
                        autoFocus
                      />
                      <button onClick={() => addSub(g.id)} className="text-[11px] gradient-therapist text-white rounded-lg px-3 font-semibold">添加</button>
                      <button onClick={() => setSubFor(null)} className="text-[11px] text-muted-foreground">取消</button>
                    </div>
                  ) : (
                    <button onClick={() => { setSubFor(g.id); setSubDraft(""); }} className="mt-2 text-[11px] text-secondary font-semibold flex items-center gap-1">
                      <Plus className="w-3 h-3" />添加子目标
                    </button>
                  )}
                </div>
              ))}

              {adding === dim && (
                <div className="px-4 py-3 bg-muted/40">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`输入「${meta.label}」层面的大目标，例如：${dim === "function" ? "肌力提升至 4 级" : dim === "activity" ? "独立完成室内行走" : "回归社区活动"}`}
                    className="w-full text-[11px] bg-background border border-border rounded-lg p-2 min-h-[60px]"
                    autoFocus
                  />
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => setAdding(null)} className="flex-1 text-[11px] border border-border rounded-lg py-1.5">取消</button>
                    <button onClick={() => addGoal(dim)} className="flex-1 text-[11px] gradient-therapist text-white rounded-lg py-1.5 font-semibold">保存</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className="text-[10px] text-muted-foreground text-center pt-2">
        ICF · International Classification of Functioning, Disability and Health
      </div>
    </div>
  );
};

const ScheduleSheet = () => (
  <div className="p-4 space-y-3">
    <AICard title="资源平台 AI 自动排班">已根据治疗师空闲时段、训练室占用、患者偏好生成排班，可手动调整。</AICard>
    <div className="bg-card rounded-2xl shadow-card p-4 space-y-2">
      {["09:00 张建国 · A-301", "10:30 王秀英 · A-303", "14:00 李 强 · B-201", "15:30 陈丽华 · B-205", "16:30 刘伟明 · A-301"].map((s) => (
        <div key={s} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
          <span className="text-[12px]">{s}</span>
          <div className="flex gap-1">
            <button className="text-[10px] px-2 py-1 rounded bg-muted">改时间</button>
            <button className="text-[10px] px-2 py-1 rounded bg-muted">换室</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RxAdjustSheet = ({ patient }: { patient?: string }) => (
  <RxDetail patient={patient} accent="therapist" />
);

const ExecSheet = () => (
  <div className="p-4 space-y-3">
    <div className="rounded-2xl gradient-therapist text-white p-5">
      <div className="text-xs opacity-80">正在执行 · OT</div>
      <div className="text-xl font-bold mt-1">厨房活动训练</div>
      <div className="text-xs opacity-90 mt-2">25 分钟 · 已用 12:30</div>
    </div>
    <SectionTitle title="动作分解 · AI 引导" />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      {["站立位取物", "持物移动 1m", "切菜动作模拟", "倒水 + 端杯", "整理收纳"].map((a, i) => (
        <FormRow key={a} label={`${i + 1}. ${a}`} value={i < 2 ? <CheckCircle2 className="w-4 h-4 text-success" /> : <span className="text-[11px] text-muted-foreground">待完成</span>} />
      ))}
    </div>
    <AICard title="实时反馈">患者本次任务负重耐受良好，建议下次增加 5min。</AICard>
  </div>
);

const SummarySheet = ({ patient }: { patient?: string }) => {
  const name = patient ? patient.split(" ")[0] : "张建国";
  const aiDraft = `${name} 今日完成 PT 下肢力量训练（3×10）与 OT 厨房活动训练 25min，主观 Borg 9，疼痛 VAS 由 5 降至 3。步态对称性改善约 8%，转移动作由中等辅助降为轻度辅助。建议明日加入精细动作训练并维持现有强度。`;
  const [record, setRecord] = useState(aiDraft);
  const [med, setMed] = useState("");
  const [recording, setRecording] = useState<null | "record" | "med">(null);

  const toggleVoice = (field: "record" | "med") => {
    if (recording === field) {
      setRecording(null);
      toast.success("语音已转写并追加");
      const sample = field === "record" ? " 患者反馈步行时髋部酸胀感减轻。" : " 巴氯芬剂量维持 10mg bid。";
      if (field === "record") setRecord((v) => v + sample);
      else setMed((v) => v + sample);
    } else {
      setRecording(field);
      toast("正在录音，再次点击结束");
    }
  };

  const regenerate = () => {
    setRecord(aiDraft);
    toast.success("已用 AI 重新总结");
  };

  return (
    <div className="p-4 space-y-3">
      {/* 患者信息卡 */}
      <div className="bg-card rounded-2xl shadow-card p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl gradient-therapist text-white flex items-center justify-center font-bold text-lg">
          {name[0]}
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold">{patient || "张建国 · 床A-301"}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">本日小结 · 2026-05-06</div>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-secondary-soft text-secondary font-semibold">每日小结</span>
      </div>

      <AICard
        title="AI 智能总结"
        action={
          <button onClick={regenerate} className="text-[11px] px-3 py-1 rounded-full bg-ai text-ai-foreground font-semibold">
            重新生成
          </button>
        }
      >
        基于今日训练记录、客观指标与历史数据，为 {name} 自动生成本日治疗小结草稿。可在下方二次编辑或语音补充。
      </AICard>

      <SectionTitle title="本患者今日治疗" extra={<span className="text-[10px] text-muted-foreground">将归入该患者档案</span>} />
      <div className="bg-card rounded-2xl shadow-card p-4 space-y-3">
        <div>
          <div className="text-[11px] text-muted-foreground mb-1">完成训练项</div>
          <div className="text-sm font-semibold">PT 下肢力量 · OT 厨房活动 · 共 2 项 / 55 分钟</div>
        </div>
        <div>
          <div className="text-[11px] text-muted-foreground mb-1">患者主观感受 (Borg)</div>
          <div className="flex gap-1">
            {[6, 7, 8, 9, 10, 11, 12].map((n) => (
              <button key={n} className={`flex-1 py-2 rounded-lg text-xs ${n === 9 ? "gradient-therapist text-white" : "bg-muted"}`}>{n}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-[11px] text-muted-foreground">治疗记录（AI 草稿，可编辑）</div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => toggleVoice("record")}
                className={`text-[10px] px-2 py-1 rounded-full font-semibold ${recording === "record" ? "bg-destructive text-white animate-pulse" : "bg-secondary-soft text-secondary"}`}
              >
                {recording === "record" ? "● 录音中" : "🎙 语音输入"}
              </button>
              <button
                onClick={() => { setRecord(""); toast("已清空治疗记录"); }}
                className="text-[10px] px-2 py-1 rounded-full bg-muted text-foreground/70 font-semibold"
              >
                一键清空
              </button>
            </div>
          </div>
          <textarea value={record} onChange={(e) => setRecord(e.target.value)} className="w-full bg-muted rounded-xl p-3 text-xs h-28 outline-none" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-[11px] text-muted-foreground">药物变动 / 反馈</div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => toggleVoice("med")}
                className={`text-[10px] px-2 py-1 rounded-full font-semibold ${recording === "med" ? "bg-destructive text-white animate-pulse" : "bg-secondary-soft text-secondary"}`}
              >
                {recording === "med" ? "● 录音中" : "🎙 语音输入"}
              </button>
              <button
                onClick={() => { setMed(""); toast("已清空药物变动"); }}
                className="text-[10px] px-2 py-1 rounded-full bg-muted text-foreground/70 font-semibold"
              >
                一键清空
              </button>
            </div>
          </div>
          <textarea value={med} onChange={(e) => setMed(e.target.value)} placeholder="如：巴氯芬调整为 10mg bid，肌张力下降..." className="w-full bg-muted rounded-xl p-3 text-xs h-20 outline-none" />
        </div>
      </div>
    </div>
  );
};

/* ============== 医嘱 Tab ============== */
const RxTab = ({ onPick }: { onPick: (item: TodoItem) => void }) => (
  <div className="pb-4">
    <div className="gradient-therapist px-5 pt-6 pb-6 text-white relative overflow-hidden">
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative">
        <div className="text-xs opacity-80">康复方案</div>
        <div className="text-[15px] font-semibold mt-0.5">待确认康复方案 · {QUEUES.rx.length} 位</div>
        <div className="text-[11px] opacity-80 mt-1">康复整体计划 · 全套训练 + 流程安排，含居家训练</div>
      </div>
    </div>
    <div className="px-4 pt-4">
      <TodoQueueList accent="therapist" items={QUEUES.rx} onPick={onPick} />
    </div>
  </div>
);

const UploadDailySheet = () => (
  <div className="p-4 space-y-3">
    <AICard title="手动上传每日治疗情况">支持工作小结、药物变动、训练记录等，提交后自动归入对应患者档案。</AICard>
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="患者" value={<select className="bg-muted rounded px-2 py-1 text-xs">{PATIENTS.map(p => <option key={p.id}>{p.name} · 床{p.bed}</option>)}</select>} />
      <FormRow label="治疗类型" value={<select className="bg-muted rounded px-2 py-1 text-xs"><option>PT</option><option>OT</option><option>ST</option></select>} />
      <FormRow label="记录类型" value={<select className="bg-muted rounded px-2 py-1 text-xs"><option>工作小结</option><option>药物变动</option><option>训练记录</option></select>} />
    </div>
    <textarea placeholder="详细描述..." className="w-full bg-card border border-border rounded-2xl p-3 text-xs h-32 outline-none" defaultValue="患者今日完成 PT 步态训练 30min，步频提高 8%，无不良反应。" />
  </div>
);

const MedSheet = () => (
  <div className="p-4 space-y-3">
    <AICard title="药物变动联动护士端">治疗师观察到的药物相关反馈将同步医生与护士。</AICard>
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="患者" value="李 强 ▾" />
      <FormRow label="药物" value="巴氯芬 ▾" />
      <FormRow label="变动类型" value="剂量调整 ▾" />
      <FormRow label="新剂量" value={<input defaultValue="10mg bid" className="w-24 bg-muted rounded px-2 py-1 text-xs text-right" />} />
    </div>
    <textarea placeholder="变动原因 / 治疗师观察..." className="w-full bg-card border border-border rounded-2xl p-3 text-xs h-20 outline-none" />
  </div>
);

/* ============== 角色切换：治疗师 / 治疗师长 ============== */
const RoleSwitch = ({ role, onChange }: { role: "therapist" | "lead"; onChange: (r: "therapist" | "lead") => void }) => (
  <div className="px-4 pt-3">
    <div className="flex items-center gap-1.5 bg-muted rounded-full p-1">
      {(["therapist", "lead"] as const).map((r) => {
        const active = role === r;
        return (
          <button
            key={r}
            onClick={() => onChange(r)}
            className={`flex-1 text-[11px] py-1.5 rounded-full font-semibold transition-all ${active ? "gradient-therapist text-white shadow-card" : "text-foreground/70"}`}
          >
            {r === "therapist" ? "治疗师视角" : "治疗师长视角"}
          </button>
        );
      })}
    </div>
  </div>
);

/* ============== 排班视图：治疗师本人 / 治疗师长全员 ============== */
const MY_SCHEDULE: { time: string; patient: string; bed: string; type: "PT" | "OT" | "ST"; room: string; duration: string }[] = [
  { time: "09:00", patient: "张建国", bed: "303", type: "PT", room: "A-301", duration: "45 min" },
  { time: "10:30", patient: "王秀英", bed: "305", type: "PT", room: "A-303", duration: "30 min" },
  { time: "14:00", patient: "李 强", bed: "307", type: "OT", room: "B-201", duration: "45 min" },
  { time: "15:30", patient: "陈丽华", bed: "310", type: "ST", room: "B-205", duration: "30 min" },
  { time: "16:30", patient: "刘伟明", bed: "A-301", type: "PT", room: "A-301", duration: "45 min" },
];

const TEAM_SCHEDULE: { therapist: string; cert: string; items: { time: string; patient: string; bed: string; type: "PT" | "OT" | "ST"; room: string }[] }[] = [
  {
    therapist: "王雅琴", cert: "PT/OT · 8 年", items: [
      { time: "09:00", patient: "张建国", bed: "303", type: "PT", room: "A-301" },
      { time: "10:30", patient: "王秀英", bed: "305", type: "PT", room: "A-303" },
      { time: "14:00", patient: "李 强", bed: "307", type: "OT", room: "B-201" },
    ],
  },
  {
    therapist: "陈治疗师", cert: "OT · 5 年", items: [
      { time: "09:30", patient: "陈丽华", bed: "310", type: "OT", room: "B-202" },
      { time: "11:00", patient: "张建国", bed: "303", type: "OT", room: "B-202" },
      { time: "15:00", patient: "李 强", bed: "307", type: "OT", room: "B-201" },
    ],
  },
  {
    therapist: "陈思雨", cert: "ST · 6 年", items: [
      { time: "10:00", patient: "陈丽华", bed: "310", type: "ST", room: "B-205" },
      { time: "14:30", patient: "李 强", bed: "307", type: "ST", room: "B-205" },
    ],
  },
  {
    therapist: "李建华", cert: "PT · 4 年", items: [
      { time: "09:00", patient: "周建华", bed: "311", type: "PT", room: "A-302" },
      { time: "13:30", patient: "刘伟明", bed: "A-301", type: "PT", room: "A-302" },
    ],
  },
];

const typeColor = (t: "PT" | "OT" | "ST") =>
  t === "PT" ? "bg-primary/10 text-primary" : t === "OT" ? "bg-secondary-soft text-secondary" : "bg-success-soft text-success";

const ScheduleView = ({ role }: { role: "therapist" | "lead" }) => {
  if (role === "therapist") {
    return (
      <div className="p-4 space-y-3">
        <AICard title="今日排班 · AI 已优化训练室占用">
          共 {MY_SCHEDULE.length} 项治疗 · 时间段 09:00 - 16:30。点击单项可查看患者档案。
        </AICard>
        <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
          {MY_SCHEDULE.map((s, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
              <div className="text-[12px] font-bold w-12 text-foreground">{s.time}</div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${typeColor(s.type)}`}>{s.type}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold truncate">{s.patient} <span className="text-muted-foreground font-normal">· 床 {s.bed}</span></div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.room} · {s.duration}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  // 治疗师长视图：横向时间 × 纵向人员的矩阵表
  const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:30"];
  const total = TEAM_SCHEDULE.reduce((n, t) => n + t.items.length, 0);
  return (
    <div className="p-4 space-y-3">
      <AICard title="治疗师长 · 全员排班总览">
        共 {TEAM_SCHEDULE.length} 位治疗师 · {total} 项治疗 · 横向时间 / 纵向人员，<span className="font-semibold text-secondary">高亮行为我本人排班</span>。点击单元格可调整 / 转派。
      </AICard>
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="text-[10px] border-collapse min-w-full">
            <thead>
              <tr className="bg-muted/60">
                <th className="sticky left-0 z-10 bg-muted/60 px-2 py-2 text-left font-semibold text-foreground border-r border-border/60 w-[88px]">治疗师</th>
                {SLOTS.map((t) => (
                  <th key={t} className="px-1.5 py-2 font-semibold text-muted-foreground border-r border-border/60 last:border-0 w-[60px]">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TEAM_SCHEDULE.map((row) => {
                const isMine = row.therapist === "王雅琴";
                return (
                <tr key={row.therapist} className={`border-t border-border/60 ${isMine ? "bg-secondary-soft/40" : ""}`}>
                  <td className={`sticky left-0 z-10 px-2 py-2 border-r border-border/60 align-top ${isMine ? "bg-secondary-soft/60" : "bg-card"}`}>
                    <div className="text-[11px] font-bold leading-tight flex items-center gap-1">
                      {row.therapist}
                      {isMine && <span className="text-[8px] px-1 py-px rounded bg-secondary text-white font-bold">我</span>}
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{row.cert}</div>
                  </td>
                  {SLOTS.map((slot) => {
                    const item = row.items.find((i) => i.time === slot);
                    return (
                      <td key={slot} className="px-1 py-1 border-r border-border/60 last:border-0 align-top">
                        {item ? (
                          <button
                            onClick={() => toast(`${row.therapist} · ${item.time} · ${item.patient}`)}
                            className={`w-full rounded-md px-1 py-1 text-left ${typeColor(item.type)} ${isMine ? "ring-2 ring-secondary/60" : ""}`}
                          >
                            <div className="font-bold leading-tight">{item.type}</div>
                            <div className="leading-tight truncate">{item.patient}</div>
                            <div className="text-[9px] opacity-75 leading-tight truncate">{item.room}</div>
                          </button>
                        ) : (
                          <div className="h-10 rounded-md border border-dashed border-border/50" />
                        )}
                      </td>
                    );
                  })}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground px-1">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-primary/30" />PT</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-secondary-soft" />OT</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-success-soft" />ST</span>
        <span className="ml-auto">空白格 = 空闲时段</span>
      </div>
    </div>
  );
};
