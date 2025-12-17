
import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { AppIntent, CvTemplate, CustomTemplate } from '../types';
import AutomationModal from './AutomationModal';

interface EditorProps {
  intent: AppIntent;
  customData: CustomTemplate | null;
  cvTemplate: CvTemplate;
  setCvTemplate: (t: CvTemplate) => void;
  onActivity: (type: 'paste' | 'keystroke') => void;
  showToast: (msg: string) => void;
  isFocusMode: boolean;
  setIsFocusMode: (val: boolean) => void;
}

const tabs: Record<string, string[]> = {
  [AppIntent.ACADEMIC]: ['Giriş', 'Ekle', 'Başvurular', 'Gözden Geçir', 'Görünüm'],
  [AppIntent.CV]: ['Giriş', 'Tasarım', 'Düzen', 'Ekle', 'Paylaş'],
  [AppIntent.HOMEWORK]: ['Giriş', 'Ekle', 'Çizim', 'Tasarım'],
  [AppIntent.REPORT]: ['Giriş', 'Özet', 'Bulgular', 'Analiz'],
  [AppIntent.CUSTOM]: ['Giriş', 'Ekle', 'Görünüm'],
  [AppIntent.NONE]: ['Giriş']
};

const Editor = forwardRef<{ getHtml: () => string; setHtml: (html: string) => void }, EditorProps>(({ intent, customData, cvTemplate, setCvTemplate, onActivity, showToast, isFocusMode, setIsFocusMode }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('Giriş');
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [hoverGrid, setHoverGrid] = useState({ r: 0, c: 0 });
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [isAutomationOpen, setIsAutomationOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    getHtml: () => editorRef.current?.innerHTML || "",
    setHtml: (html: string) => {
      if (editorRef.current) {
        editorRef.current.innerHTML = html;
        updateWordCount();
      }
    }
  }));

  // URL'den içerik yükleme (Paylaşılan Link Desteği)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('data');
    if (sharedData && editorRef.current) {
      try {
        const decodedHtml = atob(sharedData);
        editorRef.current.innerHTML = decodedHtml;
        updateWordCount();
        showToast("Paylaşılan İçerik Yüklendi!");
        // Temiz URL için parametreyi temizle
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error("Link çözme hatası:", e);
      }
    } else {
      const savedContent = localStorage.getItem(`ethos_content_${intent}_${intent === AppIntent.CV ? cvTemplate : ''}`);
      if (savedContent && editorRef.current) {
        editorRef.current.innerHTML = savedContent;
        updateWordCount();
      }
    }
  }, [intent, cvTemplate]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        setSelectedImage(target as HTMLImageElement);
      } else if (!target.closest('.image-resizer-handle') && !target.closest('.toolbar-action-btn')) {
        setSelectedImage(null);
      }
    };
    window.addEventListener('mousedown', handleGlobalClick);
    return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  const updateWordCount = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      const words = text.trim().split(/\s+/).filter(w => w.length > 0);
      setWordCount(words.length);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    updateWordCount();
  };

  const handleManualSave = () => {
    if (editorRef.current) {
      localStorage.setItem(`ethos_content_${intent}_${intent === AppIntent.CV ? cvTemplate : ''}`, editorRef.current.innerHTML);
      showToast("Veri Buluta Senkronize Edildi...");
    }
  };

  const handleShare = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const encoded = btoa(unescape(encodeURIComponent(html))); // Unicode güvenli base64
      const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
      
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast("Paylaşım Linki Kopyalandı!");
      }).catch(() => {
        showToast("Link kopyalanamadı.");
      });
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgHtml = `<img src="${event.target?.result}" style="max-width: 100%; height: auto; display: block; margin: 10px 0; cursor: pointer; border-radius: 8px;" />`;
        execCommand('insertHTML', imgHtml);
        showToast("Görsel Eklendi.");
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const insertDynamicTable = (rows: number, cols: number) => {
    let tableHtml = `<table style="width:100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin: 15px 0;">`;
    for (let i = 0; i < rows; i++) {
      tableHtml += `<tr>`;
      for (let j = 0; j < cols; j++) {
        tableHtml += `<td style="border: 1px solid #cbd5e1; padding: 12px; min-height: 40px;">&nbsp;</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</table><p>&nbsp;</p>`;
    execCommand('insertHTML', tableHtml);
    setShowTablePicker(false);
  };

  const renderToolbarContent = () => {
    switch (activeTab) {
      case 'Giriş':
        return (
          <div className="flex items-center gap-4 animate-in fade-in duration-300">
            <button 
              onClick={() => setIsAutomationOpen(true)}
              className="group relative flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 hover:border-teal-400 transition-all active:scale-95"
            >
              <span className="text-lg">✨</span>
              <span className="text-[10px] font-black text-teal-700 tracking-tighter uppercase">AI Sihirbazı</span>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
            </button>

            <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>

            <div className="flex items-center border-r border-gray-200 pr-4 gap-2">
              <select 
                className="text-[11px] border border-gray-300 rounded px-2 py-1 outline-none bg-white text-slate-800 font-bold focus:ring-1 focus:ring-blue-500 cursor-pointer"
                onChange={(e) => execCommand('fontName', e.target.value)}
                defaultValue={customData?.font || (intent === AppIntent.ACADEMIC ? "Lora" : "Inter")}
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Inter">Inter</option>
                <option value="Lora">Lora</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button onMouseDown={(e) => { e.preventDefault(); execCommand('bold'); }} className="toolbar-btn font-bold text-slate-700 hover:text-black">B</button>
              <button onMouseDown={(e) => { e.preventDefault(); execCommand('italic'); }} className="toolbar-btn italic text-slate-700 hover:text-black">I</button>
              <button onMouseDown={(e) => { e.preventDefault(); execCommand('underline'); }} className="toolbar-btn underline text-slate-700 hover:text-black">U</button>
            </div>
          </div>
        );
      case 'Ekle':
        return (
          <div className="flex items-center gap-4 animate-in fade-in duration-300 relative">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            <button onClick={handleImageUploadClick} className="toolbar-action-btn">🖼️ Resim Ekle</button>
            
            <div className="relative">
              <button onClick={() => setShowTablePicker(!showTablePicker)} className="toolbar-action-btn">📊 Tablo Ekle</button>
              {showTablePicker && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 shadow-2xl rounded-xl z-[100]">
                  <div className="grid grid-cols-6 gap-1 border border-gray-100 p-1 rounded-lg">
                    {[1,2,3,4,5,6].map(r => [1,2,3,4,5,6].map(c => (
                      <div 
                        key={`${r}-${c}`}
                        onMouseEnter={() => setHoverGrid({ r, c })}
                        onClick={() => insertDynamicTable(r, c)}
                        className={`w-4 h-4 rounded-sm border ${r <= hoverGrid.r && c <= hoverGrid.c ? 'bg-blue-500 border-blue-600' : 'bg-gray-100'}`}
                      />
                    )))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return <div className="text-[11px] text-slate-500 font-medium">Araçlar bu sekme için yakında eklenecek.</div>;
    }
  };

  return (
    <div className={`flex-1 flex flex-col bg-[#eef0f3] border border-gray-800 transition-all duration-500 ${isFocusMode ? 'rounded-none border-none' : 'rounded-3xl shadow-2xl overflow-hidden'}`}>
      {isAutomationOpen && (
        <AutomationModal 
          intent={intent} 
          onClose={() => setIsAutomationOpen(false)} 
          onGenerate={(html) => {
            if (editorRef.current) {
              editorRef.current.innerHTML = html;
              updateWordCount();
              onActivity('paste');
            }
          }}
          showToast={showToast}
        />
      )}

      {/* TOOLBAR */}
      <div className="bg-slate-50 border-b border-gray-300 select-none z-10 shrink-0">
        <div className="flex px-4 pt-1 gap-1">
          {(tabs[intent] || tabs[AppIntent.NONE]).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[11px] px-5 py-2.5 rounded-t-lg font-bold transition-all ${activeTab === tab ? 'bg-white text-blue-700 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="bg-white px-6 py-3 border-b border-gray-200 flex items-center justify-between shadow-sm">
          {renderToolbarContent()}
          <div className="flex gap-2">
            <button 
              onClick={handleShare} 
              className="bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all active:scale-95"
            >
              🔗 PAYLAŞ
            </button>
            <button 
              onClick={handleManualSave} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-[10px] font-black uppercase shadow-md transition-all active:scale-95"
            >
              KAYDET
            </button>
          </div>
        </div>
      </div>

      {/* SCROLLABLE EDITOR AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-200/50 p-6 md:p-12 flex flex-col items-center">
        <div className={`bg-white shadow-2xl border border-gray-300 mb-20 transition-all duration-700 overflow-hidden shrink-0 ${intent === AppIntent.CV ? 'w-[794px] min-h-[1123px]' : 'w-[800px] min-h-[1100px]'}`}>
          <div 
            ref={editorRef}
            contentEditable
            onPaste={() => { onActivity('paste'); updateWordCount(); }}
            onInput={() => { onActivity('keystroke'); updateWordCount(); }}
            className={`h-full outline-none p-16 md:p-24 selection:bg-blue-100 text-slate-900 leading-relaxed ${intent === AppIntent.ACADEMIC ? 'font-academic text-justify' : 'font-sans'}`}
            spellCheck={false}
            style={{ fontSize: '12pt', fontFamily: customData?.font || 'inherit' }}
          >
            {/* Editör içeriği buraya gelecek */}
          </div>
        </div>

        {/* Floating Status Bar */}
        <div className="fixed bottom-8 right-8 bg-slate-900/90 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl border border-white/10 text-[10px] font-bold tracking-widest z-50 shadow-2xl flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
            <span>STATUS: CANLI</span>
          </div>
          <div className="w-[1px] h-3 bg-gray-700"></div>
          <span>{wordCount} KELİME</span>
        </div>
      </div>
    </div>
  );
});

export default Editor;
