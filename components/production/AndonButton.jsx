import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const AndonButton = ({ modelName = "Noira Baza" }) => {
  const hatayiBildir = async () => {
    try {
      // Buluttaki 'andon_alarmlari' klasörüne veri gönderiyoruz
      await addDoc(collection(db, "andon_alarmlari"), {
        model: modelName,
        istasyon: "Döşeme Hattı",
        tarih: serverTimestamp(),
        durum: "Kritik",
        mesaj: "Hat durduruldu, teknik destek bekleniyor."
      });
      alert("Andon Sinyali Buluta Gönderildi!");
    } catch (e) {
      console.error("Hata oluştu: ", e);
    }
  };

  return (
    <button 
      onClick={hatayiBildir}
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-8 px-4 rounded-xl shadow-2xl flex flex-col items-center justify-center gap-4 transition-all active:scale-95 w-full"
    >
      <div className="text-5xl animate-pulse">🚨</div>
      <div className="text-2xl uppercase tracking-widest">ANDON</div>
      <span className="text-xs opacity-80 text-center">Kalite Problemi Bildir</span>
    </button>
  );
};

export default AndonButton;