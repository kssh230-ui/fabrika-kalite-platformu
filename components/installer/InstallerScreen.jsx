import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; 
import { doc, onSnapshot, setDoc, collection, addDoc, query, orderBy, where, serverTimestamp, deleteDoc } from 'firebase/firestore';

const InstallerScreen = () => {
  // === GENEL SEKMELER ===
  const [solSekme, setSolSekme] = useState('kurulum'); 

  // === 1. SAHA İSTATİSTİKLERİ STATE'LERİ ===
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [aktifSekme, setAktifSekme] = useState('Aylık');

  const varsayilanAylik = {
    donem: 'Nisan 2026',
    modeller: [
      { ad: 'Noira Baza', varyant: 'NRA-BSZ-180', sayi: 23, sorun: 'Kumaş Potluğu', trend: '+30', renk: 'bg-red-600' },
      { ad: 'X Konsol Koltuk', varyant: 'XKS-KLT-90', sayi: 11, sorun: 'Eksik Vida', trend: '+5', renk: 'bg-orange-500' },
      { ad: 'Luna Kanepe', varyant: 'LNA-KNP-220', sayi: 6, sorun: 'Ambalaj Hasarı', trend: '-10', renk: 'bg-blue-500' }
    ],
    hatalar: [
      { ad: 'Kumaş / Döşeme Hatası', adet: 21, yuzde: 45 },
      { ad: 'Eksik Hırdavat', adet: 9, yuzde: 19 },
      { ad: 'MDF / Sunta Ezilmesi', adet: 8, yuzde: 17 },
      { ad: 'Zigzag Yay Problemi', adet: 6, yuzde: 13 },
      { ad: 'Zıvana Uyumsuzluğu', adet: 3, yuzde: 6 }
    ]
  };

  const varsayilanYillik = {
    donem: '2026 Yılı Toplam',
    modeller: [
      { ad: 'Noira Baza', varyant: 'NRA-BSZ-180', sayi: 145, sorun: 'İskelet Çatlağı', trend: '-15', renk: 'bg-red-600' },
      { ad: 'Luna Kanepe', varyant: 'LNA-KNP-220', sayi: 82, sorun: 'Ambalaj Hasarı', trend: '+10', renk: 'bg-orange-500' },
      { ad: 'Yatak Odası Tk.', varyant: 'YOT-01', sayi: 45, sorun: 'Eksik Parça', trend: '-5', renk: 'bg-blue-500' }
    ],
    hatalar: [
      { ad: 'İskelet Çatlağı', adet: 120, yuzde: 35 },
      { ad: 'Kumaş Yırtılması', adet: 85, yuzde: 25 },
      { ad: 'Ambalaj Hasarı', adet: 60, yuzde: 20 },
      { ad: 'Eksik Parça', adet: 45, yuzde: 15 },
      { ad: 'Diğer', adet: 15, yuzde: 5 }
    ]
  };

  const [tumVeriler, setTumVeriler] = useState({ Aylık: varsayilanAylik, Yıllık: varsayilanYillik });

  // === 2. KURULUM VE HATA BİLDİRİMİ STATE'LERİ ===
  const [bildirimForm, setBildirimForm] = useState({
    siparisNo: '',
    model: 'Noira Baza',
    hataKategorisi: '',
    aciklama: ''
  });
  const [gecmisBildirimler, setGecmisBildirimler] = useState([]);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [basariMesaji, setBasariMesaji] = useState(false);
  
  // === 3. MONTAJ USTALARI SOP VİDEO STATE'İ (YENİ) ===
  const [aktifSop, setAktifSop] = useState(null);

  // === FİREBASE DİNLEYİCİLERİ ===
  
  // İstatistikleri Dinle
  useEffect(() => {
    const docRef = doc(db, 'saha_istatistikleri', 'guncel_veriler');
    const unsubStats = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const gelenVeri = docSnap.data();
        setTumVeriler({ Aylık: gelenVeri.Aylık || varsayilanAylik, Yıllık: gelenVeri.Yıllık || varsayilanYillik });
      }
    });
    return () => unsubStats();
  }, []);

  // Saha Bildirimlerini Dinle
  useEffect(() => {
    const qBildirimler = query(collection(db, 'saha_bildirimleri'), orderBy('tarih', 'desc'));
    const unsubBildirimler = onSnapshot(qBildirimler, (snapshot) => {
      const veriler = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGecmisBildirimler(veriler);
    });
    return () => unsubBildirimler();
  }, []);

  // MONTAJ USTALARI İÇİN VİDEO DİNLEYİCİSİ (YENİ)
  useEffect(() => {
    const qSop = query(collection(db, 'sop_listesi'), where('kitle', '==', 'Montaj Ustaları'));
    const unsubSop = onSnapshot(qSop, (snapshot) => {
      if (!snapshot.empty) {
        const veriler = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        veriler.sort((a, b) => (b.tarih?.toMillis() || 0) - (a.tarih?.toMillis() || 0));
        setAktifSop(veriler[0]); // En yeni videoyu çeker
      } else {
        setAktifSop(null);
      }
    });
    return () => unsubSop();
  }, []);

  // === İŞLEM FONKSİYONLARI ===

  // İstatistik Kaydet
  const handleIstatistikKaydet = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'saha_istatistikleri', 'guncel_veriler'), { ...tumVeriler, guncellemeTarihi: serverTimestamp() }, { merge: true });
      setDuzenlemeModu(false);
    } catch (error) { console.error(error); }
  };

  // Yeni Hata Bildirimi Gönder
  const handleBildirimGonder = async (e) => {
    e.preventDefault();
    if (!bildirimForm.siparisNo || !bildirimForm.hataKategorisi) return;
    
    setGonderiliyor(true);
    try {
      await addDoc(collection(db, 'saha_bildirimleri'), {
        ...bildirimForm,
        tarih: serverTimestamp(),
        durum: 'İnceleniyor',
        bildiren: 'Montaj Ekibi 1'
      });
      setBildirimForm({ siparisNo: '', model: 'Noira Baza', hataKategorisi: '', aciklama: '' });
      setBasariMesaji(true);
      setTimeout(() => setBasariMesaji(false), 3000);
    } catch (error) {
      console.error("Bildirim hatası:", error);
    } finally {
      setGonderiliyor(false);
    }
  };

  const handleBildirimSil = async (id) => {
    if (window.confirm("Bu saha bildirimini kayıtlardan tamamen silmek istediğinize emin misiniz?")) {
      try {
        await deleteDoc(doc(db, 'saha_bildirimleri', id));
      } catch (error) {
        console.error("Silme hatası:", error);
      }
    }
  };

  // İstatistik State Güncelleyicileri
  const mevcutVeri = tumVeriler[aktifSekme];
  const handleDonemGuncelle = (value) => setTumVeriler({ ...tumVeriler, [aktifSekme]: { ...mevcutVeri, donem: value } });
  const handleModelGuncelle = (index, field, value) => {
    const yeniModeller = [...mevcutVeri.modeller];
    yeniModeller[index][field] = value;
    setTumVeriler({ ...tumVeriler, [aktifSekme]: { ...mevcutVeri, modeller: yeniModeller } });
  };
  const handleHataGuncelle = (index, field, value) => {
    const yeniHatalar = [...mevcutVeri.hatalar];
    yeniHatalar[index][field] = field === 'ad' ? value : Number(value);
    setTumVeriler({ ...tumVeriler, [aktifSekme]: { ...mevcutVeri, hatalar: yeniHatalar } });
  };

  const maxModelSayisi = Math.max(...mevcutVeri.modeller.map(m => Number(m.sayi) || 0), 1);

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white font-sans">
      
      {/* SOL MENÜ */}
      <div className="w-64 bg-[#1e293b] border-r border-slate-700 flex flex-col pt-6">
        <button 
          onClick={() => { setSolSekme('kurulum'); setDuzenlemeModu(false); }}
          className={`px-6 py-4 flex items-center gap-3 text-sm font-bold transition-colors ${solSekme === 'kurulum' ? 'bg-slate-800 text-teal-400 border-r-4 border-teal-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          Kurulum & Hata Bildirimi
        </button>
        <button 
          onClick={() => { setSolSekme('istatistik'); setDuzenlemeModu(false); }}
          className={`px-6 py-4 flex items-center gap-3 text-sm font-bold transition-colors ${solSekme === 'istatistik' ? 'bg-slate-800 text-teal-400 border-r-4 border-teal-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          Saha İstatistikleri
        </button>
      </div>

      {/* ANA İÇERİK ALANI */}
      <div className="flex-1 p-8">
        
        {solSekme === 'kurulum' ? (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* SOL TARAF: BİLDİRİM FORMU */}
            <div className="bg-[#1e293b] rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col">
              <div className="bg-red-900/40 px-6 py-4 border-b border-red-500/20">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse block"></span>
                  Saha Kalite Bildirim Formu
                </h2>
                <p className="text-xs text-slate-400 mt-1">Müşteri sahasında tespit edilen üretim hatalarını anında hatta bildirin.</p>
              </div>

              <div className="p-6">
                {basariMesaji && (
                  <div className="mb-6 bg-teal-500/20 border border-teal-500 text-teal-400 px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-2 animate-fade-in">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Bildirim başarıyla fabrikaya iletildi!
                  </div>
                )}

                <form onSubmit={handleBildirimGonder} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sipariş / Barkod No *</label>
                      <input type="text" required value={bildirimForm.siparisNo} onChange={e => setBildirimForm({...bildirimForm, siparisNo: e.target.value})} placeholder="Örn: SIP-2026-884" className="w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 text-sm text-white outline-none focus:border-red-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mobilya Modeli</label>
                      <select value={bildirimForm.model} onChange={e => setBildirimForm({...bildirimForm, model: e.target.value})} className="w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 text-sm text-white outline-none focus:border-red-500 transition-colors appearance-none">
                        <option value="Noira Baza">Noira Baza</option>
                        <option value="X Konsol Koltuk">X Konsol Koltuk</option>
                        <option value="Luna Kanepe">Luna Kanepe</option>
                        <option value="Yatak Odası Tk.">Yatak Odası Tk.</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tespit Edilen Hata Kategorisi *</label>
                    <select required value={bildirimForm.hataKategorisi} onChange={e => setBildirimForm({...bildirimForm, hataKategorisi: e.target.value})} className="w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 text-sm text-white outline-none focus:border-red-500 transition-colors appearance-none">
                      <option value="">Lütfen kategori seçin...</option>
                      <option value="MDF / Sunta Ezilmesi">MDF / Sunta Ezilmesi</option>
                      <option value="Zıvana Uyumsuzluğu">Montaj / Zıvana Uyumsuzluğu</option>
                      <option value="Zigzag Yay Eksikliği">Zigzag Yay Eksikliği / Gevşeklik</option>
                      <option value="Kumaş Potluğu / Yırtık">Kumaş Potluğu / Yırtık</option>
                      <option value="Eksik Vida / Hırdavat">Eksik Vida / Hırdavat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Açıklama / Detay</label>
                    <textarea rows="4" value={bildirimForm.aciklama} onChange={e => setBildirimForm({...bildirimForm, aciklama: e.target.value})} placeholder="Örn: 18mm MDF panel köşesinde taşıma esnasında oluşmayan, üretim kaynaklı bant atması mevcut..." className="w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 text-sm text-white outline-none focus:border-red-500 transition-colors resize-none"></textarea>
                  </div>

                  <button type="submit" disabled={gonderiliyor} className={`w-full font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 ${gonderiliyor ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 text-white'}`}>
                    {gonderiliyor ? 'İletiliyor...' : 'Fabrikaya Hata Bildirimi Gönder'}
                  </button>
                </form>
              </div>
            </div>

            {/* SAĞ TARAF: VİDEO EĞİTİM VE BİLDİRİM AKIŞI BİRLEŞİMİ */}
            <div className="flex flex-col gap-6">
              
              {/* === YENİ: MONTAJ SOP VİDEO PANELİ (KOMPAKT) === */}
              <div className="bg-[#0f172a] rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col border-b-4 border-b-emerald-500">
                <div className="bg-[#1e293b] px-4 py-2 flex justify-between items-center border-b border-slate-700 z-20 relative">
                  <h3 className="font-bold text-xs flex items-center gap-2 text-slate-300 uppercase tracking-tighter">
                    {aktifSop ? "🎬 " + aktifSop.baslik : "🎬 Eğitim Bekleniyor"}
                  </h3>
                  <span className={`text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${aktifSop ? 'bg-red-600 animate-pulse' : 'bg-slate-600'}`}>
                    {aktifSop ? "Canlı 3D" : "Pasif"}
                  </span>
                </div>

                <div className="relative bg-black flex items-center justify-center aspect-video overflow-hidden">
                  {aktifSop ? (
                    <>
                      <video key={aktifSop.id || 'default'} autoPlay loop muted className="absolute inset-0 w-full h-full object-cover">
                        <source src={aktifSop.videoUrl || aktifSop.dosyaUrl || aktifSop.url} type="video/mp4" />
                      </video>
                      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-10 flex flex-col pointer-events-none">
                        <span className="text-[8px] font-bold tracking-widest flex items-center gap-2 text-emerald-400 mb-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          MONTAJ KILAVUZU
                        </span>
                        <h2 className="text-white font-bold text-sm drop-shadow-md uppercase italic line-clamp-1">{aktifSop.baslik}</h2>
                        <p className="text-slate-300 text-[9px] mt-0.5 font-mono">
                          Süre: {aktifSop.sure} dk
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-slate-600 z-10 flex flex-col items-center">
                      <p className="text-[10px] uppercase tracking-widest">Aktif Kurulum Videosu Yok</p>
                    </div>
                  )}
                </div>
              </div>

              {/* MEVCUT: SAHADAN CANLI AKIŞ */}
              <div className="bg-[#1e293b] rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col flex-1 min-h-[300px]">
                <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                  <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Sahadan Canlı Akış</h2>
                  <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded font-bold">{gecmisBildirimler.length} Kayıt</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {gecmisBildirimler.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                      <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                      <p className="text-sm">Henüz sahadan hata bildirimi yapılmadı.</p>
                    </div>
                  ) : (
                    gecmisBildirimler.map((bildirim) => (
                      <div key={bildirim.id} className="bg-[#0f172a] rounded-xl p-4 border border-slate-700/50 relative group hover:border-slate-500 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded font-mono border border-slate-600">{bildirim.siparisNo}</span>
                            <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${bildirim.durum === 'İnceleniyor' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'}`}>
                              {bildirim.durum || 'Beklemede'}
                            </span>
                          </div>
                          <button 
                            onClick={() => handleBildirimSil(bildirim.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-1"
                            title="Bildirimi Sil"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                        <h4 className="font-bold text-red-400 text-sm mb-1">{bildirim.hataKategorisi}</h4>
                        <p className="text-xs text-slate-300 font-medium mb-2">{bildirim.model}</p>
                        {bildirim.aciklama && <p className="text-sm text-slate-300 italic bg-slate-800/50 p-3 rounded mt-2 line-clamp-3">{bildirim.aciklama}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>

        ) : (
          /* ================= SAHA İSTATİSTİKLERİ PANELİ ================= */
          <div className="max-w-4xl mx-auto">
            {/* ÜST SEKMELER */}
            <div className="flex bg-[#1e293b] rounded-lg p-1 mb-6 border border-slate-700">
              <button 
                onClick={() => { setAktifSekme('Aylık'); setDuzenlemeModu(false); }} 
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${aktifSekme === 'Aylık' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >📅 Aylık</button>
              <button 
                onClick={() => { setAktifSekme('Yıllık'); setDuzenlemeModu(false); }} 
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${aktifSekme === 'Yıllık' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >📊 Yıllık</button>
            </div>

            <div className="bg-[#1e293b] rounded-2xl border border-slate-700 shadow-xl p-6 relative">
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-700/50">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Dönem ({aktifSekme})</p>
                  {duzenlemeModu ? (
                    <input type="text" value={mevcutVeri.donem} onChange={(e) => handleDonemGuncelle(e.target.value)} className="bg-slate-800 text-2xl font-black text-white p-2 rounded border border-slate-600 outline-none w-64" />
                  ) : (
                    <h2 className="text-3xl font-black text-white uppercase italic">{mevcutVeri.donem}</h2>
                  )}
                  <p className="text-xs text-slate-500 mt-1">En çok hata bildirilen modeller ve sorun dağılımı</p>
                </div>
                <button 
                  onClick={() => setDuzenlemeModu(!duzenlemeModu)} 
                  className={`text-xs px-4 py-2 rounded font-bold transition-all ${duzenlemeModu ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 border border-blue-500/30'}`}
                >
                  {duzenlemeModu ? "İptal Et" : `✎ ${aktifSekme} Verileri Düzenle`}
                </button>
              </div>

              {duzenlemeModu ? (
                <form onSubmit={handleIstatistikKaydet} className="space-y-8 animate-fade-in">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-teal-400 uppercase tracking-widest border-b border-teal-400/20 pb-2">Kritik Modelleri Düzenle</h3>
                    {mevcutVeri.modeller.map((model, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-3 bg-[#0f172a] p-3 rounded-lg border border-slate-700 items-center">
                        <div className="col-span-1 text-center font-black text-slate-500">#{idx + 1}</div>
                        <div className="col-span-3"><input type="text" value={model.ad} onChange={e => handleModelGuncelle(idx, 'ad', e.target.value)} className="w-full bg-slate-800 text-xs p-2 rounded outline-none border border-slate-600" /></div>
                        <div className="col-span-2"><input type="text" value={model.varyant} onChange={e => handleModelGuncelle(idx, 'varyant', e.target.value)} className="w-full bg-slate-800 text-xs p-2 rounded outline-none border border-slate-600" /></div>
                        <div className="col-span-3"><input type="text" value={model.sorun} onChange={e => handleModelGuncelle(idx, 'sorun', e.target.value)} className="w-full bg-slate-800 text-xs p-2 rounded outline-none border border-slate-600" /></div>
                        <div className="col-span-1"><input type="number" value={model.sayi} onChange={e => handleModelGuncelle(idx, 'sayi', e.target.value)} className="w-full bg-slate-800 text-xs p-2 rounded outline-none border border-slate-600 text-center" /></div>
                        <div className="col-span-2"><input type="text" value={model.trend} onChange={e => handleModelGuncelle(idx, 'trend', e.target.value)} className="w-full bg-slate-800 text-xs p-2 rounded outline-none border border-slate-600 text-center" /></div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-teal-400 uppercase tracking-widest border-b border-teal-400/20 pb-2">Hata Dağılımını Düzenle</h3>
                    {mevcutVeri.hatalar.map((hata, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-3 bg-[#0f172a] p-3 rounded-lg border border-slate-700 items-center">
                        <div className="col-span-8"><input type="text" value={hata.ad} onChange={e => handleHataGuncelle(idx, 'ad', e.target.value)} className="w-full bg-slate-800 text-xs p-2 rounded outline-none border border-slate-600" /></div>
                        <div className="col-span-2"><input type="number" value={hata.adet} onChange={e => handleHataGuncelle(idx, 'adet', e.target.value)} className="w-full bg-slate-800 text-xs p-2 rounded outline-none border border-slate-600 text-center" /></div>
                        <div className="col-span-2 relative">
                          <input type="number" value={hata.yuzde} onChange={e => handleHataGuncelle(idx, 'yuzde', e.target.value)} className="w-full bg-slate-800 text-xs p-2 rounded outline-none border border-slate-600 text-center pr-6" />
                          <span className="absolute right-3 top-2 text-xs text-slate-500">%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all">
                    {aktifSekme} İstatistiklerini Kaydet
                  </button>
                </form>

              ) : (
                <div className="space-y-8 animate-fade-in">
                  <div className="space-y-4">
                    {mevcutVeri.modeller.map((model, idx) => (
                      <div key={idx} className="bg-[#0f172a] rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-black border border-blue-500/30">
                              {idx + 1}
                            </div>
                            <div>
                              <h4 className="text-white font-bold">{model.ad}</h4>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{model.varyant}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black text-white block">{model.sayi}</span>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest">Bildirim</span>
                          </div>
                        </div>
                        
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                          <div className={`h-full ${model.renk} transition-all duration-1000`} style={{ width: `${(model.sayi / maxModelSayisi) * 100}%` }}></div>
                        </div>
                        
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400 flex items-center gap-1">
                            <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Başlıca sorun: <strong className="text-slate-200">{model.sorun}</strong>
                          </span>
                          <span className={`font-bold flex items-center gap-1 ${model.trend.includes('+') ? 'text-red-400' : 'text-teal-400'}`}>
                            {model.trend.includes('+') ? '↗' : '↘'} {model.trend}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#0f172a] rounded-xl p-5 border border-slate-700/50">
                    <h3 className="text-sm font-bold text-white mb-5 uppercase tracking-widest">Hata Tipi Dağılımı</h3>
                    <div className="space-y-4">
                      {mevcutVeri.hatalar.map((hata, idx) => (
                        <div key={idx} className="relative">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-300 font-medium">{hata.ad}</span>
                            <div className="flex gap-4">
                              <span className="text-slate-500">{hata.adet} adet</span>
                              <strong className="text-teal-400 font-mono">%{hata.yuzde}</strong>
                            </div>
                          </div>
                          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 transition-all duration-1000" style={{ width: `${hata.yuzde}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallerScreen;