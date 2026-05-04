"use client";
import { useState } from "react";
import { Play, Pause, RotateCcw, Volume2, MonitorPlay } from "lucide-react";

export default function VideoPlayer({ workOrder }) {
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(38);

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-600 overflow-hidden shadow-2xl">
      <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center gap-2">
          <MonitorPlay size={16} className="text-blue-400" />
          <span className="text-white font-semibold text-sm">{workOrder?.videoTitle || "SOP Eğitimi"}</span>
        </div>
        <span className="text-slate-500 text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">Döngü Modu</span>
      </div>

      {/* VİDEO EKRANI */}
      <div 
        className="relative bg-slate-950 aspect-video flex items-center justify-center group cursor-pointer overflow-hidden"
        onClick={() => setPlaying(!playing)}
      >
        {/* Arka plan (Gerçek videonuz buranın altında oynayacak) */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* 1. YALINLAŞTIRILMIŞ MERKEZ (Sadece duraklatıldığında görünür) */}
        {!playing && (
          <div className="relative z-20 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200">
            <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-white/20 bg-black/50 backdrop-blur-sm shadow-2xl hover:bg-black/70 transition-all">
              <Play size={36} className="text-white ml-1 opacity-90" />
            </div>
          </div>
        )}

        {/* 2. YENİ: VİDEONUN ALTINDAKİ ZARİF BİLGİ BANDI (Netflix Tarzı) */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 pt-16 flex flex-col gap-1 pointer-events-none transition-opacity duration-300">
          <span className={`text-[10px] font-bold tracking-widest flex items-center gap-2 ${playing ? "text-emerald-400" : "text-amber-400"}`}>
            <span className={`w-2 h-2 rounded-full ${playing ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
            {playing ? "AKTİF EĞİTİM - OYNATILIYOR" : "EĞİTİM DURAKLATILDI"}
          </span>
          <h2 className="text-white font-bold text-lg drop-shadow-md">{workOrder?.videoTitle || "Baza Montaj Eğitimi"}</h2>
        </div>

        {/* Köşe Etiketleri */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded border border-white/10 font-mono z-20">
          SOP v{workOrder?.sopVersion || "4.0"}
        </div>
      </div>

      {/* ALT KONTROL ÇUBUĞU */}
      <div className="px-5 py-3 bg-[#0f172a]">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setPlaying(!playing)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-bold transition-all border ${
              playing 
                ? "bg-slate-800 border-slate-600 text-white hover:bg-slate-700" 
                : "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500"
            }`}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            {playing ? "Duraklat" : "Oynat"}
          </button>
          
          <button 
            onClick={() => setProgress(0)} 
            className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
          >
            <RotateCcw size={14} />
          </button>
          
          <div className="flex items-center gap-2 ml-auto text-slate-400">
            <Volume2 size={16} />
            <span className="text-[11px] font-mono tracking-wider">02:47 / 04:32</span>
          </div>
        </div>

        {/* İLERLEME ÇUBUĞU */}
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer relative group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            setProgress(Math.round((x / rect.width) * 100));
          }}
        >
          <div
            className="h-full bg-blue-500 group-hover:bg-blue-400 rounded-full transition-all duration-150 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow blur-[1px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}