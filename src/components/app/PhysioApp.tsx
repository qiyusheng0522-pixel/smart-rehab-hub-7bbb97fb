import { useMemo, useState } from "react";
import {
  Activity,
  Cpu,
  Calendar,
  User,
  Plus,
  Wrench,
  CheckCircle2,
  Clock3,
  Sparkles,
  Zap,
  Waves,
  Flame,
  Magnet,
  Sun,
  Move3d,
  CircleDot,
  ChevronRight,
  Settings2,
} from "lucide-react";
import { ScreenShell, TabBar, type TabBarItem } from "./TabBar";
import { PhoneSheet, PrimaryBtn } from "./Sheet";
import { AICard, SectionTitle } from "./UI";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

/** Physiotherapy device catalogue */
type DeviceStatus = "idle" | "in_use" | "maintenance";

interface PhysioDevice {
  id: string;
  name: string;
  code: string;
  room: string;
  icon: typeof Zap;
  status: DeviceStatus;
  todayCount: number;
  capacity: number; // sessions per day
  nextSlot?: string;
  lastMaint: string;
}

const INITIAL_DEVICES: PhysioDevice[] = [
  { id: "d1", name: "中频电刺激仪", code: "EMS-01", room: "理疗一区·301", icon: Zap, status: "in_use", todayCount: 6, capacity: 12, nextSlot: "10:30", lastMaint: "2026-04-22" },
  { id: "d2", name: "超短波治疗仪", code: "USW-02", room: "理疗一区·302", icon: Waves, status: "in_use", todayCount: 4, capacity: 10, nextSlot: "10:45", lastMaint: "2026-04-15" },
  { id: "d3", name: "蜡疗机",       code: "WAX-01", room: "理疗二区·305", icon: Flame, status: "idle",   todayCount: 3, capacity: 8,  nextSlot: "11:00", lastMaint: "2026-03-30" },
  { id: "d4", name: "脉冲磁疗仪",   code: "MAG-03", room: "理疗二区·306", icon: Magnet, status: "idle",   todayCount: 2, capacity: 10, nextSlot: "11:00", lastMaint: "2026-04-10" },
  { id: "d5", name: "半导体激光治疗仪", code: "LSR-01", room: "理疗二区·307", icon: Sun,  status: "maintenance", todayCount: 0, capacity: 10, lastMaint: "2026-05-08" },
  { id: "d6", name: "颈腰椎牵引床", code: "TRC-04", room: "理疗三区·310", icon: Move3d, status: "in_use", todayCount: 5, capacity: 10, nextSlot: "10:30", lastMaint: "2026-04-02" },
  { id: "d7", name: "肌电生物反馈仪", code: "EMG-02", room: "理疗三区·311", icon: CircleDot, status: "idle", todayCount: 2, capacity: 8, nextSlot: "13:30", lastMaint: "2026-04-26" },
  { id: "d8", name: "超声波治疗仪", code: "USD-01", room: "理疗一区·303", icon: Waves, status: "idle",   todayCount: 1, capacity: 10, nextSlot: "13:30", lastMaint: "2026-04-18" },
];

const STATUS_META: Record<DeviceStatus, { label: string; cls: string; dot: string }> = {
  idle:        { label: "空闲", cls: "bg-success-soft text-success",   dot: "bg-success" },
  in_use:      { label: "使用中", cls: "bg-primary-soft text-primary", dot: "bg-primary" },
  maintenance: { label: "维护中", cls: "bg-warning-soft text-warning", dot: "bg-warning" },
};

const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:30"];

interface Booking {
  device: string; // device code
  slot: string;
  patient: string;
  bed: string;
  rx: string; // prescription type
  duration: number;
  status: "done" | "doing" | "todo";
  auto?: boolean; // 自动调度（来自处方）
}

