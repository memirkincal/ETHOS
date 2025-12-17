
import React, { useState, useEffect, useRef } from 'react';
import { AppIntent, ChatMessage } from '../types';
import { generateAIResponse } from '../geminiService';

interface SidebarProps {
  intent: AppIntent;
}

const Sidebar: React.FC<SidebarProps> = ({ intent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Added missing CUSTOM property to welcomeMessages to satisfy Record<AppIntent, string>
    const welcomeMessages: Record<AppIntent, string> = {
      [AppIntent.ACADEMIC]: "Literatür taraması için hazırım, argümanlarını sert eleştireceğim.",
      [AppIntent.CV]: "ATS sistemlerini atlatmak için anahtar kelimelerine odaklanacağım. Özgeçmişini buraya yapıştırabilirsin.",
      [AppIntent.HOMEWORK]: "Ödevine yardımcı olmak için buradayım. Konuyu birlikte inceleyelim.",
      [AppIntent.REPORT]: "Raporunu daha profesyonel hale getirmek için buradayım.",
      [AppIntent.CUSTOM]: "Özel şablonunla çalışmaya hazırım. Ne üzerinde yoğunlaşalım?",
      [AppIntent.NONE]: "ETHOS yardımcısı başlatılıyor..."
    };

    setMessages([{
      id: 'init',
      role: 'ai',
      content: welcomeMessages[intent] || "Bugün yazına nasıl yardımcı olabilirim?",
      timestamp: Date.now()
    }]);
  }, [intent]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const response = await generateAIResponse(input, intent);
    
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      content: response || "Düşünüyorum...",
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  return (
    <div className="w-80 flex flex-col bg-[#161922] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1a1d27]">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-teal-400">Bağlamsal Yardımcı</h3>
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-teal-600/20 border border-teal-500/30 text-teal-100' 
                : 'bg-white/5 border border-white/10 text-gray-300'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex gap-1">
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-[#1a1d27] border-t border-gray-800">
        <div className="relative">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Her şeyi sorabilirsin..."
            className="w-full bg-[#0f1117] border border-gray-800 rounded-full py-2.5 pl-4 pr-10 text-xs text-gray-300 focus:outline-none focus:border-teal-500/50"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-1.5 w-7 h-7 bg-teal-500 text-black rounded-full flex items-center justify-center hover:bg-teal-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
