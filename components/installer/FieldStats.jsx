"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown, Calendar, BarChart2, Award, AlertCircle } from "lucide-react";
import { monthlyErrorStats, yearlyErrorStats } from "../../data/mockData";

export default function FieldStats() {
  const [period, setPeriod] = useState("month");
  const data = period === "month" ? monthlyErrorStats : yearlyErrorStats;

  const maxCount = data.topModels[0]?.errorCount || 1;

  const medals = ["🥇", "🥈", "🥉", "4️⃣"];
  const barColors = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-slate-500"];

  return (
    <div className="flex flex-col gap-4">
      {/* PERIOD TOGGLE */}
      <div className="flex gap-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
        <button
          onClick={() => setPeriod("month")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
            period === "month"
              ? "bg-emerald-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Calendar size={15} />
          Aylık
        </button>
        <button
          onClick={() => setPeriod("year")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
            period === "year"
              ? "bg-emerald-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <BarChart2 size={15} />
          Yıllık
        </button>
      </div>

      {/* HEADER */}
      <div className="bg-slate-800 rounded-2xl border border-slate-600 p-5">
        <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Dönem</p>
        <h2 className="text-white font-black text-2xl">
          {period === "month" ? monthlyErrorStats.month : yearlyErrorStats.year}
        </h2>
        <p className="text-slate-400 text-sm mt-1">En çok hata bildirilen modeller</p>
      </div>

      {/* TOP MODELS */}
      <div className="flex flex-col gap-3">
        {data.topModels.map((item, i) => (
          <div key={item.code} className="bg-slate-800 rounded-2xl border border-slate-600 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-0.5">{medals[i] || "•"}</span>
                <div>
                  <p className="text-white font-black text-base leading-tight">{item.model}</p>
                  <p className="text-slate-500 text-xs">{item.code}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-black text-2xl leading-none">{item.errorCount}</p>
                <p className="text-slate-500 text-xs">bildirim</p>
              </div>
            </div>

            {/* BAR */}
            <div className="mb-3">
              <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barColors[i] || "bg-slate-500"}`}
                  style={{ width: `${(item.errorCount / maxCount) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={13} className="text-slate-500" />
                <span className="text-slate-400 text-xs">Başlıca sorun:</span>
                <span className="text-slate-200 text-xs font-semibold">{item.mainCategory}</span>
              </div>
              {item.change && (
                <div className={`flex items-center gap-1 text-xs font-bold ${
                  item.trend === "up" ? "text-red-400" : "text-emerald-400"
                }`}>
                  {item.trend === "up"
                    ? <TrendingUp size={13} />
                    : <TrendingDown size={13} />
                  }
                  {item.change}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MONTHLY CATEGORY BREAKDOWN */}
      {period === "month" && monthlyErrorStats.byCategory && (
        <div className="bg-slate-800 rounded-2xl border border-slate-600 p-5">
          <h3 className="text-white font-bold text-base mb-4">Hata Tipi Dağılımı</h3>
          <div className="flex flex-col gap-3">
            {monthlyErrorStats.byCategory.map((cat) => (
              <div key={cat.category}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-slate-300 text-sm font-medium">{cat.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">{cat.count} adet</span>
                    <span className="text-white font-bold text-sm w-10 text-right">%{cat.percent}</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INFO NOTE */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 flex items-start gap-3">
        <Award size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
        <p className="text-slate-400 text-sm leading-relaxed">
          Veriler, saha ekibinin yaptığı bildirimler ve döşeme hattı Andon kayıtlarından derlenmektedir.
        </p>
      </div>
    </div>
  );
}
