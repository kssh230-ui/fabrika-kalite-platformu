"use client";
import { useState } from "react";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Camera, Mic, MicOff,
  Layers, Scissors, Package, Wrench, AlertTriangle, Send
} from "lucide-react";

const STEPS = ["Konum", "Sorun Detayı", "Geçici Çözüm"];

const locations = [
  { id: "skeleton", label: "İskelet", icon: Layers, color: "#EF4444" },
  { id: "fabric", label: "Kumaş", icon: Scissors, color: "#F97316" },
  { id: "hardware", label: "Hırdavat", icon: Wrench, color: "#EAB308" },
  { id: "package", label: "Ambalaj", icon: Package, color: "#8B5CF6" },
];

const issueTypes = [
  { id: "tear", label: "Yırtık / Delik" },
  { id: "scratch", label: "Çizik / Ezik" },
  { id: "missing", label: "Eksik Parça" },
  { id: "loose", label: "Gevşek / Sallanma" },
];

const resolutions = [
  { id: "fixed", label: "Sahada Çözüldü", desc: "Sorun yerinde giderildi", color: "emerald" },
  { id: "exchange", label: "Değişim Talebi", desc: "Yeni parça / ürün gerekiyor", color: "red" },
];

const MOCK_VOICE_TEXT = "Köşe birleşiminde kumaş potluk yapmış, gerilim ayarsız bırakılmış gibi görünüyor";

