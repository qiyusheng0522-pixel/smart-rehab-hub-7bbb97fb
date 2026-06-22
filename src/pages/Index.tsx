import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { DoctorApp } from "@/components/app/DoctorApp";
import { TherapistApp } from "@/components/app/TherapistApp";
import { NurseApp } from "@/components/app/NurseApp";
import { CommunityApp } from "@/components/app/CommunityApp";
import { Sparkles, Stethoscope, Activity, HeartPulse, Home, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { WorkflowSection } from "@/components/WorkflowSection";

type Role = "landing" | "doctor" | "therapist" | "nurse" | "community";

const roleMeta = {
  doctor: {
    title: "康复医师",
    subtitle: "Rehabilitation Physician",
    desc: "评估、目标、方案、处方全流程 AI 协同",
    icon: Stethoscope,
    gradient: "gradient-doctor",
    softBg: "bg-primary-soft",
    text: "text-role-doctor",
    label: "康复医师 · 工作台",
    features: ["首次评估线上协同", "AI 智能康复目标", "方案/处方 AI 建议", "出院二级方案生成"],
  },
  therapist: {
    title: "治疗师",
    subtitle: "Therapist · PT / OT / ST",
    desc: "AI 排班、AI 推送任务、处方执行打卡",
    icon: Activity,
    gradient: "gradient-therapist",
    softBg: "bg-secondary-soft",
    text: "text-role-therapist",
    label: "治疗师 · 工作台",
    features: ["评估结果确认", "智能排班手动调整", "AI 推送康复任务", "执行打卡 + 工作小结"],
  },
  nurse: {
    title: "护士",
    subtitle: "Rehabilitation Nurse",
    desc: "AI 推送护理任务、给药、康复宣教",
    icon: HeartPulse,
    gradient: "gradient-nurse",
    softBg: "bg-rose-50",
    text: "text-role-nurse",
    label: "护士 · 工作台",
    features: ["AI 智能任务排序", "给药安全核对", "康复护理执行", "AI 宣教内容推送"],
  },
  community: {
    title: "社区端",
    subtitle: "Community Rehab · All-in-One",
    desc: "一人多岗：医师 + 治疗师 + 护士 三端集合",
    icon: Home,
    gradient: "gradient-community",
    softBg: "bg-purple-50",
    text: "text-role-community",
    label: "社区端 · 工作台",
    features: ["三端身份一键切换", "医师评估 / 开方", "治疗师任务执行", "护士给药与宣教"],
  },
};

const Index = () => {
  const [role, setRole] = useState<Role>("landing");

  if (role !== "landing") {
    const meta = roleMeta[role];
    const RoleApp =
      role === "doctor" ? DoctorApp
      : role === "therapist" ? TherapistApp
      : role === "nurse" ? NurseApp
      : CommunityApp;
    return (
      <div className="min-h-screen gradient-mesh bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
          <button
            onClick={() => setRole("landing")}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> 返回角色选择
          </button>

          <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-start">
            {/* Left: explainer */}
            <div className="lg:pt-12 max-w-xl">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${meta.softBg} ${meta.text} text-xs font-semibold mb-5`}>
                <meta.icon className="w-3.5 h-3.5" />
                {meta.subtitle}
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
                {meta.title}<span className="text-muted-foreground"> · 移动端</span>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed mb-8">
                {meta.desc}。下方手机预览中所有按钮、工作台与卡片均可交互体验。
              </p>

              <div className="space-y-3">
                {meta.features.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-lg ${meta.gradient} flex items-center justify-center shrink-0 mt-0.5`}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm text-foreground">{f}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-5 rounded-2xl border border-ai/20 bg-ai-soft">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-ai" />
                  <span className="text-sm font-semibold text-foreground">业务流程接入提示</span>
                </div>
                <p className="text-xs text-foreground/70 leading-relaxed">
                  你后续提供完整交互业务流程后，可在此 APP 内继续扩展页面联动、状态流转和跨角色协同。
                </p>
              </div>
            </div>

            {/* Right: phone */}
            <div className="flex justify-center lg:justify-end">
              <PhoneFrame label={meta.label}>
                <RoleApp />
              </PhoneFrame>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Hero */}
      <header className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-8">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">RehabAI</div>
              <div className="text-[10px] text-muted-foreground">智慧康复协同平台</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-card shadow-card text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" />
            <span className="text-foreground/70">移动端 v2.4 · AI 引擎在线</span>
          </div>
        </div>

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ai-soft text-ai text-xs font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5" /> AI 驱动 · 多角色协同
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-5">
            省人康复科{" "}
            <span className="bg-clip-text text-transparent gradient-primary">移动工作台</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            康复医师 · 治疗师 · 护士，三端打通。AI 智能贯穿评估、目标、方案、处方、执行、宣教全流程。
          </p>
        </div>
      </header>

      {/* Role selection */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">选择你的角色进入移动端</h2>
          <span className="text-xs text-muted-foreground hidden sm:block">点击卡片预览对应 APP</span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(["doctor", "therapist", "nurse"] as const).map((key) => {
            const m = roleMeta[key];
            return (
              <button
                key={key}
                onClick={() => setRole(key)}
                className="group text-left relative overflow-hidden rounded-3xl bg-card shadow-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg border border-border/50"
              >
                <div className={`absolute top-0 right-0 w-40 h-40 rounded-full ${m.gradient} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />

                <div className={`w-14 h-14 rounded-2xl ${m.gradient} flex items-center justify-center mb-5 shadow-md`}>
                  <m.icon className="w-7 h-7 text-white" strokeWidth={2.2} />
                </div>

                <div className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase mb-1">
                  {m.subtitle}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{m.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 min-h-[40px]">
                  {m.desc}
                </p>

                <div className="space-y-1.5 mb-6">
                  {m.features.slice(0, 3).map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-foreground/70">
                      <div className={`w-1 h-1 rounded-full ${m.text.replace("text-", "bg-")}`} />
                      {f}
                    </div>
                  ))}
                </div>

                <div className={`inline-flex items-center gap-1.5 ${m.text} text-sm font-semibold`}>
                  进入 APP 预览 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Full workflow */}
        <div className="mt-20">
          <WorkflowSection />
        </div>

      </main>
    </div>
  );
};

export default Index;
