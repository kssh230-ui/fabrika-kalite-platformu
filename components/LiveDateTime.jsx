"use client";
import React, { useState, useEffect } from 'react';

export default function LiveDateTime() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Her saniye tık tık atacak olan zamanlayıcı motoru
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    // Bileşen ekrandan kalkarsa sayacı durdur (Performans için)
    return () => clearInterval(timer);
  }, []);

  // Hydration hatasını önlemek için yüklenme ekranı
  if (!mounted) {
    return <div className="text-right text-slate-300 w-48 animate-pulse bg-slate-800/50 h-10 rounded-lg"></div>;
  }

  const hours = time.getHours();
  
  // Endüstriyel Vardiya Mantığı (3'lü Sistem)
  let shift = "";
  let shiftColor = "";

  if (hours >= 7 && hours < 15) {
    shift = "SABAH VARDİYASI";
    shiftColor = "text-amber-400"; // Sabah güneşi
  } else if (hours >= 15 && hours < 23) {
    shift = "AKŞAM VARDİYASI";
    shiftColor = "text-orange-500"; // Akşam gün batımı
  } else {
    shift = "GECE VARDİYASI";
    shiftColor = "text-indigo-400"; // Gece mavisi
  }

  // Türkçe Tarih Formatı
  const formattedDate = time.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Saat Formatı (SS:DD:SS)
  const formattedTime = time.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="text-right flex flex-col justify-center items-end bg-slate-900/50 px-4 py-1.5 rounded-lg border border-slate-700/50 shadow-inner">
      <div className="font-mono text-sm font-bold text-white tracking-widest flex items-center gap-2">
        {formattedDate} 
        <span className="text-slate-500 text-xs">|</span> 
        <span className="text-teal-400">{formattedTime}</span>
      </div>
      <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mt-0.5 ${shiftColor}`}>
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${shiftColor.replace('text-', 'bg-')}`}></span>
        {shift}
      </div>
    </div>
  );
}