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
  ScanLine,
  BedDouble,
  ArrowRight,
  NotebookPen,
  Plus,
  FileText,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { MeStats } from "@/components/app/MeStats";

// (护理首评已切换为 V-VST / NRS2002 量表，不再使用 EvalShared 的 Tabs/RehabPanel)

const NURSE_TABS: TabBarItem[] = [
  { key: "home", label: "工作台", icon: HomeIcon },
  { key: "patients", label: "患者管理", icon: UsersRound },
  { key: "edu", label: "宣教", icon: BookOpen },
  { key: "chat", label: "患者沟通", icon: MessageCircle, badge: PATIENT_UNREAD },
  { key: "me", label: "我的", icon: UserIcon },
];

type SheetKey =
  | null
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
  | "followUpList"
  | "intakeScan"
  | "intakeBed";

type QueueKey = "confirmAssess";

const QUEUE_TITLE: Record<QueueKey, string> = {
  confirmAssess: "待首次评估",
};

// 根据康复处方生成的待办（按患者维度）
const QUEUES: Record<QueueKey, TodoItem[]> = {
  confirmAssess: [
    { id: "ca1", patient: "305 王秀英", meta: "髋关节置换术后", detail: "护理首评 · 一般情况 / ADL / 风险评估", urgency: "high" },
    { id: "ca2", patient: "311 周建华", meta: "脑梗死恢复期", detail: "护理首评 · 跌倒 / 压疮 / VTE / 营养", urgency: "medium" },
  ],
};

export type FollowUpStatus = "pending" | "done" | "needRevisit";
export interface FollowUpPatient {
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
export const FOLLOW_UPS: FollowUpPatient[] = [
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
  const [intake, setIntake] = useState<IntakeState>({
    name: "", sex: "", age: "", diagnosis: "", admitNo: "", bed: "", step: 1,
  });
  const [pendingBed, setPendingBed] = useState<IntakeRecord[]>([
    { id: "pb-demo", name: "孙慧敏", sex: "女", age: "62", diagnosis: "腰椎间盘突出术后", admitNo: "RY-20260622-007", bed: "" },
  ]);
  const [pendingAssess, setPendingAssess] = useState<IntakeRecord[]>([]);
  const [bedTargetId, setBedTargetId] = useState<string | null>(null);
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
          pendingBed={pendingBed}
          pendingAssessCount={pendingAssess.length + QUEUES.confirmAssess.length}
          onScanIntake={() => { setBedTargetId(null); setIntake({ name: "", sex: "", age: "", diagnosis: "", admitNo: "", bed: "", step: 1 }); open("intakeScan"); }}
          onFillBed={(rec) => {
            setBedTargetId(rec.id);
            setIntake({ ...rec, step: 2 });
            open("intakeBed");
          }}
          onOpenAssessQueue={() => openQueue("confirmAssess")}
        />
      )}
      {tab === "patients" && (
        <PatientsPage
          accent="nurse"
          onPick={pickPatient}
          initialFilter={patientsFilter}
          onAction={(key, p) => {
            if (key === "assess") {
              setActivePatient(`${p.name} · 床${p.bed}`);
              setPickedPatient({ ...p, notes: patientNotes[p.id] ?? p.notes });
              setSheet("confirmAssess");
            }
          }}
        />
      )}
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

      {(Object.keys(QUEUES) as QueueKey[]).map((k) => (
        <PhoneSheet key={k} open={queue === k} onClose={closeQueue} title={QUEUE_TITLE[k]} accent="nurse">
          <TodoQueueList accent="nurse" items={QUEUES[k]} onPick={(item) => pickFromQueue(item, queueToSheet[k])} />
        </PhoneSheet>
      ))}

      <PhoneSheet open={sheet === "confirmAssess"} onClose={close} title={`首次评估${activePatient ? " · " + activePatient : ""}`} accent="nurse"
        footer={<div className="flex gap-3">
          <button onClick={() => { setActiveMeeting(null); setSheet("meeting"); }} className="flex-1 border border-primary/60 text-primary bg-card rounded-full py-3 text-sm font-semibold">团队会议评估</button>
          <button onClick={() => { toast.success("首次评估已确认 · 已同步医师 / 治疗师"); close(); }} className="flex-1 gradient-nurse text-white rounded-full py-3 text-sm font-semibold shadow-card">确认首次评估</button>
        </div>}>
        <NurseFirstAssessSheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "intakeScan"} onClose={close} title="扫入院单" accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => {
          const filled: IntakeRecord = {
            id: `ip-${Date.now()}`,
            name: intake.name || "王秀英",
            sex: intake.sex || "女",
            age: intake.age || "68",
            diagnosis: intake.diagnosis || "髋关节置换术后",
            admitNo: intake.admitNo || "RY-20260622-008",
            bed: intake.bed.trim(),
          };
          if (filled.bed) {
            setPendingAssess([filled, ...pendingAssess]);
            toast.success(`${filled.name} · 床${filled.bed} 已加入待首次评估`);
          } else {
            setPendingBed([filled, ...pendingBed]);
            toast.success(`${filled.name} 已加入待填床位号清单`);
          }
          setIntake({ name: "", sex: "", age: "", diagnosis: "", admitNo: "", bed: "", step: 1 });
          close();
        }}>{intake.bed.trim() ? "保存并加入待首次评估" : "保存（稍后填床位号）"}</PrimaryBtn>}>
        <IntakeScanSheet intake={intake} onChange={setIntake} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "intakeBed"} onClose={close} title="填床位号" accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => {
          if (!intake.bed.trim()) { toast.error("请填写床位号"); return; }
          if (bedTargetId) {
            const target = pendingBed.find(p => p.id === bedTargetId);
            if (target) {
              const updated = { ...target, bed: intake.bed.trim() };
              setPendingBed(pendingBed.filter(p => p.id !== bedTargetId));
              setPendingAssess([updated, ...pendingAssess]);
              toast.success(`床位 ${updated.bed} 已分配 · 进入待首次评估`);
            }
          }
          setBedTargetId(null);
          setIntake({ name: "", sex: "", age: "", diagnosis: "", admitNo: "", bed: "", step: 1 });
          close();
        }}>保存床位号</PrimaryBtn>}>
        <IntakeBedSheet intake={intake} onChange={setIntake} />
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


      <PhoneSheet open={sheet === "dailyNote"} onClose={close} title="每日康复护理备注" accent="nurse"
        footer={<PrimaryBtn variant="nurse" onClick={() => { toast.success("护理备注已保存到患者档案"); close(); }}>保存到患者档案</PrimaryBtn>}>
        <DailyNoteSheet patient={activePatient} />
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
                {
                  key: "assess",
                  label: "首次评估",
                  icon: ClipboardCheck,
                  onClick: () => {
                    setActivePatient(`${pickedPatient.bed} ${pickedPatient.name}`);
                    setSheet("confirmAssess");
                  },
                },
                {
                  key: "bed",
                  label: "填写床号",
                  icon: BedDouble,
                  onClick: () => {
                    setBedTargetId(null);
                    setIntake({
                      name: pickedPatient.name,
                      sex: "",
                      age: "",
                      diagnosis: pickedPatient.condition,
                      admitNo: "",
                      bed: pickedPatient.bed || "",
                      step: 2,
                    });
                    setSheet("intakeBed");
                  },
                },
                {
                  key: "daily",
                  label: "每日记录",
                  icon: NotebookPen,
                  onClick: () => {
                    setActivePatient(`${pickedPatient.bed} ${pickedPatient.name}`);
                    setSheet("dailyNote");
                  },
                },
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

