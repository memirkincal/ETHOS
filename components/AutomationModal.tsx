
import React, { useState } from 'react';
import { AppIntent } from '../types';
import { generateAIResponse } from '../geminiService';

interface AutomationModalProps {
  intent: AppIntent;
  onClose: () => void;
  onGenerate: (html: string) => void;
  showToast: (msg: string) => void;
}

const AutomationModal: React.FC<AutomationModalProps> = ({ intent, onClose, onGenerate, showToast }) => {
  const [loading, setLoading] = useState(false);
  
  // CV Form States
  const [cvData, setCvData] = useState({ name: '', title: '', skills: '', exp: '' });
  // Article Form States
  const [articleData, setArticleData] = useState({ title: '', context: '', tone: 'Akademik' });

  const handleGenerate = async () => {
    setLoading(true);
    showToast("AI Zekası Verileri İşliyor...");

    let prompt = "";
    if (intent === AppIntent.CV) {
      prompt = `Aşağıdaki bilgilerle profesyonel bir CV içeriği oluştur. HTML formatında, <div> ve <h3> etiketleri kullanarak, modern bir yapı kur.
      İsim: ${cvData.name}
      Unvan: ${cvData.title}
      Yetenekler: ${cvData.skills}
      Deneyim Özeti: ${cvData.exp}
      Not: Sadece içerik kısmını döndür, <html> etiketi ekleme.`;
    } else {
      prompt = `Aşağıdaki bilgilerle ${articleData.tone} tonunda bir makale taslağı oluştur. HTML formatında başlıklar (<h2>) ve paragraflar (<p>) kullan.
      Başlık: ${articleData.title}
      İçerik/Bağlam: ${articleData.context}
      Not: Akademik atıf yerleri için [Kaynak] işaretleri bırak. Sadece içerik kısmını döndür.`;
    }

    try {
      const response = await generateAIResponse(prompt, intent);
      if (response) {
        onGenerate(response);
        onClose();
        showToast("İçerik Başarıyla Oluşturuldu!");
      }
    } catch (error) {
      showToast("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <div className="glass max-w-lg w-full p-8 rounded-[2rem] border border-teal-500/30 shadow-2xl animate-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span className="text-2xl">✨</span> {intent === AppIntent.CV ? 'CV Sihirbazı' : 'Makale Asistanı'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
        </div>

        <div className="space-y-4">
          {intent === AppIntent.CV ? (
            <>
              <div>
                <label className="text-[10px] uppercase font-bold text-teal-400 ml-2">Ad Soyad</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 outline-none mt-1"
                  placeholder="Örn: Mehmet Demir"
                  value={cvData.name}
                  onChange={e => setCvData({...cvData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-teal-400 ml-2">Profesyonel Unvan</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 outline-none mt-1"
                  placeholder="Örn: Senior Frontend Developer"
                  value={cvData.title}
                  onChange={e => setCvData({...cvData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-teal-400 ml-2">Temel Yetenekler</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-teal-500 outline-none mt-1 min-h-[80px]"
                  placeholder="React, TypeScript, UI Design..."
                  value={cvData.skills}
                  onChange={e => setCvData({...cvData, skills: e.target.value})}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-[10px] uppercase font-bold text-cyan-400 ml-2">Makale Başlığı</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-cyan-500 outline-none mt-1"
                  placeholder="Konu başlığını girin..."
                  value={articleData.title}
                  onChange={e => setArticleData({...articleData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-cyan-400 ml-2">İçerik Detayları / Tezler</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-cyan-500 outline-none mt-1 min-h-[100px]"
                  placeholder="Makalede değinilmesini istediğiniz noktalar..."
                  value={articleData.context}
                  onChange={e => setArticleData({...articleData, context: e.target.value})}
                />
              </div>
              <div className="flex gap-4">
                {['Akademik', 'Profesyonel', 'Blog'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setArticleData({...articleData, tone: t})}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${articleData.tone === t ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-gray-500 border border-white/10'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="w-full mt-8 bg-gradient-to-r from-teal-400 to-cyan-500 text-black font-black py-3 rounded-xl uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Yaratılıyor...' : 'Sihri Başlat ✨'}
        </button>
      </div>
    </div>
  );
};

export default AutomationModal;
