import { useState } from "react";
import { ScreenShell, TabBar, type TabBarItem } from "@/components/app/TabBar";
import { AICard, SectionTitle, StatChip } from "@/components/app/UI";
import { PhoneSheet, FormRow, PrimaryBtn } from "@/components/app/Sheet";
import { TodoQueueList, WorkbenchTile, PendingStatRow, PendingTodoGrid, TodoItem } from "@/components/app/TodoQueue";
import {
  PatientsPage,
  PatientDetailSheet,
  PatientActionsBar,
  AddNoteSheet,
  TeamManageSheet,
  IMChatSheet,
  TeamMeetingListSheet,
  NewMeetingSheet,
  PatientChatListSheet,
  PatientChatSheet,
  Patient,
  PatientFilter,
  PatientPendingKey,
  getPatientStage,
  PATIENTS,
  NEW_PATIENT_COUNT,
  FIRST_ASSESS_COUNT,
  RETURNED_REASSESS_COUNT,
  PATIENT_UNREAD,
  DEFAULT_MEETING_MSGS,
  DEFAULT_VIDEO_MSGS,
  DEFAULT_MEETINGS,
  TeamMeeting,
} from "@/components/app/PatientsModule";
import { RehabPlanModule, PlanStage } from "@/components/app/RehabPlanModule";
import { RxDetail } from "@/components/app/RxDetail";
import { MeStats } from "@/components/app/MeStats";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Bell,
  ChevronRight,
  ClipboardCheck,
  Target,
  FileText,
  Users,
  Sparkles,
  CheckCircle2,
  Stethoscope,
  Calendar,
  Video,
  Plus,
  Edit3,
  Home as HomeIcon,
  UsersRound,
  FileHeart,
  AlertTriangle,
  User as UserIcon,
  LogOut,
  MessageCircle,
  
  Edit2,
  RotateCcw,
  X,
  Camera,
} from "lucide-react";

type SheetKey =
  | null
  | "assess"
  | "goal"
  | "plan"
  | "meetingList"
  | "newMeeting"
  | "meeting"
  | "rx"
  | "discharge"
  | "videoPicker"
  | "video"
  | "patientDetail"
  | "addNote"
  | "team"
  | "patientChatList"
  | "patientChat";

const DOCTOR_TABS: TabBarItem[] = [
  { key: "home", label: "工作台", icon: HomeIcon },
  { key: "patients", label: "患者管理", icon: UsersRound },
  { key: "plan", label: "康复方案", icon: FileHeart },
  { key: "rx", label: "医嘱", icon: Sparkles },
  { key: "chat", label: "沟通", icon: MessageCircle, badge: PATIENT_UNREAD },
  { key: "me", label: "我的", icon: UserIcon },
];