/* ============== 入院工作流：步骤按钮 / 扫单 / 床位 ============== */
type IntakeState = { name: string; sex: string; age: string; diagnosis: string; admitNo: string; bed: string; step: 1 | 2 | 3 | 4 };
type IntakeRecord = { id: string; name: string; sex: string; age: string; diagnosis: string; admitNo: string; bed: string };

const IntakeStep = ({
  n, icon: Icon, label, active, done, disabled, onClick,
}: { n: number; icon: typeof BedDouble; label: string; active?: boolean; done?: boolean; disabled?: boolean; onClick: () => void }) => {
  const tone = done
    ? "border-success bg-success/10 text-success"
    : active
    ? "border-role-nurse bg-rose-50 text-role-nurse"
    : disabled
    ? "border-border bg-muted/40 text-muted-foreground"
    : "border-border bg-card text-foreground/70";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border-2 px-2 py-2.5 flex flex-col items-center gap-1 transition-all active:scale-[0.98] disabled:cursor-not-allowed ${tone}`}
    >
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-bold opacity-80">{done ? "✓" : n}</span>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-[11px] font-semibold">{label}</span>
    </button>
  );
};

const IntakeScanSheet = ({ intake, onChange }: { intake: IntakeState; onChange: (v: IntakeState) => void }) => (
  <div className="p-4 space-y-3">
    <div className="rounded-2xl gradient-nurse text-white p-5">
      <div className="text-xs opacity-80">扫描入院单</div>
      <div className="text-lg font-bold mt-1">对准入院单二维码 / 条码</div>
      <div className="text-[11px] opacity-90 mt-1">支持纸质入院单、HIS 二维码</div>
    </div>
    <div className="bg-card rounded-2xl shadow-card border-2 border-dashed border-role-nurse/40 h-40 flex flex-col items-center justify-center text-muted-foreground gap-2">
      <ScanLine className="w-10 h-10 text-role-nurse animate-pulse" />
      <span className="text-[12px]">取景框</span>
    </div>
    <AICard title="AI 识别结果（可编辑）">扫描完成后将自动填充以下字段，可手动修改。</AICard>
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="姓名" value={<input value={intake.name} onChange={e => onChange({ ...intake, name: e.target.value })} placeholder="王秀英" className="w-28 bg-muted rounded px-2 py-1 text-xs text-right outline-none" />} />
      <FormRow label="性别" value={<input value={intake.sex} onChange={e => onChange({ ...intake, sex: e.target.value })} placeholder="女" className="w-16 bg-muted rounded px-2 py-1 text-xs text-right outline-none" />} />
      <FormRow label="年龄" value={<input value={intake.age} onChange={e => onChange({ ...intake, age: e.target.value })} placeholder="68" className="w-16 bg-muted rounded px-2 py-1 text-xs text-right outline-none" />} />
      <FormRow label="入院诊断" value={<input value={intake.diagnosis} onChange={e => onChange({ ...intake, diagnosis: e.target.value })} placeholder="髋关节置换术后" className="w-40 bg-muted rounded px-2 py-1 text-xs text-right outline-none" />} />
      <FormRow label="入院单号" value={<input value={intake.admitNo} onChange={e => onChange({ ...intake, admitNo: e.target.value })} placeholder="RY-..." className="w-36 bg-muted rounded px-2 py-1 text-xs text-right outline-none" />} />
      <FormRow label="床位号" hint="可留空，稍后填" value={<input value={intake.bed} onChange={e => onChange({ ...intake, bed: e.target.value })} placeholder="如 305" className="w-20 bg-muted rounded px-2 py-1 text-xs text-right outline-none" />} />
    </div>
  </div>
);

const IntakeBedSheet = ({ intake, onChange }: { intake: IntakeState; onChange: (v: IntakeState) => void }) => {
  const beds = ["302", "305", "307", "311", "312", "315", "316", "318"];
  return (
    <div className="p-4 space-y-3">
      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="text-[11px] text-muted-foreground">新入院患者</div>
        <div className="text-sm font-bold mt-0.5">{intake.name || "—"} · {intake.sex} {intake.age && `${intake.age}岁`}</div>
        <div className="text-[11px] text-muted-foreground mt-1">{intake.diagnosis || "—"}</div>
      </div>
      <AICard title="AI 床位推荐">根据病区、性别、护理等级，推荐 305 床（同房间均为术后患者）。</AICard>
      <SectionTitle title="选择床位" extra={<span className="text-[10px] text-muted-foreground">空床 {beds.length}</span>} />
      <div className="grid grid-cols-4 gap-2">
        {beds.map(b => {
          const active = intake.bed === b;
          return (
            <button
              key={b}
              onClick={() => onChange({ ...intake, bed: b })}
              className={`rounded-xl border-2 py-2.5 text-sm font-bold ${active ? "border-role-nurse bg-rose-50 text-role-nurse" : "border-border bg-card text-foreground/70"}`}
            >{b}</button>
          );
        })}
      </div>
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        <FormRow label="床位号" value={<input value={intake.bed} onChange={e => onChange({ ...intake, bed: e.target.value })} placeholder="如 305" className="w-20 bg-muted rounded px-2 py-1 text-xs text-right outline-none" />} />
        <FormRow label="病区" value="康复二区 ▾" />
        <FormRow label="护理等级" value="二级护理 ▾" />
      </div>
    </div>
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
  pendingBed,
  pendingAssessCount,
  onScanIntake,
  onFillBed,
  onOpenAssessQueue,
}: {
  onOpenQueue: (k: QueueKey) => void;
  onGoPatients: (filter?: import("@/components/app/PatientsModule").PatientFilter) => void;
  onOpenDailyNote: () => void;
  onOpenEdu: () => void;
  onOpenChat: () => void;
  onOpenFollowUpList: () => void;
  onOpenFollowUp: (p: FollowUpPatient) => void;
  pendingBed: IntakeRecord[];
  pendingAssessCount: number;
  onScanIntake: () => void;
  onFillBed: (rec: IntakeRecord) => void;
  onOpenAssessQueue: () => void;
}) => {
  const pendingTodoTotal = pendingAssessCount + 3 + PATIENT_UNREAD + FOLLOW_UPS.filter(f => f.status === "pending").length;

  return (
    <div className="pb-4">
      <div className="bg-background px-5 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">您好</div>
            <div className="text-xl font-bold mt-0.5 text-foreground">赵护士 👋</div>
            <div className="text-[11px] text-muted-foreground mt-1">今日共 {pendingTodoTotal} 项护理待办</div>
          </div>
          <button onClick={() => toast("您有 4 条新任务")} className="w-9 h-9 rounded-full bg-rose-50 text-role-nurse flex items-center justify-center relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full" />
          </button>
        </div>
      </div>

      {/* 新患者入院：扫单 + 床位 */}
      <div className="px-4 mt-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[13px] font-bold text-foreground">新患者入院</span>
          <span className="text-[10px] text-muted-foreground">扫入院单 · 可同时填床位号</span>
        </div>
        <div className="bg-card rounded-2xl shadow-card border border-border/40 p-3 space-y-2.5">
          <button
            onClick={onScanIntake}
            className="w-full rounded-xl gradient-nurse text-white px-3 py-3 text-[13px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-card"
          >
            <ScanLine className="w-4.5 h-4.5" />
            扫入院单（可同时填床位号）
          </button>
          {pendingBed.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 px-1">
                <BedDouble className="w-3 h-3 text-warning" />
                <span className="text-[11px] font-semibold text-foreground/80">待填床位号</span>
                <span className="text-[10px] text-muted-foreground">{pendingBed.length} 位患者</span>
              </div>
              {pendingBed.map(p => (
                <div key={p.id} className="rounded-xl bg-warning/5 border border-warning/30 px-3 py-2 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold truncate">{p.name} · {p.sex} {p.age}岁</div>
                    <div className="text-[10px] text-muted-foreground truncate">{p.diagnosis} · {p.admitNo}</div>
                  </div>
                  <button
                    onClick={() => onFillBed(p)}
                    className="text-[11px] px-2.5 py-1.5 rounded-full bg-warning text-white font-semibold shrink-0 flex items-center gap-1"
                  >
                    <BedDouble className="w-3 h-3" /> 填床位号
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[13px] font-bold text-foreground">今日待处理</span>
        </div>
        <PendingTodoGrid
          items={[
            { label: "待首次评估", count: pendingAssessCount, icon: ClipboardCheck, iconClass: "bg-role-nurse text-white", onClick: onOpenAssessQueue },
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
        <button
          onClick={onOpenDailyNote}
          className="w-full bg-card rounded-2xl shadow-card border border-border/40 p-4 flex items-center gap-3 active:scale-[0.99] transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-role-nurse text-white flex items-center justify-center">
            <NotebookPen className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-[13px] font-bold text-foreground">每日护理记录</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">语音 / 文字输入 · 自动归档患者档案</div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
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

const DailyNoteSheet = ({ patient }: { patient?: string }) => {
  const [text, setText] = useState("");
  return (
    <div className="p-4">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={`记录${patient ? ` ${patient} ` : ""}今日护理情况…`}
        className="w-full bg-card border border-border rounded-2xl p-3 text-sm h-64 outline-none leading-relaxed focus:border-role-nurse"
      />
    </div>
  );
};



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
        { label: "每日护理", value: 286, sub: "条" },
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
        { label: "每日护理记录", info: "本月记录 286 条，已同步患者档案" },
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

/* ============== 护理首次评估（专科评估 V-VST / 基础评估 NRS2002） ============== */

// V-VST 吞咽障碍临床评估：3 种稠度 × 3 种容积；2 大类指标
const VVST_THICKNESS = ["糖浆中稠度", "液体-水", "布丁状稠度"] as const;
const VVST_VOLUMES = ["5ml", "10ml", "15ml"] as const;
const VVST_SAFETY = ["咳嗽", "音质改变", "血氧饱和度下降"];
const VVST_EFFECT = ["唇部闭合", "口腔残留", "分次吞咽", "咽部残留"];

const VVSTScale = () => {
  const allRows = [...VVST_SAFETY, ...VVST_EFFECT];
  const [grid, setGrid] = useState<Record<string, Record<string, boolean>>>(() => {
    const init: Record<string, Record<string, boolean>> = {};
    allRows.forEach((label) => {
      init[label] = {};
      VVST_THICKNESS.forEach((t) => VVST_VOLUMES.forEach((v) => (init[label][`${t}|${v}`] = false)));
    });
    init["咳嗽"]["液体-水|10ml"] = true;
    init["血氧饱和度下降"]["液体-水|15ml"] = true;
    init["口腔残留"]["糖浆中稠度|15ml"] = true;
    return init;
  });
  const toggle = (label: string, col: string) =>
    setGrid({ ...grid, [label]: { ...grid[label], [col]: !grid[label][col] } });

  const positives = Object.values(grid).reduce(
    (acc, row) => acc + Object.values(row).filter(Boolean).length,
    0
  );

  return (
    <div className="mt-2 bg-muted/30 rounded-xl p-2 overflow-x-auto">
      <div className="text-[11px] text-muted-foreground mb-2 px-1">
        V-VST 结果记录 · 阳性指标 <span className="text-warning font-semibold">{positives}</span> 项
      </div>
      <table className="text-[10px] border-collapse w-full min-w-[520px]">
        <thead>
          <tr className="text-foreground/70">
            <th className="border border-border/60 bg-card px-1 py-1">不同稠度</th>
            {VVST_THICKNESS.map((t) => (
              <th key={t} colSpan={3} className="border border-border/60 bg-card px-1 py-1">{t}</th>
            ))}
          </tr>
          <tr className="text-foreground/70">
            <th className="border border-border/60 bg-card px-1 py-1">不同容积</th>
            {VVST_THICKNESS.flatMap((t) =>
              VVST_VOLUMES.map((v) => (
                <th key={`${t}-${v}`} className="border border-border/60 bg-card px-1 py-1 font-normal">{v}</th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          {(["safety", "effect"] as const).map((group) => {
            const rows = group === "safety" ? VVST_SAFETY : VVST_EFFECT;
            const groupLabel = group === "safety" ? "安全性受损指标" : "有效性受损指标";
            return rows.map((label, ri) => (
              <tr key={label}>
                {ri === 0 && (
                  <td
                    rowSpan={rows.length}
                    className="border border-border/60 bg-rose-50/40 px-1 py-1 text-center font-semibold text-foreground/80"
                  >
                    {groupLabel}
                  </td>
                )}
                <td className="border border-border/60 bg-card px-1 py-1">{label}</td>
                {VVST_THICKNESS.flatMap((t) =>
                  VVST_VOLUMES.map((v) => {
                    const key = `${t}|${v}`;
                    const on = grid[label][key];
                    return (
                      <td key={key} className="border border-border/60 p-0">
                        <button
                          onClick={() => toggle(label, key)}
                          className={`w-full h-7 text-[10px] ${on ? "bg-role-nurse/80 text-white font-semibold" : "bg-card text-muted-foreground"}`}
                        >
                          {on ? "+" : ""}
                        </button>
                      </td>
                    );
                  })
                )}
              </tr>
            ));
          })}
        </tbody>
      </table>
      <div className="mt-2 text-[10px] text-muted-foreground px-1">
        点击单元格标记阳性（+）。AI 已根据床旁试验预填示范结果。
      </div>
    </div>
  );
};

// NRS2002 评分表
type NrsOption = { label: string; score: number };
type NrsSection = { key: string; title: string; multi?: boolean; options: NrsOption[] };
const NRS_SECTIONS: NrsSection[] = [
  {
    key: "disease", title: "一、疾病状况（可多选）", multi: true,
    options: [
      { label: "髋骨折", score: 1 }, { label: "肝硬化", score: 1 }, { label: "慢性阻塞性肺病", score: 1 },
      { label: "血液透析", score: 1 }, { label: "糖尿病", score: 1 }, { label: "一般恶性肿瘤", score: 1 },
      { label: "慢性疾病急性发作或有并发症", score: 1 }, { label: "腹部重大手术", score: 2 },
      { label: "脑卒中", score: 2 }, { label: "重症肺炎", score: 2 }, { label: "血液系统恶性肿瘤", score: 2 },
      { label: "颅脑损伤", score: 2 }, { label: "骨髓移植", score: 2 }, { label: "重症病患（APACHE>10）", score: 3 },
    ],
  },
  {
    key: "weight", title: "二、体重变化情况（单选）",
    options: [
      { label: "3 个月内体重无减轻或减轻 < 5%", score: 0 },
      { label: "3 个月内体重减轻 > 5%", score: 1 },
      { label: "2 个月内体重减轻 > 5%", score: 2 },
      { label: "1 个月内体重减轻 > 5%", score: 3 },
    ],
  },
  {
    key: "intake", title: "三、进食变化情况（单选）",
    options: [
      { label: "近一周进食量减少 0%–25%", score: 0 },
      { label: "近一周进食量减少 25%–50%", score: 1 },
      { label: "近一周进食量减少 50%–75%", score: 2 },
      { label: "近一周进食量减少 75%–100%", score: 3 },
    ],
  },
  {
    key: "bmi", title: "四、BMI 变化（单选）",
    options: [{ label: "BMI ≥ 18.5", score: 0 }, { label: "BMI < 18.5", score: 3 }],
  },
  {
    key: "alb", title: "五、白蛋白变化（单选）",
    options: [{ label: "白蛋白 ≥ 30 g/L", score: 0 }, { label: "白蛋白 < 30 g/L", score: 3 }],
  },
  {
    key: "age", title: "六、年龄校正（单选）",
    options: [{ label: "年龄 < 70 岁", score: 0 }, { label: "年龄 ≥ 70 岁", score: 1 }],
  },
];

const NRS2002Scale = () => {
  const [picked, setPicked] = useState<Record<string, Record<number, boolean>>>(() => ({
    disease: { 8: true },     // 脑卒中
    weight: { 1: true },
    intake: { 0: true },
    bmi: { 0: true },
    alb: { 0: true },
    age: { 1: true },
  }));
  const togglePick = (sec: NrsSection, i: number) => {
    const cur = picked[sec.key] || {};
    const next = sec.multi ? { ...cur, [i]: !cur[i] } : { [i]: true };
    setPicked({ ...picked, [sec.key]: next });
  };
  const sectionScore = (sec: NrsSection) =>
    Object.entries(picked[sec.key] || {}).reduce(
      (acc, [i, v]) => acc + (v ? sec.options[Number(i)].score : 0),
      0
    );
  const total = NRS_SECTIONS.reduce((acc, s) => acc + sectionScore(s), 0);
  const risk = total >= 3 ? "存在营养风险，需营养干预" : "营养状态良好，无营养风险";

  return (
    <div className="mt-2 bg-muted/30 rounded-xl p-2 space-y-2">
      {NRS_SECTIONS.map((sec) => (
        <div key={sec.key} className="bg-card rounded-xl p-2">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[11px] font-semibold text-foreground/85">{sec.title}</span>
            <span className="text-[10px] text-role-nurse font-semibold">本节得分 {sectionScore(sec)}</span>
          </div>
          <div className="grid grid-cols-1 gap-1">
            {sec.options.map((opt, i) => {
              const on = !!picked[sec.key]?.[i];
              return (
                <button
                  key={i}
                  onClick={() => togglePick(sec, i)}
                  className={`flex items-center justify-between text-left px-2 py-1.5 rounded-lg border ${
                    on ? "border-role-nurse/60 bg-rose-50/60" : "border-border/60 bg-muted/40"
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <span
                      className={`w-3.5 h-3.5 ${sec.multi ? "rounded" : "rounded-full"} border ${
                        on ? "bg-role-nurse border-role-nurse" : "border-muted-foreground/50"
                      } flex items-center justify-center text-white text-[9px]`}
                    >
                      {on ? "✓" : ""}
                    </span>
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{opt.score} 分</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="bg-card rounded-xl p-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold">本次评估总分</span>
          <span className="text-[16px] font-bold text-role-nurse">{total} 分</span>
        </div>
        <div className={`mt-1.5 text-[11px] font-semibold ${total >= 3 ? "text-warning" : "text-success"}`}>
          风险等级：{risk}
        </div>
      </div>
    </div>
  );
};

type NurseScaleCategory = "special" | "basic";
type NurseScaleDef = {
  key: string;
  name: string;
  brief: string;
  result?: string;
  category: NurseScaleCategory;
  Render: React.FC;
};

/** 通用打分量表渲染器（量表库新增量表使用） */
const makeGenericScale = (items: { label: string; score: number }[], threshold?: { high: number; label: string }): React.FC =>
  function GenericScale() {
    const [picked, setPicked] = useState<Record<number, boolean>>({});
    const toggle = (i: number) => setPicked({ ...picked, [i]: !picked[i] });
    const total = items.reduce((acc, it, i) => acc + (picked[i] ? it.score : 0), 0);
    const danger = threshold ? total >= threshold.high : false;
    return (
      <div className="mt-2 bg-muted/30 rounded-xl p-2 space-y-1">
        {items.map((it, i) => {
          const on = !!picked[i];
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={`w-full flex items-center justify-between text-left px-2 py-1.5 rounded-lg border ${
                on ? "border-role-nurse/60 bg-rose-50/60" : "border-border/60 bg-card"
              }`}
            >
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className={`w-3.5 h-3.5 rounded border ${on ? "bg-role-nurse border-role-nurse" : "border-muted-foreground/50"} flex items-center justify-center text-white text-[9px]`}>
                  {on ? "✓" : ""}
                </span>
                {it.label}
              </span>
              <span className="text-[10px] text-muted-foreground">{it.score} 分</span>
            </button>
          );
        })}
        <div className="flex items-center justify-between bg-card rounded-lg px-3 py-2 mt-1">
          <span className="text-[12px] font-bold">本次评估总分</span>
          <span className="text-[15px] font-bold text-role-nurse">{total} 分</span>
        </div>
        {threshold && (
          <div className={`text-[11px] font-semibold px-1 ${danger ? "text-warning" : "text-success"}`}>
            风险判定：{danger ? threshold.label : "暂未达到高危阈值"}
          </div>
        )}
      </div>
    );
  };

const NURSE_DEFAULT_SCALES: NurseScaleDef[] = [
  { key: "vvst", category: "special", name: "V-VST 吞咽障碍临床评估", brief: "3 种稠度 × 3 种容积 · 安全性 / 有效性指标", result: "可疑异常 · 液体 10ml 咳嗽阳性", Render: VVSTScale },
  { key: "nrs2002", category: "basic", name: "NRS2002 营养风险筛查", brief: "6 维度评分 · 总分 ≥ 3 提示营养风险", result: "4 分 · 存在营养风险", Render: NRS2002Scale },
];

const NURSE_SCALE_LIB: NurseScaleDef[] = [
  /* ============ 专科评估库 ============ */
  {
    key: "trach-vvst", category: "special",
    name: "气管切开患者改良 V-VST 染料试验评估表",
    brief: "蓝色染料 + 不同稠度 / 容积 · 评估气切患者误吸",
    Render: makeGenericScale(
      [
        { label: "套管口分泌物可见蓝色染料", score: 3 },
        { label: "吸引物中可见蓝色染料", score: 3 },
        { label: "饮水后 SpO₂ 下降 ≥ 3%", score: 2 },
        { label: "进食后湿性嗓音 / 咳嗽", score: 2 },
        { label: "咽部残留明显", score: 1 },
        { label: "唇部闭合不全 / 流涎", score: 1 },
      ],
      { high: 3, label: "存在误吸风险，建议暂停经口进食并联系 ST" },
    ),
  },
  {
    key: "bowel", category: "special",
    name: "肠道评估",
    brief: "排便频率 / 性状 / 失禁 · Bristol 分型",
    Render: makeGenericScale(
      [
        { label: "便秘（> 3 天未排便）", score: 2 },
        { label: "腹泻（> 3 次 / 天稀便）", score: 2 },
        { label: "Bristol 1–2 型（硬便）", score: 1 },
        { label: "Bristol 6–7 型（稀水便）", score: 1 },
        { label: "大便失禁", score: 3 },
        { label: "腹胀 / 肠鸣音减弱", score: 1 },
        { label: "需药物 / 灌肠辅助排便", score: 1 },
      ],
      { high: 3, label: "存在排便障碍，需启动肠道管理方案" },
    ),
  },
  {
    key: "bladder", category: "special",
    name: "膀胱评估",
    brief: "排尿方式 / 残余尿 / 失禁 · 留置管路评估",
    Render: makeGenericScale(
      [
        { label: "尿潴留（PVR > 100ml）", score: 2 },
        { label: "尿频（> 8 次 / 日）", score: 1 },
        { label: "尿急 / 急迫性尿失禁", score: 2 },
        { label: "压力性尿失禁", score: 2 },
        { label: "留置导尿管 > 48h", score: 2 },
        { label: "尿路感染征象（尿浑浊 / 异味）", score: 3 },
        { label: "需间歇导尿 CIC", score: 1 },
      ],
      { high: 3, label: "存在膀胱功能障碍，建议膀胱训练 + 残余尿监测" },
    ),
  },
  {
    key: "eat10", category: "special",
    name: "EAT10 量表",
    brief: "10 项吞咽自评 · 总分 ≥ 3 提示吞咽异常",
    Render: makeGenericScale(
      [
        { label: "我的吞咽问题使我体重减轻", score: 2 },
        { label: "我的吞咽问题影响我在外就餐", score: 2 },
        { label: "吞咽液体费力", score: 2 },
        { label: "吞咽固体费力", score: 2 },
        { label: "吞咽药片费力", score: 2 },
        { label: "吞咽时疼痛", score: 2 },
        { label: "我的吞咽问题影响我享用食物", score: 2 },
        { label: "我吞咽时有食物卡在喉咙里", score: 2 },
        { label: "我吃东西时咳嗽", score: 2 },
        { label: "我吞咽时紧张", score: 2 },
      ],
      { high: 3, label: "存在吞咽功能异常，建议进一步评估" },
    ),
  },

  /* ============ 基础评估库 ============ */
  {
    key: "fall", category: "basic",
    name: "跌倒风险临床评估量表",
    brief: "Morse · 6 项 · 总分 ≥ 45 高危",
    Render: makeGenericScale(
      [
        { label: "跌倒史（近 3 个月）", score: 25 },
        { label: "超过 1 个医学诊断", score: 15 },
        { label: "使用助行器 / 拐杖", score: 15 },
        { label: "静脉输液 / 肝素锁", score: 20 },
        { label: "步态虚弱", score: 10 },
        { label: "认知能力差（高估自身能力）", score: 15 },
      ],
      { high: 45, label: "跌倒高危，需启用防跌倒预案" },
    ),
  },
  {
    key: "pressure", category: "basic",
    name: "成人压力性损伤评分量表",
    brief: "Braden · 6 维度 · ≤ 12 高危",
    Render: makeGenericScale(
      [
        { label: "感觉完全受限", score: 4 },
        { label: "皮肤潮湿持续暴露", score: 4 },
        { label: "活动能力卧床", score: 4 },
        { label: "移动能力完全无法移动", score: 4 },
        { label: "营养摄入极差", score: 4 },
        { label: "摩擦力 / 剪切力问题", score: 3 },
      ],
      { high: 12, label: "压疮高危，需 q2h 翻身 + 减压垫" },
    ),
  },
  {
    key: "general", category: "basic",
    name: "一般护理评估",
    brief: "意识 / 皮肤 / 管路 / 自理 / 心理",
    Render: makeGenericScale(
      [
        { label: "意识改变（嗜睡 / 昏睡 / 昏迷）", score: 2 },
        { label: "皮肤破损 / 发红", score: 1 },
        { label: "留置管路 ≥ 1 条", score: 1 },
        { label: "ADL 重度依赖", score: 2 },
        { label: "情绪低落 / 焦虑", score: 1 },
        { label: "睡眠障碍", score: 1 },
        { label: "家属照护能力不足", score: 1 },
      ],
      { high: 3, label: "护理风险偏高，建议制定个性化护理计划" },
    ),
  },
  {
    key: "vte", category: "basic",
    name: "深静脉血栓风险因素评分表",
    brief: "Caprini · 总分 ≥ 5 极高危，需药物预防",
    Render: makeGenericScale(
      [
        { label: "年龄 ≥ 75 岁", score: 3 },
        { label: "卧床 > 72h", score: 2 },
        { label: "下肢肿胀", score: 1 },
        { label: "中心静脉置管", score: 2 },
        { label: "脑卒中", score: 5 },
        { label: "下肢骨折", score: 5 },
        { label: "恶性肿瘤", score: 2 },
        { label: "既往 VTE 病史", score: 3 },
      ],
      { high: 5, label: "VTE 极高危，建议药物 + 机械联合预防" },
    ),
  },
];



