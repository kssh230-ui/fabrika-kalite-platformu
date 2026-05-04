import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const TrendCards = () => {
  const [toplamHata, setToplamHata] = useState(0);
  const [andonSayisi, setAndonSayisi] = useState(0);

  useEffect(() => {
    // 1. Pareto verilerinden toplam saha bildirimini (adet) çek ve topla
    const unsubscribePareto = onSnapshot(collection(db, "pareto_verileri"), (snapshot) => {
      let toplam = 0;
      snapshot.docs.forEach(doc => {
        toplam += Number(doc.data().adet || 0);
      });
      setToplamHata(toplam);
    });

    // 2. Aktif Andon alarmlarını say
    const unsubscribeAndon = onSnapshot(collection(db, "andon_alarmlari"), (snapshot) => {
      setAndonSayisi(snapshot.docs.length);
    });

    return () => {
      unsubscribePareto();
      unsubscribeAndon();
    };
  }, []);

  // Yalın Üretim Simülasyonu: Darboğaz (Bottleneck) Algoritması
  const cozumOrani = andonSayisi > 0 ? Math.max(45, 98 - (andonSayisi * 4)) : 100;
  const yanitSuresi = andonSayisi > 0 ? (0.8 + (andonSayisi * 0.4)).toFixed(1) : "0.5";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-4">
      {/* 1. KART: Toplam Saha Bildirimi */}
      <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl border border-slate-600 shadow-xl transition-all hover:border-slate-400">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-lg bg-red-900/50 text-red-500 flex items-center justify-center border border-red-800 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <span className="text-sm font-bold text-red-400 bg-red-900/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-red-800/50 uppercase tracking-wider shadow-sm">
            📊 Pareto'dan Çekiliyor
          </span>
        </div>
        <div className="mt-6">
          <h4 className="text-5xl leading-tight font-black text-white drop-shadow-md tracking-tight">
            {toplamHata} <span className="text-lg font-bold text-slate-500 tracking-normal ml-1">adet</span>
          </h4>
          <p className="text-base text-slate-400 mt-1 font-semibold tracking-wide uppercase">Toplam Saha Bildirimi</p>
        </div>
      </div>

      {/* 2. KART: Çözüm Oranı */}
      <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl border border-slate-600 shadow-xl transition-all hover:border-slate-400">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-lg bg-green-900/50 text-green-500 flex items-center justify-center border border-green-800 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <span className={`text-sm font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border uppercase tracking-wider shadow-sm ${cozumOrani > 80 ? 'text-green-400 bg-green-900/30 border-green-800/50' : 'text-yellow-400 bg-yellow-900/30 border-yellow-800/50'}`}>
            {cozumOrani > 80 ? '↗ İdeal Seviye' : '↘ Darboğaz Riski'}
          </span>
        </div>
        <div className="mt-6">
          <h4 className="text-5xl leading-tight font-black text-white drop-shadow-md tracking-tight">
            {cozumOrani} <span className="text-lg font-bold text-slate-500 tracking-normal ml-1">%</span>
          </h4>
          <p className="text-base text-slate-400 mt-1 font-semibold tracking-wide uppercase">Çözüm Oranı</p>
        </div>
      </div>

      {/* 3. KART: Ort. Yanıt Süresi */}
      <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl border border-slate-600 shadow-xl transition-all hover:border-slate-400">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-lg bg-blue-900/50 text-blue-500 flex items-center justify-center border border-blue-800 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <span className={`text-sm font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border uppercase tracking-wider shadow-sm ${Number(yanitSuresi) < 2 ? 'text-blue-400 bg-blue-900/30 border-blue-800/50' : 'text-red-400 bg-red-900/30 border-red-800/50'}`}>
            ⏱️ Hedef: &lt;2s
          </span>
        </div>
        <div className="mt-6">
          <h4 className="text-5xl leading-tight font-black text-white drop-shadow-md tracking-tight">
            {yanitSuresi} <span className="text-lg font-bold text-slate-500 tracking-normal ml-1">saat</span>
          </h4>
          <p className="text-base text-slate-400 mt-1 font-semibold tracking-wide uppercase">Ort. Yanıt Süresi</p>
        </div>
      </div>

      {/* 4. KART: Kritik Andon Alarmı */}
      <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl border border-slate-600 shadow-xl transition-all hover:border-slate-400 relative overflow-hidden">
        {andonSayisi > 0 && <div className="absolute inset-0 bg-red-900/10 pointer-events-none animate-pulse"></div>}
        <div className="flex justify-between items-start relative z-10">
          <div className="w-12 h-12 rounded-lg bg-orange-900/50 text-orange-500 flex items-center justify-center border border-orange-800 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          </div>
          <span className={`text-sm font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border uppercase tracking-wider shadow-sm ${andonSayisi > 0 ? 'text-orange-400 bg-orange-900/30 border-orange-800/50 animate-pulse' : 'text-slate-400 bg-slate-800 border-slate-700'}`}>
            {andonSayisi > 0 ? '🚨 Müdahale Bekliyor' : '✅ Hat Temiz'}
          </span>
        </div>
        <div className="mt-6 relative z-10">
          <h4 className={`text-5xl leading-tight font-black drop-shadow-md tracking-tight ${andonSayisi > 0 ? 'text-orange-500' : 'text-white'}`}>
            {andonSayisi} <span className="text-lg font-bold text-slate-500 tracking-normal ml-1">adet</span>
          </h4>
          <p className="text-base text-slate-400 mt-1 font-semibold tracking-wide uppercase">Kritik Andon Alarmı</p>
        </div>
      </div>
    </div>
  );
};

export default TrendCards;