export const DoctorApp = () => {
  const [tab, setTab] = useState("home");
  const [sheet, setSheet] = useState<SheetKey>(null);
  const [activePatient, setActivePatient] = useState<string>("");
  const [pickedPatient, setPickedPatient] = useState<Patient | null>(null);
  const [chatPatient, setChatPatient] = useState<Patient | null>(null);
  const [patientNotes, setPatientNotes] = useState<Record<string, Patient["notes"]>>({});
  const [patientsFilter, setPatientsFilter] = useState<PatientFilter>("all");
  const [planStage, setPlanStage] = useState<PlanStage>("plan");
  const [meetings, setMeetings] = useState<TeamMeeting[]>(DEFAULT_MEETINGS);
  const [activeMeeting, setActiveMeeting] = useState<TeamMeeting | null>(null);
  const [therapistPickerOpen, setTherapistPickerOpen] = useState(false);
  const [videoPatient, setVideoPatient] = useState<Patient | null>(null);
  const [chatSubTab, setChatSubTab] = useState<"patient" | "team">("patient");
  const [dischargePlanOpen, setDischargePlanOpen] = useState(false);
  const [dischargeDate, setDischargeDate] = useState<Date | undefined>(undefined);

  const open = (k: SheetKey) => setSheet(k);
  const close = () => setSheet(null);

  const goPatients = (filter: PatientFilter = "all") => {
    setPatientsFilter(filter);
    setTab("patients");
  };
  const goPlan = (stage: PlanStage) => {
    setPlanStage(stage);
    setTab("plan");
  };
  const goRx = () => setTab("rx");
  const pickPatient = (p: Patient) => {
    const merged = { ...p, notes: patientNotes[p.id] ?? p.notes };
    setPickedPatient(merged);
    setSheet("patientDetail");
  };
  const pickPlanPatient = (stage: PlanStage, p: Patient) => {
    setActivePatient(`${p.name} · 床${p.bed}`);
    if (stage === "goal") setSheet("goal");
    else if (stage === "plan") setSheet("plan");
    else if (stage === "airx") setSheet("rx");
    else setSheet("discharge");
  };
  const pickDischargePatient = (_s: PlanStage, p: Patient) => {
    setActivePatient(`${p.name} · 床${p.bed}`);
    setSheet("discharge");
  };

  return (
    <ScreenShell tabBar={<TabBar active={tab} onChange={setTab} accent="doctor" newPatientCount={NEW_PATIENT_COUNT} items={DOCTOR_TABS} />}>
      {tab === "home" && (
        <DoctorHome
          onOpen={open}
          onGoPatients={goPatients}
          onGoPlan={goPlan}
          onGoRx={goRx}
          onGoDischarge={() => setTab("discharge")}
          onGoChat={() => setTab("chat")}
        />
      )}
      {tab === "patients" && (
        <PatientsPage
          accent="doctor"
          onPick={pickPatient}
          initialFilter={patientsFilter}
          onAction={(key, p) => {
            setActivePatient(`${p.name} · 床${p.bed}`);
            setPickedPatient({ ...p, notes: patientNotes[p.id] ?? p.notes });
            if (key === "assess") setSheet("assess");
            else if (key === "plan") setSheet("plan");
            else setSheet("rx");
          }}
        />
      )}
      {tab === "plan" && (
        <RehabPlanModule
          accent="doctor"
          onPickPlan={pickPlanPatient}
          initialStage={planStage}
          stages={["goal", "plan"]}
          title="康复方案"
          subtitle="院内康复治疗方案 · 目标 / 方案"
        />
      )}
      {tab === "rx" && (
        <RehabPlanModule
          accent="doctor"
          onPickPlan={pickPlanPatient}
          initialStage="airx"
          stages={["airx"]}
          title="康复医嘱"
          subtitle="康复整体计划 · 全套训练 + 流程安排 · 含居家训练"
        />
      )}
      {tab === "discharge" && (
        <RehabPlanModule
          accent="doctor"
          onPickPlan={pickDischargePatient}
          initialStage="discharge"
          stages={["discharge"]}
          title="出院方案"
          subtitle="AI 二级方案 · 需医师二次确认"
        />
      )}
      {tab === "chat" && (
        <DoctorChatHub
          subTab={chatSubTab}
          onChange={setChatSubTab}
          onOpenPatient={(p) => { setChatPatient(p); setSheet("patientChat"); }}
          meetings={meetings}
          onPickMeeting={(m) => { setActiveMeeting(m); setSheet("meeting"); }}
          onCreateMeeting={() => setSheet("newMeeting")}
        />
      )}
      {tab === "me" && <DoctorMe onOpenTeam={() => open("team")} />}

      <PhoneSheet open={sheet === "assess"} onClose={close} title={`首次康复评估${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="doctor"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveMeeting(null); setSheet("meeting"); toast("已发起团队会议评估"); }}
              className="flex-1 border border-primary/30 text-primary rounded-2xl py-3 text-sm font-semibold"
            >
              团队会议评估
            </button>
            <button
              onClick={() => {
                toast.success("评估结果已确认 · 请指派治疗师");
                setTherapistPickerOpen(true);
              }}
              className="flex-1 gradient-doctor text-white rounded-2xl py-3 text-sm font-semibold"
            >
              确认首次评估
            </button>
          </div>
        }>
        <AssessSheet patient={activePatient} onLaunchMeeting={() => { setActiveMeeting(null); setSheet("meeting"); }} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "goal"} onClose={close} title={`AI 康复目标${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="ai"
        footer={
          <button onClick={() => { toast.success("康复目标已同步治疗师"); close(); }} className="w-full gradient-ai text-white rounded-2xl py-3 text-sm font-semibold">同步治疗师</button>
        }>
        <GoalSheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "plan"} onClose={close} title={`AI 康复方案${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="ai"
        footer={
          <div className="flex gap-2">
            <button onClick={() => { setActiveMeeting(null); setSheet("meeting"); }} className="flex-1 border border-ai/30 text-ai rounded-2xl py-3 text-sm font-semibold">提交团队会议</button>
            <button onClick={() => { toast.success("康复方案已直接确认 · 推送治疗师"); close(); }} className="flex-1 gradient-doctor text-white rounded-2xl py-3 text-sm font-semibold">直接确认</button>
          </div>
        }>
        <PlanSheet patient={activePatient} onLaunchMeeting={() => { setActiveMeeting(null); setSheet("meeting"); }} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "meetingList"} onClose={close} title="团队会议" accent="doctor">
        <TeamMeetingListSheet
          accent="doctor"
          meetings={meetings}
          onPick={(m) => { setActiveMeeting(m); setSheet("meeting"); }}
          onCreate={() => setSheet("newMeeting")}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "newMeeting"} onClose={() => setSheet("meetingList")} title="新增团队会议" accent="doctor">
        <NewMeetingSheet
          accent="doctor"
          onCreate={(m) => {
            setMeetings([m, ...meetings]);
            setActiveMeeting(m);
            toast.success("会议已创建");
            setSheet("meeting");
          }}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "meeting"} onClose={() => setSheet(activeMeeting ? "meetingList" : null)} title="团队会议" accent="doctor" flush hideHeader>
        <IMChatSheet
          accent="doctor"
          title={`团队会议 · ${activeMeeting?.patientName ?? (activePatient ? activePatient.split(" ")[0] : "张建国")}`}
          subtitle={activeMeeting?.topic ?? "V2 方案确认"}
          participants={activeMeeting?.participants ?? ["李医师", "王治疗师", "陈治疗师", "赵护士", "孙博士"]}
          initialMessages={DEFAULT_MEETING_MSGS}
          onAISummary={() => {}}
          enablePatientReminder
          enablePlanConfirm
          onClose={() => setSheet(activeMeeting ? "meetingList" : null)}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "rx"} onClose={close} title={`确认康复医嘱${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="doctor"
        footer={
          <div className="flex gap-2">
            <button onClick={() => setTherapistPickerOpen(true)} className="flex-1 border border-primary/30 text-primary rounded-2xl py-3 text-sm font-semibold">调整治疗师</button>
            <button onClick={() => toast("已驳回，待 AI 重新生成")} className="flex-1 border border-border rounded-2xl py-3 text-sm font-semibold">驳回</button>
            <button onClick={() => { toast.success("处方已确认 · 推送治疗师"); close(); }} className="flex-1 gradient-doctor text-white rounded-2xl py-3 text-sm font-semibold">确认 · 推送</button>
          </div>
        }>
        <RxSheet patient={activePatient} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "discharge"} onClose={close} title={`出院二级方案${activePatient ? " · " + activePatient.split(" ")[0] : ""}`} accent="ai"
        footer={
          <div className="flex gap-2">
            <button onClick={() => toast("已请 AI 重新生成")} className="flex-1 border border-ai/30 text-ai rounded-2xl py-3 text-sm font-semibold">AI 重新生成</button>
            <button onClick={() => { toast.success("AI 出院方案二次确认通过 · 转社区"); close(); }} className="flex-1 gradient-doctor text-white rounded-2xl py-3 text-sm font-semibold">二次确认 · 转社区</button>
          </div>
        }>
        <DischargeSheet />
      </PhoneSheet>

      <PhoneSheet open={sheet === "videoPicker"} onClose={close} title="线上会诊 · 选择患者" accent="doctor">
        <VideoPatientPicker
          onPick={(p) => {
            setVideoPatient(p);
            setSheet("video");
          }}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "video"} onClose={() => setSheet("videoPicker")} title="线上会诊" accent="doctor" flush hideHeader>
        <IMChatSheet
          accent="doctor"
          title={`线上会诊 · ${videoPatient?.name ?? "王秀英"}`}
          subtitle={`${videoPatient?.condition ?? "髋关节术后会诊"} · 床${videoPatient?.bed ?? "305"}`}
          participants={
            videoPatient?.shared && videoPatient.shared.length > 0
              ? ["李医师", ...videoPatient.shared]
              : ["李医师", "王治疗师", "赵护士"]
          }
          initialMessages={DEFAULT_VIDEO_MSGS}
          onAISummary={() => {}}
          enablePatientReminder
          onClose={() => setSheet("videoPicker")}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "patientChatList"} onClose={close} title="患者沟通" accent="doctor">
        <PatientChatListSheet accent="doctor" onPick={(p) => { setChatPatient(p); setSheet("patientChat"); }} />
      </PhoneSheet>

      <PhoneSheet open={sheet === "patientChat"} onClose={() => setSheet("patientChatList")} title="患者沟通" accent="doctor" flush hideHeader>
        <PatientChatSheet accent="doctor" patient={chatPatient} onClose={() => setSheet("patientChatList")} />
      </PhoneSheet>

      <PhoneSheet
        open={sheet === "patientDetail"}
        onClose={close}
        title={`患者档案${pickedPatient ? " · " + pickedPatient.name : ""}`}
        accent="doctor"
        footer={
          pickedPatient
            ? (() => {
                const stage = getPatientStage(pickedPatient);
                const noteAct = { key: "note", label: "备注", icon: Edit3, onClick: () => setSheet("addNote") };
                let acts: any[] = [];
                if (stage === "院前") {
                  if (!pickedPatient.needFirstAssess) acts.push({ key: "assess", label: "查看评估", icon: ClipboardCheck, onClick: () => setSheet("assess") });
                  if (!pickedPatient.needPlanConfirm) acts.push({ key: "plan", label: "查看方案", icon: FileText, onClick: () => setSheet("plan") });
                  if (!pickedPatient.needRxConfirm) acts.push({ key: "rx", label: "查看医嘱", icon: Sparkles, onClick: () => setSheet("rx") });
                } else if (stage === "待出院") {
                  // 待出院：仅查看详情 + 备注，无其他操作
                  acts = [];
                } else if (stage === "院中") {
                  acts = [
                    { key: "assess", label: "查看评估", icon: ClipboardCheck, onClick: () => setSheet("assess") },
                    { key: "plan", label: "查看方案", icon: FileText, onClick: () => setSheet("plan") },
                    { key: "rx", label: "查看医嘱", icon: Sparkles, onClick: () => setSheet("rx") },
                    { key: "discharge-plan", label: "计划出院", icon: LogOut, onClick: () => setDischargePlanOpen(true) },
                  ];
                }
                acts.push(noteAct);
                return <PatientActionsBar accent="doctor" actions={acts} />;
              })()
            : undefined
        }
      >
        <PatientDetailSheet
          patient={pickedPatient}
          accent="doctor"
          onAddNote={() => setSheet("addNote")}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "addNote"} onClose={() => setSheet("patientDetail")} title="添加患者备注" accent="doctor">
        <AddNoteSheet
          patient={pickedPatient}
          accent="doctor"
          onSave={(text) => {
            if (!pickedPatient) return;
            const newNote = { author: "李医师", time: "刚刚", text };
            const updated = [newNote, ...(patientNotes[pickedPatient.id] ?? pickedPatient.notes)];
            setPatientNotes({ ...patientNotes, [pickedPatient.id]: updated });
            setPickedPatient({ ...pickedPatient, notes: updated });
            toast.success("备注已保存并共享给团队");
            setSheet("patientDetail");
          }}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === "team"} onClose={close} title="团队管理" accent="doctor">
        <TeamManageSheet accent="doctor" />
      </PhoneSheet>

      <TherapistPickerDialog
        open={therapistPickerOpen}
        onClose={() => setTherapistPickerOpen(false)}
        onConfirm={(types, name) => {
          setTherapistPickerOpen(false);
          toast.success(`已指定 ${types.join("/")} 治疗师 · ${name}`);
          close();
        }}
      />

      <DischargePlanDialog
        open={dischargePlanOpen}
        date={dischargeDate}
        onChangeDate={setDischargeDate}
        patientName={pickedPatient?.name}
        onClose={() => setDischargePlanOpen(false)}
        onConfirm={(d) => {
          setDischargePlanOpen(false);
          toast.success(`已生成「${pickedPatient?.name ?? "患者"}」计划出院时间：${d.toLocaleDateString("zh-CN")}`);
        }}
      />
    </ScreenShell>
  );
};