const BOOKINGS: Booking[] = [
  { device: "EMS-01", slot: "09:00", patient: "陈建国", bed: "01-08", rx: "中频·下肢", duration: 20, status: "done", auto: true },
  { device: "EMS-01", slot: "09:30", patient: "王凤兰", bed: "02-03", rx: "中频·肩背", duration: 20, status: "done", auto: true },
  { device: "EMS-01", slot: "10:30", patient: "李大山", bed: "03-12", rx: "中频·上肢", duration: 20, status: "doing", auto: true },
  { device: "EMS-01", slot: "13:30", patient: "刘玉芳", bed: "01-04", rx: "中频·腰背", duration: 20, status: "todo", auto: true },
  { device: "USW-02", slot: "09:00", patient: "周建华", bed: "02-09", rx: "超短波·膝", duration: 15, status: "done", auto: true },
  { device: "USW-02", slot: "10:45", patient: "吴月梅", bed: "03-02", rx: "超短波·肩", duration: 15, status: "todo", auto: true },
  { device: "USW-02", slot: "14:00", patient: "陈建国", bed: "01-08", rx: "超短波·腰", duration: 15, status: "todo", auto: false },
  { device: "WAX-01", slot: "09:30", patient: "张明", bed: "01-11", rx: "蜡疗·手部", duration: 25, status: "done", auto: true },
  { device: "WAX-01", slot: "11:00", patient: "孙素珍", bed: "02-15", rx: "蜡疗·腕关节", duration: 25, status: "todo", auto: true },
  { device: "MAG-03", slot: "10:00", patient: "黄爱华", bed: "03-06", rx: "磁疗·颈椎", duration: 20, status: "done", auto: true },
  { device: "MAG-03", slot: "14:30", patient: "李大山", bed: "03-12", rx: "磁疗·肩部", duration: 20, status: "todo", auto: false },
  { device: "TRC-04", slot: "09:00", patient: "赵志强", bed: "02-07", rx: "腰椎牵引", duration: 20, status: "done", auto: true },
  { device: "TRC-04", slot: "10:30", patient: "周建华", bed: "02-09", rx: "颈椎牵引", duration: 20, status: "doing", auto: true },
  { device: "TRC-04", slot: "15:00", patient: "王凤兰", bed: "02-03", rx: "腰椎牵引", duration: 20, status: "todo", auto: true },
  { device: "USD-01", slot: "13:30", patient: "刘玉芳", bed: "01-04", rx: "超声·肩袖", duration: 10, status: "todo", auto: true },
  { device: "EMG-02", slot: "13:30", patient: "黄爱华", bed: "03-06", rx: "肌电·上肢", duration: 20, status: "todo", auto: true },
];

const TABS: TabBarItem[] = [
  { key: "home", label: "工作台", icon: Activity },
  { key: "devices", label: "设备", icon: Cpu },
  { key: "schedule", label: "排班", icon: Calendar },
  { key: "me", label: "我的", icon: User },
];

export const PhysioApp = () => {
  const [tab, setTab] = useState("home");
  const [devices, setDevices] = useState<PhysioDevice[]>(INITIAL_DEVICES);
  const [openDeviceId, setOpenDeviceId] = useState<string | null>(null);
  const [openAdd, setOpenAdd] = useState(false);

  const openDevice = devices.find((d) => d.id === openDeviceId) ?? null;

  const toggleNormal = (id: string, normal: boolean) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        if (normal) {
          // 切回正常：若今日有进行中预约则使用中，否则空闲
          const doing = BOOKINGS.some((b) => b.device === d.code && b.status === "doing");
          return { ...d, status: doing ? "in_use" : "idle" };
        }
        return { ...d, status: "maintenance" };
      }),
    );
    toast.success(normal ? "设备已恢复正常" : "已标记为维护中，相关预约将自动改派");
  };

  const stats = useMemo(() => {
    const total = devices.length;
    const inUse = devices.filter((d) => d.status === "in_use").length;
    const idle = devices.filter((d) => d.status === "idle").length;
    const maint = devices.filter((d) => d.status === "maintenance").length;
    const sessions = BOOKINGS.length;
    return { total, inUse, idle, maint, sessions };
  }, [devices]);

  return (
    <ScreenShell tabBar={<TabBar items={TABS} active={tab} accent={"physio" as any} onChange={setTab} />}>
      {tab === "home" && <HomeView devices={devices} stats={stats} onOpenDevice={(d) => setOpenDeviceId(d.id)} onAdd={() => setOpenAdd(true)} onToggle={toggleNormal} />}
      {tab === "devices" && <DevicesView devices={devices} onOpenDevice={(d) => setOpenDeviceId(d.id)} onToggle={toggleNormal} />}
      {tab === "schedule" && <ScheduleView devices={devices} onOpenDevice={(code) => setOpenDeviceId(devices.find((d) => d.code === code)?.id ?? null)} />}
      {tab === "me" && <MeView devices={devices} />}

      <PhoneSheet
        open={!!openDevice}
        title={openDevice ? `${openDevice.name} · ${openDevice.code}` : ""}
        onClose={() => setOpenDeviceId(null)}
        accent="physio"
        footer={
          openDevice && (
            <button
              onClick={() => { toast.success("已加入今日排班（人工干预）"); setOpenDeviceId(null); }}
              className="w-full gradient-physio text-white rounded-2xl py-3 text-sm font-semibold shadow-card disabled:opacity-50"
              disabled={openDevice.status === "maintenance"}
            >
              {openDevice.status === "maintenance" ? "维护中 · 不可预约" : "人工新建预约"}
            </button>
          )
        }
      >
        {openDevice && <DeviceDetail device={openDevice} onToggle={toggleNormal} />}
      </PhoneSheet>

      <PhoneSheet
        open={openAdd}
        title="人工干预 · 新建理疗预约"
        onClose={() => setOpenAdd(false)}
        accent="physio"
        footer={
          <PrimaryBtn variant="physio" onClick={() => { toast.success("已分配设备并通知患者"); setOpenAdd(false); }}>
            确认分配
          </PrimaryBtn>
        }
      >
        <NewBookingView devices={devices} />
      </PhoneSheet>
    </ScreenShell>
  );
};

/* -------------------- Home -------------------- */

const HomeView = ({
  devices,
  stats,
  onOpenDevice,
  onAdd,
  onToggle,
}: {
  devices: PhysioDevice[];
  stats: { total: number; inUse: number; idle: number; maint: number; sessions: number };
  onOpenDevice: (d: PhysioDevice) => void;
  onAdd: () => void;
  onToggle: (id: string, normal: boolean) => void;
}) => (
  <div className="px-4 pt-2 pb-6 space-y-4">
    {/* Header */}
    <div className="gradient-physio text-white rounded-3xl p-5 shadow-card relative overflow-hidden">
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
      <div className="relative">
        <div className="text-[11px] font-medium opacity-90">理疗设备工作台</div>
        <div className="text-lg font-bold mt-0.5">徐主管 · 早上好</div>
        <div className="text-xs opacity-90 mt-1">今日共 {stats.sessions} 例理疗（处方自动调度），{stats.inUse} 台运行中</div>
        <div className="grid grid-cols-4 gap-2 mt-4">
          <Chip n={stats.total} label="设备总数" />
          <Chip n={stats.inUse} label="使用中" />
          <Chip n={stats.idle} label="空闲" />
          <Chip n={stats.maint} label="维护中" />
        </div>
      </div>
    </div>

    <AICard
      title="处方自动调度"
      action={
        <button onClick={onAdd} className="text-xs font-semibold text-ai inline-flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> 人工新建
        </button>
      }
    >
      所有患者处方中包含理疗项的，系统已根据设备状态与时段自动排入；如需调整可人工干预修改。
    </AICard>

    <div>
      <SectionTitle
        title="设备实时状态"
        extra={<span className="text-[11px] text-muted-foreground">{stats.total} 台</span>}
      />
      <div className="grid grid-cols-2 gap-2.5">
        {devices.map((d) => (
          <DeviceMiniCard key={d.id} device={d} onClick={() => onOpenDevice(d)} onToggle={onToggle} />
        ))}
      </div>
    </div>
  </div>
);

const Chip = ({ n, label }: { n: number; label: string }) => (
  <div className="rounded-xl bg-white/15 backdrop-blur px-2 py-2 text-center">
    <div className="text-lg font-bold leading-none">{n}</div>
    <div className="text-[10px] opacity-90 mt-1">{label}</div>
  </div>
);

