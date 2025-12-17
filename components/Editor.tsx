
import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { AppIntent, CvTemplate, CustomTemplate } from '../types';

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

const Editor = forwardRef<{ getHtml: () => string }, EditorProps>(({ intent, customData, cvTemplate, setCvTemplate, onActivity, showToast, isFocusMode, setIsFocusMode }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('Giriş');
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [wordCount, setWordCount] = useState(0);
  const [hoverGrid, setHoverGrid] = useState({ r: 0, c: 0 });
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [resizing, setResizing] = useState(false);

  const presetColors = [
    '#000000', '#334155', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#ffffff'
  ];

  useImperativeHandle(ref, () => ({
    getHtml: () => editorRef.current?.innerHTML || ""
  }));

  useEffect(() => {
    const savedContent = localStorage.getItem(`ethos_content_${intent}_${intent === AppIntent.CV ? cvTemplate : ''}`);
    if (savedContent && editorRef.current) {
      editorRef.current.innerHTML = savedContent;
      updateWordCount();
    }
  }, [intent, cvTemplate]);

  // Resim seçimi için listener
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

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgHtml = `<img src="${event.target?.result}" style="max-width: 100%; height: auto; display: block; margin: 10px 0; cursor: pointer;" />`;
        execCommand('insertHTML', imgHtml);
        showToast("Görsel Eklendi. Boyutlandırmak için üzerine tıklayın.");
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const changeTextColor = (color: string) => {
    execCommand('foreColor', color);
    setCurrentColor(color);
    setShowColorPicker(false);
  };

  const insertDynamicTable = (rows: number, cols: number) => {
    let tableHtml = `<table style="width:100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin: 15px 0; table-layout: fixed;">`;
    for (let i = 0; i < rows; i++) {
      tableHtml += `<tr>`;
      for (let j = 0; j < cols; j++) {
        tableHtml += `<td style="border: 1px solid #cbd5e1; padding: 12px; min-height: 40px; vertical-align: top;">&nbsp;</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</table><p>&nbsp;</p>`;
    execCommand('insertHTML', tableHtml);
    setShowTablePicker(false);
    showToast(`${cols}x${rows} Tablo Oluşturuldu.`);
  };

  const findParentTag = (tagName: string) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return null;
    let node = selection.getRangeAt(0).startContainer as Node | null;
    while (node && node !== editorRef.current) {
      if (node.nodeName === tagName) return node as HTMLElement;
      node = node.parentNode;
    }
    return null;
  };

  const addRow = () => {
    const table = findParentTag('TABLE') as HTMLTableElement;
    if (!table) return showToast("Lütfen imleci bir tablo içine getirin.");
    const row = table.insertRow(-1);
    const colCount = table.rows[0].cells.length;
    for (let i = 0; i < colCount; i++) {
      const cell = row.insertCell(i);
      cell.style.border = "1px solid #cbd5e1";
      cell.style.padding = "12px";
      cell.innerHTML = "&nbsp;";
    }
    showToast("Yeni Satır Eklendi.");
  };

  const addCol = () => {
    const table = findParentTag('TABLE') as HTMLTableElement;
    if (!table) return showToast("Lütfen imleci bir tablo içine getirin.");
    for (let i = 0; i < table.rows.length; i++) {
      const cell = table.rows[i].insertCell(-1);
      cell.style.border = "1px solid #cbd5e1";
      cell.style.padding = "12px";
      cell.innerHTML = "&nbsp;";
    }
    showToast("Yeni Sütun Eklendi.");
  };

  const deleteTable = () => {
    const table = findParentTag('TABLE');
    if (table) {
      table.remove();
      showToast("Tablo Kaldırıldı.");
    }
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setResizing(true);
    const startX = e.clientX;
    const startWidth = selectedImage?.clientWidth || 0;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (selectedImage) {
        const newWidth = startWidth + (moveEvent.clientX - startX);
        selectedImage.style.width = `${newWidth}px`;
        selectedImage.style.height = 'auto'; // Aspect ratio koruma
      }
    };

    const onMouseUp = () => {
      setResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const alignImage = (alignment: 'left' | 'center' | 'right') => {
    if (selectedImage) {
      if (alignment === 'center') {
        selectedImage.style.marginLeft = 'auto';
        selectedImage.style.marginRight = 'auto';
        selectedImage.style.display = 'block';
      } else if (alignment === 'left') {
        selectedImage.style.marginLeft = '0';
        selectedImage.style.marginRight = 'auto';
        selectedImage.style.display = 'block';
      } else {
        selectedImage.style.marginLeft = 'auto';
        selectedImage.style.marginRight = '0';
        selectedImage.style.display = 'block';
      }
      showToast(`Resim Hizalandı: ${alignment}`);
    }
  };

  const renderToolbarContent = () => {
    switch (activeTab) {
      case 'Giriş':
        return (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="flex items-center border-r border-gray-200 pr-4 gap-2">
              <select 
                className="text-[11px] border border-gray-300 rounded px-2 py-1 outline-none bg-white text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                onChange={(e) => execCommand('fontName', e.target.value)}
                defaultValue={customData?.font || (intent === AppIntent.ACADEMIC ? "Lora" : "Inter")}
              >
                <optgroup label="Temel Fontlar">
                  <option value="Arial">Arial</option>
                  <option value="Tahoma">Tahoma</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Trebuchet MS">Trebuchet MS</option>
                  <option value="Times New Roman">Times New Roman</option>
                </optgroup>
                <optgroup label="Modern & Web">
                  <option value="Inter">Inter</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Poppins">Poppins</option>
                </optgroup>
                <optgroup label="Başlık & Tasarım">
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Lora">Lora</option>
                </optgroup>
              </select>

              <select 
                className="text-[11px] border border-gray-300 rounded px-2 py-1 outline-none bg-white text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer w-14"
                onChange={(e) => execCommand('fontSize', e.target.value)}
                defaultValue="3"
              >
                <option value="1">8pt</option>
                <option value="2">10pt</option>
                <option value="3">12pt</option>
                <option value="4">14pt</option>
                <option value="5">18pt</option>
                <option value="6">24pt</option>
                <option value="7">36pt</option>
              </select>
            </div>

            <div className="flex items-center border-r border-gray-200 pr-4 gap-1">
              <button onMouseDown={(e) => { e.preventDefault(); execCommand('bold'); }} className="toolbar-btn font-bold">B</button>
              <button onMouseDown={(e) => { e.preventDefault(); execCommand('italic'); }} className="toolbar-btn italic">I</button>
              <button onMouseDown={(e) => { e.preventDefault(); execCommand('underline'); }} className="toolbar-btn underline">U</button>
              
              <div className="relative">
                <button 
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className={`toolbar-btn flex flex-col items-center justify-center gap-0.5 pt-1 ${showColorPicker ? 'bg-gray-100 shadow-inner' : ''}`}
                >
                  <span className="text-sm font-black leading-none">A</span>
                  <div className="w-4 h-1 rounded-full" style={{ backgroundColor: currentColor }}></div>
                </button>
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 shadow-2xl rounded-xl z-[110] w-[180px] animate-in zoom-in-95 duration-200">
                    <p className="text-[10px] text-gray-400 mb-2 uppercase font-bold tracking-tighter">Hızlı Renkler</p>
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {presetColors.map(color => (
                        <button
                          key={color}
                          onMouseDown={(e) => { e.preventDefault(); changeTextColor(color); }}
                          className="w-6 h-6 rounded-md border border-gray-200 hover:scale-110 transition-transform shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Özel (RGB):</span>
                      <input 
                        type="color" 
                        value={currentColor} 
                        onChange={(e) => {
                           const color = e.target.value;
                           setCurrentColor(color);
                           execCommand('foreColor', color);
                        }}
                        className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0 bg-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button onMouseDown={(e) => { e.preventDefault(); execCommand('justifyLeft'); }} className="toolbar-btn text-lg">≡</button>
              <button onMouseDown={(e) => { e.preventDefault(); execCommand('justifyCenter'); }} className="toolbar-btn text-lg">≣</button>
              <button onMouseDown={(e) => { e.preventDefault(); execCommand('justifyRight'); }} className="toolbar-btn text-lg">≘</button>
            </div>
          </div>
        );
      case 'Ekle':
        return (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-300 relative">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            <button onClick={handleImageUploadClick} className="toolbar-action-btn">🖼️ Resim Ekle</button>
            
            {selectedImage && (
              <div className="flex items-center gap-1 bg-blue-50 p-1 rounded-lg border border-blue-100">
                <button onMouseDown={(e) => { e.preventDefault(); alignImage('left'); }} className="toolbar-btn" title="Sola Yasla">⇤</button>
                <button onMouseDown={(e) => { e.preventDefault(); alignImage('center'); }} className="toolbar-btn" title="Ortala">↔</button>
                <button onMouseDown={(e) => { e.preventDefault(); alignImage('right'); }} className="toolbar-btn" title="Sağa Yasla">⇥</button>
                <button onMouseDown={(e) => { e.preventDefault(); if(selectedImage) { selectedImage.style.width='auto'; selectedImage.style.height='auto'; } }} className="toolbar-btn text-[10px]" title="Boyutu Sıfırla">Sıfırla</button>
              </div>
            )}

            <div className="relative">
              <button 
                onClick={() => setShowTablePicker(!showTablePicker)} 
                className={`toolbar-action-btn flex items-center gap-1 ${showTablePicker ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
              >
                📊 Tablo Ekle {showTablePicker ? '▲' : '▼'}
              </button>
              {showTablePicker && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 shadow-2xl rounded-xl z-[100] min-w-[180px]">
                  <p className="text-[10px] text-gray-400 mb-2 uppercase font-bold tracking-tighter">Boyut Seç: {hoverGrid.c}x{hoverGrid.r}</p>
                  <div className="grid grid-cols-6 gap-1 w-fit mx-auto border border-gray-100 p-1 rounded-lg">
                    {[1,2,3,4,5,6].map(r => (
                      [1,2,3,4,5,6].map(c => (
                        <div 
                          key={`${r}-${c}`}
                          onMouseEnter={() => setHoverGrid({ r, c })}
                          onMouseLeave={() => setHoverGrid({ r: 0, c: 0 })}
                          onClick={() => insertDynamicTable(r, c)}
                          className={`w-4 h-4 rounded-sm border transition-colors cursor-pointer ${
                            r <= hoverGrid.r && c <= hoverGrid.c 
                            ? 'bg-blue-500 border-blue-600' 
                            : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                          }`}
                        />
                      ))
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>

            <div className="flex items-center gap-1">
              <button onMouseDown={(e) => { e.preventDefault(); addRow(); }} className="toolbar-btn text-lg">⫤</button>
              <button onMouseDown={(e) => { e.preventDefault(); addCol(); }} className="toolbar-btn text-lg">⫩</button>
              <button onMouseDown={(e) => { e.preventDefault(); deleteTable(); }} className="toolbar-btn text-red-500 text-lg">⌧</button>
            </div>
            
            <button onMouseDown={(e) => { e.preventDefault(); execCommand('createLink', prompt('Link URL:', 'https://') || ''); }} className="toolbar-action-btn">🔗 Link</button>
          </div>
        );
      case 'Başvurular':
        return (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
            <button onMouseDown={(e) => { e.preventDefault(); execCommand('insertHTML', `<p style="color: #666; font-style: italic; border-left: 2px solid #ccc; padding-left: 10px; margin: 10px 0;">(Yazar, Yıl). Kaynak: Makale Başlığı, ETHOS Denetimli Atıf.</p>`); }} className="toolbar-action-btn">📜 APA Kaynak Ekle</button>
            <button onMouseDown={(e) => { e.preventDefault(); execCommand('insertHTML', '<sup>[1]</sup>'); }} className="toolbar-action-btn">📍 Dipnot Ekle</button>
          </div>
        );
      case 'Gözden Geçir':
        return (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
            <button onClick={() => showToast("Yazım denetimi yapılıyor...")} className="toolbar-action-btn">🔍 Yazım Denetimi</button>
            <button onClick={() => showToast("AI Derin Tarama başlatıldı...")} className="toolbar-action-btn">🤖 AI Detaylı Tarama</button>
          </div>
        );
      case 'Görünüm':
        return (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
            <button onClick={() => setIsFocusMode(!isFocusMode)} className={`toolbar-action-btn ${isFocusMode ? 'bg-teal-100 text-teal-700' : ''}`}>👁️ Odak Modu</button>
            <button onClick={() => showToast("Tema değiştirme özelliği yolda...")} className="toolbar-action-btn">🌓 Karanlık/Aydınlık</button>
          </div>
        );
      default:
        return <div className="text-[11px] text-gray-400">Bu sekme için araç bulunmuyor.</div>;
    }
  };

  const renderCvTemplate = () => {
    switch (cvTemplate) {
      case 'MODERN':
        return (
          <div className="flex h-full min-h-[1050px]">
            <div className="w-1/3 bg-[#2c3e50] text-white p-8">
              <div className="w-24 h-24 bg-slate-400 rounded-full mb-6 mx-auto"></div>
              <h3 className="text-sm font-bold border-b border-white/20 pb-2 mb-4 uppercase">İletişim</h3>
              <p className="text-[11px] mb-8">📍 İstanbul, TR<br/>📧 ad@mail.com<br/>📞 05XX XXX</p>
              <h3 className="text-sm font-bold border-b border-white/20 pb-2 mb-4 uppercase">Yetenekler</h3>
              <ul className="text-[11px] space-y-1">
                <li>JavaScript / React</li>
                <li>UI UX Design</li>
                <li>Gemini API Integration</li>
              </ul>
            </div>
            <div className="flex-1 p-12">
              <h1 className="text-3xl font-black mb-1">ADINIZ SOYADINIZ</h1>
              <h2 className="text-lg text-blue-600 mb-8 uppercase tracking-widest">Yazılım Geliştirici</h2>
              <h3 className="text-sm font-bold border-b-2 border-slate-100 pb-2 mb-4 uppercase">Deneyim</h3>
              <p className="text-xs mb-8">Deneyiminizi buraya yazın...</p>
              <h3 className="text-sm font-bold border-b-2 border-slate-100 pb-2 mb-4 uppercase">Eğitim</h3>
              <p className="text-xs">Üniversite bilgileri...</p>
            </div>
          </div>
        );
      case 'KLASIK':
        return (
          <div className="p-16 text-center font-serif">
            <h1 className="text-4xl font-bold uppercase mb-2">ADINIZ SOYADINIZ</h1>
            <p className="text-sm italic mb-12 border-b-2 border-slate-900 pb-4">İstanbul, TR • 05XX XXX • ad@mail.com</p>
            <div className="text-left space-y-8">
              <section>
                <h3 className="font-bold border-b mb-2 uppercase text-xs tracking-widest">ÖZET</h3>
                <p className="text-xs italic">Kariyer özeti buraya...</p>
              </section>
              <section>
                <h3 className="font-bold border-b mb-2 uppercase text-xs tracking-widest">DENEYİM</h3>
                <p className="text-xs">Detaylar...</p>
              </section>
            </div>
          </div>
        );
      case 'MINIMAL':
        return (
          <div className="p-20 font-sans">
            <h1 className="text-5xl font-light mb-4">ADINIZ<br/><b>SOYADINIZ</b></h1>
            <p className="text-sm text-gray-400 mb-20 uppercase tracking-widest">Kreatif Direktör</p>
            <div className="grid grid-cols-2 gap-12">
              <div>
                <h3 className="text-[10px] font-bold text-blue-500 mb-4 uppercase">İletişim</h3>
                <p className="text-xs text-gray-600">ad@mail.com<br/>05XX XXX XXXX</p>
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-blue-500 mb-4 uppercase">Deneyim</h3>
                <p className="text-xs text-gray-600">Önceki rolleriniz ve başarılarınız...</p>
              </div>
            </div>
          </div>
        );
      case 'EXECUTIVE':
        return (
          <div className="p-12 font-sans border-t-[12px] border-blue-900">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-4xl font-black text-slate-800">ADINIZ SOYADINIZ</h1>
                <p className="text-blue-700 font-bold uppercase">Kıdemli Yönetici</p>
              </div>
              <div className="text-right text-[10px] text-gray-500">
                <p>ad@mail.com</p>
                <p>LinkedIn / adsoyad</p>
              </div>
            </div>
            <div className="space-y-8">
              <section>
                <h3 className="text-sm font-bold bg-slate-100 p-2 text-slate-700 uppercase">Profesyonel Profil</h3>
                <p className="text-xs p-2 leading-relaxed">Güçlü liderlik ve strateji yeteneklerine sahip executive profil...</p>
              </section>
              <section>
                <h3 className="text-sm font-bold bg-slate-100 p-2 text-slate-700 uppercase">Kariyer Geçmişi</h3>
                <div className="p-2">
                  <p className="text-xs font-bold text-blue-900">Şirket Adı | 2018 - GÜNÜMÜZ</p>
                  <p className="text-[10px] italic">Genel Müdür Yardımcısı</p>
                </div>
              </section>
            </div>
          </div>
        );
      case 'CREATIVE':
        return (
          <div className="flex h-full min-h-[1050px] font-sans">
            <div className="w-16 bg-teal-500"></div>
            <div className="flex-1 p-16">
              <header className="mb-16">
                <h1 className="text-6xl font-black tracking-tighter">HELLO.<br/>I'M <span className="text-teal-500">AD.</span></h1>
                <p className="text-xl font-bold mt-4 uppercase">Freelance Designer</p>
              </header>
              <div className="space-y-12">
                <section>
                  <h3 className="text-2xl font-black border-b-4 border-teal-500 inline-block mb-6">WHAT I DO</h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="text-xs leading-loose">Visual Branding, Web Development, Motion Design, UI/UX Strategy...</div>
                  </div>
                </section>
                <section>
                  <h3 className="text-2xl font-black border-b-4 border-teal-500 inline-block mb-6">HISTORY</h3>
                  <p className="text-xs">2021 - Google Intern<br/>2022 - Meta Contractor</p>
                </section>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className={`flex-1 flex flex-col bg-[#eef0f3] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative transition-all duration-500 ${isFocusMode ? 'rounded-none border-none' : ''}`}>
      <div className="bg-[#f8f9fa] border-b border-gray-300 select-none z-10 shrink-0">
        <div className="flex px-4 pt-1 gap-1">
          {(tabs[intent] || tabs[AppIntent.NONE]).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[11px] px-4 py-2 transition-all rounded-t-lg font-bold relative ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-gray-200 hover:text-slate-700'}`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
            </button>
          ))}
        </div>
        <div className="bg-white px-6 py-2.5 shadow-sm border-b border-gray-200 min-h-[56px] flex items-center justify-between">
          {renderToolbarContent()}
          <button 
            onClick={handleManualSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-[11px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95"
          >
            KAYDET
          </button>
        </div>
      </div>

      <style>{`
        .toolbar-btn {
          padding: 0.375rem;
          border-radius: 0.375rem;
          width: 2.2rem;
          height: 2.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1e293b;
          border: 1px solid transparent;
          transition: all 0.2s;
        }
        .toolbar-btn:hover { background: #f1f5f9; border-color: #e2e8f0; }
        .toolbar-btn:active { transform: scale(0.9); background: #e2e8f0; }
        
        .toolbar-action-btn {
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 11px;
          font-weight: 600;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #475569;
          transition: all 0.2s;
        }
        .toolbar-action-btn:hover { background: #f1f5f9; color: #1e293b; border-color: #cbd5e1; }
        .toolbar-action-btn:active { transform: scale(0.95); }

        table tr:hover td { background: #f8fafc; }
        td:focus { outline: 2px solid #3b82f6 !important; background: #eff6ff; }
        
        img.selected-image {
          outline: 3px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>

      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar scroll-smooth flex justify-center bg-slate-300/40 relative">
        <div 
          className={`bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.2)] border border-gray-300 relative transition-all duration-700 overflow-hidden ${intent === AppIntent.CV ? 'w-[794px] min-h-[1123px]' : 'w-[800px] min-h-[1100px]'}`}
        >
          <div 
            ref={editorRef}
            contentEditable
            onPaste={(e) => { onActivity('paste'); updateWordCount(); }}
            onInput={() => { onActivity('keystroke'); updateWordCount(); }}
            aria-multiline="true"
            role="textbox"
            className={`h-full outline-none p-0 selection:bg-blue-200 text-slate-900 ${intent === AppIntent.ACADEMIC ? 'font-academic' : 'font-sans'}`}
            spellCheck={false}
            suppressContentEditableWarning={true}
            style={{ 
              minHeight: '100%', 
              fontSize: '12pt',
              fontFamily: customData?.font || 'inherit'
            }}
          >
            {intent === AppIntent.CV ? renderCvTemplate() : (
              <div className="p-16">
                 {intent === AppIntent.ACADEMIC && (
                  <div className="space-y-8">
                    <h1 className="text-4xl font-bold text-center mb-16 uppercase tracking-wider text-slate-900">YAPAY ZEKA VE AKADEMİK DÜRÜSTLÜK ÜZERİNE BİR ARAŞTIRMA</h1>
                    <p className="indent-12 text-justify text-lg leading-[1.8]">Bu çalışma, akademik metin üretiminde yapay zeka araçlarının kullanımının etik boyutlarını ve şeffaflık ilkelerini ele almaktadır...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resim Boyutlandırma Overlay */}
          {selectedImage && (
             <div 
                className="absolute border-2 border-blue-500 pointer-events-none"
                style={{
                  top: selectedImage.offsetTop,
                  left: selectedImage.offsetLeft,
                  width: selectedImage.clientWidth,
                  height: selectedImage.clientHeight,
                  zIndex: 40
                }}
             >
                <div 
                  className="image-resizer-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-600 border border-white cursor-se-resize pointer-events-auto shadow-lg"
                  onMouseDown={startResizing}
                />
             </div>
          )}
        </div>

        {/* Kelime Sayacı */}
        <div className="fixed bottom-10 right-10 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/10 text-[10px] font-bold tracking-widest shadow-2xl flex items-center gap-3 z-50">
          <span className="text-teal-400">STATUS: ACTIVE</span>
          <span className="w-[1px] h-3 bg-white/20"></span>
          <span>{wordCount} KELİME</span>
        </div>
      </div>
    </div>
  );
});

export default Editor;
