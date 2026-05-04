import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, where, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import AndonButton from './AndonButton';

const ProductionScreen = () => {
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [isEmri, setIsEmri] = useState({
    id: null,
    urunAdi: 'Yükleniyor...',
    urunModeli: 'Yükleniyor...',
    hedefSaat: '...',
    ustaAdi: '...',
    tamamlanan: 0,
    hedef: 0
  });

  const [aktifSop, setAktifSop] = useState(null);
  const [pokaYokeler, setPokaYokeler] = useState([]);
  const [pokaYokeEkleModu, setPokaYokeEkleModu] = useState(false);
  const [yeniUyariMetni, setYeniUyariMetni] = useState('');
  const [yeniUyariTipi, setYeniUyariTipi] = useState('KRİTİK');

  useEffect(() => {
    const qIsEmri = query(collection(db, 'is_emirleri'), where('istasyon', '==', 'Döşeme Hattı'));
    const unsubIsEmri = onSnapshot(qIsEmri, (snapshot) => {
      if (!snapshot.empty) {
        const veriler = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        veriler.sort((a, b) => (b.tarih?.toMillis() || 0) - (a.tarih?.toMillis() || 0));
        setIsEmri(veriler[0]);
      }
    });
    return () => unsubIsEmri();
  }, []);

  useEffect(() => {
    const qSop = query(collection(db, 'sop_listesi'), where('kitle', '==', 'Döşeme Hattı'));
    const unsubSop = onSnapshot(qSop, (snapshot) => {
      if (!snapshot.empty) {
        const veriler = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        veriler.sort((a, b) => (b.tarih?.toMillis() || 0) - (a.tarih?.toMillis() || 0));
        setAktifSop(veriler[0]);
      }
    });
    return () => unsubSop();
  }, []);

  useEffect(() => {
    const qPoka = query(collection(db, 'poka_yoke_uyarilari'), where('istasyon', '==', 'Döşeme Hattı'));
    const unsubPoka = onSnapshot(qPoka, (snapshot) => {
      const veriler = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      veriler.sort((a, b) => (a.tarih?.toMillis() || 0) - (b.tarih?.toMillis() || 0));
      setPokaYokeler(veriler);
    });
    return () => unsubPoka();
  }, []);

  const handleIsEmriGuncelle = async (e) => {
    e.preventDefault();
    try {
      const temizVeri = {
        istasyon: 'Döşeme Hattı',
        urunAdi: isEmri.urunAdi || '',
        urunModeli: isEmri.urunModeli || '',
        hedefSaat: isEmri.hedefSaat || '',
        ustaAdi: isEmri.ustaAdi || '',
        tamamlanan: Number(isEmri.tamamlanan) || 0,
        hedef: Number(isEmri.hedef) || 0,
      };

      if (isEmri.id) {
        await updateDoc(doc(db, 'is_emirleri', isEmri.id), {
          ...temizVeri,
          guncellemeTarihi: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'is_emirleri'), {
          ...temizVeri,
          tarih: serverTimestamp()
        });
      }
      setDuzenlemeModu(false);
    } catch (error) {
      console.error("Güncelleme hatası:", error);
    }
  };

  const handlePokaYokeEkle = async (e) => {
    e.preventDefault();
    if (!yeniUyariMetni) return;
    try {
      await addDoc(collection(db, 'poka_yoke_uyarilari'), {
        istasyon: 'Döşeme Hattı', tip: yeniUyariTipi, metin: yeniUyariMetni, tarih: serverTimestamp()
      });
      setYeniUyariMetni(''); setPokaYokeEkleModu(false);
    } catch (error) { console.error(error); }
  };

  const handlePokaYokeSil = async (id) => {
    if (window.confirm("Bu kalite uyarısını silmek istediğinize emin misiniz?")) {
      try { await deleteDoc(doc(db, 'poka_yoke_uyarilari', id)); } catch (error) { console.error(error); }
    }
  };

  const ilerlemeYuzdesi = isEmri.hedef > 0 ? Math.round((isEmri.tamamlanan / isEmri.hedef) * 100) : 0;

  return (
    <div className="flex gap-6 p-6 min-h-screen bg-[#0f172a] text-white font-sans">
      <div className="flex-1 flex flex-col gap-6">
        
        {/* İŞ EMRİ PANELİ (GÖRSEL YÖNETİM İÇİN YAZILAR DEVASA YAPILDI) */}
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 shadow-xl overflow-hidden relative">
          <div className="bg-blue-600 px-6 py-3 flex justify-between items-center">
            <h3 className="font-bold text-2xl flex items-center gap-2 italic tracking-wide">
              Ürün Adı: {isEmri.urunAdi || 'Belirtilmedi'}
            </h3>
            <div className="flex items-center gap-4">
              <button onClick={() => setDuzenlemeModu(!duzenlemeModu)} className="text-sm font-bold bg-black/20 hover:bg-black/40 px-4 py-2 rounded transition-all">
                {duzenlemeModu ? "Vazgeç" : "✎ Verileri Güncelle"}
              </button>
              <span className="flex items-center gap-2 text-sm font-bold tracking-widest bg-black/20 px-3 py-1.5 rounded"><span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span> AKTİF HAT</span>
            </div>
          </div>

          <div className="p-8">
            {duzenlemeModu ? (
              <form onSubmit={handleIsEmriGuncelle} className="grid grid-cols-2 gap-4 bg-[#0f172a] p-6 rounded-xl border border-slate-700">
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Ürün Adı</label><input type="text" value={isEmri.urunAdi || ''} onChange={e => setIsEmri({...isEmri, urunAdi: e.target.value})} className="w-full bg-slate-800 p-3 rounded text-base outline-none border border-slate-700 focus:border-blue-500" /></div>
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Ürün Modeli</label><input type="text" value={isEmri.urunModeli || ''} onChange={e => setIsEmri({...isEmri, urunModeli: e.target.value})} className="w-full bg-slate-800 p-3 rounded text-base outline-none border border-slate-700 focus:border-blue-500" /></div>
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Hedef Saat</label><input type="text" value={isEmri.hedefSaat || ''} onChange={e => setIsEmri({...isEmri, hedefSaat: e.target.value})} className="w-full bg-slate-800 p-3 rounded text-base outline-none border border-slate-700 focus:border-blue-500" /></div>
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Usta Adı</label><input type="text" value={isEmri.ustaAdi || ''} onChange={e => setIsEmri({...isEmri, ustaAdi: e.target.value})} className="w-full bg-slate-800 p-3 rounded text-base outline-none border border-slate-700 focus:border-blue-500" /></div>
                
                <div className="flex gap-4">
                  <div className="w-1/2"><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Tamamlanan</label><input type="number" value={isEmri.tamamlanan || 0} onChange={e => setIsEmri({...isEmri, tamamlanan: Number(e.target.value)})} className="w-full bg-slate-800 p-3 rounded text-base outline-none border border-slate-700 text-blue-400 font-bold" /></div>
                  <div className="w-1/2"><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Günlük Hedef</label><input type="number" value={isEmri.hedef || 0} onChange={e => setIsEmri({...isEmri, hedef: Number(e.target.value)})} className="w-full bg-slate-800 p-3 rounded text-base outline-none border border-slate-700" /></div>
                </div>
                <button type="submit" className="col-span-2 bg-green-600 text-white py-3 mt-2 rounded-lg font-black hover:bg-green-500 transition-colors uppercase text-sm tracking-widest shadow-lg">Veritabanına Kaydet</button>
              </form>
            ) : (
              <>
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <p className="text-sm text-slate-400 font-bold tracking-widest uppercase mb-2">Üretimdeki Model</p>
                    <h2 className="text-6xl font-black text-white uppercase italic tracking-tight">{isEmri.urunModeli || 'Veri Bekleniyor'}</h2>
                    <p className="text-xl text-slate-400 mt-4 font-medium">{isEmri.urunAdi || 'Belirtilmedi'} <span className="mx-2 text-slate-600">|</span> Hedef Saat: <span className="text-white font-bold">{isEmri.hedefSaat || 'Belirtilmedi'}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl text-slate-300 flex items-center gap-2 justify-end mb-3">
                      <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      {isEmri.ustaAdi || 'Atanmadı'}
                    </p>
                    <h3 className="text-5xl font-black mt-2 text-blue-400 drop-shadow-md">{isEmri.tamamlanan || 0} <span className="text-2xl text-slate-500 font-normal">/ {isEmri.hedef || 0} Adet</span></h3>
                  </div>
                </div>

                <div className="relative pt-2">
                  <div className="flex mb-3 items-center justify-between">
                    <div><span className="text-sm font-bold inline-block text-slate-400 uppercase tracking-widest">Vardiya İlerlemesi</span></div>
                    <div className="text-right"><span className="text-2xl font-black inline-block text-blue-400">%{ilerlemeYuzdesi}</span></div>
                  </div>
                  <div className="overflow-hidden h-4 mb-2 text-xs flex rounded-full bg-slate-800 border border-slate-700 shadow-inner">
                    <div style={{ width: `${ilerlemeYuzdesi}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-600 to-teal-400 transition-all duration-1000"></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* VİDEO PANELİ */}
        <div className="bg-[#0f172a] rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col">
          <div className="bg-[#1e293b] px-4 py-3 flex justify-between items-center border-b border-slate-700 z-20 relative">
            <h3 className="font-bold text-sm flex items-center gap-2 text-slate-300 uppercase tracking-tighter">
              {aktifSop ? aktifSop.baslik : "SOP Eğitimi Yükleniyor..."}
            </h3>
            <span className={`text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${aktifSop ? 'bg-red-600 animate-pulse' : 'bg-slate-600'}`}>
              {aktifSop ? "Canlı SOP" : "Beklemede"}
            </span>
          </div>
          
          <div className="relative bg-black flex items-center justify-center aspect-[21/9] border-b border-slate-800 overflow-hidden">
            {aktifSop ? (
              <>
                <video key={aktifSop.id || 'default'} autoPlay loop muted className="absolute inset-0 w-full h-full object-cover">
                  <source src={aktifSop.videoUrl || aktifSop.dosyaUrl || aktifSop.url} type="video/mp4" />
                </video>
                
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 pt-16 flex flex-col pointer-events-none">
                  <span className="text-[10px] font-bold tracking-widest flex items-center gap-2 text-emerald-400 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    AKTİF EĞİTİM - OYNATILIYOR
                  </span>
                  <h2 className="text-white font-bold text-2xl drop-shadow-md uppercase italic">{aktifSop.baslik}</h2>
                  <p className="text-slate-300 text-[10px] mt-1 font-mono">
                    Süre: {aktifSop.sure} dk • Dosya: {aktifSop.dosyaAdi}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-600 z-10 flex flex-col items-center">
                <p className="text-xs uppercase tracking-widest">Ar-Ge Verisi Bekleniyor...</p>
              </div>
            )}
          </div>
        </div>

        {/* POKA-YOKE PANELİ */}
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-slate-700 flex justify-between items-center bg-[#0f172a]/50">
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-200">🛡️ Poka-Yoke Kalite Kontrol Noktaları</h3>
            <button onClick={() => setPokaYokeEkleModu(!pokaYokeEkleModu)} className="text-[10px] bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 px-2 py-1 rounded transition-colors uppercase font-bold">
              {pokaYokeEkleModu ? "Kapat" : "+ Yeni Nokta"}
            </button>
          </div>

          <div className="p-4 flex flex-col gap-3">
            {pokaYokeEkleModu && (
              <form onSubmit={handlePokaYokeEkle} className="bg-[#0f172a] p-3 rounded-lg border border-slate-600 flex gap-3">
                <select value={yeniUyariTipi} onChange={(e) => setYeniUyariTipi(e.target.value)} className="bg-slate-800 text-white text-xs px-2 py-1 rounded border border-slate-600 outline-none">
                  <option value="KRİTİK">Kritik</option>
                  <option value="UYARI">Uyarı</option>
                </select>
                <input type="text" placeholder="Hata önleme kuralını yazın..." value={yeniUyariMetni} onChange={(e) => setYeniUyariMetni(e.target.value)} className="flex-1 bg-slate-800 text-white text-xs px-3 py-1 rounded border border-slate-600 outline-none" />
                <button type="submit" className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded uppercase">Ekle</button>
              </form>
            )}

            {pokaYokeler.map((uyari, index) => (
              <div key={uyari.id} className={`relative group rounded-lg p-3 border-l-4 transition-all flex justify-between items-start ${uyari.tip === 'KRİTİK' ? 'bg-red-950/20 border-red-600' : 'bg-orange-950/20 border-orange-500'}`}>
                <div>
                  <span className={`text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded text-white mb-1 inline-block ${uyari.tip === 'KRİTİK' ? 'bg-red-600' : 'bg-orange-500'}`}>{uyari.tip}</span>
                  <p className="text-xs text-slate-300">{uyari.metin}</p>
                </div>
                <button onClick={() => handlePokaYokeSil(uyari.id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-64 flex flex-col justify-start pt-10">
         <AndonButton modelName={isEmri.urunModeli || isEmri.urunAdi} />
      </div>
    </div>
  );
};

export default ProductionScreen;