const DeviceMiniCard = ({
  device,
  onClick,
  onToggle,
}: {
  device: PhysioDevice;
  onClick: () => void;
  onToggle: (id: string, normal: boolean) => void;
}) => {
  const Icon = device.icon;
  const meta = STATUS_META[device.status];
  const pct = Math.round((device.todayCount / device.capacity) * 100);
  const normal = device.status !== "maintenance";
  return (
    <div className="text-left rounded-2xl bg-card border border-border/60 p-3 shadow-sm">
      <button onClick={onClick} className="w-full text-left">
        <div className="flex items-start justify-between mb-2">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
            <Icon className="w-[18px] h-[18px] text-role-physio" />
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${meta.cls}`}>{meta.label}</span>
        </div>
        <div className="text-[13px] font-semibold text-foreground truncate">{device.name}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{device.code} · {device.room}</div>
        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>今日使用</span>
            <span className="font-semibold text-foreground">{device.todayCount}/{device.capacity}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full gradient-physio" style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
        </div>
      </button>
      <div className="mt-2.5 pt-2.5 border-t border-border/60 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{normal ? "正常" : "故障 / 维护"}</span>
        <Switch checked={normal} onCheckedChange={(v) => onToggle(device.id, v)} />
      </div>
    </div>
  );
};

/* -------------------- Devices list -------------------- */

const DevicesView = ({
  devices,
  onOpenDevice,
  onToggle,
}: {
  devices: PhysioDevice[];
  onOpenDevice: (d: PhysioDevice) => void;
  onToggle: (id: string, normal: boolean) => void;
}) => {
  const [filter, setFilter] = useState<"all" | DeviceStatus>("all");
  const list = filter === "all" ? devices : devices.filter((d) => d.status === filter);
  return (
    <div className="px-4 pt-3 pb-6">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mb-3">
        {([
          ["all", `全部 ${devices.length}`],
          ["idle", "空闲"],
          ["in_use", "使用中"],
          ["maintenance", "维护中"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k as any)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium ${
              filter === k ? "gradient-physio text-white shadow-card" : "bg-card border border-border text-foreground/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {list.map((d) => {
          const Icon = d.icon;
          const meta = STATUS_META[d.status];
          const normal = d.status !== "maintenance";
          return (
            <div key={d.id} className="rounded-2xl bg-card border border-border/60 p-3 flex items-center gap-3 shadow-sm">
              <button onClick={() => onOpenDevice(d)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-role-physio" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-[14px] font-semibold truncate">{d.name}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${meta.cls}`}>{meta.label}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {d.code} · {d.room} · 今日 {d.todayCount}/{d.capacity}
                  </div>
                </div>
              </button>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] text-muted-foreground">{normal ? "正常" : "故障"}</span>
                <Switch checked={normal} onCheckedChange={(v) => onToggle(d.id, v)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* -------------------- Schedule matrix -------------------- */

const ScheduleView = ({
  devices,
  onOpenDevice,
}: {
  devices: PhysioDevice[];
  onOpenDevice: (code: string) => void;
}) => {
  return (
    <div className="px-3 pt-3 pb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <div className="text-[15px] font-semibold">设备排班矩阵</div>
          <div className="text-[10px] text-muted-foreground">处方自动调度 · 横向时段 · 纵向设备</div>
        </div>
        <button
          onClick={() => toast.success("已根据最新处方与设备状态重排")}
          className="text-xs font-semibold text-role-physio inline-flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" /> 重新调度
        </button>
      </div>

      <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="border-collapse text-[11px] min-w-full">
            <thead>
              <tr className="bg-muted/40">
                <th className="sticky left-0 z-10 bg-muted/60 px-2 py-2 text-left font-semibold text-foreground/80 min-w-[110px]">
                  设备
                </th>
                {SLOTS.map((s) => (
                  <th key={s} className="px-1.5 py-2 font-medium text-foreground/70 min-w-[64px]">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => {
                const isMaint = d.status === "maintenance";
                return (
                  <tr key={d.id} className="border-t border-border/60">
                    <td className="sticky left-0 bg-card px-2 py-2 align-top">
                      <button onClick={() => onOpenDevice(d.code)} className="text-left">
                        <div className="text-[12px] font-semibold leading-tight">{d.name}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {d.code}
                          {isMaint && <span className="ml-1 text-warning font-semibold">维护中</span>}
                        </div>
                      </button>
                    </td>
                    {SLOTS.map((slot) => {
                      if (isMaint) {
                        return (
                          <td key={slot} className="p-1 align-top">
                            <div className="h-[52px] rounded-md bg-warning-soft/60 border border-warning/30 text-[9px] text-warning flex items-center justify-center font-semibold">
                              维护
                            </div>
                          </td>
                        );
                      }
                      const b = BOOKINGS.find((x) => x.device === d.code && x.slot === slot);
                      if (!b) {
                        return (
                          <td key={slot} className="p-1 align-top">
                            <div className="h-[52px] rounded-md border border-dashed border-border/70 text-[9px] text-muted-foreground flex items-center justify-center">
                              空
                            </div>
                          </td>
                        );
                      }
                      const tone =
                        b.status === "done" ? "bg-success-soft border-success/30 text-success"
                        : b.status === "doing" ? "bg-primary-soft border-primary/30 text-primary"
                        : "bg-orange-50 border-role-physio/30 text-role-physio";
                      return (
                        <td key={slot} className="p-1 align-top">
                          <button
                            onClick={() => toast(b.patient + " · " + b.rx, { description: `${b.bed} · ${b.duration}min · ${b.auto ? "处方自动" : "人工干预"}` })}
                            className={`w-full h-[52px] rounded-md border px-1.5 py-1 text-left ${tone}`}
                          >
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-semibold truncate">{b.patient}</span>
                              {!b.auto && <span className="text-[8px] px-1 rounded bg-foreground/10">手动</span>}
                            </div>
                            <div className="text-[9px] truncate opacity-90">{b.rx}</div>
                            <div className="text-[9px] opacity-80">{b.bed}</div>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 border-t border-border/60 text-[10px] text-muted-foreground flex-wrap">
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-success" /> 已完成</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary" /> 进行中</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-role-physio" /> 待开始</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-warning" /> 维护中</span>
        </div>
      </div>

      <div className="mt-4">
        <AICard title="调度说明">
          系统按处方自动安排时段，遇维护中设备会自动改派或顺延。点击任一格可查看明细，需要调整请使用"人工新建"或在患者处方中修改。
        </AICard>
      </div>
    </div>
  );
};

/* -------------------- Device detail sheet -------------------- */

const DeviceDetail = ({
  device,
  onToggle,
}: {
  device: PhysioDevice;
  onToggle: (id: string, normal: boolean) => void;
}) => {
  const today = BOOKINGS.filter((b) => b.device === device.code);
  const meta = STATUS_META[device.status];
  const normal = device.status !== "maintenance";
  return (
    <div className="px-4 pt-4 pb-8 space-y-4">
      <div className="rounded-2xl gradient-physio text-white p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <device.icon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold">{device.name}</div>
            <div className="text-[11px] opacity-90 mt-0.5">{device.code} · {device.room}</div>
          </div>
          <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-md font-semibold bg-white/20`}>{meta.label}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <Chip n={device.todayCount} label="今日已用" />
          <Chip n={Math.max(0, device.capacity - device.todayCount)} label="剩余次数" />
          <Chip n={Math.round((device.todayCount / device.capacity) * 100)} label="使用率%" />
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border/60 p-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
          <Settings2 className="w-[18px] h-[18px] text-role-physio" />
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-semibold">设备状态开关</div>
          <div className="text-[11px] text-muted-foreground">关闭后标记为「维护中」，相关预约将自动改派</div>
        </div>
        <Switch checked={normal} onCheckedChange={(v) => onToggle(device.id, v)} />
      </div>

      <div>
        <SectionTitle title="今日预约" extra={<span className="text-[11px] text-muted-foreground">{today.length} 例 · 处方自动</span>} />
        <div className="rounded-2xl bg-card border border-border/60 divide-y divide-border/60 overflow-hidden">
          {today.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">暂无预约</div>
          )}
          {today.map((b, i) => (
            <div key={i} className="px-3 py-2.5 flex items-center gap-3">
              <div className="text-[12px] font-semibold w-12 shrink-0">{b.slot}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate flex items-center gap-1.5">
                  {b.patient}
                  <span className="text-muted-foreground text-[11px]">{b.bed}</span>
                  {!b.auto && <span className="text-[9px] px-1 rounded bg-muted text-foreground/70">手动</span>}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">{b.rx} · {b.duration} 分钟</div>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                b.status === "done" ? "bg-success-soft text-success"
                : b.status === "doing" ? "bg-primary-soft text-primary"
                : "bg-orange-50 text-role-physio"
              }`}>
                {b.status === "done" ? "已完成" : b.status === "doing" ? "进行中" : "待开始"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="设备信息" />
        <div className="rounded-2xl bg-card border border-border/60 p-3 text-[12px] space-y-2">
          <Row label="日通量" value={`${device.capacity} 次 / 天`} />
          <Row label="单次时长" value="15–25 分钟" />
          <Row label="上次保养" value={device.lastMaint} />
          <Row label="责任工程师" value="工程·赵勇" />
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);

/* -------------------- New booking -------------------- */

const NewBookingView = ({ devices }: { devices: PhysioDevice[] }) => {
  const available = devices.filter((d) => d.status !== "maintenance");
  const [device, setDevice] = useState(available[0]?.code ?? "");
  const [slot, setSlot] = useState("10:30");
  return (
    <div className="px-4 pt-4 pb-8 space-y-4">
      <AICard title="自动调度参考">
        系统已根据该患者处方自动分配时段，如需调整可在下方手动覆盖。
        <div className="mt-2 space-y-1.5">
          <div className="text-[12px] flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> EMS-01 中频电 · 10:30 · 20min（自动）</div>
          <div className="text-[12px] flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> MAG-03 磁疗 · 14:30 · 20min（自动）</div>
        </div>
      </AICard>

      <div>
        <SectionTitle title="选择设备（仅显示正常设备）" />
        <div className="grid grid-cols-2 gap-2">
          {available.map((d) => (
            <button
              key={d.code}
              onClick={() => setDevice(d.code)}
              className={`text-left rounded-xl border p-2.5 ${
                device === d.code ? "border-role-physio bg-orange-50" : "border-border bg-card"
              }`}
            >
              <div className="text-[12px] font-semibold truncate">{d.name}</div>
              <div className="text-[10px] text-muted-foreground">{d.code} · {STATUS_META[d.status].label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="选择时段" />
        <div className="grid grid-cols-4 gap-2">
          {SLOTS.map((s) => (
            <button
              key={s}
              onClick={() => setSlot(s)}
              className={`rounded-lg py-2 text-[12px] font-medium ${
                slot === s ? "gradient-physio text-white" : "bg-card border border-border text-foreground/80"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="患者" />
        <div className="rounded-2xl bg-card border border-border/60 p-3 text-[12px] space-y-2">
          <Row label="床号 · 姓名" value="03-12 李大山" />
          <Row label="处方项" value="中频电刺激（上肢）" />
          <Row label="医师" value="康复·王洁" />
        </div>
      </div>
    </div>
  );
};

/* -------------------- Me -------------------- */

const MeView = ({ devices }: { devices: PhysioDevice[] }) => {
  const maint = devices.filter((d) => d.status === "maintenance").length;
  return (
    <div className="px-4 pt-3 pb-6 space-y-4">
      <div className="rounded-3xl gradient-physio text-white p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold">徐</div>
          <div>
            <div className="text-base font-bold">徐建国 · 设备主管</div>
            <div className="text-[11px] opacity-90">理疗中心 · 工号 PT-1024</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <Chip n={devices.length} label="管理设备" />
          <Chip n={BOOKINGS.length} label="今日例次" />
          <Chip n={maint} label="维护中" />
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border/60 divide-y divide-border/60 overflow-hidden">
        {[
          { icon: Cpu, label: "设备清单与状态" },
          { icon: Calendar, label: "排班矩阵" },
          { icon: User, label: "账号与权限" },
        ].map((it, i) => {
          const Icon = it.icon;
          return (
            <button key={i} className="w-full px-3 py-3 flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                <Icon className="w-[18px] h-[18px] text-role-physio" />
              </div>
              <div className="flex-1 text-[13px] font-medium">{it.label}</div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PhysioApp;
