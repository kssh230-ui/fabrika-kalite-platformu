"use client";
import { AlertTriangle, ShieldAlert, ChevronRight } from "lucide-react";

const severityConfig = {
  critical: {
    bg: "bg-red-950/60",
    border: "border-red-500",
    icon: ShieldAlert,
    iconColor: "text-red-400",
    label: "KRİTİK",
    labelBg: "bg-red-600",
    textColor: "text-red-100",
    pulse: true,
  },
  warning: {
    bg: "bg-amber-950/60",
    border: "border-amber-500",
    icon: AlertTriangle,
    iconColor: "text-amber-400",
    label: "UYARI",
    labelBg: "bg-amber-600",
    textColor: "text-amber-100",
    pulse: false,
  },
};

export default function PokaYokeAlerts({ alerts }) {
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-600 p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert size={18} className="text-amber-400" />
        <h2 className="text-white font-bold text-base">Poka-Yoke Kalite Uyarıları</h2>
        <span className="ml-auto bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full font-mono">
          {alerts.length} uyarı
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {alerts.map((alert) => {
          const cfg = severityConfig[alert.severity];
          const Icon = cfg.icon;
          return (
            <div
              key={alert.id}
              className={`${cfg.bg} ${cfg.border} border-l-4 rounded-xl p-4 flex items-start gap-4 ${
                cfg.pulse ? "warning-blink" : ""
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <Icon size={22} className={cfg.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`${cfg.labelBg} text-white text-xs font-black px-2 py-0.5 rounded tracking-wider`}>
                    {cfg.label}
                  </span>
                  <span className="text-slate-500 text-xs">Nokta {alert.id}</span>
                </div>
                <p className={`${cfg.textColor} font-semibold text-base leading-snug`}>
                  {alert.text}
                </p>
              </div>
              <ChevronRight size={16} className="text-slate-600 flex-shrink-0 mt-1" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
