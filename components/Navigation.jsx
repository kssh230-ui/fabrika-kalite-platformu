"use client";
import { Factory, Wrench, BarChart3, Zap } from "lucide-react";
// Az önce oluşturduğumuz dosyayı içeri alıyoruz:
import LiveDateTime from "./LiveDateTime"; 

const pages = [
  {
    id: "production",
    label: "Döşeme Hattı",
    shortLabel: "Hat",
    icon: Factory,
    color: "text-blue-400",
    activeBg: "bg-blue-600",
  },
  {
    id: "installer",
    label: "Montaj Ustası",
    shortLabel: "Montaj",
    icon: Wrench,
    color: "text-emerald-400",
    activeBg: "bg-emerald-600",
  },
  {
    id: "dashboard",
    label: "Ar-Ge / Yönetim",
    shortLabel: "Dashboard",
    icon: BarChart3,
    color: "text-violet-400",
    activeBg: "bg-violet-600",
  },
];

export default function Navigation({ activePage, setActivePage }) {
  return (
    <>
      <header className="bg-slate-950 border-b border-slate-700 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight leading-none block">FabrikaNet</span>
            <span className="text-slate-400 text-xs leading-none">Yalın Üretim Platformu</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
          {pages.map((page) => {
            const Icon = page.icon;
            const isActive = activePage === page.id;
            return (
              <button
                key={page.id}
                onClick={() => setActivePage(page.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? `${page.activeBg} text-white shadow-lg`
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                <Icon size={16} />
                <span>{page.label}</span>
              </button>
            );
          })}
        </nav>

        {/* CANLI SAAT BİLEŞENİ BURADA ÇALIŞIYOR */}
        <div className="hidden md:block">
          <LiveDateTime />
        </div>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950 border-t border-slate-700 flex">
        {pages.map((page) => {
          const Icon = page.icon;
          const isActive = activePage === page.id;
          return (
            <button
              key={page.id}
              onClick={() => setActivePage(page.id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all duration-200 ${
                isActive ? "text-white" : "text-slate-500"
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all ${isActive ? page.activeBg : ""}`}>
                <Icon size={20} />
              </div>
              <span className="text-xs font-semibold">{page.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}