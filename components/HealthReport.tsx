
import React from 'react';
import { MetricState, AppIntent } from '../types';

interface HealthReportProps {
  metrics: MetricState;
  intent: AppIntent;
  onDownloadReport: () => void;
}

const HealthReport: React.FC<HealthReportProps> = ({ metrics, intent, onDownloadReport }) => {
  const getRiskColor = (val: number) => {
    if (val > 70) return 'text-red-500';
    if (val > 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRiskBg = (val: number) => {
    if (val > 70) return 'bg-red-500';
    if (val > 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    switch (intent) {
      case AppIntent.ACADEMIC: return 'Akademik Titizlik';
      case AppIntent.CV: return 'ATS Uyumu (Score)';
      case AppIntent.HOMEWORK: return 'Kriter Uyumluluğu';
      default: return 'Genel Kalite';
    }
  };

  return (
    <div className="w-80 flex flex-col gap-4 shrink-0">
      <div className="p-6 bg-[#161922] border border-gray-800 rounded-3xl shadow-xl">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-teal-400 mb-6">Doküman Analizi</h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] text-gray-400 uppercase font-medium">AI Benzerlik Riski</span>
              <span className={`text-sm font-bold ${getRiskColor(metrics.aiRisk)}`}>%{Math.round(metrics.aiRisk)}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${getRiskBg(metrics.aiRisk)}`}
                style={{ width: `${metrics.aiRisk}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] text-gray-400 uppercase font-medium">Özgünlük Saflığı</span>
              <span className="text-sm font-bold text-teal-400">%{Math.round(metrics.originality)}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-500 transition-all duration-500"
                style={{ width: `${metrics.originality}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] text-gray-400 uppercase font-medium">{getStrengthLabel()}</span>
              <span className="text-sm font-bold text-blue-400">{metrics.academicStrength}/100</span>
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${metrics.academicStrength}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 bg-gradient-to-br from-[#1a1d27] to-[#161922] border border-gray-800 rounded-3xl shadow-xl flex flex-col">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-4">Gerçek Zamanlı Günlük</h3>
        <div className="flex-1 overflow-y-auto custom-scrollbar text-[10px] space-y-3 font-mono text-gray-500 leading-tight">
          <p className="text-teal-400/80">&gt; Mod: {intent}</p>
          <p>&gt; Sayfa yapısı analiz ediliyor...</p>
          <p>&gt; Tipografi uyumu: {intent === AppIntent.ACADEMIC ? 'Formal' : 'Modern'}</p>
          {metrics.aiRisk > 60 && <p className="text-red-400">&gt; UYARI: Kaynak belirtilmemiş metin bloğu!</p>}
          <p>&gt; Bağlamsal AI desteği aktif.</p>
        </div>
        <button 
          onClick={onDownloadReport}
          className="mt-4 w-full py-2.5 rounded-xl bg-teal-500 text-black text-[11px] font-bold uppercase tracking-tighter hover:bg-teal-400 transition-all active:scale-95 shadow-lg shadow-teal-500/20"
        >
          Tam Raporu İndir
        </button>
      </div>
    </div>
  );
};

export default HealthReport;