const NurseScaleList = ({
  scales,
  category,
  libraryOpen,
  onToggleLibrary,
  libraryScales,
  onAdd,
  onRemove,
}: {
  scales: NurseScaleDef[];
  category: NurseScaleCategory;
  libraryOpen: boolean;
  onToggleLibrary: () => void;
  libraryScales: NurseScaleDef[];
  onAdd: (s: NurseScaleDef) => void;
  onRemove: (key: string) => void;
}) => {
  const [expanded, setExpanded] = useState<string | null>(scales[0]?.key ?? null);
  const addedKeys = new Set(scales.map((s) => s.key));
  return (
    <>
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        {scales.length === 0 && (
          <div className="px-3 py-4 text-center text-[11px] text-muted-foreground">暂无量表，请从量表库添加</div>
        )}
        {scales.map((s) => {
          const open = expanded === s.key;
          const Render = s.Render;
          const isDefault = NURSE_DEFAULT_SCALES.some((d) => d.key === s.key);
          return (
            <div key={s.key} className="px-3 py-2.5">
              <button onClick={() => setExpanded(open ? null : s.key)} className="w-full flex items-center gap-2 text-left">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[12px] font-semibold truncate">{s.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-50 text-role-nurse font-semibold shrink-0">护理</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{s.brief}</div>
                  {s.result && <div className="text-[11px] text-foreground/80 mt-1 font-medium">{s.result}</div>}
                </div>
                {isDefault && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-ai/10 text-ai font-semibold flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" />AI 预填</span>
                )}
                <span className="text-[11px] text-role-nurse font-semibold ml-1">{open ? "收起" : "查看 / 修改"}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(s.key); }}
                  className="text-[10px] text-destructive ml-1 px-1.5 py-0.5 rounded border border-destructive/30"
                >
                  删除
                </button>
              </button>
              {open && <Render />}
            </div>
          );
        })}
      </div>

      {libraryOpen && (
        <div className="mt-2 bg-card rounded-2xl border border-border/60 overflow-hidden shadow-card">
          <div className="px-3 pt-2.5 pb-2 border-b border-border/60 flex items-center justify-between">
            <div className="text-[12px] font-semibold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-role-nurse" />
              护理评估量表库 · {category === "special" ? "专科" : "基础"}
            </div>
            <button onClick={onToggleLibrary} className="text-[11px] text-muted-foreground flex items-center gap-0.5">
              <X className="w-3 h-3" />关闭
            </button>
          </div>
          <div className="max-h-[280px] overflow-y-auto divide-y divide-border/60">
            {libraryScales.map((s) => {
              const added = addedKeys.has(s.key);
              return (
                <button
                  key={s.key}
                  onClick={() => !added && onAdd(s)}
                  disabled={added}
                  className="w-full px-3 py-2.5 flex items-start gap-2 text-left active:bg-muted/40 disabled:opacity-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold truncate">{s.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{s.brief}</div>
                  </div>
                  <span className={`text-[11px] font-semibold shrink-0 ${added ? "text-muted-foreground" : "text-role-nurse"}`}>
                    {added ? "已添加" : "+ 加入"}
                  </span>
                </button>
              );
            })}
            {libraryScales.length === 0 && (
              <div className="px-3 py-6 text-center text-[11px] text-muted-foreground">量表库暂无可添加量表</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const NurseFirstAssessSheet = ({ patient }: { patient?: string }) => {
  const name = patient ? patient.split(" ").slice(-1)[0] : "王秀英";
  const [scaleTab, setScaleTab] = useState<NurseScaleCategory>("special");
  const [specialScales, setSpecialScales] = useState<NurseScaleDef[]>(
    NURSE_DEFAULT_SCALES.filter((s) => s.category === "special"),
  );
  const [basicScales, setBasicScales] = useState<NurseScaleDef[]>(
    NURSE_DEFAULT_SCALES.filter((s) => s.category === "basic"),
  );
  const [libOpen, setLibOpen] = useState(false);

  const currentScales = scaleTab === "special" ? specialScales : basicScales;
  const setCurrent = scaleTab === "special" ? setSpecialScales : setBasicScales;
  const libraryScales = NURSE_SCALE_LIB.filter((s) => s.category === scaleTab);

  const handleAdd = (s: NurseScaleDef) => {
    setCurrent([...currentScales, s]);
    toast.success(`已加入「${s.name}」`);
  };
  const handleRemove = (key: string) => {
    setCurrent(currentScales.filter((x) => x.key !== key));
    toast(`已移除该量表`);
  };

  return (
    <div className="p-4 space-y-3">
      {/* 患者档案概要 */}
      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-nurse text-white flex items-center justify-center font-bold text-lg">{name[0]}</div>
          <div className="flex-1">
            <div className="text-sm font-bold">{patient || "305 王秀英 · 女 68 岁"}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">床号 305 · 髋关节置换术后 · 入院第 5 天</div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-rose-50 text-role-nurse font-semibold">护理首评</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted rounded-xl py-2"><div className="text-[9px] text-muted-foreground">BP</div><div className="text-[12px] font-semibold mt-0.5">128/82</div></div>
          <div className="bg-muted rounded-xl py-2"><div className="text-[9px] text-muted-foreground">VAS</div><div className="text-[12px] font-semibold mt-0.5">6 → 3</div></div>
          <div className="bg-muted rounded-xl py-2"><div className="text-[9px] text-muted-foreground">DVT 风险</div><div className="text-[12px] font-semibold mt-0.5">中</div></div>
        </div>
      </div>

      {/* 专科评估 / 基础评估 二段式切换 */}
      <div className="sticky top-0 z-20 -mx-4 px-4 pt-1 pb-2 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-1.5 bg-muted rounded-full p-1">
          {([
            { k: "special" as const, label: "专科评估" },
            { k: "basic" as const, label: "基础评估" },
          ]).map((it) => {
            const isActive = scaleTab === it.k;
            return (
              <button
                key={it.k}
                onClick={() => { setScaleTab(it.k); setLibOpen(false); }}
                className={`flex-1 text-[12px] py-1.5 rounded-full font-semibold transition-all ${
                  isActive ? "gradient-nurse text-white shadow-card" : "text-foreground/70"
                }`}
              >
                {it.label}
              </button>
            );
          })}
        </div>
      </div>

      <SectionTitle
        title={`${scaleTab === "special" ? "专科评估量表" : "基础评估量表"} · ${currentScales.length} 项`}
        extra={
          <button
            onClick={() => setLibOpen(!libOpen)}
            className="text-[11px] font-semibold text-role-nurse flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />{libOpen ? "收起量表库" : "从量表库添加"}
          </button>
        }
      />
      <NurseScaleList
        scales={currentScales}
        category={scaleTab}
        libraryOpen={libOpen}
        onToggleLibrary={() => setLibOpen(!libOpen)}
        libraryScales={libraryScales}
        onAdd={handleAdd}
        onRemove={handleRemove}
      />

      <AICard title="AI 护理评估辅助结论">
        <div className="text-[12px] leading-relaxed whitespace-pre-line">
          {scaleTab === "special"
            ? `V-VST 液体 10ml 出现咳嗽与 SpO₂ 下降，提示稀流质安全性受损；
建议：暂予糊状饮食 + 增稠剂；进食时 30° 半坐卧位，避免一次性大口；ST 联合评估。`
            : `NRS2002 总分 4 分（脑卒中 2 + 体重减轻 1 + 年龄 ≥70 岁 1），存在营养风险；
建议：营养教育 + 口服营养补充剂 ONS，必要时联系营养科会诊。`}
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground">AI · 基于护理量表与患者档案综合生成</div>
      </AICard>
    </div>
  );
};




/* ============== 随访清单 ============== */
const STATUS_TONE: Record<FollowUpStatus, { label: string; cls: string }> = {
  done: { label: "已完成", cls: "bg-success/15 text-success" },
  pending: { label: "待随访", cls: "bg-primary/15 text-primary" },
  needRevisit: { label: "需复访", cls: "bg-warning/20 text-warning" },
};

export const FollowUpListView = ({
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

export const FollowUpSheet = ({
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
export const ManualCallSheet = ({
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
