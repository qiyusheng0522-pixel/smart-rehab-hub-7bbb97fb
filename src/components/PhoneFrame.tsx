import { ReactNode } from "react";
import { Signal, Wifi, BatteryFull } from "lucide-react";

interface PhoneFrameProps {
  children: ReactNode;
  label?: string;
  time?: string;
}

export const PhoneFrame = ({ children, label, time = "9:41" }: PhoneFrameProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* iPhone outer shell */}
      <div className="relative shrink-0">
        {/* Side buttons */}
        <div className="absolute -left-[3px] top-[110px] w-[3px] h-[32px] bg-slate-700 rounded-l-md" />
        <div className="absolute -left-[3px] top-[170px] w-[3px] h-[60px] bg-slate-700 rounded-l-md" />
        <div className="absolute -left-[3px] top-[245px] w-[3px] h-[60px] bg-slate-700 rounded-l-md" />
        <div className="absolute -right-[3px] top-[200px] w-[3px] h-[90px] bg-slate-700 rounded-r-md" />

        <div
          className="relative bg-slate-900 rounded-[55px] p-[14px] shadow-phone"
          style={{ width: 380, height: 780 }}
        >
          {/* Screen */}
          <div className="relative w-full h-full bg-background rounded-[42px] overflow-hidden">
            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 h-[54px] z-30 flex items-center justify-between px-8 pt-3 text-foreground">
              <span className="text-[15px] font-semibold tracking-tight">{time}</span>
              <div className="flex items-center gap-[6px]">
                <Signal className="w-4 h-4" strokeWidth={2.5} />
                <Wifi className="w-4 h-4" strokeWidth={2.5} />
                <BatteryFull className="w-5 h-5" strokeWidth={2.5} />
              </div>
            </div>

            {/* Dynamic Island */}
            <div className="absolute top-[12px] left-1/2 -translate-x-1/2 z-40 w-[120px] h-[36px] bg-black rounded-full" />

            {/* Content area */}
            <div className="absolute inset-0 pt-[54px] pb-0 overflow-hidden">
              <div className="h-full">{children}</div>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[120px] h-[5px] bg-foreground/80 rounded-full z-40" />
          </div>
        </div>
      </div>

      {label && (
        <div className="text-sm font-medium text-muted-foreground tracking-wide">{label}</div>
      )}
    </div>
  );
};