export default function FiveWhyForm({ model, onSubmit, onCancel }) {
  const [step, setStep] = useState(0);
  const [location, setLocation] = useState(null);
  const [issueType, setIssueType] = useState(null);
  const [description, setDescription] = useState("");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [recording, setRecording] = useState(false);
  const [resolution, setResolution] = useState(null);

  const handleVoice = () => {
    setRecording(true);
    setTimeout(() => {
      setDescription(MOCK_VOICE_TEXT);
      setRecording(false);
    }, 1800);
  };

  const canNext = () => {
    if (step === 0) return !!location;
    if (step === 1) return !!issueType;
    if (step === 2) return !!resolution;
    return false;
  };

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    else onSubmit();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-white font-black text-lg leading-none">Hata Bildirimi</h2>
          <p className="text-slate-400 text-xs">{model?.modelName || "Model"}</p>
        </div>
      </div>

      {/* STEP INDICATORS */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                i < step
                  ? "bg-emerald-600 border-emerald-500 text-white"
                  : i === step
                    ? "bg-slate-700 border-emerald-500 text-white"
                    : "bg-slate-800 border-slate-600 text-slate-500"
              }`}>
                {i < step ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${i === step ? "text-white" : "text-slate-500"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full transition-all ${i < step ? "bg-emerald-600" : "bg-slate-700"}`} />
            )}
          </div>
        ))}
      </div>

      {/* STEP CONTENT */}
      <div className="bg-slate-800 rounded-2xl border border-slate-600 p-5 min-h-[320px]">
        {/* STEP 0: LOCATION */}
        {step === 0 && (
          <div>
            <p className="text-slate-400 text-sm font-semibold mb-1 uppercase tracking-wider">Adım 1</p>
            <h3 className="text-white font-black text-xl mb-5">Hata Nerede?</h3>
            <div className="grid grid-cols-2 gap-3">
              {locations.map((loc) => {
                const Icon = loc.icon;
                const isSelected = location?.id === loc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => setLocation(loc)}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-150 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-950/50 shadow-lg shadow-emerald-500/20"
                        : "border-slate-600 bg-slate-700/40 hover:border-slate-500 hover:bg-slate-700/70"
                    }`}
                  >
                    <div className="p-3 rounded-xl" style={{ backgroundColor: loc.color + "22" }}>
                      <Icon size={28} style={{ color: loc.color }} />
                    </div>
                    <span className={`font-bold text-base ${isSelected ? "text-emerald-300" : "text-white"}`}>
                      {loc.label}
                    </span>
                    {isSelected && <CheckCircle2 size={16} className="text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 1: ISSUE */}
        {step === 1 && (
          <div>
            <p className="text-slate-400 text-sm font-semibold mb-1 uppercase tracking-wider">Adım 2</p>
            <h3 className="text-white font-black text-xl mb-1">Sorun Ne?</h3>
            <p className="text-slate-500 text-sm mb-5">Seçim: <span className="text-slate-300 font-semibold">{location?.label}</span></p>

            <div className="flex flex-col gap-2 mb-5">
              {issueTypes.map((it) => (
                <button
                  key={it.id}
                  onClick={() => setIssueType(it)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all ${
                    issueType?.id === it.id
                      ? "border-emerald-500 bg-emerald-950/50 text-emerald-200"
                      : "border-slate-600 bg-slate-700/40 text-white hover:border-slate-500"
                  }`}
                >
                  <span className="font-bold text-base">{it.label}</span>
                  {issueType?.id === it.id && <CheckCircle2 size={18} className="text-emerald-400" />}
                </button>
              ))}
            </div>

            {/* DESCRIPTION */}
            <div className="bg-slate-700/50 rounded-xl border border-slate-600 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-600">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Açıklama</span>
                <div className="flex gap-2">
                  {/* PHOTO */}
                  <button
                    onClick={() => setHasPhoto(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      hasPhoto
                        ? "bg-emerald-700 text-white"
                        : "bg-slate-600 text-slate-300 hover:bg-slate-500"
                    }`}
                  >
                    <Camera size={14} />
                    {hasPhoto ? "Fotoğraf Eklendi ✓" : "Fotoğraf Çek"}
                  </button>
                  {/* VOICE */}
                  <button
                    onClick={handleVoice}
                    disabled={recording}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      recording
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-slate-600 text-slate-300 hover:bg-slate-500"
                    }`}
                  >
                    {recording ? <MicOff size={14} /> : <Mic size={14} />}
                    {recording ? "Dinleniyor..." : "Sesli Giriş"}
                  </button>
                </div>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Sorunu kısaca açıklayın veya mikrofon ile konuşun..."
                rows={3}
                className="w-full bg-transparent px-4 py-3 text-white text-sm resize-none outline-none placeholder-slate-500"
              />
            </div>
          </div>
        )}

        {/* STEP 2: RESOLUTION */}
        {step === 2 && (
          <div>
            <p className="text-slate-400 text-sm font-semibold mb-1 uppercase tracking-wider">Adım 3</p>
            <h3 className="text-white font-black text-xl mb-5">Geçici Çözüm?</h3>

            {/* SUMMARY */}
            <div className="bg-slate-700/50 rounded-xl border border-slate-600 p-4 mb-5">
              <p className="text-slate-400 text-xs mb-2 font-semibold">Bildiriminiz</p>
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2 text-sm">
                  <span className="text-slate-500 w-16 flex-shrink-0">Konum:</span>
                  <span className="text-white font-semibold">{location?.label}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-slate-500 w-16 flex-shrink-0">Sorun:</span>
                  <span className="text-white font-semibold">{issueType?.label}</span>
                </div>
                {description && (
                  <div className="flex gap-2 text-sm">
                    <span className="text-slate-500 w-16 flex-shrink-0">Not:</span>
                    <span className="text-slate-300 text-xs leading-relaxed">{description}</span>
                  </div>
                )}
                {hasPhoto && (
                  <div className="flex gap-2 text-sm">
                    <span className="text-slate-500 w-16 flex-shrink-0">Fotoğraf:</span>
                    <span className="text-emerald-400 text-xs">✓ Eklendi</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {resolutions.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setResolution(r)}
                  className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                    resolution?.id === r.id
                      ? r.color === "emerald"
                        ? "border-emerald-500 bg-emerald-950/50"
                        : "border-red-500 bg-red-950/50"
                      : "border-slate-600 bg-slate-700/40 hover:border-slate-500"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                    resolution?.id === r.id
                      ? r.color === "emerald" ? "border-emerald-500 bg-emerald-500" : "border-red-500 bg-red-500"
                      : "border-slate-500"
                  }`}>
                    {resolution?.id === r.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div>
                    <p className="text-white font-black text-base">{r.label}</p>
                    <p className="text-slate-400 text-sm">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* NAV BUTTONS */}
      <div className="flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 px-5 py-4 rounded-2xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition-all"
          >
            <ArrowLeft size={18} />
            Geri
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canNext()}
          className={`flex-1 py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 ${
            canNext()
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
              : "bg-slate-700 text-slate-500 cursor-not-allowed"
          }`}
        >
          {step < 2 ? (
            <><span>Devam</span><ArrowRight size={18} /></>
          ) : (
            <><Send size={18} /><span>Fabrikaya Gönder</span></>
          )}
        </button>
      </div>
    </div>
  );
}
