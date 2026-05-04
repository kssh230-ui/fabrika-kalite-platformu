import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, addDoc, query } from 'firebase/firestore';

const ParetoChart = () => {
  const [veriler, setVeriler] = useState([]);
  const [yeniKategori, setYeniKategori] = useState('');
  const [yeniSorun, setYeniSorun] = useState('');
  const [yeniAdet, setYeniAdet] = useState('');

  useEffect(() => {
    // Firebase'den verileri dinliyoruz
    const q = query(collection(db, "pareto_verileri"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hamVeri = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // --- ENDÜSTRİ MÜHENDİSLİĞİ HESAPLAMA MOTORU ---
      // 1. Toplam hata sayısını bul
      const toplamHata = hamVeri.reduce((sum, item) => sum + Number(item.adet), 0);
      
      // 2. Büyükten küçüğe sırala
      const siraliVeri = hamVeri.sort((a, b) => b.adet - a.adet);

      // 3. Oranları ve Kümülatif (Birikimli) toplamı hesapla
      let kumulatifToplam = 0;
      const hesaplanmisVeri = siraliVeri.map(item => {
        const oran = toplamHata === 0 ? 0 : (item.adet / toplamHata) * 100;
        kumulatifToplam += oran;
        return {
          ...item,
          oran: oran.toFixed(1),
          kumulatif: kumulatifToplam.toFixed(1)
        };
      });

      setVeriler(hesaplanmisVeri);
    });
    return () => unsubscribe();
  }, []);

  // Yeni veri gönderme fonksiyonu
  const veriEkle = async (e) => {
    e.preventDefault();
    if(!yeniKategori || !yeniAdet) return;

    await addDoc(collection(db, "pareto_verileri"), {
      kategori: yeniKategori,
      sorun: yeniSorun || "Genel Hata",
      adet: Number(yeniAdet)
    });

    setYeniKategori(''); setYeniSorun(''); setYeniAdet('');
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-600 p-8 shadow-2xl transition-all">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="font-black text-3xl text-white flex items-center gap-3 drop-shadow-md">
            📊 Dinamik Pareto Analizi
          </h3>
          <p className="text-base text-slate-400 mt-2 font-medium tracking-wide">
            Veriler girildikçe 80/20 kuralı otomatik hesaplanır
          </p>
        </div>
      </div>

      {/* --- HIZLI VERİ GİRİŞ FORMU (BÜYÜTÜLDÜ) --- */}
      <form onSubmit={veriEkle} className="flex gap-4 mb-10 bg-slate-900/50 p-5 rounded-xl border border-slate-700 shadow-inner">
        <input 
          type="text" placeholder="Ürün (Örn: Noira Baza)" 
          value={yeniKategori} onChange={e => setYeniKategori(e.target.value)} 
          className="bg-slate-800 text-white px-5 py-4 rounded-lg text-lg w-1/3 border border-slate-600 focus:border-blue-500 outline-none placeholder-slate-500 transition-colors" required 
        />
        <input 
          type="text" placeholder="Sorun (Örn: Kumaş Yırtılması)" 
          value={yeniSorun} onChange={e => setYeniSorun(e.target.value)} 
          className="bg-slate-800 text-white px-5 py-4 rounded-lg text-lg w-1/3 border border-slate-600 focus:border-blue-500 outline-none placeholder-slate-500 transition-colors" required 
        />
        <input 
          type="number" placeholder="Adet" 
          value={yeniAdet} onChange={e => setYeniAdet(e.target.value)} 
          className="bg-slate-800 text-white px-5 py-4 rounded-lg text-lg w-1/4 border border-slate-600 focus:border-blue-500 outline-none placeholder-slate-500 transition-colors" required min="1" 
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-lg font-black text-lg uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/25 w-1/4">
          Sisteme İşle
        </button>
      </form>

      {/* --- GRAFİK KISMI (BOYU UZATILDI VE YAZILAR BÜYÜTÜLDÜ) --- */}
      <div className="h-80 flex items-end gap-3 mb-8 border-b-2 border-slate-700 pb-2 relative">
        <div className="absolute w-full border-t-2 border-dashed border-orange-500/50 bottom-[80%] flex justify-end">
            <span className="text-orange-500 text-sm font-bold bg-[#1e293b] px-3 py-1 rounded -mt-4 mr-2 border border-orange-500/30">
              %80 Eşiği
            </span>
        </div>

        {veriler.map((item, index) => {
          const maxAdet = veriler.length > 0 ? Math.max(...veriler.map(v => v.adet)) : 1;
          const height = (item.adet / maxAdet) * 100;
          const barColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-slate-500"];
          const color = barColors[index % barColors.length];

          return (
            <div key={item.id} className="flex-1 flex flex-col items-center group relative">
              <div className={`${color} w-full rounded-t-lg transition-all duration-700 relative flex items-start justify-center pt-3 shadow-lg`} style={{ height: `${height}%`, minHeight: '40px' }}>
                <span className="text-lg font-black text-white bg-black/40 px-2 py-0.5 rounded drop-shadow-md">
                  {item.adet}
                </span>
              </div>
              <div className="mt-3 text-center">
                <div className="text-sm font-bold text-slate-300 truncate w-24 md:w-32 uppercase tracking-wide">
                  {item.kategori}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- TABLO KISMI (SATIRLAR VE FONT BÜYÜTÜLDÜ) --- */}
      <table className="w-full text-left mt-8">
        <thead className="border-b-2 border-slate-700 text-sm text-slate-400 uppercase tracking-widest bg-slate-900/30">
          <tr>
            <th className="py-4 px-4 rounded-tl-lg">Ürün / Sorun Kategorisi</th>
            <th className="py-4 px-4 text-right">Hata Adedi</th>
            <th className="py-4 px-4 text-right">% Oran</th>
            <th className="py-4 px-4 text-right rounded-tr-lg">Kümülatif</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {veriler.map((item) => (
            <tr key={item.id} className="hover:bg-slate-800/50 transition-colors group">
              <td className="py-5 px-4">
                <div className="font-black text-2xl text-white tracking-tight">{item.kategori}</div>
                <div className="text-base text-slate-400 mt-1 font-medium">{item.sorun}</div>
              </td>
              <td className="py-5 px-4 text-right font-black text-2xl text-white">
                {item.adet}
              </td>
              <td className="py-5 px-4 text-right text-xl font-bold text-slate-300">
                {item.oran}%
              </td>
              <td className={`py-5 px-4 text-right font-black text-xl ${Number(item.kumulatif) <= 80 ? 'text-red-400' : 'text-green-400'}`}>
                {item.kumulatif}%
              </td>
            </tr>
          ))}
          {veriler.length === 0 && (
            <tr>
              <td colSpan="4" className="py-12 text-center text-lg text-slate-500 font-medium">
                Henüz saha verisi girilmedi. Formu kullanarak veri ekleyin.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ParetoChart;