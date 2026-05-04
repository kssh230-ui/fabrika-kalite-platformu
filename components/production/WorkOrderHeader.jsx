"use client";
import { ClipboardList, Clock, User, Target, CheckCircle2 } from "lucide-react";

export default function WorkOrderHeader({ workOrder }) {
  const progressPercent = Math.round((workOrder.completedQty / workOrder.targetQty) * 100);

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-600 overflow-hidden">
      {/* TOP BAR */}
      <div className="bg-blue-700 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList size={20} className="text-blue-200" />
          <span className="text-blue-100 font-semibold text-sm">İş Emri: {workOrder.id}</span>
        </div>
        <div className="flex items-center gap-2 bg-blue-600/50 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-white text-xs font-bold">CANLI</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <div className="mb-4">
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Üretimdeki Model</p>
          <h1 className="text-white text-3xl font-black tracking-tight">{workOrder.modelName}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{workOrder.modelCode} — SOP v{workOrder.sopVersion}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-5">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock size={15} className="text-slate-500" />
            <span>{workOrder.shift}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <User size={15} className="text-slate-500" />
            <span>{workOrder.operator}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 col-span-2 md:col-span-1">
            <Target size={15} className="text-slate-500" />
            <span>{workOrder.completedQty} / {workOrder.targetQty} adet</span>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-xs font-medium">Günlük İlerleme</span>
            <span className="text-white text-sm font-bold">{progressPercent}%</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-slate-500 text-xs">{workOrder.completedQty} tamamlandı</span>
            <span className="text-slate-500 text-xs">{workOrder.targetQty - workOrder.completedQty} kaldı</span>
          </div>
        </div>
      </div>
    </div>
  );
}
