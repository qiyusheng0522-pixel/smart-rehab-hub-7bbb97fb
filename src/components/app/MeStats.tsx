import { TrendingUp, Wallet, ChevronRight } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip, Cell } from "recharts";
import { SectionTitle } from "@/components/app/UI";

type Accent = "doctor" | "therapist" | "nurse";

const accentColor: Record<Accent, string> = {
  doctor: "hsl(var(--primary))",
  therapist: "hsl(var(--secondary))",
  nurse: "hsl(var(--destructive))",
};

const gradMap: Record<Accent, string> = {
  doctor: "gradient-doctor",
  therapist: "gradient-therapist",
  nurse: "gradient-nurse",
};

export interface MeWorkloadStat {
  label: string;
  value: number;
}

export interface MeStatsProps {
  accent: Accent;
  /** 7-day workload e.g. [{ day: '一', value: 12 }, ...] */
  trend: { day: string; value: number }[];
  /** Top stat tiles (3-4 items) */
  tiles: { label: string; value: string | number; sub?: string }[];
  /** Revenue card (optional - hidden when omitted) */
  revenue?: {
    monthLabel: string;
    monthValue: string;
    today: string;
    pending: string;
    breakdown?: { label: string; value: string }[];
  };
}

export const MeStats = ({ accent, trend, tiles, revenue }: MeStatsProps) => {
  const color = accentColor[accent];
  const grad = gradMap[accent];
  const max = Math.max(...trend.map((t) => t.value), 1);

  return (
    <div className="space-y-4">
      {/* 工作量统计 */}
      <div>
        <SectionTitle
          title="本月工作量"
          extra={<span className="text-[10px] text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3" />近 7 日</span>}
        />
        <div className="bg-card rounded-2xl shadow-card p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {tiles.map((t) => (
              <div key={t.label} className="bg-muted rounded-xl p-2.5 text-center">
                <div className="text-[10px] text-muted-foreground">{t.label}</div>
                <div className="text-lg font-extrabold mt-0.5" style={{ color }}>{t.value}</div>
                {t.sub && <div className="text-[9px] text-muted-foreground mt-0.5">{t.sub}</div>}
              </div>
            ))}
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {trend.map((d, i) => (
                    <Cell key={i} fill={d.value === max ? color : `${color}99`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 收益概览（按需展示） */}
      {revenue && (
        <div>
          <SectionTitle title="收益概览" extra={<span className="text-[10px] text-muted-foreground">实时同步</span>} />
          <div className={`rounded-2xl p-4 ${grad} text-white shadow-card relative overflow-hidden`}>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-[11px] opacity-90">
                <Wallet className="w-3.5 h-3.5" /> {revenue.monthLabel}
              </div>
              <div className="text-3xl font-extrabold mt-1.5">¥ {revenue.monthValue}</div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-white/15 backdrop-blur rounded-xl p-2.5">
                  <div className="text-[10px] opacity-80">今日入账</div>
                  <div className="text-sm font-bold mt-0.5">¥ {revenue.today}</div>
                </div>
                <div className="bg-white/15 backdrop-blur rounded-xl p-2.5">
                  <div className="text-[10px] opacity-80">待结算</div>
                  <div className="text-sm font-bold mt-0.5">¥ {revenue.pending}</div>
                </div>
              </div>
            </div>
          </div>
          {revenue.breakdown && revenue.breakdown.length > 0 && (
            <div className="bg-card rounded-2xl shadow-card divide-y divide-border/60 mt-2">
              {revenue.breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-[12px] text-foreground/80">{b.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[12px] font-semibold">¥ {b.value}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
