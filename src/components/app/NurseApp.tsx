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
} from "lucide-react";
import { toast } from "sonner";
import { MeStats } from "@/components/app/MeStats";

import {
  EvalTabs,
  EvalTabKey,
  RehabPanel,
  NumberedGoals,
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
              if (!p.bed || !String(p.bed).trim()) { toast.error("请先填写床位号"); return; }
              setActivePatient(`${p.name} · 床${p.bed}`);
              setPickedPatient({ ...p, notes: patientNotes[p.id] ?? p.notes });
              setSheet("confirmAssess");
            } else if (key === "bed") {
              setPickedPatient({ ...p, notes: patientNotes[p.id] ?? p.notes });
              setBedTargetId(null);
              setIntake({
                name: p.name,
                sex: "",
                age: "",
                diagnosis: p.condition,
                admitNo: "",
                bed: p.bed || "",
                step: 2,
              });
              setSheet("intakeBed");
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

      {(["confirmAssess"] as QueueKey[]).map((k) => (
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

/* ============== 护理首次评估（参照康复医师端：2 段式 Tabs · 康复评估只展示护理内容 + 其他角色意见） ============== */
const NurseNursingScales = () => (
  <>
    <SectionTitle title="护理首评量表" extra={<span className="text-[10px] text-muted-foreground">已完成 5 / 5</span>} />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      {[
        { name: "Morse 跌倒评估", val: "55 · 高危" },
        { name: "Braden 压疮评估", val: "14 · 高危" },
        { name: "Caprini VTE 评估", val: "5 · 高危" },
        { name: "Barthel ADL", val: "35 · 重度依赖" },
        { name: "NRS-2002 营养筛查", val: "3 · 有风险" },
      ].map(s => (
        <div key={s.name} className="flex items-center justify-between px-3 py-2.5">
          <span className="text-[12px] font-semibold">{s.name}</span>
          <span className="text-[11px] text-foreground/80 font-semibold">{s.val}</span>
        </div>
      ))}
    </div>
    <SectionTitle title="护理观察要点" />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="意识 GCS" value="13 分 · 嗜睡" />
      <FormRow label="皮肤情况" value="完整 · 骶尾部发红" />
      <FormRow label="管路" value="导尿管 · PICC" />
      <FormRow label="疼痛 NRS" value="3 · 轻度" />
      <FormRow label="HAMD 简版" value="9 · 轻度抑郁倾向" />
    </div>
  </>
);

const NurseFirstAssessSheet = ({ patient }: { patient?: string }) => {
  const name = patient ? patient.split(" ").slice(-1)[0] : "王秀英";
  const [tab, setTab] = useState<EvalTabKey>("rehab");
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
        <div className="mt-2 text-[11px] text-foreground/75 leading-relaxed bg-muted/60 rounded-xl px-3 py-2">
          基础情况：术后第 5 天，伤口干洁；夜间血压一过性升高，疼痛 VAS 6→3；跌倒 / 压疮 / VTE 均为高风险。
        </div>
      </div>

      <EvalTabs active={tab} onChange={setTab} accent="nurse" hideClinical />

      {tab === "rehab" && (
        <RehabPanel
          hideDirections
          scaleSlot={<NurseNursingScales />}
          conclusions={ALL_REHAB_CONCLUSIONS}
          aiBottom={
            <AICard title="AI 康复评估辅助结论">
              <div className="text-[12px] leading-relaxed whitespace-pre-line">
                {`综合护理首评 + 医师 / 治疗师评估：
1. 当前主要护理风险：跌倒（Morse 55）/ 压疮（Braden 14）/ VTE（Caprini 5）均为高危，需 q2h 翻身 + 镇痛护理。
2. 训练配合：训练时段建议安排在镇痛后 30min 内，避免 VAS > 4 进行下地训练。
3. 出院前重点：自理训练 + 居家防跌倒宣教 + 家属照护培训。`}
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground">AI · 基于护理首评 + 三角色档案综合生成</div>
            </AICard>
          }
        />
      )}
      {tab === "goal" && <NumberedGoals accent="nurse" readOnly />}
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
