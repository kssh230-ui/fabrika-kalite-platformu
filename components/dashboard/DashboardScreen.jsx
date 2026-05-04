"use client";
import TrendCards from "./TrendCards";
import ParetoChart from "./ParetoChart";
import FieldReportsTable from "./FieldReportsTable";
import UploadSOPPanel from "./UploadSOPPanel";

export default function DashboardScreen() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* DASHBOARD HEADER - OBEYA ODASI STANDARTLARINA GÖRE BÜYÜTÜLDÜ */}
      <div className="bg-slate-950 border-b border-slate-700 px-6 py-6 md:py-8 shadow-2xl relative overflow-hidden">
        {/* Arka plan aydınlatma efekti */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-blue-400 text-sm md:text-base font-black uppercase tracking-[0.2em] mb-2">Ar-Ge / Yönetim Paneli</p>
              <h1 className="text-white font-black text-4xl md:text-5xl lg:text-6xl tracking-tight drop-shadow-lg">
                Kalite Analiz Merkezi
              </h1>
            </div>
            <div className="inline-flex items-center gap-3 text-sm md:text-base font-bold text-slate-200 bg-slate-800/90 backdrop-blur-sm px-6 py-3 rounded-xl border border-slate-600 shadow-xl">
              <div className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              <span className="uppercase tracking-widest">Canlı Veri — Nisan 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-8 mt-4">
        {/* ROW 1: TREND CARDS */}
        <TrendCards />

        {/* ROW 2: PARETO + UPLOAD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ParetoChart />
          </div>
          <div className="lg:col-span-1">
            <UploadSOPPanel />
          </div>
        </div>

        {/* ROW 3: FIELD REPORTS TABLE */}
        <FieldReportsTable />
      </div>
    </div>
  );
}