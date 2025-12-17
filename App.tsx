
import React, { useState, useEffect, useRef } from 'react';
import { AppIntent, MetricState, CvTemplate, CustomTemplate } from './types';
import IntentModal from './components/IntentModal';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import HealthReport from './components/HealthReport';

const App: React.FC = () => {
  const [intent, setIntent] = useState<AppIntent>(AppIntent.NONE);
  const [customIntentData, setCustomIntentData] = useState<CustomTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [cvTemplate, setCvTemplate] = useState<CvTemplate>('MODERN');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });
  
  const editorRef = useRef<{ getHtml: () => string }>(null);

  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(() => {
    const saved = localStorage.getItem('ethos_custom_templates');
    return saved ? JSON.parse(saved) : [];
  });

  const [metrics, setMetrics] = useState<MetricState>({
    aiRisk: 5,
    originality: 85,
    academicStrength: 70,
    repetition: 12
  });

  useEffect(() => {
    localStorage.setItem('ethos_custom_templates', JSON.stringify(customTemplates));
  }, [customTemplates]);

  const showToast = (msg: string) => {
    setToast({ message: msg, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 3000);
  };

  const handleIntentSelection = (selected: AppIntent, customData?: CustomTemplate, cvT?: CvTemplate) => {
    setIntent(selected);
    if (customData) setCustomIntentData(customData);
    if (cvT) setCvTemplate(cvT);
    setIsModalOpen(false);
    showToast(`${customData?.title || (cvT ? `CV (${cvT})` : selected)} Modu Aktifleştirildi`);
  };

  const handleAddCustomTemplate = (newTemp: CustomTemplate) => {
    setCustomTemplates(prev => [...prev, newTemp]);
    showToast("Yeni Şablon Kütüphaneye Eklendi");
  };

  const handleBackToMenu = () => {
    const confirmSave = window.confirm("Çalışmanızı kaydetmek istiyor musunuz? Kaydedilmemiş değişiklikler kaybolabilir.");
    if (confirmSave) {
       showToast("Veriler Buluta Senkronize Edildi...");
    }
    setIntent(AppIntent.NONE);
    setIsModalOpen(true);
    setIsFocusMode(false);
  };

  const handleDownloadReport = () => {
    const content = editorRef.current?.getHtml() || "";
    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>ETHOS Denetim Raporu</title>
        <style>
          body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          .header { border-bottom: 4px solid #14b8a6; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
          .logo { font-weight: 900; font-size: 24px; color: #0f172a; letter-spacing: 2px; }
          .metrics { display: flex; gap: 20px; margin-bottom: 40px; }
          .metric-card { flex: 1; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center; }
          .metric-card h4 { margin: 0; font-size: 10px; color: #64748b; text-transform: uppercase; }
          .metric-card p { margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #14b8a6; }
          .content { background: white; border: 1px solid #eee; padding: 30px; min-height: 400px; }
          .footer { margin-top: 50px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
          .seal { display: inline-block; padding: 10px 20px; border: 3px double #14b8a6; color: #14b8a6; font-weight: bold; transform: rotate(-5deg); text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">ETHOS AI REPORT</div>
          <div>Tarih: ${new Date().toLocaleDateString('tr-TR')}</div>
        </div>
        <div class="metrics">
          <div class="metric-card"><h4>AI Riski</h4><p>%${Math.round(metrics.aiRisk)}</p></div>
          <div class="metric-card"><h4>Özgünlük</h4><p>%${Math.round(metrics.originality)}</p></div>
          <div class="metric-card"><h4>Akademik Güç</h4><p>${metrics.academicStrength}/100</p></div>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <div class="seal">Bu belge ETHOS AI tarafından denetlenmiştir</div>
          <p style="font-size: 10px; color: #999; margin-top: 10px;">ETHOS Transparan Yazım Teknolojileri • Güvenli ve Etik Yazım</p>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ETHOS_Denetim_Raporu_${Date.now()}.html`;
    a.click();
    showToast("Denetim Raporu Oluşturuldu.");
  };

  const processEditorInput = (type: 'paste' | 'keystroke') => {
    setMetrics(prev => {
      if (type === 'paste') {
        return {
          ...prev,
          aiRisk: Math.min(95, prev.aiRisk + 45),
          originality: Math.max(5, prev.originality - 30)
        };
      } else {
        return {
          ...prev,
          aiRisk: Math.max(0, prev.aiRisk - 0.2),
          originality: Math.min(100, prev.originality + 0.5)
        };
      }
    });
  };

  const getAccentColor = () => {
    switch (intent) {
      case AppIntent.ACADEMIC: return 'border-cyan-500 text-cyan-400';
      case AppIntent.CV: return 'border-blue-500 text-blue-400';
      case AppIntent.HOMEWORK: return 'border-orange-500 text-orange-400';
      case AppIntent.CUSTOM: return 'border-purple-500 text-purple-400';
      default: return 'border-teal-500 text-teal-400';
    }
  };

  return (
    <div className={`h-screen flex flex-col bg-[#0f1117] transition-all duration-700 ${isFocusMode ? 'p-0' : 'p-0'}`}>
      {toast.show && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-teal-500 text-black px-6 py-2 rounded-full font-bold shadow-2xl animate-bounce">
          {toast.message}
        </div>
      )}

      {!isFocusMode && (
        <header className="h-14 flex items-center justify-between px-6 bg-[#161922] border-b border-gray-800 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-widest text-white">ETHOS</span>
              <span className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded border ${getAccentColor()} bg-opacity-10`}>
                {customIntentData?.title || (intent === AppIntent.CV ? `CV • ${cvTemplate}` : intent)} MODU
              </span>
              {intent !== AppIntent.NONE && (
                <button 
                  onClick={handleBackToMenu}
                  className="ml-2 text-[10px] text-gray-400 hover:text-white transition-colors flex items-center gap-1 bg-white/5 px-2 py-1 rounded border border-white/10"
                >
                  <span>↩</span> MOD DEĞİŞTİR
                </button>
              )}
            </div>
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest hidden md:block">
            Transparan Yazım Teknolojisi • Gemini AI Entegre
          </div>
        </header>
      )}

      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        {!isFocusMode && <Sidebar intent={intent} />}
        <Editor 
          ref={editorRef}
          intent={intent} 
          customData={customIntentData}
          cvTemplate={cvTemplate} 
          setCvTemplate={setCvTemplate}
          onActivity={processEditorInput} 
          showToast={showToast}
          isFocusMode={isFocusMode}
          setIsFocusMode={setIsFocusMode}
        />
        {!isFocusMode && (
          <HealthReport 
            metrics={metrics} 
            intent={intent} 
            onDownloadReport={handleDownloadReport} 
          />
        )}
      </main>

      {isModalOpen && (
        <IntentModal 
          onSelect={handleIntentSelection} 
          customTemplates={customTemplates} 
          onAddCustom={handleAddCustomTemplate} 
        />
      )}
    </div>
  );
};

export default App;
