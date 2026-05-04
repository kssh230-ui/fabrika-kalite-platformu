"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';

const FieldReportsTable = () => {
  const [raporlar, setRaporlar] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "andon_alarmlari"), orderBy("tarih", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const veriler = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRaporlar(veriler);
    });

    return () => unsubscribe();
  }, []);

  const handleSil = async (id) => {
    const onay = window.confirm("Bu bildirimi silmek istediğinize emin misiniz?");
    if (onay) {
      try {
        await deleteDoc(doc(db, "andon_alarmlari", id));
      } catch (error) {
        console.error("Silme hatası:", error);
        alert("Silme işlemi başarısız oldu.");
      }
    }
  };

  return (
    <div className="bg-[#1e293b] rounded-xl border border-slate-700 overflow-hidden mt-6">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-white flex items-center gap-2">
            🚨 Canlı Andon Bildirimleri
          </h3>
          <p className="text-xs text-slate-400">Firebase üzerinden anlık güncellenir</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#0f172a] text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Sinyal ID</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">İstasyon</th>
              <th className="px-4 py-3">Sistem Mesajı</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {raporlar.map((rapor) => (
              <tr key={rapor.id} className="border-b border-slate-700 hover:bg-slate-800 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{rapor.id.slice(0, 8)}...</div>
                </td>
                <td className="px-4 py-3 font-semibold text-blue-400">{rapor.model}</td>
                <td className="px-4 py-3">{rapor.istasyon}</td>
                <td className="px-4 py-3 text-slate-300">{rapor.mesaj}</td>
                <td className="px-4 py-3">
                  <span className="bg-red-900/50 text-red-400 px-2 py-1 rounded text-xs border border-red-800 font-bold animate-pulse">
                    {rapor.durum || "KRİTİK"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSil(rapor.id)}
                    className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/50 px-3 py-1.5 rounded text-xs font-semibold transition-all duration-200"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
            {raporlar.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                  Şu an hatta bir problem yok, üretim devam ediyor...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FieldReportsTable;