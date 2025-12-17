
import React, { useState } from 'react';
import { AppIntent, CustomTemplate, CvTemplate } from '../types';

interface IntentModalProps {
  onSelect: (intent: AppIntent, custom?: CustomTemplate, cvT?: CvTemplate) => void;
  customTemplates: CustomTemplate[];
  onAddCustom: (temp: CustomTemplate) => void;
}

const IntentModal: React.FC<IntentModalProps> = ({ onSelect, customTemplates, onAddCustom }) => {
  const [view, setView] = useState<'MAIN' | 'CV_SELECT' | 'ADD_CUSTOM' | 'ABOUT'>('MAIN');
  const [newTemp, setNewTemp] = useState({ title: '', font: 'Arial' });

  const defaultOptions = [
    { id: AppIntent.ACADEMIC, icon: '🏛️', title: 'Akademik Makale', desc: 'Atıf yönetimi, kaynakça ve resmi üslup denetimi.' },
    { id: AppIntent.CV, icon: '📄', title: 'Özgeçmiş / CV', desc: '5 Hazır şablon, ATS optimizasyonu ve yetenek vurgusu.' },
    { id: AppIntent.HOMEWORK, icon: '✏️', title: 'Ödev / Rapor', desc: 'Görsel ekleme, madde işaretleri ve basit düzenleme.' },
  ];

  const cvTemplates: { id: CvTemplate, name: string, desc: string, icon: string }[] = [
    { id: 'MODERN', name: 'Modern Dark', desc: 'Koyu yan panel ve temiz tipografi.', icon: '🌑' },
    { id: 'KLASIK', name: 'Klasik Serif', desc: 'Geleneksel, güven veren akademik görünüm.', icon: '📜' },
    { id: 'MINIMAL', name: 'Minimalist', desc: 'Bol boşluklu, sade ve şık tasarım.', icon: '⚪' },
    { id: 'EXECUTIVE', name: 'Yönetici (Executive)', desc: 'Mavi vurgular ve güçlü yapı.', icon: '💼' },
    { id: 'CREATIVE', name: 'Kreatif (Split)', desc: 'Canlı renkler ve dikey bölünmüş düzen.', icon: '🎨' },
  ];

  const handleAdd = () => {
    if (!newTemp.title) return;
    const t: CustomTemplate = {
      id: Date.now().toString(),
      title: newTemp.title,
      font: newTemp.font,
      desc: 'Kullanıcı tarafından oluşturulan özel şablon.',
      icon: '✨'
    };
    onAddCustom(t);
    setView('MAIN');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
      <div className="glass max-w-5xl w-full p-12 rounded-[2.5rem] shadow-2xl flex flex-col items-center overflow-y-auto max-h-[90vh] custom-scrollbar">
        
        {view === 'MAIN' && (
          <>
            <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-teal-300 to-cyan-500 bg-clip-text text-transparent">
              ETHOS EDITÖR
            </h2>
            <p className="text-gray-400 mb-12 text-center text-lg max-w-lg">
              Bugün ne üzerinde çalışıyoruz?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-10">
              {defaultOptions.map((opt) => (
                <button 
                  key={opt.id}
                  onClick={() => opt.id === AppIntent.CV ? setView('CV_SELECT') : onSelect(opt.id)}
                  className="group flex flex-col items-center p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-teal-500/50 hover:-translate-y-2 transition-all duration-500"
                >
                  <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">{opt.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{opt.title}</h3>
                  <p className="text-[11px] text-gray-500 text-center leading-relaxed">{opt.desc}</p>
                </button>
              ))}

              {customTemplates.map((opt) => (
                <button 
                  key={opt.id}
                  onClick={() => onSelect(AppIntent.CUSTOM, opt)}
                  className="group flex flex-col items-center p-8 rounded-3xl bg-purple-500/5 border border-purple-500/20 hover:bg-purple-500/10 hover:border-purple-500/50 hover:-translate-y-2 transition-all duration-500"
                >
                  <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-3xl">{opt.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-purple-200">{opt.title}</h3>
                  <p className="text-[11px] text-gray-500 text-center leading-relaxed">Özel Şablon ({opt.font})</p>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setView('ADD_CUSTOM')}
                className="px-8 py-3 rounded-full border border-teal-500/30 text-teal-400 hover:bg-teal-500 hover:text-black transition-all font-bold text-sm"
              >
                + Kendi Şablonunu Ekle
              </button>
              <button 
                onClick={() => setView('ABOUT')}
                className="px-8 py-3 rounded-full border border-white/10 text-white hover:bg-white/10 transition-all font-bold text-sm"
              >
                ETHOS Nedir?
              </button>
            </div>
          </>
        )}

        {view === 'ABOUT' && (
          <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex justify-between items-center mb-10">
              <button onClick={() => setView('MAIN')} className="text-teal-400 hover:text-white flex items-center gap-2 font-bold transition-colors">
                <span>← Geri Dön</span>
              </button>
              <h2 className="text-2xl font-black text-white tracking-widest">VİZYONUMUZ</h2>
              <div className="w-20"></div>
            </div>
            
            <div className="space-y-8 text-gray-300 leading-relaxed font-light">
              <section className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                <h3 className="text-teal-400 font-bold mb-4 flex items-center gap-2">
                  <span className="text-xl">✨</span> Niyet Odaklı Şeffaf Yazım
                </h3>
                <p className="text-sm">
                  <b>ETHOS</b>, yazma eylemini sadece bir metin girişi değil, bir etik süreç ve niyet beyanı olarak yeniden tanımlar. 
                  Yapay zekayı bir "hayalet yazar" değil, yazarın şeffaflığını güçlendiren bir entellektüel partner olarak konumlandırır.
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                  <h4 className="text-white font-bold mb-2 text-sm uppercase tracking-tighter">Etik Metrikler</h4>
                  <p className="text-xs text-gray-400">Gerçek zamanlı AI riski ve özgünlük takibi ile dijital parmak izinizi kontrol altında tutun.</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                  <h4 className="text-white font-bold mb-2 text-sm uppercase tracking-tighter">Saf Odak</h4>
                  <p className="text-xs text-gray-400">Glassmorphism estetiği ve odak modu ile dikkatinizi sadece kelimelerinize verin.</p>
                </div>
              </div>

              <p className="text-center italic text-teal-500/80 font-serif py-6">
                "Önemli olan sadece ne yazdığınız değil, onu hangi niyetle yazdığınızdır."
              </p>
            </div>
          </div>
        )}

        {view === 'CV_SELECT' && (
          <div className="w-full animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <button onClick={() => setView('MAIN')} className="text-gray-400 hover:text-white flex items-center gap-2">
                <span>← Geri</span>
              </button>
              <h2 className="text-2xl font-black text-white">CV Şablonu Seçin</h2>
              <div className="w-10"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              {cvTemplates.map((t) => (
                <button 
                  key={t.id}
                  onClick={() => onSelect(AppIntent.CV, undefined, t.id)}
                  className="group flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">{t.icon}</div>
                  <h4 className="text-sm font-bold text-white mb-2">{t.name}</h4>
                  <p className="text-[10px] text-gray-500 text-center leading-tight">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'ADD_CUSTOM' && (
          <div className="w-full max-w-md bg-white/5 p-8 rounded-3xl border border-white/10 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4">
            <h4 className="text-white font-bold text-center">Yeni Şablon Detayları</h4>
            <input 
              className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
              placeholder="Şablon Adı (Örn: Blog Yazısı)"
              value={newTemp.title}
              onChange={e => setNewTemp({...newTemp, title: e.target.value})}
            />
            <select 
              className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              value={newTemp.font}
              onChange={e => setNewTemp({...newTemp, font: e.target.value})}
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Verdana">Verdana</option>
            </select>
            <div className="flex gap-4 mt-2">
              <button onClick={handleAdd} className="flex-1 bg-teal-500 text-black font-bold py-2 rounded-xl text-sm hover:bg-teal-400">Ekle</button>
              <button onClick={() => setView('MAIN')} className="flex-1 bg-white/10 text-white py-2 rounded-xl text-sm hover:bg-white/20">İptal</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntentModal;