/* ===== 线上会诊 · 患者选择 ===== */
const VideoPatientPicker = ({ onPick }: { onPick: (p: Patient) => void }) => (
  <div className="p-4 space-y-3">
    <AICard title="发起线上会诊 · 先选择患者">
      不同患者关联的协作角色不同，请先选择患者，系统会自动拉取该患者的医师 / 治疗师 / 护理 / 心理团队进入会诊。
    </AICard>
    <SectionTitle title={`患者列表 · ${PATIENTS.length}`} />
    <div className="space-y-2">
      {PATIENTS.map((p) => (
        <button
          key={p.id}
          onClick={() => onPick(p)}
          className="w-full bg-card rounded-2xl shadow-card p-3.5 text-left active:scale-[0.99] transition-transform flex items-center gap-3"
        >
          <div className="w-11 h-11 rounded-2xl gradient-doctor text-white flex items-center justify-center font-bold">{p.name[0]}</div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold flex items-center gap-1.5">
              {p.name}
              <span className="text-[10px] text-muted-foreground font-normal">床{p.bed}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-soft text-primary">{p.status}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{p.condition} · {p.meta}</div>
            <div className="text-[10px] text-muted-foreground mt-1 truncate">协作：{p.shared.join(" / ") || "暂无"}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  </div>
);

/* ===== 指定治疗师弹窗 ===== */
const THERAPIST_OPTIONS: Record<"PT" | "OT" | "ST", string[]> = {
  PT: ["王雅琴", "李建华"],
  OT: ["陈治疗师", "周敏"],
  ST: ["陈思雨", "刘语欣"],
};

const TherapistPickerDialog = ({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (types: ("PT" | "OT" | "ST")[], name: string) => void;
}) => {
  const [types, setTypes] = useState<("PT" | "OT" | "ST")[]>([]);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const toggle = (t: "PT" | "OT" | "ST") =>
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>指派治疗师</AlertDialogTitle>
          <AlertDialogDescription>评估已确认。请选择治疗类型（PT / OT / ST），并为每种类型指派治疗师。</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            {(["PT", "OT", "ST"] as const).map((t) => (
              <button
                key={t}
                onClick={() => toggle(t)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${
                  types.includes(t) ? "gradient-doctor text-white border-transparent" : "border-border text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {types.map((t) => (
            <div key={t} className="bg-muted rounded-xl p-3">
              <div className="text-[11px] text-muted-foreground mb-2">{t} 治疗师</div>
              <div className="flex flex-wrap gap-2">
                {THERAPIST_OPTIONS[t].map((name) => (
                  <button
                    key={name}
                    onClick={() => setPicked({ ...picked, [t]: name })}
                    className={`text-[12px] px-3 py-1.5 rounded-lg border ${
                      picked[t] === name ? "bg-primary text-primary-foreground border-transparent" : "border-border bg-card"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (types.length === 0) return;
              const names = types.map((t) => picked[t] ?? THERAPIST_OPTIONS[t][0]).join(" / ");
              onConfirm(types, names);
              setTypes([]);
              setPicked({});
            }}
          >
            确认指派
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const DischargePlanDialog = ({
  open,
  onClose,
  onConfirm,
  date,
  onChangeDate,
  patientName,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (d: Date) => void;
  date?: Date;
  onChangeDate: (d?: Date) => void;
  patientName?: string;
}) => (
  <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
    <AlertDialogContent className="max-w-sm">
      <AlertDialogHeader>
        <AlertDialogTitle>计划出院时间</AlertDialogTitle>
        <AlertDialogDescription>
          为「{patientName ?? "患者"}」选择计划出院日期，系统将同步给治疗师与护理团队。
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="flex justify-center">
        <CalendarUI
          mode="single"
          selected={date}
          onSelect={onChangeDate}
          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
          className="rounded-md border"
        />
      </div>
      {date && (
        <div className="text-center text-[12px] text-foreground">
          已选择：<span className="font-semibold">{date.toLocaleDateString("zh-CN")}</span>
        </div>
      )}
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onClose}>取消</AlertDialogCancel>
        <AlertDialogAction onClick={() => date && onConfirm(date)} disabled={!date}>
          确认计划出院
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);


const DoctorChatHub = ({
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
    <div className="gradient-doctor px-5 pt-6 pb-6 text-white">
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
      <PatientChatListSheet accent="doctor" onPick={onOpenPatient} />
    ) : (
      <TeamMeetingListSheet
        accent="doctor"
        meetings={meetings}
        onPick={onPickMeeting}
        onCreate={onCreateMeeting}
      />
    )}
  </div>
);

const DoctorHome = ({
  onOpen,
  onGoPatients,
  onGoPlan,
  onGoRx,
  onGoDischarge,
  onGoChat,
}: {
  onOpen: (k: SheetKey) => void;
  onGoPatients: (filter?: PatientFilter) => void;
  onGoPlan: (stage: PlanStage) => void;
  onGoRx: () => void;
  onGoDischarge: () => void;
  onGoChat: () => void;
}) => {
  return (
    <div className="pb-4">
      {/* 顶部白色头部 */}
      <div className="bg-background px-5 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">早上好</div>
            <div className="text-xl font-bold mt-0.5 text-foreground">李医师 👋</div>
            <div className="text-[11px] text-muted-foreground mt-1">康复医师 · 共 {PATIENTS.length} 位患者</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onOpen("patientChatList")} className="w-9 h-9 rounded-full bg-primary-soft text-primary flex items-center justify-center relative">
              <MessageCircle className="w-4 h-4" />
              {PATIENT_UNREAD > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-warning text-white text-[10px] font-bold flex items-center justify-center">
                  {PATIENT_UNREAD}
                </span>
              )}
            </button>
            <button onClick={() => toast("您有 3 条新提醒")} className="w-9 h-9 rounded-full bg-primary-soft text-primary flex items-center justify-center relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 mt-3 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[13px] font-bold text-foreground">今日待处理</span>
            <button onClick={() => onGoPlan("plan")} className="text-[11px] text-primary font-medium flex items-center">
              点击进入处理 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <PendingTodoGrid
            items={[
              { label: "待首次评估", count: FIRST_ASSESS_COUNT, icon: ClipboardCheck, iconClass: "bg-warning text-white", onClick: () => onGoPatients("待首次评估") },
              { label: "退回重评", count: RETURNED_REASSESS_COUNT, icon: AlertTriangle, iconClass: "bg-destructive text-white", onClick: () => onGoPatients("退回重评") },
              { label: "待设定目标", count: 3, icon: Target, iconClass: "bg-primary text-white", onClick: () => onGoPlan("goal") },
              { label: "待确认方案", count: 3, icon: FileText, iconClass: "bg-secondary text-white", onClick: () => onGoPlan("plan") },
              { label: "待确认医嘱", count: 4, icon: Sparkles, iconClass: "bg-success text-white", onClick: onGoRx },
              { label: "待出院评估", count: PATIENTS.filter(p => getPatientStage(p) === "待出院").length, icon: LogOut, iconClass: "bg-destructive text-white", onClick: () => onGoPatients("待出院") },
            ]}
          />
        </div>

        <div>
          <SectionTitle
            title="今日紧急待办"
            extra={<button onClick={() => onGoPlan("plan")} className="text-xs text-primary font-medium flex items-center">全部 <ChevronRight className="w-3 h-3" /></button>}
          />
          <div className="space-y-2">
            <PatientTaskCard onClick={() => onGoPatients("退回重评")} patient="退回重评 · 重新首次评估" tag={`共 ${RETURNED_REASSESS_COUNT} 位患者`} task="赵子轩 318 / 黄淑芬 320 · 治疗师与护士反馈与首评不符，需医师重新组织首评" urgency="high" time="今日 09:30" />
            <PatientTaskCard onClick={() => onGoPlan("plan")} patient="待确认 AI 方案" tag="共 3 位患者" task="点击进入方案确认列表，逐位审核" urgency="high" time="10:30 团队会议" />
            <PatientTaskCard onClick={() => onGoPatients("待首次评估")} patient="待首次评估" tag={`共 ${FIRST_ASSESS_COUNT} 位患者`} task="团队线上接入 · 进入患者列表" urgency="medium" time="今日" />
            <PatientTaskCard onClick={onGoDischarge} patient="待二次确认出院方案" tag="共 2 位患者" task="AI 二级方案待医师二次确认" urgency="low" time="今日" />
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientTaskCard = ({ patient, tag, task, urgency, time, onClick }: {
  patient: string; tag: string; task: string; urgency: "high" | "medium" | "low"; time: string; onClick?: () => void;
}) => {
  const urgencyMap = {
    high: { color: "bg-destructive/10 text-destructive", label: "紧急" },
    medium: { color: "bg-warning/15 text-warning", label: "重要" },
    low: { color: "bg-primary/10 text-primary", label: "常规" },
  }[urgency];
  return (
    <button onClick={onClick} className="w-full text-left bg-card rounded-2xl shadow-card p-3.5 active:scale-[0.99] transition-transform">
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <div className="text-[13px] font-semibold text-foreground">{patient}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{tag}</div>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${urgencyMap.color}`}>{urgencyMap.label}</span>
      </div>
      <div className="text-[12px] text-foreground/80 leading-relaxed">{task}</div>
      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border/60">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> {time}</span>
        <span className="text-[11px] text-primary font-semibold flex items-center">查看 <ChevronRight className="w-3 h-3" /></span>
      </div>
    </button>
  );
};

const DoctorMe = ({ onOpenTeam }: { onOpenTeam: () => void }) => (
  <div className="px-4 pt-4 pb-4 space-y-4">
    <div className="bg-card rounded-2xl shadow-card p-5 flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl gradient-doctor flex items-center justify-center text-white text-xl font-bold">李</div>
      <div>
        <div className="text-base font-bold">李志远 主任医师</div>
        <div className="text-xs text-muted-foreground mt-0.5">神经康复科 · 从业 18 年</div>
        <div className="flex gap-1.5 mt-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-soft text-primary font-medium">脑卒中</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-soft text-secondary font-medium">脊髓损伤</span>
        </div>
      </div>
    </div>

    <MeStats
      accent="doctor"
      tiles={[
        { label: "本月接诊", value: 86, sub: "患者人次" },
        { label: "方案确认", value: 124, sub: "AI 方案" },
        { label: "团队会议", value: 18, sub: "次" },
      ]}
      trend={[
        { day: "一", value: 12 }, { day: "二", value: 15 }, { day: "三", value: 9 },
        { day: "四", value: 18 }, { day: "五", value: 14 }, { day: "六", value: 6 }, { day: "日", value: 4 },
      ]}
    />

    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <button onClick={onOpenTeam} className="w-full flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-role-doctor" />
          <span className="text-sm">团队管理</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-soft text-primary">配置成员 · 共享患者</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
      {[
        { label: "我的患者", info: `当前共 ${PATIENTS.length} 位患者，新患者 ${NEW_PATIENT_COUNT} 位` },
        { label: "评估记录", info: "本月已完成 86 份首次评估，详情已同步至档案" },
        { label: "AI 偏好设置", info: "AI 风险偏好：保守 · 处方默认 4 周复评" },
        { label: "帮助与反馈", info: "客服电话：400-021-8866，工单已为您准备" },
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

const AI_DEFAULT_CONCLUSION = `综合判定：急性缺血性卒中后右侧偏瘫，NIHSS 14 分（中度），mRS 4 级（中重度残疾）。
当前主要功能障碍：右上下肢运动重度受损（肌力 2 级）、轻度表达性失语、左侧空间忽略、吞咽可疑异常。
合并高跌倒/DVT/压疮风险与营养及认知风险，整体康复潜力中等。
建议方向：① 床旁早期 PT（良肢位、被动 ROM、坐位平衡）；② OT 介入 ADL + 视空间忽略训练；③ ST 进行吞咽与构音训练，暂予糊状饮食；④ 护理重点落实跌倒/压疮/DVT 三大预防 + 营养支持；⑤ 7 天后复评 NIHSS / mRS / MoCA，必要时再次发起 MDT。`;

// ===== 评估量表库 =====
type ScaleRole = "doctor" | "PT" | "OT" | "ST";
type ScaleStatus = "AI 已预填" | "已完成" | "待填写";
type Scale = {
  key: string;
  name: string;
  role: ScaleRole;
  brief: string;       // 用途
  result?: string;     // 已有结果
  status: ScaleStatus;
  recommended?: boolean; // AI 推荐
};

// AI 基于该患者（急性缺血性卒中、中度 NIHSS、右侧偏瘫）优先推荐的医师量表
const DOCTOR_SCALES: Scale[] = [
  { key: "nihss", name: "NIHSS 卒中量表", role: "doctor", brief: "急性卒中严重程度", result: "14 分 · 中度", status: "AI 已预填", recommended: true },
  { key: "mrs", name: "mRS 改良 Rankin", role: "doctor", brief: "残疾程度 / 日常生活能力", result: "4 级 · 中重度残疾", status: "AI 已预填", recommended: true },
  { key: "morse", name: "Morse 跌倒风险", role: "doctor", brief: "跌倒分层", result: "高 55 分", status: "AI 已预填", recommended: true },
  { key: "braden", name: "Braden 压疮风险", role: "doctor", brief: "压疮分层", result: "中 16 分", status: "AI 已预填", recommended: true },
  { key: "wada", name: "洼田饮水试验", role: "doctor", brief: "吞咽风险筛查", result: "可疑异常 3 级", status: "AI 已预填", recommended: true },
  { key: "caprini", name: "Caprini DVT", role: "doctor", brief: "深静脉血栓风险", result: "高危 5 分", status: "AI 已预填", recommended: true },
  { key: "nrs2002", name: "NRS2002 营养", role: "doctor", brief: "营养风险筛查", result: "3 分 · 有风险", status: "AI 已预填", recommended: true },
  { key: "moca", name: "MoCA 认知", role: "doctor", brief: "认知功能", result: "18/30 · 轻度损害", status: "AI 已预填", recommended: true },
];

// 治疗师量表库（PT / OT / ST），首评时医师可按需补充加入
const THERAPIST_SCALE_LIB: Scale[] = [
  // PT
  { key: "fma", name: "简化 Fugl-Meyer 运动评测", role: "PT", brief: "上下肢运动功能", status: "待填写", recommended: true },
  { key: "mas-pt", name: "MAS 卒中运动功能评估", role: "PT", brief: "8 项运动功能 0–6 分", status: "待填写", recommended: true },
  { key: "ashworth", name: "改良 Ashworth 痉挛", role: "PT", brief: "肌张力分级", status: "待填写" },
  { key: "berg", name: "Berg 平衡量表", role: "PT", brief: "静态/动态平衡", status: "待填写" },
  { key: "tct", name: "躯干控制能力 TCT", role: "PT", brief: "躯干控制", status: "待填写" },
  { key: "fac", name: "功能性步行 FAC", role: "PT", brief: "步行能力分级", status: "待填写" },
  { key: "holden", name: "Holden 步行功能", role: "PT", brief: "步行独立性", status: "待填写" },
  { key: "tug", name: "3M 计时起立行走 TUG", role: "PT", brief: "动态平衡 / 跌倒", status: "待填写" },
  { key: "mmt", name: "徒手肌力 MMT", role: "PT", brief: "0–5 级肌力", status: "待填写" },
  { key: "rom", name: "关节活动度 ROM", role: "PT", brief: "关节活动范围", status: "待填写" },
  { key: "brunnstrom", name: "Brunnstrom 脑卒中分级", role: "PT", brief: "Ⅰ–Ⅵ 期", status: "待填写" },
  { key: "asia", name: "ASIA 脊髓损伤分级", role: "PT", brief: "脊髓损伤神经学分类", status: "待填写" },
  { key: "sit3", name: "坐立位三级平衡", role: "PT", brief: "三级平衡分级", status: "待填写" },
  // OT
  { key: "mbi", name: "Modified Barthel", role: "OT", brief: "ADL 日常生活能力", status: "AI 已预填", result: "55 分 · 中度依赖", recommended: true },
  { key: "fim", name: "FIM 功能独立性", role: "OT", brief: "运动+认知独立性", status: "待填写" },
  { key: "arat", name: "ARAT 上肢功能", role: "OT", brief: "上肢动作研究", status: "待填写", recommended: true },
  { key: "9hpt", name: "九孔/普渡钉板", role: "OT", brief: "手精细动作", status: "待填写" },
  { key: "dash", name: "DASH 上肢残疾", role: "OT", brief: "上肢功能问卷", status: "待填写" },
  { key: "lawton", name: "Lawton IADL", role: "OT", brief: "工具性日常活动", status: "待填写" },
  { key: "copm", name: "COPM 加拿大作业", role: "OT", brief: "作业表现满意度", status: "待填写" },
  { key: "sf36", name: "SF-36 生活质量", role: "OT", brief: "生活质量", status: "待填写" },
  // ST
  { key: "eat10", name: "EAT-10 吞咽问卷", role: "ST", brief: "吞咽自评", status: "待填写", recommended: true },
  { key: "vfss", name: "VFSS 吞咽造影", role: "ST", brief: "影像学吞咽评估", status: "待填写" },
  { key: "frenchay", name: "Frenchay 构音", role: "ST", brief: "构音障碍评估", status: "待填写" },
  { key: "wab", name: "WAB 失语症", role: "ST", brief: "失语症成套", status: "待填写" },
];

const STATUS_STYLE: Record<ScaleStatus, string> = {
  "AI 已预填": "bg-ai/10 text-ai",
  "已完成": "bg-success-soft text-success",
  "待填写": "bg-warning-soft text-warning",
};

const ROLE_BADGE: Record<ScaleRole, { label: string; cls: string }> = {
  doctor: { label: "医师", cls: "bg-primary-soft text-primary" },
  PT: { label: "PT", cls: "bg-secondary-soft text-secondary" },
  OT: { label: "OT", cls: "bg-warning-soft text-warning" },
  ST: { label: "ST", cls: "bg-ai/10 text-ai" },
};

const ScaleRow = ({ s, onView, onRemove }: { s: Scale; onView: () => void; onRemove?: () => void }) => {
  const role = ROLE_BADGE[s.role];
  return (
    <div className="px-4 py-3 flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[12px] font-semibold">{s.name}</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded ${role.cls} font-semibold`}>{role.label}</span>
          {s.recommended && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-ai/10 text-ai font-semibold flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" />AI 推荐
            </span>
          )}
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{s.brief}</div>
        {s.result && <div className="text-[11px] text-foreground/80 mt-1 font-medium">{s.result}</div>}
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${STATUS_STYLE[s.status]}`}>{s.status}</span>
        <div className="flex gap-1">
          <button onClick={onView} className="text-[10px] px-2 py-1 rounded-lg border border-border text-foreground/70">
            {s.status === "待填写" ? "填写 / OCR" : "查看"}
          </button>
          {onRemove && (
            <button onClick={onRemove} className="text-[10px] px-2 py-1 rounded-lg border border-destructive/30 text-destructive">
              移除
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// 量表条目模板（按 key 提供典型条目，未配置则用通用条目）
const SCALE_ITEM_TEMPLATES: Record<string, { label: string; value: string }[]> = {
  nihss: [
    { label: "1a 意识水平", value: "1 嗜睡" },
    { label: "1b 意识水平提问", value: "1 一项正确" },
    { label: "2 凝视", value: "1 部分凝视麻痹" },
    { label: "3 视野", value: "1 部分偏盲" },
    { label: "4 面瘫", value: "2 部分性瘫" },
    { label: "5a 右上肢运动", value: "3 不能抗重力" },
    { label: "6a 右下肢运动", value: "3 不能抗重力" },
    { label: "9 语言", value: "1 轻-中度失语" },
    { label: "10 构音障碍", value: "1 轻度" },
  ],
  mrs: [{ label: "mRS 等级", value: "4 中重度残疾" }],
  morse: [
    { label: "跌倒史", value: "25" },
    { label: "多种诊断", value: "15" },
    { label: "步态/转移", value: "10" },
    { label: "精神状态", value: "0" },
  ],
  braden: [
    { label: "感觉", value: "3" },
    { label: "潮湿", value: "3" },
    { label: "活动", value: "2" },
    { label: "移动", value: "2" },
    { label: "营养", value: "3" },
    { label: "摩擦剪切", value: "3" },
  ],
  wada: [{ label: "饮 30ml 温水分级", value: "3 级 · 可疑异常" }],
  caprini: [{ label: "Caprini 评分", value: "5 分 · 高危" }],
  nrs2002: [
    { label: "营养状况受损", value: "1" },
    { label: "疾病严重程度", value: "1" },
    { label: "年龄 ≥70", value: "1" },
  ],
  moca: [
    { label: "视空间执行", value: "3/5" },
    { label: "命名", value: "2/3" },
    { label: "注意力", value: "3/6" },
    { label: "语言", value: "1/3" },
    { label: "延迟回忆", value: "2/5" },
    { label: "定向力", value: "6/6" },
  ],
  mbi: [
    { label: "进食", value: "10" },
    { label: "洗澡", value: "0" },
    { label: "修饰", value: "5" },
    { label: "穿衣", value: "5" },
    { label: "如厕", value: "5" },
    { label: "床椅转移", value: "10" },
    { label: "平地行走", value: "10" },
    { label: "上下楼梯", value: "5" },
  ],
};

const ScaleDetail = ({ scale, onClose }: { scale: Scale; onClose: () => void }) => {
  const initial = SCALE_ITEM_TEMPLATES[scale.key] ?? [
    { label: "条目 1", value: "" },
    { label: "条目 2", value: "" },
    { label: "条目 3", value: "" },
    { label: "条目 4", value: "" },
    { label: "条目 5", value: "" },
  ];
  const [items, setItems] = useState(initial);
  const [note, setNote] = useState("");
  const [name, setName] = useState(scale.name);
  const [editingTitle, setEditingTitle] = useState(false);
  const role = ROLE_BADGE[scale.role];

  const addItem = () => setItems([...items, { label: `自定义条目 ${items.length + 1}`, value: "" }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const update = (i: number, k: "label" | "value", v: string) =>
    setItems(items.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));

  return (
    <div className="absolute inset-0 z-40 bg-background flex flex-col">
      <div className="gradient-doctor text-white px-4 pt-3 pb-4 flex items-center gap-2">
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              autoFocus
              className="text-sm font-semibold bg-white/20 text-white rounded px-2 py-1 w-full"
            />
          ) : (
            <button onClick={() => setEditingTitle(true)} className="text-sm font-semibold flex items-center gap-1">
              {name} <Edit3 className="w-3 h-3 opacity-70" />
            </button>
          )}
          <div className="text-[10px] opacity-80 mt-0.5">{scale.brief} · 支持自定义编辑</div>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${role.cls}`}>{role.label}</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3 pb-24">
        <AICard title="AI 预填说明">
          已基于患者档案自动预填本量表 {scale.status === "AI 已预填" ? "全部" : "部分"} 条目，请逐项核对并修改；所有条目均可编辑或自定义新增。
        </AICard>

        <button
          onClick={() => toast("打开摄像头识别纸质量表...")}
          className="w-full bg-ai/10 border border-ai/30 rounded-2xl p-3 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-ai text-white flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-[12px] font-semibold text-ai">OCR 拍照上传纸质量表</div>
            <div className="text-[10px] text-muted-foreground">AI 自动识别并填入条目</div>
          </div>
          <ChevronRight className="w-4 h-4 text-ai" />
        </button>

        <SectionTitle
          title={`量表条目 · ${items.length}`}
          extra={
            <button onClick={addItem} className="text-[11px] text-primary font-semibold flex items-center gap-0.5">
              <Plus className="w-3 h-3" />新增条目
            </button>
          }
        />
        <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
          {items.map((it, i) => (
            <div key={i} className="px-3 py-2.5 flex items-center gap-2">
              <input
                value={it.label}
                onChange={(e) => update(i, "label", e.target.value)}
                className="flex-1 min-w-0 text-[12px] bg-transparent border-b border-transparent focus:border-primary/40 outline-none py-1"
              />
              <input
                value={it.value}
                onChange={(e) => update(i, "value", e.target.value)}
                placeholder="评分"
                className="w-24 text-[12px] bg-muted rounded px-2 py-1 text-right"
              />
              <button onClick={() => removeItem(i)} className="text-[10px] text-destructive p-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <SectionTitle title="备注" />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="补充说明、配合度、特殊情况..."
          className="w-full text-[12px] bg-card rounded-2xl shadow-card p-3 min-h-[80px] resize-none"
        />
      </div>

      <div className="absolute left-0 right-0 bottom-0 bg-card/95 backdrop-blur-xl border-t border-border/60 px-4 py-3 pb-6 flex gap-2">
        <button onClick={onClose} className="flex-1 border border-border rounded-2xl py-3 text-sm font-semibold">取消</button>
        <button
          onClick={() => { toast.success(`「${name}」已保存`); onClose(); }}
          className="flex-1 gradient-doctor text-white rounded-2xl py-3 text-sm font-semibold"
        >
          保存
        </button>
      </div>
    </div>
  );
};

/* ===== 内嵌康复目标（首次评估页内可编辑/删除） ===== */
type InlineGoal = { id: string; dim: "function" | "activity" | "participation"; period: string; source: "AI" | "医师"; text: string };
const INLINE_DEFAULT_GOALS: InlineGoal[] = [
  { id: "ig1", dim: "function", period: "4 周", source: "AI", text: "右上下肢肌力由 2 级提升至 3+ 级，痉挛 MAS ≤ 1+" },
  { id: "ig2", dim: "function", period: "4 周", source: "AI", text: "MoCA 由 18 提升至 ≥ 24，左侧空间忽略明显改善" },
  { id: "ig3", dim: "activity", period: "2 周", source: "AI", text: "床椅转移独立完成，助行器辅助步行 30m" },
  { id: "ig4", dim: "activity", period: "4 周", source: "AI", text: "独立步行 ≥ 50m（FAC ≥ 3），Barthel ≥ 75" },
  { id: "ig5", dim: "participation", period: "8 周", source: "AI", text: "回归家庭：独立完成进食、如厕、穿衣，参与家庭对话" },
];
const INLINE_DIM: Record<InlineGoal["dim"], { label: string; cls: string }> = {
  function: { label: "身体功能与结构", cls: "bg-primary-soft text-primary" },
  activity: { label: "活动", cls: "bg-secondary-soft text-secondary" },
  participation: { label: "参与", cls: "bg-warning-soft text-warning" },
};
export const InlineGoals = ({ accent = "doctor" }: { accent?: "doctor" | "therapist" }) => {
  const [goals, setGoals] = useState<InlineGoal[]>(INLINE_DEFAULT_GOALS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState<InlineGoal["dim"] | null>(null);
  const [newDraft, setNewDraft] = useState("");
  const grad = accent === "therapist" ? "gradient-therapist" : "gradient-doctor";
  const accentText = accent === "therapist" ? "text-secondary" : "text-primary";

  const startEdit = (g: InlineGoal) => { setEditingId(g.id); setDraft(g.text); };
  const saveEdit = () => {
    if (!editingId) return;
    setGoals(goals.map(g => g.id === editingId ? { ...g, text: draft.trim() || g.text } : g));
    setEditingId(null);
    toast.success("目标已更新");
  };
  const remove = (id: string) => { setGoals(goals.filter(g => g.id !== id)); toast.success("目标已删除"); };
  const addGoal = (dim: InlineGoal["dim"]) => {
    if (!newDraft.trim()) return;
    setGoals([...goals, { id: `ig${Date.now()}`, dim, period: "4 周", source: "医师", text: newDraft.trim() }]);
    setNewDraft(""); setAdding(null);
    toast.success("已新增目标");
  };

  return (
    <div className="space-y-2">
      {(Object.keys(INLINE_DIM) as InlineGoal["dim"][]).map(dim => {
        const list = goals.filter(g => g.dim === dim);
        const meta = INLINE_DIM[dim];
        return (
          <div key={dim} className="bg-card rounded-2xl shadow-card overflow-hidden">
            <div className="px-3 py-2 flex items-center justify-between border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${meta.cls}`}>{meta.label}</span>
                <span className="text-[10px] text-muted-foreground">{list.length} 项</span>
              </div>
              <button onClick={() => { setAdding(dim); setNewDraft(""); }} className={`text-[11px] ${accentText} font-semibold flex items-center gap-0.5`}><Plus className="w-3 h-3" />添加</button>
            </div>
            <div className="divide-y divide-border/60">
              {list.map(g => (
                <div key={g.id} className="px-3 py-2.5">
                  {editingId === g.id ? (
                    <div className="space-y-2">
                      <textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="w-full text-[12px] bg-muted rounded-lg p-2 min-h-[60px]" autoFocus />
                      <div className="flex gap-2">
                        <button onClick={() => setEditingId(null)} className="flex-1 text-[11px] border border-border rounded-lg py-1.5">取消</button>
                        <button onClick={saveEdit} className={`flex-1 text-[11px] ${grad} text-white rounded-lg py-1.5 font-semibold`}>保存</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground/70 font-semibold">{g.period}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${g.source === "AI" ? "bg-ai/10 text-ai" : "bg-primary-soft text-primary"}`}>{g.source}</span>
                      </div>
                      <div className="text-[12px] text-foreground/90 mt-1 leading-relaxed">{g.text}</div>
                      <div className="mt-1.5 flex gap-2">
                        <button onClick={() => startEdit(g)} className={`text-[11px] ${accentText} font-semibold flex items-center gap-0.5`}><Edit2 className="w-3 h-3" />编辑</button>
                        <button onClick={() => remove(g.id)} className="text-[11px] text-destructive font-semibold flex items-center gap-0.5"><X className="w-3 h-3" />删除</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {adding === dim && (
                <div className="px-3 py-2.5 bg-muted/40 space-y-2">
                  <textarea value={newDraft} onChange={(e) => setNewDraft(e.target.value)} placeholder={`新增「${meta.label}」目标`} className="w-full text-[11px] bg-background border border-border rounded-lg p-2 min-h-[60px]" autoFocus />
                  <div className="flex gap-2">
                    <button onClick={() => setAdding(null)} className="flex-1 text-[11px] border border-border rounded-lg py-1.5">取消</button>
                    <button onClick={() => addGoal(dim)} className={`flex-1 text-[11px] ${grad} text-white rounded-lg py-1.5 font-semibold`}>保存</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AssessSheet = ({ patient, onLaunchMeeting }: { patient?: string; onLaunchMeeting: () => void }) => {
  const name = patient ? patient.split(" ")[0] : "张建国";
  const [conclusion, setConclusion] = useState(AI_DEFAULT_CONCLUSION);
  const [draft, setDraft] = useState(conclusion);
  const [editing, setEditing] = useState(false);

  // 医师量表始终显示
  const [docScales, setDocScales] = useState<Scale[]>(DOCTOR_SCALES);
  // 已加入的治疗师量表
  const [extraScales, setExtraScales] = useState<Scale[]>(
    THERAPIST_SCALE_LIB.filter((s) => s.status !== "待填写"),
  );
  const [showLib, setShowLib] = useState(false);
  const [libRole, setLibRole] = useState<ScaleRole | "ALL">("ALL");
  const [viewing, setViewing] = useState<Scale | null>(null);

  const addScale = (s: Scale) => {
    if (extraScales.find((x) => x.key === s.key)) {
      toast("该量表已添加");
      return;
    }
    setExtraScales([...extraScales, s]);
    toast.success(`已加入「${s.name}」`);
  };
  const removeScale = (k: string) => setExtraScales(extraScales.filter((x) => x.key !== k));

  const viewScale = (s: Scale) => setViewing(s);

  const libList = THERAPIST_SCALE_LIB.filter((s) => libRole === "ALL" || s.role === libRole);
  const completedCount = [...docScales, ...extraScales].filter((s) => s.status !== "待填写").length;
  const totalCount = docScales.length + extraScales.length;

  return (
    <div className="p-4 space-y-3">
      {/* 患者档案概要 */}
      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-doctor text-white flex items-center justify-center font-bold text-lg">{name[0]}</div>
          <div className="flex-1">
            <div className="text-sm font-bold">{patient || "张建国 · 男 68 岁"}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">床号 303 · 病案号 ZY-052266 · 主诊：李敏 副主任医师</div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-primary-soft text-primary font-semibold">首次评估</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted rounded-xl py-2"><div className="text-[9px] text-muted-foreground">看诊时间</div><div className="text-[11px] font-semibold mt-0.5">05-08 09:00</div></div>
          <div className="bg-muted rounded-xl py-2"><div className="text-[9px] text-muted-foreground">入院日期</div><div className="text-[11px] font-semibold mt-0.5">05-07</div></div>
          <div className="bg-muted rounded-xl py-2"><div className="text-[9px] text-muted-foreground">入院诊断</div><div className="text-[11px] font-semibold mt-0.5">急性缺血卒中</div></div>
        </div>
        <div className="mt-2 text-[11px] text-foreground/75 leading-relaxed bg-muted/60 rounded-xl px-3 py-2">
          病史摘要：高血压 10 年、房颤 3 年；本次以「右侧肢体无力 + 言语含糊」起病，急诊溶栓后转入。当前右上下肢肌力 2 级，意识嗜睡。
        </div>
      </div>

      {/* 医师量表 */}
      <SectionTitle title={`医师评估量表 · ${docScales.length}`} extra={<span className="text-[10px] text-muted-foreground">已完成 {completedCount}/{totalCount}</span>} />
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
        {docScales.map((s) => (
          <ScaleRow key={s.key} s={s} onView={() => viewScale(s)} onRemove={() => setDocScales(docScales.filter((x) => x.key !== s.key))} />
        ))}
      </div>

      {/* 已添加的治疗师量表 */}
      <SectionTitle
        title={`补充评估量表 · ${extraScales.length}`}
        extra={
          <button
            onClick={() => setShowLib(!showLib)}
            className="text-[11px] font-semibold text-primary flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />{showLib ? "收起量表库" : "从量表库添加"}
          </button>
        }
      />
      {extraScales.length > 0 ? (
        <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
          {extraScales.map((s) => (
            <ScaleRow key={s.key} s={s} onView={() => viewScale(s)} onRemove={() => removeScale(s.key)} />
          ))}
        </div>
      ) : (
        <div className="bg-muted/40 rounded-2xl p-4 text-[11px] text-muted-foreground text-center">
          暂未添加治疗师量表，可点击「从量表库添加」补充 PT / OT / ST 量表
        </div>
      )}

      {/* 量表库 */}
      {showLib && (
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="px-4 pt-3 pb-2 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12px] font-semibold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" />治疗师量表库
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">含 PT / OT / ST 共 {THERAPIST_SCALE_LIB.length} 份；标记 AI 推荐者为本患者高相关</div>
              </div>
              <button onClick={() => setShowLib(false)} className="text-[11px] text-muted-foreground">关闭</button>
            </div>
            <div className="mt-2 flex gap-1 bg-muted rounded-full p-1 w-fit">
              {(["ALL", "PT", "OT", "ST"] as const).map((r) => {
                const active = libRole === r;
                return (
                  <button
                    key={r}
                    onClick={() => setLibRole(r)}
                    className={`text-[11px] px-3 py-1 rounded-full font-semibold ${active ? "gradient-doctor text-white" : "text-foreground/70"}`}
                  >
                    {r === "ALL" ? "全部" : r}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="max-h-[280px] overflow-y-auto divide-y divide-border/60">
            {libList.map((s) => {
              const added = !!extraScales.find((x) => x.key === s.key);
              const role = ROLE_BADGE[s.role];
              return (
                <button
                  key={s.key}
                  onClick={() => !added && addScale(s)}
                  className="w-full px-4 py-2.5 flex items-start gap-2 text-left active:bg-muted/40"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[12px] font-semibold">{s.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${role.cls}`}>{role.label}</span>
                      {s.recommended && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-ai/10 text-ai font-semibold flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />推荐
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{s.brief}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-lg font-semibold ${added ? "bg-success-soft text-success" : "gradient-doctor text-white"}`}>
                    {added ? "已添加" : "+ 添加"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 康复目标（AI 生成 · 可编辑删除） */}
      <SectionTitle title="康复目标" extra={<span className="text-[10px] text-muted-foreground">AI 基于 ICF 自动生成 · 支持编辑/删除</span>} />
      <InlineGoals />

      {/* AI 结论 */}
      <AICard
        title="AI 首次评估辅助结论"
        action={
          <button
            onClick={() => setEditing(!editing)}
            className="text-[11px] font-semibold text-ai flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3" />{editing ? "完成编辑" : "编辑结论"}
          </button>
        }
      >
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full min-h-[160px] text-[12px] leading-relaxed bg-background/60 border border-ai/20 rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-ai/40"
            />
            <div className="flex gap-2">
              <button
                className="flex-1 border border-ai/30 text-ai rounded-xl py-2 text-xs font-semibold flex items-center justify-center gap-1"
                onClick={() => { setDraft(AI_DEFAULT_CONCLUSION); toast("已重新生成 AI 结论"); }}
              ><RotateCcw className="w-3 h-3" />重新生成</button>
              <button
                className="flex-1 gradient-doctor text-white rounded-xl py-2 text-xs font-semibold"
                onClick={() => { setConclusion(draft); setEditing(false); toast.success("结论已保存"); }}
              >保存</button>
            </div>
          </div>
        ) : (
          <div className="whitespace-pre-line text-[12px] leading-relaxed">{conclusion}</div>
        )}
        <div className="mt-2 text-[10px] text-muted-foreground">评估医师：康复医学科 王敏 · 已纳入 {completedCount} 份量表数据</div>
      </AICard>

      {viewing && (
        <ScaleDetail scale={viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  );
};

const PatientHeader = ({ patient, label }: { patient?: string; label: string }) => {
  const name = patient ? patient.split(" ")[0] : "张建国";
  return (
    <div className="bg-card rounded-2xl shadow-card p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl gradient-doctor text-white flex items-center justify-center font-bold text-lg">{name[0]}</div>
        <div className="flex-1">
          <div className="text-sm font-bold">{patient || "张建国 · 男 56 · 床303"}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">脑卒中后偏瘫 · 入院第 12 天 · 主管医师：李志远</div>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-primary-soft text-primary font-semibold">{label}</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <StatChip label="FMA" value="42" accent="primary" />
        <StatChip label="Barthel" value="70" accent="success" />
        <StatChip label="VAS" value="3" accent="warning" />
      </div>
    </div>
  );
};

// ===== ICF 康复目标 =====
type ICFDim = "function" | "activity" | "participation";
type Goal = {
  id: string;
  dim: ICFDim;
  text: string;
  period: "1 周" | "2 周" | "4 周" | "8 周";
  source: "AI" | "医师" | "治疗师";
  subs: { id: string; text: string; by: string }[];
};

const ICF_DIM: Record<ICFDim, { label: string; desc: string; cls: string }> = {
  function: { label: "身体功能与结构", desc: "Body Functions · 损伤层面：肌力 / 张力 / 感觉 / 认知", cls: "bg-primary-soft text-primary" },
  activity: { label: "活动", desc: "Activity · 个体执行任务的能力：转移 / 步行 / ADL", cls: "bg-secondary-soft text-secondary" },
  participation: { label: "参与", desc: "Participation · 投入生活情境：家庭 / 社交 / 工作", cls: "bg-warning-soft text-warning" },
};

const DEFAULT_GOALS: Goal[] = [
  { id: "g1", dim: "function", period: "4 周", source: "AI", text: "右上下肢肌力由 2 级提升至 3+ 级，痉挛 MAS ≤ 1+", subs: [] },
  { id: "g2", dim: "function", period: "4 周", source: "AI", text: "MoCA 由 18 提升至 ≥ 24，左侧空间忽略明显改善", subs: [] },
  { id: "g3", dim: "activity", period: "2 周", source: "AI", text: "床椅转移独立完成，助行器辅助步行 30m", subs: [
    { id: "s1", text: "PT：坐站转换连续 5 次 / 不借助上肢", by: "PT 王雅琴" },
  ] },
  { id: "g4", dim: "activity", period: "4 周", source: "AI", text: "独立步行 ≥ 50m（FAC ≥ 3），Barthel ≥ 75", subs: [] },
  { id: "g5", dim: "participation", period: "8 周", source: "AI", text: "回归家庭：可独立完成进食、如厕、穿衣，参与家庭对话", subs: [] },
];

const GoalSheet = ({ patient }: { patient?: string }) => {
  const [goals, setGoals] = useState<Goal[]>(DEFAULT_GOALS);
  const [adding, setAdding] = useState<ICFDim | null>(null);
  const [draft, setDraft] = useState("");
  const [subFor, setSubFor] = useState<string | null>(null);
  const [subDraft, setSubDraft] = useState("");

  const addGoal = (dim: ICFDim) => {
    if (!draft.trim()) return;
    setGoals([...goals, { id: `g${Date.now()}`, dim, period: "4 周", source: "医师", text: draft.trim(), subs: [] }]);
    setDraft(""); setAdding(null);
    toast.success("已新增大目标");
  };
  const addSub = (goalId: string) => {
    if (!subDraft.trim()) return;
    setGoals(goals.map((g) => g.id === goalId ? { ...g, subs: [...g.subs, { id: `s${Date.now()}`, text: subDraft.trim(), by: "医师 李敏" }] } : g));
    setSubDraft(""); setSubFor(null);
    toast.success("已新增子目标");
  };

  return (
    <div className="p-4 space-y-3">
      <PatientHeader patient={patient} label="ICF 康复目标" />
      <AICard title="AI 基于 ICF 框架生成大目标">
        从「身体功能 / 活动 / 参与」三个维度自动生成 4–8 周分阶段目标。医师可自定义补充大目标，治疗师可在每个大目标下添加可执行的子目标。
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
                className="text-[11px] font-semibold text-primary flex items-center gap-1"
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
                      <button onClick={() => addSub(g.id)} className="text-[11px] gradient-doctor text-white rounded-lg px-3 font-semibold">添加</button>
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
                    <button onClick={() => addGoal(dim)} className="flex-1 text-[11px] gradient-doctor text-white rounded-lg py-1.5 font-semibold">保存</button>
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

const PlanSheet = ({ patient, onLaunchMeeting }: { patient?: string; onLaunchMeeting?: () => void }) => (
  <div className="p-4 space-y-3">
    <PatientHeader patient={patient} label="康复方案" />
    {onLaunchMeeting && (
      <button
        onClick={onLaunchMeeting}
        className="w-full bg-warning-soft border border-warning/30 rounded-2xl p-3 flex items-center gap-3 active:scale-[0.99]"
      >
        <div className="w-9 h-9 rounded-xl bg-warning text-white flex items-center justify-center">
          <Video className="w-4 h-4" />
        </div>
        <div className="flex-1 text-left">
          <div className="text-[12px] font-semibold text-warning">就该方案发起在线团队会议</div>
          <div className="text-[10px] text-muted-foreground">医师 / 治疗师 / 护士线上协同确认 · AI 自动纪要</div>
        </div>
        <ChevronRight className="w-4 h-4 text-warning" />
      </button>
    )}
    <AICard title="AI 生成的康复方案 V2">
      基于本周评估更新方案：PT 强度 +20%、新增 OT 厨房训练、ST 维持原计划。
    </AICard>
    <SectionTitle title="方案明细" />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="PT 物理治疗" value="60 min × 5/周" hint="步态 + 平衡 + 力量" />
      <FormRow label="OT 作业治疗" value="45 min × 5/周" hint="ADL + 厨房 + 书写" />
      <FormRow label="ST 言语治疗" value="30 min × 3/周" hint="构音 + 吞咽" />
      <FormRow label="物理因子" value="20 min × 5/周" hint="低频电刺激" />
      <FormRow label="药物联动" value="维持" hint="详见护理端医嘱" />
    </div>
    <AICard title="AI 方案差异提醒">
      与上版相比：训练总时长 +25%，建议会议关注患者耐受度与疲劳指数。
    </AICard>
  </div>
);

const RxSheet = ({ patient }: { patient?: string }) => (
  <RxDetail patient={patient} accent="doctor" />
);

const DischargeSheet = () => (
  <div className="p-4 space-y-3">
    {/* 患者基本信息 */}
    <div className="bg-card rounded-2xl shadow-card p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl gradient-doctor text-white flex items-center justify-center font-bold text-lg">李</div>
        <div className="flex-1">
          <div className="text-sm font-bold">李 强 · 男 42 · 床307</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">脊髓损伤 · 入院第 28 天 · 主管医师：李志远</div>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-success-soft text-success font-semibold">待出院</span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        <StatChip label="FMA" value="58" accent="primary" />
        <StatChip label="Barthel" value="85" accent="success" />
        <StatChip label="Berg" value="48" accent="success" />
        <StatChip label="VAS" value="1" accent="warning" />
      </div>
    </div>

    <SectionTitle title="档案 / 在院信息" extra={<span className="text-[10px] text-muted-foreground">完整电子病历</span>} />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="主诉" value="T10 平面以下运动障碍 4 个月" />
      <FormRow label="既往史" value="无特殊" hint="否认高血压 / 糖尿病" />
      <FormRow label="手术史" value="2026-04-01 椎管减压 + 内固定" />
      <FormRow label="入院诊断" value="不完全性脊髓损伤 · ASIA C" />
      <FormRow label="并发症筛查" value="DVT 阴性 · 压疮 0 期" />
      <FormRow label="过敏 / 医保" value="无 · 城镇职工" />
    </div>

    <SectionTitle title="多角色康复方案汇总" extra={<span className="text-[10px] text-muted-foreground">医师 / PT / OT / ST / 护理</span>} />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="医师 · 总体方案" value="渐进负重 + 神经促通" hint="李志远 · 第 4 周方案" />
      <FormRow label="PT · 物理治疗" value="60 min × 5/周" hint="步态 + 平衡 + 力量 · 王雅琴" />
      <FormRow label="OT · 作业治疗" value="45 min × 5/周" hint="ADL + 厨房 · 陈治疗师" />
      <FormRow label="ST · 言语治疗" value="30 min × 3/周" hint="构音 · 陈思雨" />
      <FormRow label="护理 · 康复护理" value="q4h 体位 + 皮肤护理" hint="赵静怡 · 主管护师" />
      <FormRow label="心理 · 出院适应" value="家属同伴支持" hint="孙博士" />
    </div>

    <SectionTitle title="近 7 日康复执行 / 用药记录" />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="今日 PT" value="步行 60m" hint="独立完成 · Borg 9" />
      <FormRow label="今日 OT" value="厨房 ADL" hint="独立完成 · 30 min" />
      <FormRow label="昨日 PT" value="上下楼" hint="扶手辅助 · 双足交替" />
      <FormRow label="昨日 ST" value="构音清晰度 92%" hint="EAT-10：2" />
      <FormRow label="本周用药" value="停巴氯芬 / 加 VitB" hint="李医师 · 本周三调整" />
      <FormRow label="护理打卡" value="14 / 14 项" hint="系统自动记录" />
    </div>

    <AICard title="AI 生成的院外二级方案 · 待二次确认">
      AI 综合上述在院档案、5 角色方案及 28 天康复执行数据生成院外二级方案，请医师二次确认。
    </AICard>
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="家庭训练" value="每日 60 min" hint="PT 视频指导 × 3 节" />
      <FormRow label="远程随访" value="每周 1 次" hint="医师视频回访 + 量表" />
      <FormRow label="紧急预警" value="跌倒 / 疼痛突增" hint="自动通知医师 + 家属" />
      <FormRow label="社区对接" value="徐汇康复站" hint="每周 2 次门诊治疗" />
      <FormRow label="复诊节点" value="2 / 4 / 8 周" />
      <FormRow label="家属培训" value="跌倒预防 + 转移技巧" hint="出院前 1 日完成" />
    </div>

    <SectionTitle title="出院条件复核" />
    <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60">
      <FormRow label="独立步行 ≥ 50m" value={<CheckCircle2 className="w-4 h-4 text-success" />} hint="实测 60m" />
      <FormRow label="Barthel ≥ 75" value={<CheckCircle2 className="w-4 h-4 text-success" />} hint="实测 85" />
      <FormRow label="家属照护培训完成" value={<CheckCircle2 className="w-4 h-4 text-success" />} />
      <FormRow label="无急性并发症" value={<CheckCircle2 className="w-4 h-4 text-success" />} />
    </div>
  </div>
);
