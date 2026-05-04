import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

const UploadSOPPanel = () => {
  const [baslik, setBaslik] = useState('');
  const [hedefKitle, setHedefKitle] = useState('Döşeme Hattı');
  const [dosya, setDosya] = useState(null);
  const [egitimler, setEgitimler] = useState([]);
  
  const [yukleniyor, setYukleniyor] = useState(false);
  const [yuklemeYuzdesi, setYuklemeYuzdesi] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'sop_listesi'), orderBy('tarih', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const veriler = snapshot.docs.map(belge => ({ id: belge.id, ...belge.data() }));
      setEgitimler(veriler);
    });
    return () => unsubscribe();
  }, []);

  const handleSil = async (id) => {
    if (window.confirm("Bu eğitimi sistemden silmek istediğinize emin misiniz?")) {
      try { await deleteDoc(doc(db, 'sop_listesi', id)); } catch (error) { console.error(error); }
    }
  };

  const handleDosyaSec = (e) => {
    if (e.target.files[0]) { setDosya(e.target.files[0]); }
  };

  const handleYukle = async (e) => {
    e.preventDefault();
    if (!baslik || !dosya) {
      alert("Lütfen başlık girin ve bir video dosyası seçin!");
      return;
    }

    setYukleniyor(true);

    const formData = new FormData();
    formData.append('file', dosya);
    formData.append('upload_preset', 'fabrika_video'); 

    const xhr = new XMLHttpRequest();
    
    xhr.open('POST', `https://api.cloudinary.com/v1_1/dejydr9bn/video/upload`, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setYuklemeYuzdesi(progress);
      }
    };

    xhr.onload = async () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        const videoUrl = response.secure_url;

        try {
          await addDoc(collection(db, 'sop_listesi'), {
            baslik: baslik,
            kitle: hedefKitle,
            sure: "Aktif Eğitim",
            dosyaAdi: dosya.name,
            videoUrl: videoUrl,
            tarih: serverTimestamp()
          });
          
          setBaslik('');
          setDosya(null);
          setYukleniyor(false);
          setYuklemeYuzdesi(0);
        } catch (error) {
          console.error("Kayıt hatası:", error);
          setYukleniyor(false);
        }
      } else {
        console.error("Cloudinary yükleme hatası:", xhr.responseText);
        setYukleniyor(false);
        alert("Video yüklenirken bir hata oluştu. Cloudinary Upload Preset ayarlarını kontrol edin.");
      }
    };

    xhr.send(formData);
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* ÜST PANEL: YÜKLEME FORMU */}
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-600 p-8 shadow-2xl relative overflow-hidden flex-1">
        
        {yukleniyor && (
          <div className="absolute top-0 left-0 h-1.5 bg-emerald-500 transition-all duration-300" style={{ width: `${yuklemeYuzdesi}%` }}></div>
        )}

        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="bg-blue-600/20 p-3 rounded-xl border border-blue-500/30">
             <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          </div>
          <div>
            <h3 className="font-black text-2xl text-white uppercase tracking-tight drop-shadow-md">Yeni SOP Yükle</h3>
            <p className="text-sm text-emerald-400 font-bold tracking-widest mt-1">Cloudinary Bulut Motoru Aktif</p>
          </div>
        </div>

        <form onSubmit={handleYukle} className="flex flex-col gap-6 relative z-10 h-[calc(100%-80px)] justify-between">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold text-slate-400 mb-2 block uppercase tracking-wider">Video Başlığı</label>
              <input 
                type="text" value={baslik} onChange={(e) => setBaslik(e.target.value)}
                placeholder="Örn: Baza Köşe Döşeme v4.0" 
                className="w-full bg-slate-900/50 text-white px-5 py-4 rounded-xl border border-slate-600 focus:border-blue-500 outline-none text-lg transition-colors shadow-inner placeholder-slate-600" required 
                disabled={yukleniyor}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-400 mb-2 block uppercase tracking-wider">Hedef Kitle / İstasyon</label>
              <select 
                value={hedefKitle} onChange={(e) => setHedefKitle(e.target.value)}
                className="w-full bg-slate-900/50 text-white px-5 py-4 rounded-xl border border-slate-600 focus:border-blue-500 outline-none text-lg appearance-none transition-colors shadow-inner"
                disabled={yukleniyor}
              >
                <option value="Döşeme Hattı">Döşeme Hattı</option>
                <option value="Montaj Ustaları">Montaj Ustaları</option>
                <option value="Kalite Kontrol">Kalite Kontrol</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-400 mb-2 block uppercase tracking-wider">Eğitim Videosu Seç</label>
              <label className={`border-2 border-dashed border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer relative overflow-hidden min-h-[140px] ${yukleniyor ? 'bg-slate-800 opacity-50 cursor-not-allowed' : 'hover:bg-slate-700/50 bg-slate-900/30'}`}>
                <input type="file" className="hidden" accept="video/mp4,video/webm,video/ogg" onChange={handleDosyaSec} disabled={yukleniyor} required />
                
                {dosya ? (
                  <div className="text-center">
                    <svg className="w-10 h-10 text-emerald-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span className="text-lg font-bold text-white block truncate max-w-xs">{dosya.name}</span>
                    <span className="text-sm text-slate-400 block mt-1 font-mono">{(dosya.size / (1024 * 1024)).toFixed(2)} MB • {yukleniyor ? 'Yükleniyor...' : 'Hazır'}</span>
                  </div>
                ) : (
                  <div className="text-center text-slate-500">
                    <svg className="w-10 h-10 mb-3 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <span className="text-base font-bold">Dosya seçmek için tıklayın</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={yukleniyor || !dosya} 
            className={`w-full py-5 rounded-xl font-black transition-all uppercase tracking-[0.2em] text-sm md:text-base shadow-xl flex items-center justify-center gap-3 mt-4 ${yukleniyor ? 'bg-emerald-600 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/25'}`}
          >
            {yukleniyor ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                YÜKLENİYOR... %{yuklemeYuzdesi}
              </>
            ) : (
              '↑ Sahaya Yayımla'
            )}
          </button>
        </form>
      </div>

      {/* ALT PANEL: MEVCUT EĞİTİMLER LİSTESİ */}
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-600 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-600 flex justify-between items-center bg-slate-900/40">
          <h3 className="font-bold text-white text-sm uppercase tracking-widest">Mevcut Eğitimler</h3>
          <span className="bg-slate-900 text-slate-300 text-xs px-3 py-1 rounded-lg border border-slate-600 font-bold">{egitimler.length} Kayıt</span>
        </div>
        <div className="flex flex-col max-h-[350px] overflow-y-auto custom-scrollbar">
          {egitimler.map((egitim) => (
            <div key={egitim.id} className="p-5 border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors flex items-center justify-between group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-blue-400 border border-slate-600 shrink-0 shadow-inner">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <h4 className="text-base font-bold text-white line-clamp-1">{egitim.baslik}</h4>
                  <p className="text-xs text-slate-400 mt-1 uppercase font-medium tracking-wide">{egitim.kitle} • <span className="text-slate-500 lowercase">{egitim.dosyaAdi}</span></p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 shrink-0">
                <span className="bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 px-3 py-1 rounded-md text-xs font-black tracking-wider">AKTİF</span>
                <button onClick={() => handleSil(egitim.id)} className="text-slate-500 hover:text-red-500 transition-colors bg-slate-900/50 p-2 rounded-lg hover:bg-red-900/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          ))}
          {egitimler.length === 0 && (
            <div className="p-8 text-center text-slate-500 font-medium">
              Sistemde yüklü SOP eğitimi bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadSOPPanel;