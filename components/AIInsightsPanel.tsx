
import React, { useState, useEffect } from 'react';
import { getProductionInsights } from '../services/geminiService';
import { ProductionItem } from '../types';

interface AIInsightsPanelProps {
  data: ProductionItem[];
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ data }) => {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await getProductionInsights(data);
      setInsights(res);
    } catch (err) {
      setInsights("Unable to reach the AI advisor at this moment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generate();
  }, [data]);

  return (
    <div className="bg-white rounded-[3rem] border border-pink-50 shadow-2xl overflow-hidden animate-fadeIn">
      <div className="p-10 bg-gradient-to-br from-[#ffafbd] to-[#ffc3a0] text-white">
        <h3 className="text-3xl font-black flex items-center gap-4 tracking-tighter">
          <span className="text-4xl filter drop-shadow-md">✨</span>
          EMILIO'S AI HQ 🧳
        </h3>
        <p className="text-pink-50 text-sm mt-2 opacity-90 font-bold uppercase tracking-[0.2em]">Smart Manufacturing Summary</p>
      </div>
      
      <div className="p-12">
        {loading ? (
          <div className="space-y-6">
            <div className="h-6 bg-pink-50 rounded-2xl w-3/4 animate-pulse"></div>
            <div className="h-6 bg-pink-50 rounded-2xl w-1/2 animate-pulse"></div>
            <div className="h-40 bg-pink-50/50 rounded-[2rem] animate-pulse"></div>
            <p className="text-center text-pink-300 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
              <span className="animate-spin text-lg">👜</span> Optimizing Packing Strategies...
            </p>
          </div>
        ) : (
          <div className="prose prose-pink max-w-none">
            <div className="flex justify-end mb-8">
               <button 
                onClick={generate}
                className="text-xs font-black text-pink-500 hover:text-pink-700 flex items-center gap-2 border-2 border-pink-100 px-6 py-2.5 rounded-full transition-all uppercase tracking-widest shadow-sm hover:shadow-md"
               >
                <span className="text-sm">🔄</span>
                Refresh Advisor
               </button>
            </div>
            <div className="whitespace-pre-wrap text-slate-700 leading-loose font-medium text-xl bg-pink-50/30 p-10 rounded-[2.5rem] border border-pink-50">
              {insights}
            </div>
          </div>
        )}

        <div className="mt-12 pt-12 border-t border-pink-50 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-orange-50/50 rounded-[2.5rem] border border-orange-100">
            <h4 className="text-sm font-black text-orange-600 flex items-center gap-3 mb-4 uppercase tracking-widest">
              <span>🚨</span>
              Critical Alert
            </h4>
            <p className="text-sm text-orange-700 leading-relaxed font-bold">Priority re-alignment recommended for backpack orders on Line 2. 🎒</p>
          </div>
          <div className="p-8 bg-pink-50 rounded-[2.5rem] border border-pink-100">
            <h4 className="text-sm font-black text-[#ff8fa3] flex items-center gap-3 mb-4 uppercase tracking-widest">
              <span>👜</span>
              Efficiency Hack
            </h4>
            <p className="text-sm text-pink-700 leading-relaxed font-bold">Target peak output recorded for model X-Series. Strategy suggested for replication. 🧳</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPanel;
