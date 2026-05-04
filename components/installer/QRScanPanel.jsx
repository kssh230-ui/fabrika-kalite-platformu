"use client";
import { useState } from "react";
import {
  QrCode, CheckCircle2, AlertTriangle, Package, Ruler,
  Weight, ListChecks, PlayCircle, FileText, ChevronDown, ChevronUp
} from "lucide-react";
import { qrModels } from "../../data/mockData";
import FiveWhyForm from "./FiveWhyForm";

export default function QRScanPanel() {
  const [scanned, setScanned] = useState(false);
  const [model, setModel] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      const m = qrModels["NRA-BSZ-180"];
      setModel(m);
      setScanned(true);
      setScanning(false);
    }, 1400);
  };

  const handleFormSubmit = () => {
    setFormOpen(false);
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 4000);
  };

  if (formOpen) {
    return <FiveWhyForm model={model} onSubmit={handleFormSubmit} onCancel={() => setFormOpen(false)} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* SUCCESS TOAST */}
      {formSuccess && (
        <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold text-center border border-emerald-400 slide-up">
          ✓ Bildirim Fabrikaya İletildi — Ar-Ge Ekibi Bilgilendirildi
        </div>
      )}

      {!scanned ? (
        /* QR SCAN BUTTON */
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="relative">
            <div className={`w-40 h-40 rounded-3xl border-4 flex items-center justify-center transition-all duration-300 ${
              scanning
                ? "border-emerald-400 bg-emerald-950/50 shadow-2xl shadow-emerald-500/30"
                : "border-slate-600 bg-slate-800"
            }`}>
              <QrCode size={72} className={scanning ? "text-emerald-400" : "text-slate-400"} />
            </div>
            {scanning && (
              <div className="absolute inset-0 rounded-3xl border-4 border-emerald-400 animate-ping opacity-30" />
            )}
          </div>

          <div className="text-center">
            <h2 className="text-white text-2xl font-black mb-2">
              {scanning ? "Taranıyor..." : "Ürünü Tara"}
            </h2>
            <p className="text-slate-400 text-sm">
              {scanning
                ? "Model bilgileri yükleniyor"
                : "Ürün üzerindeki QR kodu okutarak kurulum talimatlarına ulaşın"
              }
            </p>
          </div>

          <button
            onClick={handleScan}
            disabled={scanning}
            className={`w-full max-w-xs py-5 rounded-2xl font-black text-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-2xl ${
              scanning
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-emerald-500/40"
            }`}
          >
            <QrCode size={28} />
            {scanning ? "Taranıyor..." : "QR Kodu Okut"}
          </button>
        </div>
      ) : (
        /* MODEL LOADED */
        <>
          {/* SUCCESS BADGE */}
          <div className="bg-emerald-950/60 border border-emerald-600 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 size={24} className="text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-emerald-300 font-bold text-sm">Model Algılandı</p>
              <p className="text-white font-black text-lg leading-tight">{model.modelName}</p>
            </div>
            <button
              onClick={() => { setScanned(false); setModel(null); }}
              className="ml-auto text-xs text-slate-500 hover:text-slate-300 underline"
            >
              Değiştir
            </button>
          </div>

          {/* WARNING BANNER */}
          {model.warningLevel === "high" && (
            <div className="bg-red-950/60 border-2 border-red-500 rounded-2xl p-4 warning-blink">
              <div className="flex items-start gap-3">
                <AlertTriangle size={22} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 font-black text-sm uppercase tracking-wider mb-1">Proaktif Uyarı</p>
                  <p className="text-red-100 font-semibold leading-snug">{model.warning}</p>
                </div>
              </div>
            </div>
          )}

          {/* MODEL SPECS */}
          <div className="bg-slate-800 rounded-2xl border border-slate-600 p-5">
            <h3 className="text-white font-bold text-base mb-4">Model Bilgileri</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Package, label: "Model Kodu", value: model.modelCode },
                { icon: Ruler, label: "Ölçüler", value: model.dimensions },
                { icon: Weight, label: "Ağırlık", value: model.weight },
                { icon: ListChecks, label: "Parça Sayısı", value: `${model.partsCount} adet` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-slate-700/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={13} className="text-slate-500" />
                    <span className="text-slate-400 text-xs">{label}</span>
                  </div>
                  <p className="text-white font-bold text-sm">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* INSTALLATION STEPS */}
          <div className="bg-slate-800 rounded-2xl border border-slate-600 overflow-hidden">
            <button
              onClick={() => setStepsOpen(!stepsOpen)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-700/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <ListChecks size={18} className="text-emerald-400" />
                <span className="text-white font-bold">Kurulum Adımları</span>
                <span className="bg-emerald-900/60 text-emerald-300 text-xs px-2 py-0.5 rounded-full">
                  {model.installSteps.length} adım
                </span>
              </div>
              {stepsOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
            </button>

            {stepsOpen && (
              <div className="border-t border-slate-700 px-5 pb-5 pt-4 flex flex-col gap-3">
                {/* 3D Placeholder */}
                <div className="bg-slate-900 rounded-xl aspect-video flex items-center justify-center border border-slate-700 mb-2">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📦</div>
                    <p className="text-slate-500 text-sm font-medium">3D Kurulum Görünümü</p>
                    <p className="text-slate-600 text-xs">İnteraktif model yükleniyor...</p>
                  </div>
                </div>
                {model.installSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-900/60 border border-emerald-700 flex items-center justify-center flex-shrink-0 text-emerald-300 text-xs font-black">
                      {i + 1}
                    </div>
                    <p className="text-slate-300 text-sm pt-1 leading-snug">{step.replace(/^\d+\.\s/, "")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AR-GE VIDEO */}
          <div className="bg-slate-800 rounded-2xl border border-slate-600 p-4 flex items-center gap-4">
            <div className="bg-blue-900/60 p-3 rounded-xl border border-blue-700">
              <PlayCircle size={24} className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-xs mb-0.5">Ar-Ge Uyarı Videosu</p>
              <p className="text-white font-bold text-sm truncate">Noira Baza - Kumaş Gerilim Tekniği</p>
            </div>
            <button className="text-blue-400 text-xs font-bold bg-blue-950/50 px-3 py-2 rounded-xl border border-blue-800 hover:bg-blue-900/50 transition-all flex-shrink-0">
              İzle
            </button>
          </div>

          {/* REPORT BUTTON */}
          <button
            onClick={() => setFormOpen(true)}
            className="w-full py-5 bg-red-700 hover:bg-red-600 active:scale-98 rounded-2xl
              text-white font-black text-xl flex items-center justify-center gap-3
              border-2 border-red-500 shadow-2xl shadow-red-500/30 transition-all mt-2"
          >
            <AlertTriangle size={24} />
            Kurulumda Hata Var
          </button>
        </>
      )}
    </div>
  );
}
